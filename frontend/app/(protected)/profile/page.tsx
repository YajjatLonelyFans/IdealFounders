'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useCurrentUser } from '@/context/UserContext';
import { deleteProfile } from '@/lib/api';

/* ─── Label Maps ─────────────────────────────────────────────── */
const STARTING_LABELS: Record<string, string> = {
    own_idea: 'Working on own idea',
    join_idea: 'Looking to join an idea',
    either: 'Either works',
};

const SUITABILITY_LABELS: Record<string, string> = {
    cofounder_with_idea: 'Cofounder with an idea',
    cofounder_looking: 'Looking for startups to join',
    either: 'Either works',
};

/* ─── SVG Icons ──────────────────────────────────────────────── */
const PersonIcon = () => (
    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const BoltIcon = () => (
    <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);
const SettingsIcon = () => (
    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
);
const MailIcon = () => (
    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
const EditIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);
const GradCapIcon = () => (
    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
    </svg>
);

const AVATAR_GRADIENTS = [
    'from-blue-400 to-blue-600',
    'from-indigo-400 to-indigo-600',
    'from-violet-400 to-violet-600',
    'from-cyan-400 to-cyan-600',
];

function getAvatarGradient(name: string) {
    return AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];
}

/* ─── Preference Row ─────────────────────────────────────────── */
function PrefRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-1">
                {icon}
                <span className="field-label" style={{ marginBottom: 0 }}>{label}</span>
            </div>
            <span className="field-value ml-6">{value}</span>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function ProfilePage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const { user, loading, error } = useCurrentUser();
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            await deleteProfile(token);
            window.location.href = '/sign-in';
        } catch (err: any) {
            alert(err.message);
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) return <LoadingPage message="Loading your profile..." />;
    if (error) return <div className="max-w-6xl mx-auto px-4 py-12"><ErrorMessage message={error} /></div>;
    if (!user) return null;

    const gradient = getAvatarGradient(user.fullName);

    return (
        <div className="min-h-screen bg-[#f0f5ff] font-sans">
            {/* Ambient Background */}
            <div className="ambient-bg" />

            <main className="relative z-10 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">

                    {/* Page Header */}
                    <div className="mb-8 fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Your <span className="text-gradient">Profile</span></h1>
                        <p className="text-slate-500 text-sm mt-1">This is how other founders see you on the platform.</p>
                    </div>

                    {/* Profile Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* ─── SIDEBAR: Identity Card ─── */}
                        <div className="lg:col-span-4 space-y-6 fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="glass-card p-8 text-center sticky top-28">
                                {/* Avatar */}
                                <div className="avatar-ring mb-6 mx-auto" style={{ width: 'fit-content' }}>
                                    {user.avatar?.url ? (
                                        <Image src={user.avatar.url} alt={user.fullName} width={112} height={112} className="w-28 h-28 rounded-full object-cover" />
                                    ) : (
                                        <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-4xl font-bold`}>
                                            {user.fullName.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-2xl font-bold text-slate-800 mb-1">{user.fullName}</h2>
                                <p className="text-slate-500 text-sm mb-6 flex items-center justify-center gap-1.5 break-all">
                                    <MailIcon />
                                    {user.email}
                                </p>

                                {/* Badges */}
                                <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                                    <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow-md shadow-blue-500/20 capitalize">
                                        {user.expertise}
                                    </span>
                                    <span className="skill-tag capitalize">{user.gender}</span>
                                    <span className="skill-tag">
                                        {user.graduateStatus === 'pursuing' ? 'Student' : 'Graduate'}
                                    </span>
                                </div>

                                {/* Edit Profile Button */}
                                <Link
                                    href="/edit-profile"
                                    className="btn-outline-dash w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                                >
                                    <EditIcon />
                                    Edit Profile
                                </Link>
                            </div>
                        </div>

                        {/* ─── MAIN COLUMN: Details ─── */}
                        <div className="lg:col-span-8 space-y-6 fade-in-up" style={{ animationDelay: '0.3s' }}>

                            <div className="glass-card overflow-hidden">

                                {/* Section: Background */}
                                <div className="content-block">
                                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <PersonIcon />
                                        Background
                                    </h3>

                                    {/* Bio */}
                                    <div className="mb-8">
                                        <span className="field-label">About Me</span>
                                        <p className="text-slate-600 leading-relaxed text-sm mt-2">
                                            {user.bio || 'No bio added yet.'}
                                        </p>
                                    </div>

                                    {/* Education (for students) */}
                                    {user.graduateStatus === 'pursuing' && user.education && (
                                        <div>
                                            <span className="field-label mb-4" style={{ marginBottom: '1rem', display: 'block' }}>Education</span>
                                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center flex-shrink-0">
                                                        <GradCapIcon />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm">{user.education.collegeName || 'N/A'}</h4>
                                                        <p className="text-slate-500 text-sm">{user.education.degree || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right sm:text-left">
                                                    <span className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-600">
                                                        Class of {user.education.yearOfPassing || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Location (for graduates) */}
                                    {user.graduateStatus === 'graduated' && user.location && (
                                        <div>
                                            <span className="field-label mb-4" style={{ marginBottom: '1rem', display: 'block' }}>Location</span>
                                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div>
                                                        <span className="field-label">State</span>
                                                        <span className="field-value">{user.location.state || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="field-label">City</span>
                                                        <span className="field-value">{user.location.city || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="field-label">Locality</span>
                                                        <span className="field-value">{user.location.locality || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Section: Skills & Expertise */}
                                <div className="content-block bg-white/40">
                                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <BoltIcon />
                                        Expertise
                                    </h3>

                                    <div className="space-y-6">
                                        <div>
                                            <span className="field-label" style={{ marginBottom: '0.75rem', display: 'block' }}>My Skills</span>
                                            <div className="flex flex-wrap gap-2">
                                                {user.skills.map((skill) => (
                                                    <span key={skill} className="skill-tag">{skill}</span>
                                                ))}
                                                {user.skills.length === 0 && <p className="text-slate-400 text-sm">No skills added yet</p>}
                                            </div>
                                        </div>
                                        <div className="pt-6 border-t border-slate-100/50">
                                            <span className="field-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Skills I&apos;m Looking For in a Co-founder</span>
                                            <div className="flex flex-wrap gap-2">
                                                {user.skillsLookingFor?.map((skill) => (
                                                    <span key={skill} className="skill-tag-alt">{skill}</span>
                                                ))}
                                                {(!user.skillsLookingFor || user.skillsLookingFor.length === 0) && <p className="text-slate-400 text-sm">None specified</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Preferences */}
                                <div className="content-block">
                                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <SettingsIcon />
                                        Preferences
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                                        <PrefRow
                                            icon={<svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                                            label="Expertise Looking For"
                                            value={user.expertiseLookingFor ? (user.expertiseLookingFor.charAt(0).toUpperCase() + user.expertiseLookingFor.slice(1)) : 'Not specified'}
                                        />
                                        <PrefRow
                                            icon={<svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                                            label="Starting From"
                                            value={STARTING_LABELS[user.startingFrom] || 'Not specified'}
                                        />
                                        <PrefRow
                                            icon={<svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                                            label="Has Co-founder"
                                            value={user.hasCofounder ? 'Yes' : 'No'}
                                        />
                                        <PrefRow
                                            icon={<svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                            label="Best Suits"
                                            value={SUITABILITY_LABELS[user.suitability] || 'Not specified'}
                                        />
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="content-block">
                                    <h3 className="text-lg font-semibold text-red-600 mb-2 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        Danger Zone
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">Once you delete your profile, there is no going back. Please be certain.</p>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        disabled={deleting}
                                        className="btn-danger px-6 py-2.5 rounded-xl font-semibold text-sm"
                                    >
                                        {deleting ? 'Deleting...' : 'Delete Profile'}
                                    </button>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Profile"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleting}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete} loading={deleting}>Delete Forever</Button>
                    </>
                }
            >
                <p className="text-gray-700">
                    Are you sure you want to delete your profile? This action cannot be undone and all your data will be permanently removed.
                </p>
            </Modal>
        </div>
    );
}
