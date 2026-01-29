'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { updateProfile } from '@/lib/api';
import { fadeInUp, fadeIn, scaleIn } from '@/lib/animations';

export default function OnboardingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showRedirectMessage, setShowRedirectMessage] = useState(false);
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [skillInput, setSkillInput] = useState('');
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

    useEffect(() => {
        // Check if user was redirected here (e.g., from dashboard or other protected pages)
        const redirected = searchParams.get('redirected');
        if (redirected === 'true') {
            setShowRedirectMessage(true);
            // Auto-hide message after 5 seconds
            const timer = setTimeout(() => setShowRedirectMessage(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

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
        setLoading(true);

        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            await updateProfile(formData, avatar, token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
                <p className="text-gray-600">Tell us about yourself to get better matches</p>
            </motion.div>

            {/* Redirect Message */}
            <AnimatePresence>
                {showRedirectMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3"
                    >
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-blue-900 mb-1">Complete Your Profile First</h3>
                            <p className="text-sm text-blue-700">Please fill out your profile information below to access the platform features.</p>
                        </div>
                        <button
                            onClick={() => setShowRedirectMessage(false)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

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

                    <Button type="submit" loading={loading} className="w-full" size="lg">
                        Complete Profile
                    </Button>
                </form>
            </Card>
        </motion.div>
    );
}
