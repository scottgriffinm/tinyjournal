import pool from '../../lib/db';
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [entries] = await pool.query(
      'SELECT id, DATE_FORMAT(dateTime, "%m/%d/%y") as formattedDate, shortSummary FROM entries WHERE email = ? ORDER BY dateTime DESC',
      [token.email]
    );

    res.status(200).json({ entries });
  } catch (error) {
    console.error('Error fetching entries:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}