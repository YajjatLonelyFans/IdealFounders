import express from 'express';
import { getRecommendations } from '../controllers/matchController.js';
import { protectRoute } from '../middleware/auth.js';

const router = express.Router();


router.get('/recommendations', protectRoute, getRecommendations);

export default router;
