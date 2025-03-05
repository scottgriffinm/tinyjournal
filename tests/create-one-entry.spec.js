import { test, expect } from '@playwright/test';

const TEST_ENTRY_TEXT = "This is a Playwright test journal entry.";

test.describe('Journal Entry Creation', () => {
  test('Create one new journal entry and verify it exists', async ({ page }) => {
    await page.goto('http://localhost:3000/'); // Navigate to home
    // Click on new entry button
    console.log('Clicking on new entry button...');
    await page.getByTestId('new-entry').click();

    // Type the journal entry
    console.log('Typing the journal entry...');
    await page.locator('textarea').fill(TEST_ENTRY_TEXT);

    // Try up to three times to save the entry
    console.log('Trying up to three times to save the entry...');
    let found = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
        // Save the entry
        console.log(`Attempt ${attempt} to save the entry...`);
        await page.getByTestId('save-button').click();
        await page.waitForTimeout(100); // wait
        await page.getByTestId('save-dialog-save-button').click();
       
        // Check success: look for analysis pane or error close button for a max of about ten seconds
        let result = "Error";
        for (let second=0; second<10; second++) {
          console.log(second);
          await page.waitForTimeout(1000); // initially wait one second
          // Check for close button
          const analysisPanelCloseButton = page.locator('[data-testid="analysis-panel-close-button"]');
          if (await analysisPanelCloseButton.count() > 0) {
            console.log("✅ Analysis panel close button found!");
            result = "Success";
            break; // Exit loop
          }
          // Check for error dialog
          const errorDialogCloseButton = page.locator('[data-testid="error-dialog-close-button"]');
          if (await errorDialogCloseButton.count() > 0) {
            console.log("❌ Error dialog close button found. Resubmitting...");
            break; // Exit loop 
          }
        }
        // Check if the entry was sucessfully saved
        if (result === "Success") {
            found = true;
            break; // Exit loop 
        } else {
          // Try again!
          await page.getByTestId('error-dialog-close-button').click();
        }
    }

    // Check if entry saved   
    expect(found).toBeTruthy(); 

    // Click close
    await page.getByTestId('analysis-panel-close-button').click();
    await page.waitForTimeout(3000); // wait

    // Check for entry in entry list
    const searchText = TEST_ENTRY_TEXT.slice(0, 15);
    const feedItems = await page.locator('.feed-item').all();

    // Check for a feed item that matches the first 15 characters of the test entry
    found = false;
    for (const feedItem of feedItems) {
        const itemText = await feedItem.innerText(); // Get the text content of the feed item
        if (itemText.includes(searchText)) {
            await feedItem.click(); // Click on the matching entry
            found = true;
            break; // Exit loop once a match is found
        }
    }
    // check if entry is present in feed
    expect(found).toBeTruthy();

    // Ensure we navigated to an entry page
    await expect(page).toHaveURL(/\/entry\?id=/);

    // Validate entry text
    const journalEntryElement = await page.getByTestId('journal-entry-text');
    const actualText = await journalEntryElement.innerText();
    expect(actualText.toBe(TEST_ENTRY_TEXT));
  });

});