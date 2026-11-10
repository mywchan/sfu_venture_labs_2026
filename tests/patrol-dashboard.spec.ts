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

test('reporting rejects blank, invalid and future times and accepts the preview clock', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('demo-u-sam').click();
  await page.getByTestId('report-missing-c-ava').click();
  const time = page.getByTestId('report-missing-time');
  const previewTime = await time.inputValue();
  await page.getByTestId('report-missing-place').fill('Pigeon chair');
  await time.fill('');
  await page.getByTestId('report-missing-send').click();
  await expect(time).toHaveAttribute('aria-invalid', 'true');
  await expect(time).toBeFocused();
  await expect(page.getByTestId('report-missing-time-error')).toHaveText('Enter the last-seen time.');
  // Exercise application validation independently of the native time-input sanitizer.
  await time.evaluate((input) => input.setAttribute('type', 'text'));
  await time.fill('25:99');
  await page.getByTestId('report-missing-send').click();
  await expect(page.getByTestId('report-missing-time-error')).toHaveText('Enter a valid time in hours and minutes.');
  await time.fill('23:59');
  await page.getByTestId('report-missing-send').click();
  await expect(page.getByTestId('report-missing-time-error')).toContainText('cannot be later than the preview clock');
  await expect(page.getByTestId('report-missing-sent')).toHaveCount(0);
  await time.fill(previewTime);
  await page.getByTestId('report-missing-send').click();
  await expect(page.getByTestId('report-missing-sent')).toContainText('Report recorded in this preview');
  await expect(page.getByTestId('report-missing-sent')).not.toContainText('has been alerted');
  await page.getByRole('button', { name: 'OK', exact: true }).click();
  await becomePatrol(page);
  await expect(page.getByTestId('active-incidents').getByRole('article')).toHaveCount(1);
});

