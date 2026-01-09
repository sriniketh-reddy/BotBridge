// Load environment variables early so config modules (firebase) can read them
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 4000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`Server listening on ${BASE_URL}`);
  console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
});
