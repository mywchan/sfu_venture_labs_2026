// piezas-scenario: S-012 v=0a4c14a80098
// S-012: An unapproved adult is stopped at pickup
//   Given Lily's approved adults are her mother and father only
//   When a man saying he is her uncle asks to pick her up
//   Then the desk sees a warning that he is not approved, Lily stays checked in, and the refused attempt is recorded with the time and staff member
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-012: An unapproved adult is stopped at pickup", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-012 has no test yet");
});
