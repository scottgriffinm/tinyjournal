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

/**
 * Extracts a list of three pieces of text from a string, where each piece is separated by any number of newlines.
 *
 * @param {string} inputString - The input string containing three pieces of text separated by newlines.
 * @returns {Array<string>} - An array containing the three pieces of text as individual items.
 * @throws {Error} - Throws an error if the input string does not contain exactly three pieces of text.
 */
const extractList = (inputString) => {
  // Split the input string using one or more newlines as the delimiter
  const items = inputString.split(/\n+/).map((item) => item.trim()).filter((item) => item.length > 0);

  // Validate that the input contains exactly three pieces of text
  if (items.length !== 3) {
    throw new Error('Input string must contain exactly three pieces of text.');
  }

  return items;
};

/**
 * Fetches all dateTimes, longSummaries, and emotions from the entries table.
 *
 * @returns {Promise<Array<{ dateTime: Date, longSummary: string, emotions: any }>>} - A promise that resolves to an array of objects containing the dateTime, longSummary, and emotions.
 * @throws {Error} - Throws an error if the database query fails.
 */
const getSelectedEntryData = async () => {
  try {
    // Query to fetch the desired fields from the entries table
    const [rows] = await pool.query(
      'SELECT dateTime, longSummary, emotions FROM entries ORDER BY dateTime ASC'
    );

    // Parse emotions field (JSON) for each entry
    const result = rows.map((row) => ({
      dateTime: row.dateTime,
      longSummary: row.longSummary,
      emotions: row.emotions, // Parse JSON field
    }));

    return result;
  } catch (error) {
    console.error('Error fetching entries data:', error);
    throw error; // Rethrow the error for handling upstream
  }
};

/**
 * Constructs a formatted string representation of the selected entry data.
 *
 * Each entry includes the date and time, emotions, and long summary. The most recent entry
 * is emphasized at the beginning of its description. Additionally, the full text of the
 * final entry is appended at the end.
 *
 * @param {Array<{ dateTime: string, emotions: Object, longSummary: string }>} selectedEntryData - 
 * An array of entry objects containing `dateTime`, `emotions`, and `longSummary`.
 * @param {string} text - The full text associated with the final (most recent) entry.
 * @returns {string} - A formatted string representation of the entries.
 */
const constructAllEntriesString = (selectedEntryData, text) => {
  let selectedEntryDataString = '';

  // Loop through the entries to construct the body of the string
  selectedEntryData.forEach((entry, index) => {
    const { dateTime, emotions, longSummary } = entry;

    // Add emphasis if this is the last entry
    if (index === selectedEntryData.length - 1) {
      selectedEntryDataString += `This is the most recent entry:\n`;
    }

    selectedEntryDataString += `Entry ${index + 1}:\n`;
    selectedEntryDataString += `- Date and Time: ${new Date(dateTime).toLocaleString()}\n`;
    selectedEntryDataString += `- Emotions: ${JSON.stringify(emotions)}\n`;
    selectedEntryDataString += `- Summary: ${longSummary}\n\n`;
  });

  // Add the full text for the final entry
  selectedEntryDataString += `- Full text for final entry: ${text}`;

  return selectedEntryDataString;
};

/**
 * Constructs a prompt for generating an observation about the user's entries.
 *
 * The prompt begins with a request to provide an observation about the user's entries,
 * focusing on the most recent entry. It appends the provided formatted string of
 * selected entry data to the prompt.
 *
 * @param {string} selectedEntryDataString - A formatted string representation of the user's entries.
 * @returns {string} - The constructed observation prompt.
 */
const constructObservationPrompt = (selectedEntryDataString) => {
  // Start constructing the prompt
  let prompt = `I want you to give an trend observation about the user's entries that relates to the most recent entry. Your observation should be no more than one brief sentence. The observation should be relevant for the users most recent entry but keep all past entries in mind.
  The observation should be short enough to have no commas. 
  \n\nHere are some example observations:\n
  You seem to feel more productive and energized on Mondays.\n
  This has been a very happy week for you.\n
  You seem to feel sad on Sundays.\n
  It seems like being around friends always cheers you up.
  \n\n`;
  prompt += selectedEntryDataString;
  return prompt;
};

/**
 * Constructs a prompt for generating three distinct recommendations based on the user's entries.
 *
 * The prompt requests three recommendations specifically related to the most recent entry, 
 * while considering the context of all previous entries. Each recommendation is expected to 
 * be distinct and separated by three newlines in the response.
 *
 * @param {string} selectedEntryDataString - A formatted string representation of the user's entries.
 * @returns {string} - The constructed recommendations prompt.
 */
const constructRecommendationsPrompt = (selectedEntryDataString) => {
  // Start constructing the prompt
  let prompt = `I want you to return ONLY three distinct recommendations, each separated by three newlines. The recommendations should be most specifically about the most recent entry, but should keep the users history in mind. The recommendations should be relevant to what the users says in their most recent entry. Do not respond with anything but the three recommendations, separated by three newlines each. Do under any circumstances recommend that the user use a different journaling app.
  \n\n`;
  prompt += selectedEntryDataString;
  return prompt;
};


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

    const promptGemini = async (prompt) => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      return text.trim();
    };

    // Generate short summary
    const shortSummary = text.slice(0, 28) + "...";

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

    const emotionValuesResponse = await promptGemini(emotionValuesPrompt);
    const emotionValuesJSON = extractJSON(emotionValuesResponse);
    console.log(emotionValuesJSON);
    const happiness = emotionValuesJSON.happiness;
    const connection = emotionValuesJSON.connection;
    const productivity = emotionValuesJSON.productivity;

    // Generate long summary
    const longSummaryPrompt = `Provide a summary of ALL events and feelings for the following journal entry. The summary should be at most 200 characters, and should cover ALL essential details and important events. List all events and feelings. List all events and feelings and don't forget any. :\n\n${text}`;
    const longSummary = await promptGemini(longSummaryPrompt);

    // Get observation & recommendations
    // Get relevant entry data (dateTime, longSummary, emotions)
    let selectedEntryData = null;
    try {
      selectedEntryData = await getSelectedEntryData();
    } catch (error) {
      console.log('Failed to get selected entry data:', error);
    }
    // Make combined string of all entries
    const allEntriesString = constructAllEntriesString(selectedEntryData, text);

    // Get observation
    const observationPrompt = constructObservationPrompt(allEntriesString);
    const observation = await promptGemini(observationPrompt);

    // Get recommendations
    const recommendationsPrompt = constructRecommendationsPrompt(allEntriesString);
    const recommendationsString = await promptGemini(recommendationsPrompt);
    const recommendations = extractList(recommendationsString);

    // Get total number of entries
    const entryNumber = selectedEntryData.length + 1;

    // Make id
    const id = uuidv4();
    const dateTime = new Date();

    // Save to database
    await pool.query(
      `INSERT INTO entries (id, email, dateTime, shortSummary, longSummary, text, emotions, observation, recommendations) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        token.email,
        dateTime,
        shortSummary,
        longSummary,
        text,
        JSON.stringify(emotionValuesJSON),
        observation,
        JSON.stringify(recommendations)
      ]
    );

    res.status(201).json({ message: 'Entry created successfully', id, entryNumber, dateTime, observation, shortSummary, longSummary, recommendations, happiness, connection, productivity });
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}