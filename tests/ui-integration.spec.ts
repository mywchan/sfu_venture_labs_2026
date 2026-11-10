import { expect, test, type Page } from '@playwright/test';

async function switchRole(page: Page, account: string) {
  await page.getByTestId('switch-person').click();
  await page.getByTestId(`demo-${account}`).click();
}

async function addContact(page: Page, name: string, order: string) {
  await page.getByTestId('add-adult').click();
  await page.getByTestId('adult-name').fill(name);
  await page.getByTestId('adult-relationship').fill('Family friend');
  await page.getByTestId('adult-phone').fill('604-555-0199');
  await page.getByTestId('adult-order').selectOption(order);
  await page.getByTestId('adult-save').click();
}

async function reportMissing(page: Page, child: string) {
  await page.getByTestId(`report-missing-${child}`).click();
  await page.getByTestId('report-missing-place').fill('Top of the Pigeon chair');
  await page.getByTestId('report-missing-time').fill('13:30');
  await page.getByTestId('report-missing-send').click();
  await page.getByRole('button', { name: 'OK', exact: true }).click();
}

test('reception keeps contacts and blocks pickup until closure, with truthful acknowledgement status', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('demo-u-sam').click();
  await reportMissing(page, 'c-ava');
  const child = page.getByTestId('group-child-c-ava');
  await expect(child).toContainText('awaiting patrol acknowledgement');
  await expect(child).not.toContainText('patrol searching');
  await switchRole(page, 'u-mei');
  await page.getByTestId('desk-result-c-ava').click();
  await expect(page.getByTestId('desk-incident-status')).toContainText('Awaiting patrol acknowledgement');
  await expect(page.getByTestId('desk-contacts')).toContainText('Claire Moreau');
  await expect(page.getByTestId('desk-contacts')).toContainText('Luc Moreau');
  await expect(page.getByTestId('desk-contacts').getByRole('link')).toHaveCount(2);
  await expect(page.getByTestId('pickup-panel')).toHaveCount(0);
  await expect(page.getByTestId('desk-child-panel')).not.toContainText('Tree nut');
  await switchRole(page, 'u-rob');
  await page.getByTestId('acknowledge').click();
  await switchRole(page, 'u-sam');
  await expect(page.getByTestId('group-child-c-ava')).toContainText('patrol acknowledged');
  await switchRole(page, 'u-mei');
  await page.getByTestId('desk-result-c-ava').click();
  await expect(page.getByTestId('desk-incident-status')).toContainText('Patrol has acknowledged');
  await expect(page.getByTestId('desk-contacts')).toContainText('Claire Moreau');
  await expect(page.getByTestId('pickup-panel')).toHaveCount(0);
  await switchRole(page, 'u-rob');
  await page.getByTestId('close-search').click();
  await page.getByTestId('close-confirm').click();
  await switchRole(page, 'u-mei');
  await page.getByTestId('desk-result-c-ava').click();
  await expect(page.getByTestId('pickup-panel')).toBeVisible();
  await page.getByTestId('release-to-Claire Moreau').click();
  await page.getByTestId('pickup-identity-checked').check();
  await page.getByTestId('pickup-confirm-release').click();
  await expect(page.getByTestId('pickup-status')).toContainText('Claire Moreau');
});

