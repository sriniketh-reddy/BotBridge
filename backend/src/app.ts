import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import mcpRoutes from './routes/mcp.js';

const app = express();

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

app.use(cors({ origin: BASE_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/mcp', mcpRoutes);

export default app;
