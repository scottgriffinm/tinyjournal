// pages/api/analyze.js
import { getToken } from "next-auth/jwt";
import pool from "../../lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 1) Validate the user session:
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 2) Parse request body to get conversation messages + new user message
    const { messages, userMessage } = req.body;
    if (!messages || !Array.isArray(messages) || !userMessage) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // 3) Fetch the user’s entries (date + longSummary) from the DB
    const [entries] = await pool.query(
      `SELECT 
         DATE_FORMAT(dateTime, "%m/%d/%y") as formattedDate,
         longSummary
       FROM entries
       WHERE email = ?
       ORDER BY dateTime ASC`,
      [token.email]
    );

    // If no entries yet, respond with no entry message
    if (entries.length === 0) {
      return res
        .status(200)
        .json({ aiResponse: "To talk about your journal, you need to make at least one entry." });
    }

    // 4) Construct the prompt
    let summariesSection = "These are summaries of the users journal entries:\n";
    entries.forEach((entry) => {
      summariesSection += `Entry date: ${entry.formattedDate}]\n Summary: ${entry.longSummary}\n\n`;
    });

    let conversationSection = "Previous messages in this conversation:\n";
    messages.forEach((msg) => {
      if (msg.type === "user") {
        conversationSection += `User: ${msg.content}\n`;
      } else {
        // Bot or AI messages
        conversationSection += `AI: ${msg.content}\n`;
      }
    });

    const finalPrompt = `
You are analyzing a user's journaling data. Make sure to keep a helpful and caring attitude. You are an AI but you care about the person you're talking to.

${summariesSection}

${conversationSection}

Now the user is asking:
"${userMessage}"

Please provide a thoughtful, relevant, and concise response based on the user's journal summaries, past messages, and current message. Make sure to be thoughtful and as helpful and analytical as possible, but focus on positivity and always try to help the user.
If you see any seriously concerning behavior, make sure to remind the user in an emergency they should call 911 and seek professional assistance. They are not alone.
    `.trim();

    // 5) Call the Google Generative AI "gemini-1.5-flash" model
    const gemini = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const aiText = (await response.text()).trim();
    console.log(aiText);

    // -------------------------------------
    // NEW CODE FOR RETURNING CHART DATA
    // -------------------------------------
    let emotionData = null;
    let entryHistoryData = null;

    // If userMessage is exactly "Analyze trends in my journal" (case-insensitive),
    // also return arrays for the EntryEmotionGraph & EntryHistoryChart
    if (userMessage.trim().toLowerCase() === "analyze trends in my journal") {
      // 1. Fetch dateTime & emotions from the DB
      const [chartEntries] = await pool.query(
        `SELECT dateTime, emotions
         FROM entries
         WHERE email = ?
         ORDER BY dateTime ASC`,
        [token.email]
      );

      // 2. Parse data for the charts:
      //    a) emotionData: { date, happiness, connection, productivity }
      emotionData = chartEntries.map((row) => {
        const parsedEmotions = row.emotions ? JSON.parse(row.emotions) : {};
        const dateObj = new Date(row.dateTime);
        const dateStr = dateObj.toISOString().split("T")[0]; // e.g. "2025-01-01"
        return {
          date: dateStr,
          happiness: parsedEmotions.happiness ?? 0,
          connection: parsedEmotions.connection ?? 0,
          productivity: parsedEmotions.productivity ?? 0,
        };
      });

      //    b) entryHistoryData: { date, timeValue }
      //       timeValue = hour of the day, 0-23
      entryHistoryData = chartEntries.map((row) => {
        const dateObj = new Date(row.dateTime);
        const dateStr = dateObj.toISOString().split("T")[0];
        return {
          date: dateStr,
          timeValue: dateObj.getHours(), // hour from 0-23
        };
      });
    }

    // Return AI text plus chart data if requested
    return res.status(200).json({
      aiResponse: aiText,
      emotionData,
      entryHistoryData,
    });
  } catch (error) {
    console.error("Error in analyze handler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}