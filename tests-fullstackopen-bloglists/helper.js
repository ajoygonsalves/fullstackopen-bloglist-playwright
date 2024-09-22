import { expect } from "@playwright/test";

const createNote = async (page, content) => {
  console.log("Starting createNote function");
  const createBlogButton = page.locator("text=Create new blog post");
  await createBlogButton.click();
  console.log("Create blog button clicked");
  await page.locator("input[name='title']").fill("Cool title");
  await page.locator("input[name='author']").fill("New blog author");
  await page.locator("input[name='url']").fill("www.sampleurl.com");
  await page.locator("button:has-text('create')").click();
  console.log("Create button clicked, waiting for confirmation");
  await expect(page.locator("text=added")).toBeVisible();
  console.log("Blog created successfully");
};

export { createNote };
