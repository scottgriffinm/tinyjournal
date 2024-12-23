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

    // 4) Construct the prompt
    //    a) Summaries with date
    //    b) The conversation so far
    //    c) The user’s current message
    let summariesSection = "These are summaries of the users journal entries:\n";
    entries.forEach((entry, i) => {
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

Please provide a thoughtful, relevant, and concise response based on the user's journal summaries past messages, and current message. Make sure to be thoughful and as helpful and analytical as possible, but focus on positivity and always try to help the user.
If you see any seriously concerning behavior, make sure to remind the user in an emergency they should call 911 and seek professional assistance. They are not alone.
    `.trim();

    // 5) Call the Google Generative AI "gemini-1.5-flash" model
    const gemini = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const aiText = (await response.text()).trim();

    return res.status(200).json({ aiResponse: aiText });
  } catch (error) {
    console.error("Error in analyze handler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}