// piezas-scenario: S-009 v=cff0d25fc47f
// S-009: An instructor only sees their own group
//   Given Sam teaches a level 3 group of five children today
//   When Sam signs in on a phone
//   Then exactly those five children are listed in large rows, and children from other groups cannot be opened
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-009: An instructor only sees their own group", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-009 has no test yet");
});
