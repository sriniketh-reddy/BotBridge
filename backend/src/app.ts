import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import mcpRoutes from './routes/mcp.js';
import debugRoutes from './routes/debug.js';

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
// Basic request logger for debugging
app.use((req, res, next) => {
	const start = Date.now();
	res.on('finish', () => {
		const ms = Date.now() - start;
		// avoid logging sensitive headers
		console.debug(`[req] ${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`);
	});
	next();
});

// Configure CORS to allow the frontend origin and include credentials (cookies)
// Add a light-weight middleware that explicitly sets the CORS headers for the allowed frontend origin.
// This ensures the server never responds with Access-Control-Allow-Origin: '*' when credentials are used.
app.use((req, res, next) => {
	const origin = req.headers.origin as string | undefined;
	if (origin && origin === FRONTEND_ORIGIN) {
		res.header('Access-Control-Allow-Origin', origin);
		res.header('Access-Control-Allow-Credentials', 'true');
		res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
		res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
	}
	// Handle preflight quickly
	if (req.method === 'OPTIONS') {
		return res.sendStatus(204);
	}
	next();
});

// Keep the cors middleware configured (redundant but safe). It will respect the headers above.
app.use(
	cors({
		origin: FRONTEND_ORIGIN,
		credentials: true,
	})
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/mcp', mcpRoutes);
// mount debug routes in non-production for quick debugging
if (process.env.NODE_ENV !== 'production') {
	app.use('/api/debug', debugRoutes);
}

export default app;
