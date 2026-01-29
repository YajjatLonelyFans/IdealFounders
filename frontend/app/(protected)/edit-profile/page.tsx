'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { getCurrentUser, updateProfile } from '@/lib/api';
import { fadeInUp, fadeIn, scaleIn } from '@/lib/animations';

export default function EditProfilePage() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [skillInput, setSkillInput] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        role: 'founder' as 'founder' | 'investor',
        skills: [] as string[],
        lookingFor: {
            role: '',
            industry: '',
        },
    });

    // Load existing user data
    useEffect(() => {
        async function loadUserData() {
            try {
                const token = await getToken();
                if (!token) throw new Error('Not authenticated');

                const userData = await getCurrentUser(token);

                if (!userData) {
                    router.push('/onboarding?redirected=true');
                    return;
                }

                // Pre-fill form with existing data
                setFormData({
                    fullName: userData.fullName || '',
                    bio: userData.bio || '',
                    role: userData.role,
                    skills: userData.skills || [],
                    lookingFor: userData.lookingFor || { role: '', industry: '' },
                });

                // Set existing avatar preview
                if (userData.avatar?.url) {
                    setAvatarPreview(userData.avatar.url);
                }
            } catch (err: any) {
                if (err.message.includes('404') || err.message.includes('not found')) {
                    router.push('/onboarding?redirected=true');
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        }

        loadUserData();
    }, [getToken, router]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 3 * 1024 * 1024) {
                setError('Avatar must be less than 3MB');
                return;
            }
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const addSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData({
                ...formData,
                skills: [...formData.skills, skillInput.trim()],
            });
            setSkillInput('');
        }
    };

    const removeSkill = (skill: string) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter((s) => s !== skill),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            await updateProfile(formData, avatar, token);

            // Show success toast
            setToast({ message: 'Profile updated successfully!', type: 'success' });

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
            setToast({ message: err.message || 'Failed to update profile', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingPage message="Loading your profile..." />;

    return (
        <>
            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={!!toast}
                    onClose={() => setToast(null)}
                />
            )}

            <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className="max-w-2xl mx-auto px-4 py-12"
            >
                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Your Profile</h1>
                    <p className="text-gray-600">Update your information to improve your matches</p>
                </motion.div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary-dark">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                </label>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Max 3MB (JPG, PNG, WEBP)</p>
                        </div>

                        {/* Full Name */}
                        <Input
                            label="Full Name"
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="John Doe"
                        />

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                I am a <span className="text-error">*</span>
                            </label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'founder' })}
                                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${formData.role === 'founder'
                                        ? 'border-primary bg-primary-50 text-primary'
                                        : 'border-border hover:border-primary'
                                        }`}
                                >
                                    Founder
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'investor' })}
                                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${formData.role === 'investor'
                                        ? 'border-primary bg-primary-50 text-primary'
                                        : 'border-border hover:border-primary'
                                        }`}
                                >
                                    Investor
                                </button>
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Bio <span className="text-error">*</span>
                            </label>
                            <textarea
                                required
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Tell us about yourself, your experience, and what you're looking for..."
                                rows={4}
                                className="flex w-full rounded-lg border border-border bg-white px-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Skills */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Skills</label>
                            <div className="flex gap-2 mb-3">
                                <Input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    placeholder="e.g., React, Marketing, Sales"
                                />
                                <Button type="button" onClick={addSkill} variant="outline">
                                    Add
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <AnimatePresence>
                                    {formData.skills.map((skill) => (
                                        <motion.div
                                            key={skill}
                                            variants={scaleIn}
                                            initial="hidden"
                                            animate="visible"
                                            exit={{ opacity: 0, scale: 0.8 }}
                                        >
                                            <Badge variant="primary" className="flex items-center gap-1 cursor-pointer" onClick={() => removeSkill(skill)}>
                                                {skill}
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Looking For */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Looking for (Role)"
                                type="text"
                                value={formData.lookingFor.role}
                                onChange={(e) => setFormData({ ...formData, lookingFor: { ...formData.lookingFor, role: e.target.value } })}
                                placeholder="e.g., Technical Co-founder"
                            />
                            <Input
                                label="Industry"
                                type="text"
                                value={formData.lookingFor.industry}
                                onChange={(e) => setFormData({ ...formData, lookingFor: { ...formData.lookingFor, industry: e.target.value } })}
                                placeholder="e.g., Fintech, Healthcare"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/profile')}
                                className="flex-1"
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" loading={submitting} className="flex-1" size="lg">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Card>
            </motion.div>
        </>
    );
}
