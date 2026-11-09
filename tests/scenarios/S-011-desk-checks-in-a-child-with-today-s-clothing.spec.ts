// piezas-scenario: S-011 v=94c0c5aa5b3e
// S-011: Desk checks in a child with today's clothing
//   Given Owen is registered for today and not yet checked in
//   When the desk searches "Owen", checks him in, and enters jacket "red", pants "black" and helmet "white"
//   Then Owen shows as checked in, with the time, the staff member's name, and his clothing colours
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-011: Desk checks in a child with today's clothing", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-011 has no test yet");
});
