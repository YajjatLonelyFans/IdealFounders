import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import config from './config.js';
import { initClerkMiddleware } from './middleware/auth.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import userRoutes from './routes/userRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
    cors: {
        origin: [config.frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
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
        origin: [config.frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
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
        await mongoose.connect(config.mongodbUri);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
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
app.use('/api/chat', rateLimiter, chatRoutes);

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
    socket.on('send-message', async (data) => {
        const { roomId, message, senderId, senderName, timestamp } = data;

        // Broadcast message to all users in the room EXCEPT the sender
        // (sender already has optimistic UI update)
        socket.broadcast.to(roomId).emit('receive-message', {
            message,
            senderId,
            senderName,
            timestamp: timestamp || new Date().toISOString(),
        });

        // Persist message to database
        try {
            // 1. Find or create conversation
            // roomId is unique (e.g. "user1--user2")
            let conversation = await Conversation.findOne({ roomId });

            if (!conversation) {
                const participants = roomId.split('--');

                if (participants.length === 2) {
                    conversation = await Conversation.create({
                        roomId,
                        participants,
                        lastMessage: message,
                        lastMessageAt: new Date(),
                    });
                }
            } else {
                // Update existing conversation
                conversation.lastMessage = message;
                conversation.lastMessageAt = new Date();

                // Mark as unread for the recipient (not the sender)
                const recipientId = conversation.participants.find(id => id !== senderId);
                if (recipientId) {
                    conversation.hasUnreadMessages.set(recipientId, true);
                }

                await conversation.save();
            }

            // 2. Create message
            if (conversation) {
                await Message.create({
                    conversationId: conversation._id,
                    senderId,
                    senderName,
                    content: message,
                });
            }
        } catch (error) {
            console.error('Error saving message to DB:', error);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// ======================
// SERVER START
// ======================


httpServer.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Health check: http://localhost:${config.port}/health`);
    console.log(`Socket.io ready for real-time connections`);
});

export default app;