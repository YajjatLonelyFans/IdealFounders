import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// Get all conversations for the current user
export const getConversations = async (req, res) => {
    try {
        const userId = req.auth.userId;

        // Find conversations where the user is a participant
        const conversations = await Conversation.find({
            participants: userId,
        }).sort({ lastMessageAt: -1 });

        // Enhance conversations with participant details
        const enhancedConversations = await Promise.all(
            conversations.map(async (conv) => {
                const otherUserId = conv.participants.find((id) => id !== userId);
                const otherUser = await User.findOne({ clerkId: otherUserId }).select(
                    'fullName avatar role'
                );

                return {
                    _id: conv._id,
                    roomId: conv.roomId,
                    lastMessage: conv.lastMessage,
                    lastMessageAt: conv.lastMessageAt,
                    hasUnread: conv.hasUnreadMessages.get(userId) === true,
                    participant: otherUser || {
                        fullName: 'Unknown User',
                        avatar: { url: '' },
                        role: '',
                    },
                };
            })
        );

        res.json(enhancedConversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
};

// Get messages for a specific room
export const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;

        // Find the conversation first
        const conversation = await Conversation.findOne({ roomId });

        if (!conversation) {
            // If conversation doesn't exist yet (first time chat), return empty messages
            return res.json([]);
        }

        // Check if user is a participant
        if (!conversation.participants.includes(req.auth.userId)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const messages = await Message.find({
            conversationId: conversation._id,
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// Mark conversation as read
export const markAsRead = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.auth.userId;

        const conversation = await Conversation.findOne({ roomId });

        if (!conversation) {
            // If conversation doesn't exist yet, just return success (nothing to mark as read)
            return res.json({ success: true });
        }

        // Check if user is a participant
        if (!conversation.participants.includes(userId)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Mark as read for this user
        conversation.hasUnreadMessages.set(userId, false);
        await conversation.save();

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking as read:', error);
        res.status(500).json({ error: 'Failed to mark as read' });
    }
};

// Get count of conversations with unread messages
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.auth.userId;

        // Find all conversations where this user is a participant
        const conversations = await Conversation.find({
            participants: userId,
        });

        // Count how many have unread messages for this user
        const unreadCount = conversations.filter(conv =>
            conv.hasUnreadMessages.get(userId) === true
        ).length;

        res.json({ count: unreadCount });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
};
