import { test, expect, beforeEach, describe } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const username = "testuser";
const password = "testpass";

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    await request.post("http://localhost:3111/api/testing/reset");
    await request.post("http://localhost:3111/api/users", {
      data: {
        username: username,
        name: "testuser",
        password: password,
      },
    });

    await page.goto("http://localhost:5173/");
  });

  test("Login form is shown", async ({ page }) => {
    await expect(page.locator("button:has-text('login')")).toBeVisible();
  });

  describe("Login", () => {
    test("succeeds with correct credentials", async ({ page }) => {
      await page.locator("input[name='username']").fill(username);
      await page.locator("input[name='password']").fill(password);
      await page.locator("button:has-text('login')").click();
      await expect(page.locator("button:has-text('logout')")).toBeVisible();
    });

    test("fails with wrong credentials", async ({ page }) => {
      await page.locator("input[name='username']").fill("random");
      await page.locator("input[name='password']").fill("randpass");
      await page.locator("button:has-text('login')").click();
      await expect(page.locator("text=invalid")).toBeVisible();
    });
  });

  describe("When logged in", () => {
    beforeEach(async ({ page }) => {
      await page.locator("input[name='username']").fill(username);
      await page.locator("input[name='password']").fill(password);
      await page.locator("button:has-text('login')").click();
    });

    test("a new blog can be created", async ({ page }) => {
      const creatBlogButton = page.locator("text=Create new blog post");
      await creatBlogButton.click();
      await page.locator("input[name='title']").fill("Cool title");
      await page.locator("input[name='author']").fill("New blog author");
      await page.locator("input[name='url']").fill("www.sampleurl.com");
      await page.locator("button:has-text('create')").click();
      await expect(page.locator("text=added")).toBeVisible();
    });
  });
});