test('malformed incident times remain visible without breaking sorting or response actions', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByTestId('demo-u-sam').click();
  await report(page, 'c-ava', 'Pigeon chair', '13:30');
  await report(page, 'c-noah', 'Base lodge', '12:00');
  // Corrupt existing preview state only inside this test. No production test hook,
  // server data, SDK mocking or new fixture dataset is introduced.
  await page.evaluate(() => {
    type Preview = { data: { emergencies: { childId: string; lastSeenAt: unknown }[] } };
    type Fiber = { return?: Fiber; dependencies?: { firstContext?: { memoizedValue?: Preview } } };
    const element = document.querySelector('[data-testid="topbar"]')!;
    const key = Object.keys(element).find((key) => key.startsWith('__reactFiber$'))!;
    let fiber = (element as unknown as Record<string, Fiber>)[key];
    while (fiber) {
      const preview = fiber.dependencies?.firstContext?.memoizedValue;
      if (preview?.data?.emergencies) {
        preview.data.emergencies.find((e) => e.childId === 'c-ava')!.lastSeenAt = null;
        return;
      }
      fiber = fiber.return!;
    }
    throw new Error('Could not locate preview state for malformed-record regression');
  });
  await becomePatrol(page);
  const cards = page.getByTestId('active-incidents').getByRole('article');
  await expect(cards).toHaveCount(2);
  await expect(cards.first()).toHaveAttribute('data-testid', 'incident-card-c-ava');
  await expect(cards.first()).toContainText('Time unavailable');
  await expect(page.getByTestId('incident-card-c-noah')).toContainText('Overdue');
  await page.getByTestId('open-incident-c-ava').click();
  await expect(page.getByTestId('search-countdown')).toContainText('Verify escalation timing now');
  await expect(page.getByTestId('safety-snapshot')).toContainText('Time unavailable');
  await expect(page.getByTestId('incident-timeline')).toContainText('Time unavailable');
  await expect(page.getByTestId('search-screen')).not.toContainText(/NaN|Invalid Date|Infinity/);
  await page.getByTestId('acknowledge').click();
  await page.getByTestId('share-police').click();
  await expect(page.getByTestId('police-shared')).toBeVisible();
  await page.getByTestId('close-search').click();
  await page.getByTestId('close-confirm').click();
  await expect(page.getByTestId('closed-searches')).toContainText('Found safe');
  await expect(page.getByTestId('incident-card-c-noah')).toBeVisible();
  expect(errors).toEqual([]);
});

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
  const snapshot = page.getByTestId('safety-snapshot');
  await expect(snapshot).toContainText('Ava');
  await expect(snapshot).toContainText(/Bib \d+/);
  await expect(snapshot).toContainText('Top of the Pigeon chair');
  await expect(snapshot).toContainText('Jacket');
  await expect(snapshot).toContainText('Pants');
  await expect(snapshot).toContainText('Helmet');
  await expect(snapshot.getByTestId('snapshot-distinguishing')).toContainText('Not recorded');
  await expect(snapshot.getByTestId('snapshot-response-status')).toContainText('awaiting acknowledgement');
  const timeline = page.getByTestId('incident-timeline');
  await expect(timeline.getByRole('listitem')).toHaveCount(1);
  await expect(timeline).toContainText('Last seen');
  await expect(timeline.locator('time')).toHaveAttribute('datetime', /T13:30:00$/);
  await expect(timeline).not.toContainText(/Report created|Notification delivered|Search started/);
  await page.getByTestId('acknowledge').click();
  await expect(snapshot.getByTestId('snapshot-response-status')).toHaveText('Patrol acknowledged');
  await expect(timeline.getByRole('listitem')).toHaveCount(2);
  await expect(timeline).toContainText('Patrol acknowledged · Rob Fournier');
  const acknowledgementAt = await page.getByTestId('acks').innerText();
  await expect(timeline.getByRole('listitem').nth(1)).toContainText(acknowledgementAt.split('·').at(-1)!.trim());
  await expect(ava.getByTestId('incident-ack-status')).toHaveText('Acknowledged · 1 patroller');
  await expect(ava.getByTestId('incident-responders')).toContainText('Rob Fournier');
  await page.getByTestId('share-police').click();
  await expect(timeline.getByRole('listitem')).toHaveCount(3);
  await expect(timeline).toContainText('Police disclosure recorded');
  await expect(page.getByTestId('notice-todo')).toBeVisible();
  await expect(page.getByTestId('patrol-preview-note')).toContainText('No real alerts');
  await page.getByTestId('close-search').click();
  await page.getByTestId('close-confirm').click();
  await expect(ava).toHaveCount(0);
  await expect(page.getByTestId('no-searches')).toBeVisible();
  await expect(page.getByTestId('closed-searches')).toContainText('Found safe');
  await expect(page.getByTestId('search-screen')).toHaveCount(0);
  await expect(snapshot).toHaveCount(0);
  await page.getByTestId('closed-searches').getByText('Recorded activity', { exact: true }).click();
  const closedTimeline = page.getByTestId('closed-searches').getByTestId('incident-timeline');
  await expect(closedTimeline).toContainText('Search closed');
  await expect(closedTimeline).toContainText('Found safe');
  await expect(closedTimeline.getByRole('listitem')).toHaveCount(3);
  await expect(closedTimeline).not.toContainText('Top of the Pigeon chair');
  await expect(closedTimeline).not.toContainText('Last seen');
});

test('escalation countdown advances and remains overdue after acknowledgement', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.getByTestId('demo-u-sam').click();
  await report(page, 'c-ava', 'Kids centre', '13:30');
  await becomePatrol(page);
  const timer = page.getByTestId('escalation-timer');
  await expect(timer).toHaveText(/\d+:[0-5]\d remaining/);
  const initial = await timer.innerText();
  await page.clock.fastForward(2000);
  await expect(timer).not.toHaveText(initial);
  await page.clock.fastForward(60 * 60 * 1000);
  await expect(timer).toHaveText(/Overdue by \d+:[0-5]\d/);
  await expect(page.getByTestId('snapshot-urgency')).toContainText('Overdue');
  await expect(page.getByTestId('search-countdown')).toContainText('Call police now and contact the family');
  await page.getByTestId('acknowledge').click();
  await expect(page.getByTestId('snapshot-response-status')).toHaveText('Patrol acknowledged');
  await expect(timer).toContainText('Overdue');
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
  const snapshotBox = await page.getByTestId('safety-snapshot').boundingBox();
  expect(snapshotBox!.x + snapshotBox!.width).toBeLessThanOrEqual(375);
  const timelineBox = await page.getByTestId('incident-timeline').boundingBox();
  expect(timelineBox!.x + timelineBox!.width).toBeLessThanOrEqual(375);
  for (const card of await cards.all()) {
    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375);
  }
});
