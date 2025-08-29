import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });
  // Extract text from response
  const text =
    response?.candidates?.[0]?.content?.parts
      ?.map((p) => p?.text || "")
      .join("") ?? "";

  return text.trim();
}

export default main;
