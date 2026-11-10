// piezas-scenario: S-024 v=f74e86eb886a
// S-024: The administrator sees today's check-in clothing
//   Given the desk checked Owen in wearing a red jacket, black pants and a white helmet
//   When the administrator opens the list of children
//   Then Owen's row shows his check-in time, who checked him in, and "red" jacket, "black" pants and "white" helmet
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-024: The administrator sees today's check-in clothing", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-024 has no test yet");
});
