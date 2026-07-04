import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
import issueRoutes from './routes/issueRoutes';
import userRoutes from './routes/userRoutes';
import locationRoutes from './routes/locationRoutes';
import aiRoutes from './routes/aiRoutes';
import commentRoutes from './routes/commentRoutes';
import chatbotRoutes from './routes/chatbotRoutes';
import inviteRoutes from './routes/inviteRoutes';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL || '',
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', commentRoutes);          // /api/issues/:id/comments, /api/issues/:id/logs, /api/comments/:id
app.use('/api/chatbot', chatbotRoutes);  // /api/chatbot/message
app.use('/api/invites', inviteRoutes);  // /api/invites

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.path} not found` });
});

// Global error handler
app.use(errorHandler);

export default app;
