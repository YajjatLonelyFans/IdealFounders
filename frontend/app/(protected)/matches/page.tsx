'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState, EmptyIcons } from '@/components/ui/EmptyState';
import { useCurrentUser } from '@/context/UserContext';
import { getMatches } from '@/lib/api';
import { Match } from '@/types';
import { calculateMatchPercentage, generateRoomId } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function MatchesPage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const { user: currentUser, loading: userLoading, error: userError } = useCurrentUser();
    const [matches, setMatches] = useState<Match[]>([]);
    const [matchesLoading, setMatchesLoading] = useState(true);
    const [matchesError, setMatchesError] = useState('');

    useEffect(() => {
        if (userLoading || !currentUser) return;

        async function loadMatches() {
            setMatchesLoading(true);
            setMatchesError('');
            try {
                const token = await getToken();
                if (!token) throw new Error('Not authenticated');
                const matchesData = await getMatches(token);
                setMatches(matchesData.matches);
            } catch (err: any) {
                setMatchesError(err.message);
            } finally {
                setMatchesLoading(false);
            }
        }

        loadMatches();
    }, [currentUser, userLoading, getToken]);

    const handleChat = (matchId: string) => {
        if (!currentUser) return;
        const roomId = generateRoomId(currentUser.clerkId, matchId);
        router.push(`/chat/${roomId}`);
    };

    if (userLoading) return <LoadingPage message="Finding your matches..." />;
    if (userError) return <div className="max-w-7xl mx-auto px-4 py-12"><ErrorMessage message={userError} /></div>;

    // Build match explanation
    const getMatchExplanation = (match: Match) => {
        const reasons: string[] = [];
        if (match.matchScore >= 25) reasons.push('📍 Nearby location');
        else if (match.matchScore >= 10 && currentUser?.location?.state &&
            match.location?.state?.toLowerCase() === currentUser.location.state.toLowerCase()) {
            reasons.push('📍 Same state');
        }
        if (match.education?.degree && match.education.degree !== 'N/A' &&
            currentUser?.education?.degree && currentUser.education.degree !== 'N/A' &&
            match.education.degree.toLowerCase() === currentUser.education.degree.toLowerCase()) {
            reasons.push('🎓 Education match');
        }
        if (match.expertise && currentUser?.expertiseLookingFor &&
            match.expertise === currentUser.expertiseLookingFor) {
            reasons.push('💼 Expertise match');
        }
        if (match.skills && currentUser?.skillsLookingFor) {
            const matchedSkills = match.skills.filter(s =>
                currentUser.skillsLookingFor.map(sl => sl.toLowerCase()).includes(s.toLowerCase())
            );
            if (matchedSkills.length > 0) reasons.push(`🔧 ${matchedSkills.length} skill${matchedSkills.length > 1 ? 's' : ''} match`);
        }
        return reasons.length > 0 ? reasons.join(' • ') : 'Potential match';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Header */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Matches</h1>
                <p className="text-gray-600">Find co-founders with complementary skills and aligned goals</p>
            </motion.div>

            {/* Error State */}
            {matchesError && (
                <ErrorMessage message={matchesError} retry={() => window.location.reload()} />
            )}

            {/* Loading Skeleton */}
            {matchesLoading && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-xl border border-border bg-white p-6 animate-pulse">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-24 h-24 rounded-full bg-gray-200" />
                                <div className="h-4 bg-gray-200 rounded w-24" />
                                <div className="h-3 bg-gray-200 rounded w-16" />
                                <div className="h-3 bg-gray-200 rounded w-full mt-2" />
                                <div className="h-3 bg-gray-200 rounded w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!matchesLoading && !matchesError && matches.length === 0 && (
                <EmptyState
                    icon={EmptyIcons.NoMatches}
                    title="No matches found"
                    description="Try updating your profile with more skills or preferences to find better matches."
                    action={{
                        label: 'Update Profile',
                        onClick: () => router.push('/profile'),
                    }}
                />
            )}

            {/* Matches Grid */}
            {!matchesLoading && !matchesError && matches.length > 0 && (
                <motion.div
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {matches.map((match) => (
                        <motion.div key={match._id} variants={staggerItem}>
                            <Card hover>
                                <CardContent className="pt-6">
                                    {/* Avatar */}
                                    <div className="flex flex-col items-center mb-4">
                                        <div className="relative w-24 h-24 mb-3">
                                            {match.avatar?.url ? (
                                                <Image src={match.avatar.url} alt={match.fullName} fill className="rounded-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-primary-100 flex items-center justify-center">
                                                    <span className="text-3xl font-bold text-primary">{match.fullName.charAt(0)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Match Score */}
                                        <div className="mb-2">
                                            <span className="text-2xl font-bold text-primary">
                                                {calculateMatchPercentage(match.matchScore)}%
                                            </span>
                                            <span className="text-sm text-gray-600 ml-1">Match</span>
                                        </div>
                                    </div>

                                    {/* Name & Info */}
                                    <div className="text-center mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{match.fullName}</h3>
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            <Badge variant="primary" className="capitalize">{match.expertise}</Badge>
                                            {match.location && (
                                                <Badge variant="secondary">{match.location.city}, {match.location.state}</Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <p className="text-sm text-gray-600 text-center mb-4 line-clamp-3">{match.bio}</p>

                                    {/* Skills */}
                                    {match.skills.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-xs font-medium text-gray-700 mb-2">Skills:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {match.skills.slice(0, 5).map((skill) => (
                                                    <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                                                ))}
                                                {match.skills.length > 5 && (
                                                    <Badge variant="secondary" className="text-xs">+{match.skills.length - 5}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Match Explanation */}
                                    <div className="bg-primary-50 rounded-lg p-3 mb-4 text-xs">
                                        <p className="font-medium text-primary-700 mb-1">Why matched:</p>
                                        <p className="text-primary-600">{getMatchExplanation(match)}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button variant="primary" className="flex-1" onClick={() => handleChat(match.clerkId)}>
                                            Chat
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
