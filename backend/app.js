import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initClerkMiddleware } from './middleware/auth.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import userRoutes from './routes/userRoutes.js';
import matchRoutes from './routes/matchRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// ======================
// MIDDLEWARE
// ======================

// Security & CORS
app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Clerk authentication
app.use(initClerkMiddleware);

// ======================
// DATABASE CONNECTION
// ======================

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Connect to database
connectDB();

// ======================
// ROUTES
// ======================

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// API routes with rate limiting
app.use('/api/users', rateLimiter, userRoutes);
app.use('/api/matches', rateLimiter, matchRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: 'The requested resource does not exist',
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// ======================
// SOCKET.IO LOGIC
// ======================

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a specific chat room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    // Send message to room
    socket.on('send-message', (data) => {
        const { roomId, message, senderId, senderName, timestamp } = data;

        // Broadcast message to all users in the room
        io.to(roomId).emit('receive-message', {
            message,
            senderId,
            senderName,
            timestamp: timestamp || new Date().toISOString(),
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// ======================
// SERVER START
// ======================

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🔌 Socket.io ready for real-time connections`);
});

export default app;