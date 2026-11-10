// piezas-scenario: S-001 v=3b63b7142450
// S-001: Each person only sees their own role's screens
//   Given an instructor account created by the administrator
//   When the instructor signs in and tries to open the desk check-in screen
//   Then they are shown their own group screen instead, and the desk screen is not available to them
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-001: Each person only sees their own role's screens", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-001 has no test yet");
});
