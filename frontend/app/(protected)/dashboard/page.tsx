'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useCurrentUser } from '@/context/UserContext';
import { getMatches } from '@/lib/api';
import { Match } from '@/types';
import { calculateMatchPercentage } from '@/lib/utils';

/* ─── Helpers ────────────────────────────────────────────────── */
const CIRCUMFERENCE = 2 * Math.PI * 45;

const AVATAR_GRADIENTS = [
    'from-blue-500 to-blue-700',
    'from-indigo-500 to-indigo-700',
    'from-violet-500 to-violet-700',
    'from-cyan-500 to-cyan-700',
    'from-teal-500 to-teal-700',
    'from-blue-600 to-indigo-700',
];

function getAvatarGradient(name: string) {
    return AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];
}

function getMatchColor(percent: number) {
    if (percent >= 75) return { stroke: '#10b981', bg: 'bg-green-50', text: 'text-green-600' };
    if (percent >= 50) return { stroke: '#2563eb', bg: 'bg-blue-50', text: 'text-blue-600' };
    return { stroke: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-600' };
}

/* ─── Mini SVG Icons ─────────────────────────────────────────── */
const CodeSvg = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);
const BoltSvg = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);
const PeopleSvg = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);
const SearchSvg = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);
const EditSvg = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);
const ChevronSvg = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
);
const CheckSvg = () => (
    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
    </svg>
);

