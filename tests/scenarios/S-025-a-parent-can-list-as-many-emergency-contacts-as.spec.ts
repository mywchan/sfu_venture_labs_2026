// piezas-scenario: S-025 v=6b0a38627c42
// S-025: A parent can list as many emergency contacts as they need
//   Given Owen already has a 1st and a 2nd emergency contact
//   When his mother adds Grace Okafor and chooses "3rd emergency contact", then adds another adult and chooses "4th emergency contact"
//   Then Owen shows four emergency contacts in that order, and patrol's search screen lists all four
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-025: A parent can list as many emergency contacts as they need", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-025 has no test yet");
});
