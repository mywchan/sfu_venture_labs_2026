// piezas-scenario: S-013 v=d88d80b36e11
// S-013: The desk cannot see medical details
//   Given Ava has a tree nut allergy on file
//   When the desk opens Ava's pickup screen
//   Then no medical alert or medical detail is shown
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-013: The desk cannot see medical details", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-013 has no test yet");
});
