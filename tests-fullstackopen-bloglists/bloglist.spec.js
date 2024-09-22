import { test, expect, beforeEach, describe } from "@playwright/test";
import dotenv from "dotenv";
import { createNote } from "./helper";

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
      await createNote(page);
    });

    test("a blog can be liked", async ({ page }) => {
      await createNote(page);

      await page.locator("text=view").first().click();
      await page.locator("text=like").click();
      await expect(page.locator("text=likes: 1")).toBeVisible();
    });

    test("a blog can be deleted", async ({ page }) => {
      await createNote(page);

      await page.locator("text=view").first().click();
      await page.locator("text=remove").click();
      await page.on("dialog", (dialog) => {
        console.log(dialog.message());
        dialog.accept();
      });
      await expect(
        page.locator("text=view") && page.locator("text=hide")
      ).not.toBeVisible();
    });

    describe("Blog ownership", () => {
      test("only the creator can see the delete button", async ({
        page,
        request,
      }) => {
        // User who creates the blog
        const creatorUsername = "creatoruser";
        const creatorPassword = "creatorpass";

        await page.locator("button:has-text('logout')").click();

        await request.post("http://localhost:3111/api/users", {
          data: {
            username: creatorUsername,
            name: "creatoruser",
            password: creatorPassword,
          },
        });

        await page.goto("http://localhost:5173/");

        // Create and login the first user (creator)
        await page.locator("input[name='username']").fill(creatorUsername);
        await page.locator("input[name='password']").fill(creatorPassword);
        await page.locator("button:has-text('login')").click();

        await page.locator("text=logout").waitFor();

        // Create a note
        await createNote(page);

        // Log out the first user
        await page.locator("button:has-text('logout')").click();

        // Create and login the second user (viewer)
        await page.locator("input[name='username']").fill(username);
        await page.locator("input[name='password']").fill(password);
        await page.locator("button:has-text('login')").click();

        // Attempt to view the blog
        await page.locator("text=view").first().click();

        // Check if the delete button is not visible
        await expect(
          page.locator("button:has-text('remove')")
        ).not.toBeVisible();
      });
    });
  });
});
