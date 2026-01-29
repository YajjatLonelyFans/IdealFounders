'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { getCurrentUser, getMatches } from '@/lib/api';
import { User, Match } from '@/types';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

export default function DashboardPage() {
    const { getToken } = useAuth();
    const { user: clerkUser } = useUser();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadData() {
            try {
                const token = await getToken();
                if (!token) throw new Error('Not authenticated');

                const userData = await getCurrentUser(token);

                // If user doesn't exist (onboarding not completed), redirect to onboarding
                if (!userData) {
                    router.push('/onboarding?redirected=true');
                    return;
                }

                setUser(userData);

                const matchesData = await getMatches('opposite', token);
                setMatches(matchesData.matches.slice(0, 3));
            } catch (err: any) {
                // If user not found (404), redirect to onboarding
                if (err.message.includes('404') || err.message.includes('not found') || err.message.includes('onboarding')) {
                    router.push('/onboarding?redirected=true');
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [getToken, router]);

    if (loading) return <LoadingPage message="Loading your dashboard..." />;
    if (error) return <div className="max-w-7xl mx-auto px-4 py-12"><ErrorMessage message={error} /></div>;
    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Welcome Section */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {user.fullName || clerkUser?.firstName || 'there'}! 👋
                </h1>
                <p className="text-gray-600">Here's what's happening with your matches</p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                className="grid md:grid-cols-3 gap-6 mb-8"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={staggerItem}>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Your Role</p>
                                    <p className="text-2xl font-bold text-primary capitalize">{user.role}</p>
                                </div>
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={staggerItem}>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Skills</p>
                                    <p className="text-2xl font-bold text-primary">{user.skills.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={staggerItem}>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Top Matches</p>
                                    <p className="text-2xl font-bold text-primary">{matches.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                className="grid md:grid-cols-2 gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={staggerItem}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Find Matches</CardTitle>
                            <CardDescription>
                                Discover {user.role === 'founder' ? 'investors and co-founders' : 'founders'} who align with your goals
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/matches">
                                <Button className="w-full">
                                    Browse Matches
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={staggerItem}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Profile</CardTitle>
                            <CardDescription>
                                Keep your profile up to date to get better matches
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/profile">
                                <Button variant="outline" className="w-full">
                                    View Profile
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Recent Matches Preview */}
            {matches.length > 0 && (
                <motion.div
                    className="mt-8"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Top Matches</h2>
                        <Link href="/matches">
                            <Button variant="ghost">View All</Button>
                        </Link>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {matches.map((match, index) => (
                            <motion.div key={match._id} variants={staggerItem}>
                                <Card hover>
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-3">
                                                {match.avatar?.url ? (
                                                    <img src={match.avatar.url} alt={match.fullName} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <span className="text-2xl font-bold text-primary">{match.fullName.charAt(0)}</span>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-gray-900 mb-1">{match.fullName}</h3>
                                            <p className="text-sm text-gray-600 capitalize mb-3">{match.role}</p>
                                            <Link href="/matches">
                                                <Button size="sm">View Profile</Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
