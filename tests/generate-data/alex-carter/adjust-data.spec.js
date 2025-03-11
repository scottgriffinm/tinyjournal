import { test, expect } from '@playwright/test';
import pool from "../../../lib/db"; // Import the MySQL connection pool
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Adjust data (dateTimes)
test.describe('Adjust Data', () => {
  test('Adjust Dates', async () => {
    // Check if the user exists in the database
    console.log(process.env.DB_USER);
    const [rows] = await pool.query("SELECT dateTime FROM entries WHERE email = ? ORDER BY dateTime asc", [process.env.TEST_EMAIL]);
    console.log(rows);
  });
});