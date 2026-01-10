import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import ratingRoutes from './routes/ratingRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import storyRoutes from './routes/storyRoutes';
import { securityHeaders, rateLimit, errorHandler } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - SECURITY FIX: Don't allow empty string origins (CORS bypass)
const allowedOrigins = [
  'http://localhost:3000',  // Local development
  'https://researcher-hut.vercel.app', // Production frontend
];

// Only add CLIENT_URL if it's a valid URL (not empty string)
if (process.env.CLIENT_URL && process.env.CLIENT_URL.trim()) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}));
app.use(cookieParser());
app.use(express.json());

// Security headers and general rate limiting
app.use(securityHeaders);
app.use(rateLimit(15 * 60 * 1000, 100));

// Routes
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Researcher.Hut Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Error handler (should be last)
app.use(errorHandler);

export default app;
