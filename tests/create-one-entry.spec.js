import { test, expect } from '@playwright/test';

const TEST_ENTRY_TEXT = "This is a Playwright test journal entry.";

test.describe('Journal Entry Creation', () => {
  test('Create one new journal entry and verify it exists', async ({ page }) => {
    await page.goto('http://localhost:3000/'); // Navigate to home
    // Click on new entry button
    console.log('Clicking on new entry button...');
    await page.getByTestId('new-entry').click();
    console.log("✅ New entry button clicked.");
    
    // Type the journal entry
    console.log('Typing the journal entry...');
    await page.locator('textarea').fill(TEST_ENTRY_TEXT);
    console.log("✅ Journal entry typed.");

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
            console.log("✅ Analysis panel close button found.");
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
    console.log("✅ Entry successfully saved.");

    // Click close
    console.log("Clicking close button...");
    await page.getByTestId('analysis-panel-close-button').click();
    console.log("✅ Close button clicked.");
    await page.waitForTimeout(3000); // wait

    // Check for entry in entry list
    console.log("Checking if entry in home page entry list...");
    const searchText = TEST_ENTRY_TEXT.slice(0, 15);
    const feedItems = await page.locator('.feed-item').all();
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
    console.log("✅ Entry found in entry list on home page.");

    // Ensure we navigated to an entry page
    console.log("Ensuring we navigated to an entry page...");
    await expect(page).toHaveURL(/\/entry\?id=/);
    console.log("✅ Navigated to entry page.");

    // Validate entry text
    console.log("Validating entry text...");
    const journalEntryElement = await page.getByTestId('journal-entry-text');
    const actualText = await journalEntryElement.innerText();
    expect(actualText).toBe(TEST_ENTRY_TEXT);
    console.log("✅ Entry text validated.");
  });

  test.afterEach(async ({ request }) => {
    console.log("🔄 Cleaning up test entry...");
    const response = await request.delete('http://localhost:3000/api/delete-entry', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        text: TEST_ENTRY_TEXT,
      },
    });
  
    const responseBody = await response.json();
    
    if (response.ok) {
      console.log("✅ Test entry successfully deleted.");
    } else {
      console.error("❌ Failed to delete test entry:", responseBody.error);
    }
  });

});