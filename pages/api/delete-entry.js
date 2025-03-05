import pool from '../../lib/db';
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the request body
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    // Validate user session
    let token;
    if (process.env.TEST_MODE) { 
      token = { email: process.env.TEST_EMAIL };
    } else {
      token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (!token || !token.email) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    // Delete the entry with the given text and user's email
    const [result] = await pool.query(
      `DELETE FROM entries WHERE text = ? AND email = ?`,
      [text, token.email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Entry not found or already deleted' });
    }

    return res.status(200).json({ message: 'Entry successfully deleted' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}