/* ─── Main Page ──────────────────────────────────────────────── */
export default function DashboardPage() {
    const { getToken } = useAuth();
    const { user: clerkUser } = useUser();
    const { user, loading: userLoading, error: userError } = useCurrentUser();
    const [matches, setMatches] = useState<Match[]>([]);
    const [matchesLoading, setMatchesLoading] = useState(true);
    const [matchesError, setMatchesError] = useState('');

    useEffect(() => {
        if (userLoading || !user) return;

        async function loadMatches() {
            try {
                const token = await getToken();
                if (!token) throw new Error('Not authenticated');
                const matchesData = await getMatches(token);
                setMatches(matchesData.matches.slice(0, 3));
            } catch (err: any) {
                setMatchesError(err.message);
            } finally {
                setMatchesLoading(false);
            }
        }

        loadMatches();
    }, [user, userLoading, getToken]);

    if (userLoading) return <LoadingPage message="Loading your dashboard..." />;
    if (userError) return <div className="max-w-7xl mx-auto px-4 py-12"><ErrorMessage message={userError} /></div>;
    if (!user) return null;

    const firstName = user.fullName?.split(' ')[0] || clerkUser?.firstName || 'there';
    const topMatches = matches.slice(0, 2);

    return (
        <div className="min-h-screen bg-[#f0f5ff] font-sans">
            {/* Ambient Background */}
            <div className="ambient-bg" />

            <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* ─── Welcome Hero Banner ─── */}
                    <div className="glass-card hero-banner p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="z-10 text-center md:text-left">
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight mb-2">
                                Welcome back, {firstName}! <span className="wave-emoji">👋</span>
                            </h1>
                            <p className="text-slate-600 text-base sm:text-lg">
                                Your profile is looking great. You have{' '}
                                <strong className="text-blue-600">
                                    {matchesLoading ? '...' : `${matches.length} new high-quality match${matches.length !== 1 ? 'es' : ''}`}
                                </strong>{' '}
                                waiting.
                            </p>
                        </div>

                        {/* Profile Completion Ring */}
                        <div className="z-10 flex items-center gap-4 bg-white/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-blue-100 shadow-sm">
                            <div className="relative w-14 h-14">
                                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="8"
                                        strokeDasharray="283" strokeDashoffset="0" strokeLinecap="round"
                                        className="match-ring-fill"
                                        style={{ animation: 'ringDraw 1.5s cubic-bezier(0.4,0,0.2,1) both' }} />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <CheckSvg />
                                </div>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-800">100%</p>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Profile Setup</p>
                            </div>
                        </div>
                    </div>

                    {/* ─── Dashboard Grid ─── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* MAIN COLUMN (Left) */}
                        <div className="lg:col-span-8 space-y-6">

                            {/* Stats Section */}
                            <div className="glass-card p-6 fade-in-up" style={{ animationDelay: '0.2s' }}>
                                <h2 className="text-lg font-bold text-slate-800 mb-4">Your Overview</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="stat-card p-5">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                                            <CodeSvg />
                                        </div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Expertise</p>
                                        <h3 className="text-xl font-bold text-slate-800 capitalize">{user.expertise}</h3>
                                    </div>
                                    <div className="stat-card p-5">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                                            <BoltSvg />
                                        </div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Looking For</p>
                                        <h3 className="text-xl font-bold text-slate-800 capitalize">{user.expertiseLookingFor}</h3>
                                    </div>
                                    <div className="stat-card p-5">
                                        <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-3">
                                            <PeopleSvg />
                                        </div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Top Matches</p>
                                        <h3 className="text-xl font-bold text-slate-800">
                                            {matchesLoading ? '...' : `${matches.length} Found`}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            {/* Highlighted Matches Section */}
                            {!matchesLoading && topMatches.length > 0 && (
                                <div className="fade-in-up" style={{ animationDelay: '0.3s' }}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-slate-800">Top Selected Matches</h2>
                                        <Link href="/matches" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                            View all <ChevronSvg />
                                        </Link>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {topMatches.map((match, idx) => {
                                            const percent = calculateMatchPercentage(match.matchScore);
                                            const color = getMatchColor(percent);
                                            const dashoffset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
                                            const gradient = getAvatarGradient(match.fullName);

                                            return (
                                                <div key={match._id} className="match-card-preview p-5 flex flex-col h-full bg-white">
                                                    <div className={`h-1 absolute top-0 left-0 right-0 bg-gradient-to-r ${percent >= 75 ? 'from-green-400 to-green-500' : 'from-blue-500 to-blue-600'}`} style={{ opacity: 0.9 }} />

                                                    <div className="flex items-start gap-4 mb-4">
                                                        {/* Mini Match Ring */}
                                                        <div className="relative w-16 h-16 flex-shrink-0">
                                                            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
                                                                <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                                                                <circle cx="50" cy="50" r="45" fill="none" stroke={color.stroke} strokeWidth="5.5"
                                                                    strokeDasharray={CIRCUMFERENCE} strokeDashoffset={dashoffset}
                                                                    strokeLinecap="round" className="match-ring-fill"
                                                                    style={{ animation: `ringDraw 1.5s cubic-bezier(0.4,0,0.2,1) both`, animationDelay: `${0.5 + idx * 0.1}s` }} />
                                                            </svg>
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                {match.avatar?.url ? (
                                                                    <Image src={match.avatar.url} alt={match.fullName} width={44} height={44} className="rounded-full border border-white object-cover" />
                                                                ) : (
                                                                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold border border-white`}>
                                                                        {match.fullName.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex-1">
                                                            <h3 className="text-base font-bold text-slate-800">{match.fullName}</h3>
                                                            <p className="text-xs text-slate-500 mb-1 capitalize">
                                                                {match.expertise} • {match.location?.city || 'N/A'}
                                                            </p>
                                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${color.bg} ${color.text}`}>
                                                                {percent}% Match
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-slate-600 mb-4 flex-1" style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                    }}>
                                                        {match.bio || 'No bio available.'}
                                                    </p>

                                                    <Link href="/matches" className="btn-solid w-full py-2.5 rounded-xl font-semibold text-sm text-center block">
                                                        Review Profile
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Matches loading state */}
                            {matchesLoading && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="match-card-preview p-5 animate-pulse">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-16 h-16 rounded-full bg-slate-200 flex-shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-slate-200 rounded w-32" />
                                                    <div className="h-3 bg-slate-200 rounded w-24" />
                                                    <div className="h-4 bg-slate-200 rounded w-16" />
                                                </div>
                                            </div>
                                            <div className="h-3 bg-slate-200 rounded w-full mb-2" />
                                            <div className="h-3 bg-slate-200 rounded w-3/4 mb-4" />
                                            <div className="h-10 bg-slate-200 rounded-xl w-full" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {matchesError && <ErrorMessage message={matchesError} />}
                        </div>

                        {/* SIDEBAR COLUMN (Right) */}
                        <div className="lg:col-span-4 space-y-6">

                            {/* Quick Actions */}
                            <div className="glass-card p-6 fade-in-up" style={{ animationDelay: '0.4s' }}>
                                <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
                                <div className="space-y-3">
                                    <Link href="/matches" className="btn-solid w-full py-3.5 rounded-xl font-semibold text-sm text-center flex items-center justify-center gap-2">
                                        <SearchSvg />
                                        Discover Matches
                                    </Link>
                                    <Link href="/edit-profile" className="btn-outline-dash w-full py-3.5 rounded-xl font-semibold text-sm text-center flex items-center justify-center gap-2">
                                        <EditSvg />
                                        Edit Profile
                                    </Link>
                                </div>
                            </div>

                            {/* Profile Snapshot */}
                            <div className="glass-card p-6 fade-in-up" style={{ animationDelay: '0.5s' }}>
                                <h2 className="text-lg font-bold text-slate-800 mb-4">Your Profile Snapshot</h2>

                                <div className="flex items-center gap-4 mb-6">
                                    {user.avatar?.url ? (
                                        <Image src={user.avatar.url} alt={user.fullName} width={56} height={56} className="rounded-full object-cover shadow-md" />
                                    ) : (
                                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getAvatarGradient(user.fullName)} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
                                            {user.fullName.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-slate-800">{user.fullName}</h3>
                                        <p className="text-xs text-slate-500 capitalize">{user.expertise} Founder</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* My Skills */}
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">My Skills</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {user.skills.map((skill) => (
                                                <span key={skill} className="skill-tag px-2.5 py-1 rounded-lg text-xs font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Looking For */}
                                    <div className="pt-2 border-t border-slate-100">
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Looking For</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {user.skillsLookingFor.map((skill) => (
                                                <span key={skill} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
