'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState, EmptyIcons } from '@/components/ui/EmptyState';
import { getMatches, getCurrentUser } from '@/lib/api';
import { Match, User } from '@/types';
import { calculateMatchPercentage, generateRoomId } from '@/lib/utils';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

export default function MatchesPage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [filter, setFilter] = useState<'opposite' | 'same'>('opposite');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadMatches() {
            setLoading(true);
            setError('');
            try {
                const token = await getToken();
                if (!token) throw new Error('Not authenticated');

                const [userData, matchesData] = await Promise.all([
                    getCurrentUser(token),
                    getMatches(filter, token),
                ]);

                // If user doesn't exist (onboarding not completed), redirect to onboarding
                if (!userData) {
                    router.push('/onboarding?redirected=true');
                    return;
                }

                setCurrentUser(userData);
                setMatches(matchesData.matches);
            } catch (err: any) {
                // If user not found, redirect to onboarding
                if (err.message.includes('not found') || err.message.includes('onboarding')) {
                    router.push('/onboarding?redirected=true');
                    return;
                }
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadMatches();
    }, [filter, getToken, router]);

    const handleChat = (matchId: string) => {
        if (!currentUser) return;
        const roomId = generateRoomId(currentUser.clerkId, matchId);
        router.push(`/chat/${roomId}`);
    };

    if (loading) return <LoadingPage message="Finding your matches..." />;

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
                <p className="text-gray-600">
                    {filter === 'opposite'
                        ? currentUser?.role === 'founder'
                            ? 'Connect with investors who match your profile'
                            : 'Connect with founders who match your profile'
                        : 'Find co-founders with complementary skills'}
                </p>
            </motion.div>

            {/* Filter Toggle */}
            <motion.div
                className="mb-8 flex justify-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <div className="inline-flex rounded-lg border border-border p-1 bg-white">
                    <button
                        onClick={() => setFilter('opposite')}
                        className={`px-6 py-2 rounded-md font-medium transition-all ${filter === 'opposite'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-700 hover:text-primary'
                            }`}
                    >
                        {currentUser?.role === 'founder' ? 'Find Investors' : 'Find Founders'}
                    </button>
                    <button
                        onClick={() => setFilter('same')}
                        className={`px-6 py-2 rounded-md font-medium transition-all ${filter === 'same'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-700 hover:text-primary'
                            }`}
                    >
                        Find Co-founders
                    </button>
                </div>
            </motion.div>

            {/* Error State */}
            {error && (
                <ErrorMessage
                    message={error}
                    retry={() => window.location.reload()}
                />
            )}

            {/* Empty State */}
            {!error && matches.length === 0 && (
                <EmptyState
                    icon={EmptyIcons.NoMatches}
                    title="No matches found"
                    description="Try updating your profile with more skills or change your preferences to find better matches."
                    action={{
                        label: 'Update Profile',
                        onClick: () => router.push('/profile'),
                    }}
                />
            )}

            {/* Matches Grid */}
            {!error && matches.length > 0 && (
                <motion.div
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    key={filter}
                >
                    {matches.map((match, index) => (
                        <motion.div key={match._id} variants={staggerItem}>
                            <Card hover>
                                <CardContent className="pt-6">
                                    {/* Avatar */}
                                    <div className="flex flex-col items-center mb-4">
                                        <div className="relative w-24 h-24 mb-3">
                                            {match.avatar?.url ? (
                                                <Image
                                                    src={match.avatar.url}
                                                    alt={match.fullName}
                                                    fill
                                                    className="rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-primary-100 flex items-center justify-center">
                                                    <span className="text-3xl font-bold text-primary">
                                                        {match.fullName.charAt(0)}
                                                    </span>
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

                                    {/* Name & Role */}
                                    <div className="text-center mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {match.fullName}
                                        </h3>
                                        <Badge variant="primary" className="capitalize">
                                            {match.role}
                                        </Badge>
                                    </div>

                                    {/* Bio */}
                                    <p className="text-sm text-gray-600 text-center mb-4 line-clamp-3">
                                        {match.bio}
                                    </p>

                                    {/* Skills */}
                                    {match.skills.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-xs font-medium text-gray-700 mb-2">Skills:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {match.skills.slice(0, 5).map((skill) => (
                                                    <Badge key={skill} variant="secondary" className="text-xs">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                {match.skills.length > 5 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{match.skills.length - 5}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Match Explanation */}
                                    <div className="bg-primary-50 rounded-lg p-3 mb-4 text-xs">
                                        <p className="font-medium text-primary-700 mb-1">Why matched:</p>
                                        <p className="text-primary-600">
                                            {match.matchScore >= 20 && '✓ Industry match'}
                                            {match.matchScore >= 10 && match.matchScore < 20 && '✓ Shared skills'}
                                            {match.matchScore >= 30 && ' • Shared skills'}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant="primary"
                                            className="flex-1"
                                            onClick={() => handleChat(match.clerkId)}
                                        >
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
