import { test, expect } from '@playwright/test';
import pool from "../../../lib/db"; // Import the MySQL connection pool
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

function getRandomTimeAround10PM() {
    const meanHour = 21; // 9 PM
    const stdDev = 2;  // Standard deviation of 2 hours

    // Box-Muller transform for normal distribution
    function randomNormal(mean, stdDev) {
        let u = 1 - Math.random(); // Uniform(0,1] random value
        let v = Math.random();     // Uniform(0,1] random value
        let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v); // Standard normal distribution
        return mean + z * stdDev;  // Scale to desired mean & stdDev
    }

    const hour = Math.round(randomNormal(meanHour, stdDev)) % 24;
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);

    return { hour, minute, second };
}

test.describe('Adjust Data', () => {
  test('Generate Chain of Adjusted Dates', async () => {
    // Get datetimes from database (sorted by dateTime)
    const [rows] = await pool.query(
      "SELECT id FROM entries WHERE email = ? ORDER BY dateTime DESC",
      [process.env.TEST_EMAIL]
    );

    if (rows.length === 0) {
      console.log("No entries found for the given email.");
      return;
    }

    let updates = [];
    let currentDate = new Date(); // Today's date
    currentDate.setUTCDate(currentDate.getUTCDate() - 1); // Start at the day before today

    for (let i = 0; i < rows.length; i++) {
      const { hour, minute, second } = getRandomTimeAround10PM();
      currentDate.setUTCHours(hour, minute, second, 0);

      const newDateTime = currentDate.toISOString().slice(0, 19).replace('T', ' '); // Format for MySQL
      updates.push({ id: rows[i].id, newDateTime });

      console.log(`Updating ID ${rows[i].id}: New DateTime → ${newDateTime}`);

      // Move back 1-10 days for the next entry
      currentDate.setUTCDate(currentDate.getUTCDate() - (Math.floor(Math.random() * 3) + 1));
    }

    // Execute updates in the database
    for (const update of updates) {
        await pool.query("UPDATE entries SET dateTime = ? WHERE id = ?", [update.newDateTime, update.id]);
    }

    console.log(`Successfully updated ${updates.length} entries.`);
  });
});