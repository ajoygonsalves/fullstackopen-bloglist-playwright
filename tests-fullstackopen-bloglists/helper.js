import { expect } from "@playwright/test";

const createNote = async (page, content) => {
  console.log("Starting createNote function");
  const createBlogButton = page.locator("text=Create new blog post");
  await createBlogButton.click();
  console.log("Create blog button clicked");
  await page.locator("input[name='title']").fill(content.title);
  await page.locator("input[name='author']").fill(content.author);
  await page.locator("input[name='url']").fill(content.url);
  await page.locator("button:has-text('create')").click();
  console.log("Create button clicked, waiting for confirmation");
  await expect(page.locator("text=added")).toBeVisible();
  console.log("Blog created successfully");
};

// Add this function to your helper file
async function loginUser(page, username, password) {
  await page.locator("input[name='username']").fill(username);
  await page.locator("input[name='password']").fill(password);
  await page.locator("button:has-text('login')").click();
}

// This function simulates liking a blog post multiple times
async function likePost(page, title, times) {
  for (let i = 0; i < times; i++) {
    await page.locator(`text=${title}`).locator("text=view").click();
    await page.locator(`text=${title}`).locator("text=like").click();
    // Ensure the like is registered before clicking again
    await page.waitForTimeout(500);
  }
}

export { createNote, loginUser, likePost };