for (const mobile of [false, true]) {
  test(`verified pickup requires a staff identity check and keeps release history (${mobile ? 'mobile' : 'desktop'})`, async ({ page }) => {
    if (mobile) await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.getByTestId('demo-u-mei').click();
    await page.getByTestId('desk-result-c-ava').click();
    await page.getByTestId('release-to-Claire Moreau').click();
    const confirmation = page.getByTestId('pickup-confirmation');
    await expect(confirmation).toContainText('Ava Moreau');
    await expect(confirmation).toContainText('Claire Moreau');
    await expect(confirmation).toContainText('does not independently verify identity');
    await expect(page.getByTestId('pickup-identity-checked')).toBeFocused();
    await expect(page.getByTestId('pickup-confirm-release')).toBeDisabled();
    await expect(page.getByTestId('pickup-status')).toHaveCount(0);
    await page.getByLabel('I checked this adult’s identity against the approved pickup information.').check();
    await expect(page.getByTestId('pickup-confirm-release')).toBeEnabled();
    const bounds = await confirmation.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    await page.getByTestId('pickup-confirm-release').click();
    await expect(page.getByTestId('pickup-status')).toContainText('Claire Moreau, released by Mei Tanaka');
    await expect(confirmation).toHaveCount(0);
    await expect(page.getByTestId('pickup-panel')).toHaveCount(0);
    await switchRole(page, 'u-claire');
    await page.getByTestId('parent-child-c-ava').click();
    await expect(page.getByTestId('lesson-pickup')).toContainText('Claire Moreau');
  });
}

test('cancel and changing the adult do not carry an identity confirmation forward', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('demo-u-mei').click();
  await page.getByTestId('desk-result-c-ava').click();
  const claire = page.getByTestId('release-to-Claire Moreau');
  await claire.click();
  await page.getByTestId('pickup-identity-checked').check();
  await page.getByTestId('pickup-cancel').click();
  await expect(claire).toBeFocused();
  await expect(page.getByTestId('pickup-status')).toHaveCount(0);
  await expect(page.getByTestId('pickup-confirmation')).toHaveCount(0);
  await claire.click();
  await expect(page.getByTestId('pickup-identity-checked')).not.toBeChecked();
  await page.getByTestId('pickup-identity-checked').check();
  await page.getByTestId('release-to-Luc Moreau').click();
  await expect(page.getByTestId('pickup-confirmation')).toContainText('Luc Moreau');
  await expect(page.getByTestId('pickup-confirm-release')).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('release-to-Luc Moreau')).toBeFocused();
  await expect(page.getByTestId('pickup-status')).toHaveCount(0);
});

test('a contact without pickup permission cannot enter confirmation and refusal is recorded', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('demo-u-claire').click();
  await page.getByTestId('parent-child-c-ava').click();
  await page.getByTestId('tab-adults').click();
  await page.getByTestId('adult-Luc Moreau').getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByTestId('adult-can-pickup').uncheck();
  await page.getByTestId('adult-save').click();
  await switchRole(page, 'u-mei');
  await page.getByTestId('desk-result-c-ava').click();
  await expect(page.getByTestId('desk-contacts')).toContainText('Luc Moreau');
  await expect(page.getByTestId('release-to-Luc Moreau')).toHaveCount(0);
  await expect(page.getByTestId('pickup-confirmation')).toHaveCount(0);
  await page.getByTestId('someone-else').click();
  await page.getByTestId('other-name').fill('Luc Moreau');
  await page.getByTestId('other-check').click();
  await expect(page.getByTestId('pickup-refused')).toContainText('Do not release');
  await expect(page.getByTestId('refusals')).toContainText('Luc Moreau');
  await expect(page.getByTestId('refusals')).toContainText('Mei Tanaka');
  await expect(page.getByTestId('pickup-status')).toHaveCount(0);
  await expect(page.getByTestId('pickup-confirmation')).toHaveCount(0);
});

test('a missing-child report blocks even a pickup awaiting final confirmation', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('demo-u-mei').click();
  await page.getByTestId('desk-result-c-ava').click();
  await page.getByTestId('release-to-Claire Moreau').click();
  await page.getByTestId('pickup-identity-checked').check();
  await page.getByTestId('desk-report-missing').click();
  await page.getByTestId('report-missing-place').fill('Pigeon chair');
  await page.getByTestId('report-missing-time').fill('13:30');
  await page.getByTestId('report-missing-send').click();
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await expect(page.getByTestId('desk-incident-status')).toContainText('Pickup is blocked');
  await expect(page.getByTestId('pickup-confirmation')).toHaveCount(0);
  await expect(page.getByTestId('pickup-panel')).toHaveCount(0);
  await expect(page.getByTestId('pickup-status')).toHaveCount(0);
  await expect(page.getByTestId('desk-contacts')).toContainText('Claire Moreau');
});

