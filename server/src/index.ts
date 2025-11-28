import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import ratingRoutes from './routes/ratingRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'https://researcher-hut.vercel.app',
  'https://researcher-hut-client.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => origin.includes(allowed?.replace('https://', '').replace('http://', '') || ''))) {
      return callback(null, true);
    }
    
    console.log('Blocked by CORS:', origin);
    return callback(null, true); // Allow all for now, restrict later
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Researcher.Hut Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
