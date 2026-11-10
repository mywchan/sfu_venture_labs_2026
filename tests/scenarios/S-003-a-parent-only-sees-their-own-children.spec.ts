// piezas-scenario: S-003 v=2f2efafb32ec
// S-003: A parent only sees their own children
//   Given two families each with one child
//   When the first parent signs in
//   Then only their own child is listed, and opening the other child's page shows "not found"
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-003: A parent only sees their own children", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-003 has no test yet");
});
