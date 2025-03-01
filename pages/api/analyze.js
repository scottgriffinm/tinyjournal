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
    // Validate user session
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Parse request body
    const { messages, userMessage } = req.body;
    if (!Array.isArray(messages) || !userMessage) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Fetch user's journal entries
    const [entries] = await pool.query(
      `SELECT 
         DATE_FORMAT(dateTime, "%m/%d/%y") as formattedDate,
         longSummary
       FROM entries
       WHERE email = ?
       ORDER BY dateTime ASC`,
      [token.email]
    );

    if (entries.length === 0) {
      return res
        .status(200)
        .json({ aiResponse: "To talk about your journal, you need to make at least one entry." });
    }

    // Construct prompt
    const summariesSection = [
      "These are summaries of the user's journal entries:",
      ...entries.map(
        (entry) =>
          `Entry date: ${entry.formattedDate}]\n Summary: ${entry.longSummary}\n`
      ),
    ].join("\n");

    const conversationSection = [
      "Previous messages in this conversation:",
      ...messages.map((msg) =>
        msg.type === "user" ? `User: ${msg.content}` : `AI: ${msg.content}`
      ),
    ].join("\n");

    const finalPrompt = `
You are analyzing a user's journaling data. Make sure to keep a helpful and caring attitude. You are an AI but you care about the person you're talking to.

${summariesSection}

${conversationSection}

Now the user is asking:
"${userMessage}"

Please provide a thoughtful, relevant, and concise response based on the user's journal summaries, past messages, and current message. Make sure to be thoughtful and as helpful and analytical as possible, but focus on positivity and always try to help the user.
If you see any seriously concerning behavior, make sure to remind the user in an emergency they should call 911 and seek professional assistance. But only tell them once per conversation. Make sure to then actually try help them analyze any potential cognitive distortions and try to show them the brighter side of things.
Keep it relatively concise.
    `.trim();

    // Call the Google Generative AI "gemini-1.5-flash" model
    const gemini = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(finalPrompt);
    const aiText = (await result.response.text()).trim();

    // If userMessage is "Analyze trends in my journal", also fetch data for charts
    let emotionData = null;
    let entryHistoryData = null;
    if (userMessage.trim().toLowerCase() === "analyze trends in my journal") {
      const [chartEntries] = await pool.query(
        `SELECT dateTime, emotions
         FROM entries
         WHERE email = ?
         ORDER BY dateTime ASC`,
        [token.email]
      );

      console.log(chartEntries);

      emotionData = chartEntries.map((row) => {
        const parsedEmotions =
          typeof row.emotions === "object"
            ? row.emotions
            : JSON.parse(row.emotions || "{}");
        const dateObj = new Date(row.dateTime);

        return {
          date: dateObj.toISOString().split("T")[0],
          happiness: parsedEmotions.happiness ?? 0,
          connection: parsedEmotions.connection ?? 0,
          productivity: parsedEmotions.productivity ?? 0,
        };
      });

      entryHistoryData = chartEntries.map((row) => {
        const dateObj = new Date(row.dateTime);
        return {
          date: dateObj.toISOString().split("T")[0],
          timeValue: dateObj.getHours(),
        };
      });
    }

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