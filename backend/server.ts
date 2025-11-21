import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
});

const generateAIResponse = async (prompt: string, text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `${prompt}\n\n${text}`,
    });

    const result = response.text ?? ""; 

    if (!result.trim()) {
      throw new Error("Empty response from Gemini API");
    }

    return result;
  } catch (error: any) {
    console.error("Gemini API Error:", error.message);
    throw new Error("Failed to generate AI response");
  }
};

app.post("/api/ai/summarize", async (req: Request, res: Response) => {
  try {
    const { text } = req.body as { text: string };
    if (!text?.trim()) {
      return res.status(400).json({ success: false, error: "Text is required" });
    }

    const prompt = `
    You are an expert text summarizer. Summarize the following text clearly and concisely in 2–3 sentences. 
    Focus on the main ideas and remove unnecessary details or repetition. 
    Keep the summary natural, easy to read, and in the same language as the input.
    
    Text:
    `;
    const summary = await generateAIResponse(prompt, text);

    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/ai/expand", async (req: Request, res: Response) => {
  try {
    const { text } = req.body as { text: string };
    if (!text?.trim()) {
      return res.status(400).json({ success: false, error: "Text is required" });
    }

    const prompt = `
    Expand the following text by adding helpful details and examples,
    but keep the tone natural. 
    Return ONLY the expanded text, no explanations or formatting:
    
    "${text}"
    `;
    const expanded = await generateAIResponse(prompt, text);

    res.json({ success: true, data: expanded });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/ai/improve", async (req: Request, res: Response) => {
  try {
    const { text } = req.body as { text: string };
    if (!text?.trim()) {
      return res.status(400).json({ success: false, error: "Text is required" });
    }

    const prompt = `
    You are a professional writing assistant. 
    Improve the following text for grammar, clarity, and tone.
    Do NOT include any explanations, options, or bullet points.
    Return ONLY the improved version of the text:

    "${text}"
    `;
    const improved = await generateAIResponse(prompt, text);

    res.json({ success: true, data: improved });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/ai/autocomplete", async (req: Request, res: Response) => {
  try {
    const { text } = req.body as { text: string };
    if (!text?.trim()) {
      return res.status(400).json({ success: false, error: "Text is required" });
    }

    const prompt = `
    You are an AI writing assistant.
    Continue writing the following text naturally.
    Keep the same tone and context.
    DO NOT rewrite the text, only continue it.
    DO NOT add explanations.

    TEXT TO CONTINUE:
    "${text}"
    `;

    const continuation = await generateAIResponse(prompt, text);

    res.json({ success: true, data: continuation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});


app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
