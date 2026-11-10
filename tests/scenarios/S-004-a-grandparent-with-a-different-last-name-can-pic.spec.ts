// piezas-scenario: S-004 v=8ccbbe7bfa85
// S-004: A grandparent with a different last name can pick up
//   Given Owen Okafor-Parr, whose mother is his only approved adult
//   When his mother adds "Grace Okafor (grandmother)" as allowed to pick up
//   Then the desk pickup screen for Owen immediately shows Grace as approved, and the desk can release Owen to her and record it
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-004: A grandparent with a different last name can pick up", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-004 has no test yet");
});
