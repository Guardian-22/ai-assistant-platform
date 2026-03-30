import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors({
  origin: "*", // temporary (for testing)
})); 

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1", // Fixed: Added /openai/v1
});

// Logic function
async function getLLMResponse(prompt) {
  const completion = await openai.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: "You are a helpful assistant.Keep answers clear, and well formatted using bullet points when needed." },
      { role: "user", content: prompt }
    ],
  });

  // completion.choices[0] is the standard way to access the first response
  return completion.choices[0].message.content;
}

// API Route
app.post("/chat", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await getLLMResponse(prompt);
    res.json({ response });
  } catch (err) {
    console.error("AI Error:", err.message); // Log the specific message for easier debugging
    res.status(500).json({ response: "Error generating response" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
