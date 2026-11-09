// piezas-scenario: S-007 v=e8d0a3d7cf75
// S-007: An incomplete phone number is refused
//   Given a parent adding an emergency contact
//   When they enter the phone number "604555-187"
//   Then the form says the number is incomplete and does not save
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-007: An incomplete phone number is refused", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-007 has no test yet");
});
