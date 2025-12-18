import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import ratingRoutes from './routes/ratingRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import storyRoutes from './routes/storyRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for localhost development
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5000',
    'https://researcher-hut-qabi.onrender.com', // Your actual Frontend URL
    'https://researcher-hut.vercel.app', // Vercel deployment
    process.env.CLIENT_URL || '' // Fallback from environment variables
  ],
  credentials: true,
}));
app.use(express.json());

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

export default app;
