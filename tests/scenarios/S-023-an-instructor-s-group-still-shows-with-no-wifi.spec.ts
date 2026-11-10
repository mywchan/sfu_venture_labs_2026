// piezas-scenario: S-023 v=9e925cf1cf1b
// S-023: An instructor's group still shows with no wifi
//   Given Sam has saved today's group to his phone, including Ava's alert "Tree nut allergy, EpiPen in backpack"
//   When his phone loses its connection and he opens his group
//   Then he sees his five children with bibs, clothing and Ava's alert, and no full medical details or contacts
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-023: An instructor's group still shows with no wifi", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-023 has no test yet");
});
