'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useCurrentUser } from '@/context/UserContext';
import { getMatches } from '@/lib/api';
import { Match } from '@/types';
import { calculateMatchPercentage, generateRoomId } from '@/lib/utils';

/* ─── Helpers ────────────────────────────────────────────────── */
function getMatchColor(percent: number) {
    if (percent >= 75) return { stroke: '#16a34a', text: '#15803d' };
    if (percent >= 50) return { stroke: '#2563eb', text: '#1d4ed8' };
    return { stroke: '#f59e0b', text: '#b45309' };
}

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

const CIRCUMFERENCE = 2 * Math.PI * 45;

type FilterType = 'all' | 'technical' | 'non-technical' | 'high-match';

/* ─── SVG Icons ──────────────────────────────────────────────── */
const SearchIcon = () => (
    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);
const CodeIcon = () => (
    <svg className="inline w-3.5 h-3.5 mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);
const BriefcaseIcon = () => (
    <svg className="inline w-3.5 h-3.5 mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
const TrendUpIcon = () => (
    <svg className="inline w-3.5 h-3.5 mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);
const ChatBubbleIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);
const LocationIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const EmptySearchIcon = () => (
    <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

/* ─── Match Ring Component ───────────────────────────────────── */
function MatchRing({ percent, avatarUrl, fullName, delay }: {
    percent: number;
    avatarUrl?: string;
    fullName: string;
    delay: number;
}) {
    const color = getMatchColor(percent);
    const dashoffset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
    const gradient = getAvatarGradient(fullName);

    return (
        <div className="relative mb-3">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke={color.stroke} strokeWidth="4.5"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashoffset}
                    className="match-ring-fill"
                    style={{
                        animation: `ringDraw 1.5s cubic-bezier(0.4,0,0.2,1) both`,
                        animationDelay: `${delay + 0.3}s`,
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {avatarUrl ? (
                    <Image src={avatarUrl} alt={fullName} width={64} height={64} className="rounded-full object-cover border-2 border-white shadow-sm" />
                ) : (
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
                        {fullName.charAt(0)}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Match Card Component ───────────────────────────────────── */
function MatchCard({ match, index, matchPercent, explanation, onChat }: {
    match: Match;
    index: number;
    matchPercent: number;
    explanation: string[];
    onChat: () => void;
}) {
    const color = getMatchColor(matchPercent);
    const isTechnical = match.expertise === 'technical';
    const delay = index * 0.08;

    return (
        <div className="match-card rounded-2xl card-enter h-full flex flex-col" style={{ animationDelay: `${delay}s` }}>
            {/* Top accent */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 flex-shrink-0" style={{ opacity: Math.min(matchPercent / 100, 1) }} />

            <div className="p-6 flex flex-col flex-1">
                {/* Avatar + Ring */}
                <div className="flex flex-col items-center mb-5">
                    <MatchRing
                        percent={matchPercent}
                        avatarUrl={match.avatar?.url}
                        fullName={match.fullName}
                        delay={delay}
                    />
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold" style={{ color: color.text }}>{matchPercent}%</span>
                        <span className="text-xs font-medium text-slate-400">Match</span>
                    </div>
                </div>

                {/* Name */}
                <h3 className="text-lg font-bold text-slate-800 text-center mb-3">{match.fullName}</h3>

                {/* Badges */}
                <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isTechnical ? 'badge-technical' : 'badge-nontechnical'}`}>
                        {match.expertise === 'technical' ? 'Technical' : 'Non-Technical'}
                    </span>
                    {match.location && (
                        <span className="badge-location px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <LocationIcon />
                            {match.location.city}, {match.location.state}
                        </span>
                    )}
                </div>

                {/* Bio */}
                <p className="text-sm text-slate-500 text-center leading-relaxed mb-5" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}>
                    {match.bio}
                </p>

                {/* Skills */}
                {match.skills.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                            {match.skills.slice(0, 5).map((skill) => (
                                <span key={skill} className="skill-tag px-2.5 py-1 rounded-lg text-xs font-medium">{skill}</span>
                            ))}
                            {match.skills.length > 5 && (
                                <span className="skill-tag px-2.5 py-1 rounded-lg text-xs font-medium">+{match.skills.length - 5}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Why Matched */}
                <div className="match-reason rounded-xl px-3 py-2.5 mb-5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Why matched</p>
                    <div className="flex flex-wrap gap-2">
                        {explanation.map((reason, i) => (
                            <span key={i} className="flex items-center gap-1 text-xs text-slate-600">
                                {reason}
                            </span>
                        ))}
                        {explanation.length === 0 && (
                            <span className="text-xs text-slate-500">Potential match</span>
                        )}
                    </div>
                </div>

                {/* Chat Button */}
                <button
                    onClick={onChat}
                    className="btn-chat w-full py-3 rounded-xl text-white font-semibold text-sm tracking-wide flex items-center justify-center gap-2 mt-auto"
                >
                    <ChatBubbleIcon />
                    Chat
                </button>
            </div>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function MatchesPage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const { user: currentUser, loading: userLoading, error: userError } = useCurrentUser();
    const [matches, setMatches] = useState<Match[]>([]);
    const [matchesLoading, setMatchesLoading] = useState(true);
    const [matchesError, setMatchesError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    useEffect(() => {
        if (userLoading || !currentUser) return;

        async function loadMatches() {
            setMatchesLoading(true);
            setMatchesError('');
            try {
                const token = await getToken();
                if (!token) throw new Error('Not authenticated');
                const matchesData = await getMatches(token);
                setMatches(matchesData.matches.slice(0, 50));
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
        router.push(`/chat?room=${roomId}`);
    };

    // Match explanation builder
    const getMatchExplanation = (match: Match): string[] => {
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
        return reasons;
    };

    // Filtered matches
    const filteredMatches = useMemo(() => {
        return matches.filter((m) => {
            // Filter
            if (activeFilter === 'technical' && m.expertise !== 'technical') return false;
            if (activeFilter === 'non-technical' && m.expertise !== 'non-technical') return false;
            if (activeFilter === 'high-match' && calculateMatchPercentage(m.matchScore) < 70) return false;

            // Search
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const haystack = `${m.fullName} ${m.location?.city ?? ''} ${m.location?.state ?? ''} ${m.skills.join(' ')} ${m.bio}`.toLowerCase();
                return haystack.includes(q);
            }
            return true;
        });
    }, [matches, activeFilter, searchQuery]);

    if (userLoading) return <LoadingPage message="Finding your matches..." />;
    if (userError) return <div className="max-w-7xl mx-auto px-4 py-12"><ErrorMessage message={userError} /></div>;

    return (
        <div className="min-h-screen bg-[#f0f5ff] font-sans">
            {/* Ambient Background */}
            <div className="ambient-bg" />

            {/* Main Content */}
            <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight mb-2">
                                    Relevant <span className="text-gradient">Matches For You</span>
                                </h1>
                                <p className="text-slate-500 text-base sm:text-lg">
                                    Find co-founders with complementary skills and aligned goals
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span>
                                    {matchesLoading ? 'Loading...' : `${filteredMatches.length} match${filteredMatches.length !== 1 ? 'es' : ''} found`}
                                </span>
                            </div>
                        </div>

                        {/* Search & Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <SearchIcon />
                                <input
                                    type="text"
                                    placeholder="Search by name, skills, or location..."
                                    className="search-input w-full pl-11 pr-4 py-3 rounded-xl text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {([
                                    { key: 'all' as FilterType, label: 'All', icon: null },
                                    { key: 'technical' as FilterType, label: 'Technical', icon: <CodeIcon /> },
                                    { key: 'non-technical' as FilterType, label: 'Non-Technical', icon: <BriefcaseIcon /> },
                                    { key: 'high-match' as FilterType, label: '70%+ Match', icon: <TrendUpIcon /> },
                                ]).map(({ key, label, icon }) => (
                                    <button
                                        key={key}
                                        className={`filter-chip px-4 py-2.5 rounded-xl text-sm ${activeFilter === key ? 'chip-active' : ''}`}
                                        onClick={() => setActiveFilter(key)}
                                    >
                                        {icon}{label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Error State */}
                    {matchesError && (
                        <ErrorMessage message={matchesError} retry={() => window.location.reload()} />
                    )}

                    {/* Loading Skeleton */}
                    {matchesLoading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="match-card rounded-2xl">
                                    <div className="h-1 bg-slate-200" />
                                    <div className="p-6 animate-pulse">
                                        <div className="flex flex-col items-center mb-5">
                                            <div className="w-24 h-24 rounded-full bg-slate-200 mb-3" />
                                            <div className="h-6 bg-slate-200 rounded w-16 mb-1" />
                                        </div>
                                        <div className="h-5 bg-slate-200 rounded w-32 mx-auto mb-3" />
                                        <div className="flex justify-center gap-2 mb-4">
                                            <div className="h-6 bg-slate-200 rounded-full w-20" />
                                            <div className="h-6 bg-slate-200 rounded-full w-28" />
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            <div className="h-3 bg-slate-200 rounded w-full" />
                                            <div className="h-3 bg-slate-200 rounded w-3/4" />
                                        </div>
                                        <div className="h-10 bg-slate-200 rounded-xl w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!matchesLoading && !matchesError && filteredMatches.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-50 flex items-center justify-center">
                                <EmptySearchIcon />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-700 mb-2">
                                {matches.length === 0 ? 'No matches found' : 'No matches match your search'}
                            </h3>
                            <p className="text-slate-400">
                                {matches.length === 0
                                    ? 'Try updating your profile with more skills or preferences.'
                                    : 'Try adjusting your search or filters'}
                            </p>
                            {matches.length === 0 && (
                                <button
                                    onClick={() => router.push('/profile')}
                                    className="btn-chat mt-6 px-6 py-3 rounded-xl text-white font-semibold text-sm inline-flex items-center gap-2"
                                >
                                    Update Profile
                                </button>
                            )}
                        </div>
                    )}

                    {/* Cards Grid */}
                    {!matchesLoading && !matchesError && filteredMatches.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredMatches.map((match, index) => (
                                <MatchCard
                                    key={match._id}
                                    match={match}
                                    index={index}
                                    matchPercent={calculateMatchPercentage(match.matchScore)}
                                    explanation={getMatchExplanation(match)}
                                    onChat={() => handleChat(match.clerkId)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
