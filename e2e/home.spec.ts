import { expect, test } from "@playwright/test";

test("home page shows the department name", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "School Works Management System" }),
  ).toBeVisible();
  await expect(page.getByText("Department of Engineering Services")).toBeVisible();
});
