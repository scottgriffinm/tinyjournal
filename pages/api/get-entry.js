import pool from '../../lib/db';
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [entry] = await pool.query(
      `SELECT 
         DATE_FORMAT(dateTime, "%m/%d/%y %h:%i %p") as formattedDateTime, 
         text, 
         longSummary, 
         emotions, 
         observation, 
         recommendations 
       FROM entries 
       WHERE id = ? AND email = ?`,
      [id, token.email]
    );
/asdgasdg
    if (entry.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.status(200).json(entry[0]);
  } catch (error) {
    console.error('Error fetching entry:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}