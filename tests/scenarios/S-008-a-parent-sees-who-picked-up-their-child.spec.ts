// piezas-scenario: S-008 v=d9d4097f8311
// S-008: A parent sees who picked up their child
//   Given Lily was checked in and picked up by her mother today
//   When Lily's parent opens her page
//   Then they see her group, today's check-in time, pickup time, and "picked up by" her mother
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-008: A parent sees who picked up their child", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-008 has no test yet");
});
