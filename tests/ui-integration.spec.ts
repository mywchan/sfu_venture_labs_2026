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
