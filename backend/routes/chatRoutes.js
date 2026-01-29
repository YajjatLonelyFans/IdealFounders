import express from 'express';
import { getConversations, getMessages, markAsRead, getUnreadCount } from '../controllers/chatController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', protectRoute, getConversations);
router.get('/unread-count', protectRoute, getUnreadCount);
router.get('/:roomId/messages', protectRoute, getMessages);
router.post('/:roomId/mark-read', protectRoute, markAsRead);

export default router;
