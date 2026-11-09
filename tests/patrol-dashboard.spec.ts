import { expect, test, type Page } from '@playwright/test';

async function report(page: Page, child: string, place: string, time: string) {
  await page.getByTestId(`report-missing-${child}`).click();
  await page.getByTestId('report-missing-place').fill(place);
  await page.getByTestId('report-missing-time').fill(time);
  await page.getByTestId('report-missing-send').click();
  await page.getByRole('button', { name: 'OK', exact: true }).click();
}

async function becomePatrol(page: Page) {
  await page.getByTestId('switch-person').click();
  await page.getByTestId('demo-u-rob').click();
  await expect(page.getByTestId('patrol-preview-note')).toBeVisible();
}

test('incident cards retain search actions and distinguish acknowledgement from urgency', async ({ page }) => {
  await page.goto('/');
  // Ava's fixture deliberately has no alert until her parent supplies it.
  await page.getByTestId('demo-u-claire').click();
  await page.getByTestId('parent-child-c-ava').click();
  await page.getByTestId('tab-medical').click();
  await page.getByTestId('add-medical').click();
  await page.getByTestId('medical-short').fill('Tree nut allergy, EpiPen in backpack');
  await page.getByTestId('medical-details').fill('Avoid tree nuts.');
  await page.getByLabel('Where medication is kept').fill('Backpack');
  await page.getByTestId('medical-save').click();
  await page.getByTestId('switch-person').click();
  await page.getByTestId('demo-u-sam').click();
  await report(page, 'c-ava', 'Top of the Pigeon chair', '13:30');
  await becomePatrol(page);
  const ava = page.getByTestId('incident-card-c-ava');
  await expect(ava).toContainText('Ava');
  await expect(ava).toContainText(/Bib \d+/);
  await expect(ava).toContainText('Top of the Pigeon chair');
  await expect(ava).toContainText('Sam Lee');
  await expect(ava).toContainText('Escalation deadline');
  await expect(ava.locator('time').first()).toHaveAttribute('datetime', /T13:30:00$/);
  await expect(ava.getByTestId('incident-ack-status')).toHaveText('Unacknowledged');
  await expect(ava.getByTestId('viewing-incident-c-ava')).toHaveText('Currently viewing');
  await expect(ava.getByRole('button', { name: /View search/ })).toHaveCount(0);
  const listBox = await page.getByTestId('active-incidents').boundingBox();
  const detailBox = await page.getByTestId('search-screen').boundingBox();
  expect(listBox!.x + listBox!.width).toBeLessThanOrEqual(detailBox!.x);
  await expect(page.getByTestId('search-medical')).toContainText('Tree nut');
  await expect(page.getByTestId('search-contacts')).toContainText('Claire');
  await expect(page.getByTestId('search-jacket')).toHaveText('Purple');
  await page.getByTestId('acknowledge').click();
  await expect(ava.getByTestId('incident-ack-status')).toHaveText('Acknowledged · 1 patroller');
  await expect(ava.getByTestId('incident-responders')).toContainText('Rob Fournier');
  await page.getByTestId('share-police').click();
  await expect(page.getByTestId('notice-todo')).toBeVisible();
  await expect(page.getByTestId('patrol-preview-note')).toContainText('No real alerts');
  await page.getByTestId('close-search').click();
  await page.getByTestId('close-confirm').click();
  await expect(ava).toHaveCount(0);
  await expect(page.getByTestId('no-searches')).toBeVisible();
  await expect(page.getByTestId('closed-searches')).toContainText('Found safe');
  await expect(page.getByTestId('search-screen')).toHaveCount(0);
});

test('multiple cards select existing incidents on mobile and prioritize overdue searches', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByTestId('demo-u-sam').click();
  await report(page, 'c-ava', 'Kids centre', '13:30');
  await report(page, 'c-noah', 'Pigeon chair', '12:00');
  await report(page, 'c-chloe', 'Base lodge', '12:40');
  await becomePatrol(page);
  const cards = page.getByTestId('active-incidents').getByRole('article');
  await expect(cards).toHaveCount(3);
  await expect(cards.first()).toHaveAttribute('data-testid', 'incident-card-c-noah');
  await expect(page.getByTestId('incident-card-c-noah').getByTestId('incident-urgency')).toContainText('Overdue');
  await expect(page.getByTestId('incident-card-c-chloe').getByTestId('incident-urgency')).toContainText('Urgent');
  const noah = page.getByTestId('open-incident-c-noah');
  await noah.focus();
  await page.keyboard.press('Enter');
  await expect(noah).toHaveCount(0);
  await expect(page.getByTestId('viewing-incident-c-noah')).toHaveText('Currently viewing');
  await expect(page.getByTestId('incident-card-c-noah')).toHaveAttribute('aria-current', 'true');
  await expect(page.getByTestId('search-last-seen')).toContainText('Pigeon chair');
  await page.getByTestId('acknowledge').click();
  await expect(page.getByTestId('incident-card-c-noah').getByTestId('incident-urgency')).toContainText('Overdue');
  await expect(page.getByTestId('incident-card-c-noah').getByTestId('incident-ack-status')).toContainText('Acknowledged');
  await page.getByTestId('open-incident-c-ava').click();
  await expect(page.getByTestId('search-last-seen')).toContainText('Kids centre');
  await expect(page.getByTestId('open-incident-c-noah')).toBeVisible();
  const listBox = await page.getByTestId('active-incidents').boundingBox();
  const detailBox = await page.getByTestId('search-screen').boundingBox();
  expect(listBox!.y + listBox!.height).toBeLessThanOrEqual(detailBox!.y);
  const ackButton = await page.getByTestId('acknowledge').boundingBox();
  expect(ackButton!.width).toBeGreaterThan(250);
  expect(ackButton!.x + ackButton!.width).toBeLessThanOrEqual(375);
  for (const card of await cards.all()) {
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375);
  }
});
