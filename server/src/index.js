import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import jwt from 'jsonwebtoken';

import authRoutes    from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import adminRoutes   from './routes/admin.js';
import uploadRoutes  from './routes/upload.js';
import paymentRoutes from './routes/payments.js';
import messageRoutes from './routes/messages.js';
import favoriteRoutes from './routes/favorites.js';
import sellerRoutes from './routes/sellers.js';
import savedSearchRoutes from './routes/savedSearches.js';
import { handleWebhook } from './controllers/paymentsController.js';
import { setIo } from './socket.js';
import { authLimiter, apiLimiter, uploadLimiter } from './middleware/rateLimiter.js';
import { startAlertsJob } from './services/alertsJob.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Stripe webhook — raw body BEFORE express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(cors({ origin: [process.env.CLIENT_URL || 'http://localhost:5173'] }));
app.use(express.json({ limit: '10mb' }));
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  app.use('/uploads', express.static('uploads'));
}

// Rate limiting
app.use('/api', apiLimiter);

app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: Date.now() }));
app.use('/api/auth',     authLimiter, authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/upload',   uploadLimiter, uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/saved-searches', savedSearchRoutes);

// Socket.io
const io = new SocketIO(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Unauthorized'));
  try { socket.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { next(new Error('Invalid token')); }
});

io.on('connection', (socket) => {
  socket.on('join_conversation',  (id) => socket.join(`conv_${id}`));
  socket.on('leave_conversation', (id) => socket.leave(`conv_${id}`));

  socket.on('typing', ({ conversationId, isTyping }) => {
    socket.to(`conv_${conversationId}`).emit('user_typing', { userId: socket.user.id, isTyping });
  });
});

setIo(io);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

httpServer.listen(PORT, () => {
  console.log(`Server → http://localhost:${PORT}`);
  startAlertsJob();
});
