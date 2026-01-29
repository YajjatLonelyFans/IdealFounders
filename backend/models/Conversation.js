import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
    {
        participants: {
            type: [String], // Array of Clerk IDs
            required: true,
            index: true,
        },
        lastMessage: {
            type: String,
            default: '',
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        roomId: {
            type: String,
            required: true,
            unique: true, // "user1--user2"
        },
        hasUnreadMessages: {
            type: Map,
            of: Boolean,
            default: new Map(), // { "userId": true/false }
        },
    },
    {
        timestamps: true,
    }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
