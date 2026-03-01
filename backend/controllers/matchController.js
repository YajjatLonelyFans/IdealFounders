import User from '../models/User.js';
import { calculateMatchScore } from '../functionality/matchAlgorithm.js';


export const getRecommendations = async (req, res) => {
    try {
        const clerkId = req.auth.userId;

        const currentUser = await User.findOne({ clerkId });

        if (!currentUser) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Please complete onboarding first',
            });
        }

        // Get all other users as potential matches
        const candidates = await User.find({
            clerkId: { $ne: clerkId },
        });

        const scoredCandidates = candidates.map((candidate) => ({
            ...candidate.toObject(),
            matchScore: calculateMatchScore(currentUser, candidate),
        }));

        const sortedMatches = scoredCandidates
            .sort((a, b) => b.matchScore - a.matchScore);

        res.json({
            matches: sortedMatches,
            total: sortedMatches.length,
        });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch recommendations',
        });
    }
};
