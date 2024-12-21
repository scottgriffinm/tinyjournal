import pool from '../../lib/db';
import { getToken } from 'next-auth/jwt';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    const shortSummaryPrompt = `Provide a concise summary for the following journal entry. The summary should be at most 20 characters and end with a characteristic emoji:\n\n${text}`;
    const shortSummary = await generateSummary(shortSummaryPrompt);

    // Generate long summary
    const longSummaryPrompt = `Provide a summary of ALL events and feelings for the following journal entry. The summary should be at most 200 characters, and should cover ALL essential details and important events. List all events and feelings. List all events and feelings and don't forget any. :\n\n${text}`;
    const longSummary = await generateSummary(longSummaryPrompt);

    const id = uuidv4();
    const dateTime = new Date();

    await pool.query(
      'INSERT INTO entries (id, email, dateTime, shortSummary, longSummary, text) VALUES (?, ?, ?, ?, ?, ?)',
      [id, token.email, dateTime, shortSummary, longSummary, text]
    );

    res.status(201).json({ message: 'Entry created successfully', id, shortSummary, longSummary });
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}