test('parent contacts shift and renumber, and all reach the existing patrol detail', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('demo-u-claire').click();
  await expect(page.getByTestId('role-badge')).toHaveText('Parent');
  await page.getByTestId('parent-child-c-ava').click();
  await page.getByTestId('tab-adults').click();
  await addContact(page, 'Grace Example', '3');
  await addContact(page, 'Taylor Example', '2');
  await expect(page.getByTestId('adult-Taylor Example')).toContainText('Emergency contact 2');
  await expect(page.getByTestId('adult-Luc Moreau')).toContainText('Emergency contact 3');
  await expect(page.getByTestId('adult-Grace Example')).toContainText('Emergency contact 4');
  await page.getByTestId('adult-Taylor Example').getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(page.getByTestId('adult-Luc Moreau')).toContainText('Emergency contact 2');
  await expect(page.getByTestId('adult-Grace Example')).toContainText('Emergency contact 3');
  await switchRole(page, 'u-sam');
  await reportMissing(page, 'c-ava');
  await switchRole(page, 'u-rob');
  const contacts = page.getByTestId('search-contacts');
  await expect(contacts).toContainText('3. Grace Example');
  const orderedNames = await contacts.locator('p > strong').allTextContents();
  expect(orderedNames).toEqual(['1. Claire Moreau', '2. Luc Moreau', '3. Grace Example']);
  await expect(page.getByTestId('viewing-incident-c-ava')).toHaveText('Currently viewing');
});

test('desk colour entry and instructor corrections reach patrol and administrator', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('demo-u-mei').click();
  await expect(page.getByTestId('role-badge')).toHaveText('Desk');
  await page.getByTestId('desk-result-c-owen').click();
  await page.getByTestId('checkin-jacket-red').click();
  await expect(page.getByTestId('checkin-jacket')).toHaveValue('Red');
  await page.getByTestId('checkin-pants').fill('Charcoal');
  await page.getByTestId('checkin-helmet-white').click();
  await page.getByTestId('checkin-submit').click();
  await expect(page.getByTestId('checkin-status')).toContainText('Charcoal');
  await switchRole(page, 'u-sam');
  await expect(page.getByTestId('role-badge')).toHaveText('Instructor');
  await page.getByTestId('fix-clothing-c-owen').click();
  await page.getByTestId('fix-jacket-green').click();
  await page.getByTestId('fix-pants').fill('Navy blue');
  await page.getByTestId('fix-clothing-save').click();
  await expect(page.getByTestId('clothing-fixed-c-owen')).toContainText('Sam Lee');
  await reportMissing(page, 'c-owen');
  await switchRole(page, 'u-rob');
  await expect(page.getByTestId('role-badge')).toHaveText('Patrol');
  await expect(page.getByTestId('search-jacket')).toHaveText('Green');
  await expect(page.getByTestId('search-pants')).toHaveText('Navy blue');
  // A second correction while the search is open must update its clothing too.
  await switchRole(page, 'u-sam');
  await page.getByTestId('fix-clothing-c-owen').click();
  await page.getByTestId('fix-jacket-yellow').click();
  await page.getByTestId('fix-clothing-save').click();
  await switchRole(page, 'u-rob');
  await expect(page.getByTestId('search-jacket')).toHaveText('Yellow');
  await switchRole(page, 'u-hana');
  await expect(page.getByTestId('role-badge')).toHaveText('Administrator');
  await page.getByTestId('admin-tab-children').click();
  await expect(page.getByTestId('child-checkin-c-owen')).toContainText('Yellow');
  await expect(page.getByTestId('child-checkin-c-owen')).toContainText('Sam Lee');
  await switchRole(page, 'u-mei');
  await page.getByTestId('desk-result-c-owen').click();
  await expect(page.getByTestId('clothing-fixed-note')).toContainText('Sam Lee');
});
