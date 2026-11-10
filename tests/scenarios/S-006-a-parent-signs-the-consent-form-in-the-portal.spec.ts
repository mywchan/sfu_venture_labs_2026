// piezas-scenario: S-006 v=e20d62a06cef
// S-006: A parent signs the consent form in the portal
//   Given a child with no consent form
//   When the parent completes and signs the consent form, choosing no photo consent
//   Then the child no longer appears as "no consent form" for the administrator, and no photo is shown for the child anywhere
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-006: A parent signs the consent form in the portal", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-006 has no test yet");
});
