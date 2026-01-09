import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const logPath = path.join(process.cwd(), 'debug_llm.log');
try {
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] Loading gemini.ts\n`);
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] GEMINI_API_KEY at top level: ${process.env.GEMINI_API_KEY ? 'PRESENT' : 'MISSING'}\n`);
} catch (e) {
  // ignore
}

/**
 * LLM service that calls Gemini when configured via env.
 * If not configured, returns a simple echo response for development.
 */

export const generateBotResponse = async (messages: Array<{ id: string, created_at: string, sender: string, text: string }>, userId?: string) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  try {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] generateBotResponse called. Key present: ${!!GEMINI_API_KEY}\n`);
  } catch (e) { }

  // If GEMINI_API_KEY is configured, call Gemini API
  if (GEMINI_API_KEY) {
    try {
      fs.appendFileSync(logPath, `[${new Date().toISOString()}] Initializing GoogleGenerativeAI...\n`);
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
      fs.appendFileSync(logPath, `[${new Date().toISOString()}] Model initialized successfully\n`);

      // Convert chat history to Gemini format
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      if (history.length === 0) {
        return "Error: No messages to send.";
      }

      const chat = model.startChat({
        history: history.slice(0, -1), // all but last
      });

      const lastMsg = history[history.length - 1]!;
      if (lastMsg.role !== 'user') {
        return "Error: Last message was not from user.";
      }

      if (!lastMsg.parts || lastMsg.parts.length === 0) {
        return "Error: Message content is empty.";
      }

      fs.appendFileSync(logPath, `[${new Date().toISOString()}] Sending message to Gemini: "${lastMsg.parts[0]!.text.substring(0, 50)}..."\n`);
      const result = await chat.sendMessage(lastMsg.parts[0]!.text);
      fs.appendFileSync(logPath, `[${new Date().toISOString()}] Received result from Gemini\n`);
      const response = await result.response;
      const text = response.text();
      fs.appendFileSync(logPath, `[${new Date().toISOString()}] Response text: "${text.substring(0, 100)}..."\n`);
      return text;

    } catch (e: unknown) {
      const err: any = e;
      fs.appendFileSync(logPath, `[${new Date().toISOString()}] ERROR in Gemini call: ${err?.message || JSON.stringify(err)}\n`);
      console.error('LLM call failed', err?.message || err);
      return `Sorry, I couldn't generate a response right now. (Error: ${err?.message || 'Unknown'})`;
    }
  } else {
    return "DEBUG ERROR: GEMINI_API_KEY is missing inside function!";
  }
};
