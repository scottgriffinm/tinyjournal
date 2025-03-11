import { test, expect } from '@playwright/test';
import fs from 'fs';

// Read the text file and split entries by `---`
const rawData = fs.readFileSync('tests/generate-data/alex-carter-entries.txt', 'utf8');
const entries = rawData.split('\n---\n').map(entry => entry.trim());

// Generate data (character is Alex Carter, a normal software dev that finds love)
test.describe('Generate Data (Alex Carter)', () => {
  test('Create all entries', async ({ page }) => {
    await page.goto('http://localhost:3000/'); // Navigate to home
    
    let entry_number = 0;
    for (const entry_text of entries) { // Create each new entry
    entry_number+=1;
    if (entry_number<15) {
        continue;
    }
    await page.waitForTimeout(5000); // initially wait

    console.log(`Creating entry ${entry_number}/${entries.length}...`)
    // Click on new entry button
    console.log('Clicking on new entry button...');
    await page.getByTestId('new-entry').click();
    console.log("✅ New entry button clicked.");
    
    // Type the journal entry
    console.log('Typing the journal entry...');
    await page.locator('textarea').fill(entry_text);
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
            await page.waitForTimeout(10000); // initially wait one second 
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
    await page.waitForTimeout(1000); // wait

    }
   
  });

});