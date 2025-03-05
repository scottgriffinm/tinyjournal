import { test, expect } from '@playwright/test';
import pool from "../lib/db"; // Import the MySQL connection pool


const TEST_ENTRY_TEXT = "This is a Playwright test journal entry.";
let email = process.env.TEST_EMAIL;
let name = process.env.TEST_NAME;

test.describe('Journal Entry Creation', () => {
    // First test: ensure we have the test user in the database
    test.beforeAll('Ensure test user exists in database', async ({ page }) => {
        // Step 1: Check if the user exists in the database, create if they don't
        let [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) { // If the user does not exist, create a new user
        await pool.query(
            "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
            [email, null, name || "Unknown"]
        );
        console.log(`New user ${email} added to the database`);
        } else {
        console.log(`User ${email} already exists in the database`);
        }
        
        // Step 2: Ensure user exists in the database
        [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        expect(rows.length).toBe(1);
      });

  test('Create a new journal entry and verify it exists', async ({ page }) => {
    await page.goto('http://localhost:3000/'); // Navigate to home
    
    // Step 1: Type the journal entry
    await page.locator('textarea').fill(TEST_ENTRY_TEXT);

    // Step 2: Save the entry
    await page.getByTestId('save-button').click();
    await page.getByTestId('save-button').click();

    // Step 3: Ensure success by checking if redirected to home or analysis appears
    await expect(page).not.toHaveURL(/new-entry/); // Redirects to home or analysis

    // Step 4: Check if the new entry exists in the journal list
    await page.goto('http://localhost:3000/'); // Navigate to home
    await expect(page.locator('div')).toHaveText(TEST_ENTRY_TEXT.slice(0, 42)); // Truncated summary

    // Step 5: Validate via API if necessary
    const response = await page.request.get('http://localhost:3000/api/get-entries');
    const data = await response.json();
    const entryExists = data.entries.some(entry => entry.shortSummary.includes(TEST_ENTRY_TEXT.slice(0, 42)));

    expect(entryExists).toBeTruthy();
  });

});