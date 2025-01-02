// ==============================
// Imports
// ==============================
import pool from '../../lib/db';
import { getToken } from 'next-auth/jwt';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ==============================
// Helper Functions
// ==============================


/**
 * Extracts the JSON object from a response string.
 * 
 * @param {string} response - The string containing the JSON object.
 * @returns {object|null} - The extracted JSON object, or null if parsing fails.
 */
function extractJSON(response) {
  try {
    // Use a regex to match the JSON object in the string
    const jsonMatch = response.match(/{[^}]*}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null; // Return null if no JSON is found
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

// ==============================
// Main Handler
// ==============================

/**
 * API route handler for creating a journal entry.
 * Supports POST method only.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const gemini = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const generateSummary = async (prompt) => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      return text.trim();
    };

    // Generate short summary
    const shortSummary = text.slice(0,28) + "...";

    // Get emotion values from 0-1 for happiness, connection, and productivity
    const emotionValuesPrompt = `Return just a json dict ( no other text ) of general emotions detected in the following personal journal entry.
    The emotions are happiness, connection, and productivity, and they should be gauged in a scale of intensity from 0-1 with floating point numbers.

    Happiness: A state of well-being and contentment, often characterized by feelings of joy, satisfaction, and fulfillment.
    Connection: The sense of being emotionally or socially linked to others, fostering meaningful relationships and shared understanding.
    Productivity: The ability to efficiently achieve desired outcomes or complete tasks, often measured by the quality and quantity of output in a given time.

    Example json dict:
    {
    "happiness": .75,
    "connection": .96,
    "productivity": .83,
    }
    
    Journal entry: ${text}
    `;

    const emotionValuesResponse = await generateSummary(emotionValuesPrompt);
    const emotionValuesJSON = extractJSON(emotionValuesResponse);
    console.log(emotionValuesJSON);

    // Generate long summary
    const longSummaryPrompt = `Provide a summary of ALL events and feelings for the following journal entry. The summary should be at most 200 characters, and should cover ALL essential details and important events. List all events and feelings. List all events and feelings and don't forget any. :\n\n${text}`;
    const longSummary = await generateSummary(longSummaryPrompt);

    const id = uuidv4();
    const dateTime = new Date();

    await pool.query(
      'INSERT INTO entries (id, email, dateTime, shortSummary, longSummary, text, emotions) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, token.email, dateTime, shortSummary, longSummary, text, JSON.stringify(emotionValuesJSON)]
    );

    res.status(201).json({ message: 'Entry created successfully', id, shortSummary, longSummary });
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}