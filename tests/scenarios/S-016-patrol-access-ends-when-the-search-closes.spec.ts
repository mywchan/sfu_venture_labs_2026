// piezas-scenario: S-016 v=859bb42da75a
// S-016: Patrol access ends when the search closes
//   Given an open search for Owen that patrol can see
//   When the search is closed as "found safe"
//   Then the closing time and outcome are saved, and patrol can no longer open Owen's details
//
// NOT WRITTEN YET. Replace the test body with the real steps, driven against
// the running app: open the page (page.goto), do what the When line says
// (click, fill, ...), and check what the Then line says is visible
// (await expect(page.getByTestId(...)).toBeVisible() / toHaveText(...)).
// Keep the first line: it tells Piezas which scenario (and which wording of
// it) this test checks. Never skip the test or fake Piezas.
import { test } from '@playwright/test';

test("S-016: Patrol access ends when the search closes", async () => {
  throw new Error("PIEZAS_NOT_WRITTEN: S-016 has no test yet");
});
