import firestore from './firestore.js';
import axios from 'axios';

/**
 * LLM service that calls Gemini (Vertex AI) when configured via env.
 * If not configured, returns a simple echo response for development.
 */

const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // optional

export const generateBotResponse = async (messages: Array<{ id: string, created_at: string, sender: string, text: string }>, userId?: string) => {
  // Compose prompt/context from messages
  const prompt = messages.map(m => `${m.sender === 'user' ? 'User' : 'Bot'}: ${m.text}`).join('\n') + '\nBot:';

  // If GEMINI_API_KEY or project is configured, call Vertex AI API
  if (GEMINI_API_KEY && PROJECT_ID) {
    // use REST API for Vertex AI - this is a simplified example; in prod use google-auth-library to sign requests
    const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/text-bison:predict`;
    try {
      const resp = await axios.post(url, {
        instances: [{ content: prompt }]
      }, {
        headers: {
          'Authorization': `Bearer ${GEMINI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      const text = resp.data?.predictions?.[0]?.content || resp.data?.predictions?.[0] || resp.data;
      return String(text);
    } catch (e: unknown) {
      const err: any = e;
      console.error('LLM call failed', err?.response?.data || err?.message || err);
      return `Sorry, I couldn't generate a response right now.`;
    }
  }

  // Fallback: echo last user message reversed or a canned response for dev
  const lastUser = [...messages].reverse().find(m => m.sender === 'user');
  if (!lastUser) return "Hello! How can I help you today?";
  return `Echoing: ${lastUser.text}`;
};

export default { generateBotResponse };
