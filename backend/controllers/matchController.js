import User from '../models/User.js';
import { calculateMatchScore } from '../functionality/matchAlgorithm.js';


export const getRecommendations = async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const { filter } = req.query;

        const currentUser = await User.findOne({ clerkId });

        if (!currentUser) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete onboarding first',
            });
        }

        let targetRole;

        if (filter === 'same') {
            targetRole = currentUser.role;
        } else {
            targetRole = currentUser.role === 'founder' ? 'investor' : 'founder';
        }

        const candidates = await User.find({
            role: targetRole,
            clerkId: { $ne: clerkId },
        });

        const scoredCandidates = candidates.map((candidate) => ({
            ...candidate.toObject(),
            matchScore: calculateMatchScore(currentUser, candidate),
        }));

        const topMatches = scoredCandidates
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 10);

        res.json({
            matches: topMatches,
            total: topMatches.length,
            filter: filter || 'opposite',
        });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch recommendations',
        });
    }
};
