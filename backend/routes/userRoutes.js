import express from 'express';
import { getMe, onboardUser, deleteUser, getUserByClerkId } from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/me', protectRoute, getMe);
router.get('/:clerkId', protectRoute, getUserByClerkId);
router.post('/onboard', protectRoute, upload.single('avatar'), onboardUser);
router.delete('/me', protectRoute, deleteUser);

export default router;
