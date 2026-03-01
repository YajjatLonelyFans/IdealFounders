'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { updateProfile } from '@/lib/api';
import { useCurrentUser } from '@/context/UserContext';
import { fadeInUp, fadeIn, scaleIn } from '@/lib/animations';

const STEP_TITLES = ['Personal Information', 'Preferences & Skills'];

export default function OnboardingPage() {
    const router = useRouter();
    const { getToken } = useAuth();
    const { refetch } = useCurrentUser();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [skillInput, setSkillInput] = useState('');
    const [skillLookingInput, setSkillLookingInput] = useState('');


    const [formData, setFormData] = useState({
        fullName: '',
        birthdate: '',
        gender: '' as '' | 'male' | 'female',
        location: { state: '', city: '', locality: '' },
        education: { degree: '', yearOfPassing: '' },
        expertise: '' as '' | 'technical' | 'non-technical',
        expertiseLookingFor: '' as '' | 'technical' | 'non-technical',
        bio: '',
        skills: [] as string[],
        skillsLookingFor: [] as string[],
        startingFrom: '' as '' | 'own_idea' | 'join_idea' | 'either',
        hasCofounder: null as boolean | null,
        suitability: '' as '' | 'cofounder_with_idea' | 'cofounder_looking' | 'either',
    });


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
            setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
            setSkillInput('');
        }
    };

    const removeSkill = (skill: string) => {
        setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
    };

    const addSkillLooking = () => {
        if (skillLookingInput.trim() && !formData.skillsLookingFor.includes(skillLookingInput.trim())) {
            setFormData({ ...formData, skillsLookingFor: [...formData.skillsLookingFor, skillLookingInput.trim()] });
            setSkillLookingInput('');
        }
    };

    const removeSkillLooking = (skill: string) => {
        setFormData({ ...formData, skillsLookingFor: formData.skillsLookingFor.filter((s) => s !== skill) });
    };

    // Step 1 validation
    const validateStep1 = (): boolean => {
        if (!formData.fullName.trim()) { setError('Full name is required'); return false; }
        if (!formData.birthdate) { setError('Birthdate is required'); return false; }
        if (!formData.gender) { setError('Please select your gender'); return false; }
        if (!formData.location.state.trim()) { setError('State is required'); return false; }
        if (!formData.location.city.trim()) { setError('City is required'); return false; }
        if (!formData.location.locality.trim()) { setError('Locality is required'); return false; }
        // Education is optional
        return true;
    };

    // Step 2 validation
    const validateStep2 = (): boolean => {
        if (!formData.expertise) { setError('Please select your expertise'); return false; }
        if (!formData.expertiseLookingFor) { setError('Please select expertise you are looking for'); return false; }
        if (!formData.bio.trim() || formData.bio.trim().length < 10) { setError('Bio must be at least 10 characters'); return false; }
        if (formData.skills.length < 1) { setError('Add at least 1 skill'); return false; }
        if (formData.skillsLookingFor.length < 1) { setError('Add at least 1 skill you are looking for'); return false; }
        if (!formData.startingFrom) { setError('Please select where you are starting from'); return false; }
        if (formData.hasCofounder === null) { setError('Please indicate if you have a co-founder'); return false; }
        if (!formData.suitability) { setError('Please select what best suits you'); return false; }
        return true;
    };

    const handleNext = () => {
        setError('');
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setError('');
        setStep(1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateStep2()) return;

        setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const submitData = {
                ...formData,
                education: {
                    degree: formData.education.degree.trim() || 'N/A',
                    yearOfPassing: formData.education.yearOfPassing.trim() || 'N/A',
                },
                hasCofounder: formData.hasCofounder!,
            };

            await updateProfile(submitData, avatar, token);
            await refetch();
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const slideVariants = {
        enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
    };

    const direction = step === 1 ? -1 : 1;

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

                {/* Step Indicator */}
                <div className="flex items-center justify-center mt-6 gap-3">
                    {STEP_TITLES.map((title, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step > i + 1
                                ? 'bg-green-500 text-white'
                                : step === i + 1
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }`}>
                                {step > i + 1 ? '✓' : i + 1}
                            </div>
                            <span className={`text-sm font-medium hidden sm:inline ${step === i + 1 ? 'text-primary' : 'text-gray-500'
                                }`}>{title}</span>
                            {i < STEP_TITLES.length - 1 && (
                                <div className={`w-12 h-0.5 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>



            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <AnimatePresence mode="wait" custom={direction}>
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
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

                                {/* Birthdate */}
                                <Input
                                    label="Birthdate"
                                    type="date"
                                    required
                                    value={formData.birthdate}
                                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                                />

                                {/* Gender */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender <span className="text-error">*</span>
                                    </label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: 'male' })}
                                            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${formData.gender === 'male'
                                                ? 'border-primary bg-primary-50 text-primary'
                                                : 'border-border hover:border-primary'
                                                }`}
                                        >
                                            Male
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: 'female' })}
                                            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${formData.gender === 'female'
                                                ? 'border-primary bg-primary-50 text-primary'
                                                : 'border-border hover:border-primary'
                                                }`}
                                        >
                                            Female
                                        </button>
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location <span className="text-error">*</span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <Input
                                            type="text"
                                            required
                                            value={formData.location.state}
                                            onChange={(e) => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })}
                                            placeholder="State"
                                        />
                                        <Input
                                            type="text"
                                            required
                                            value={formData.location.city}
                                            onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                                            placeholder="City"
                                        />
                                        <Input
                                            type="text"
                                            required
                                            value={formData.location.locality}
                                            onChange={(e) => setFormData({ ...formData, location: { ...formData.location, locality: e.target.value } })}
                                            placeholder="Locality"
                                        />
                                    </div>
                                </div>

                                {/* Education (Optional) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Education <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Input
                                            type="text"
                                            value={formData.education.degree}
                                            onChange={(e) => setFormData({ ...formData, education: { ...formData.education, degree: e.target.value } })}
                                            placeholder="Degree (e.g., B.Tech, MBA)"
                                        />
                                        <Input
                                            type="text"
                                            value={formData.education.yearOfPassing}
                                            onChange={(e) => setFormData({ ...formData, education: { ...formData.education, yearOfPassing: e.target.value } })}
                                            placeholder="Year of Passing (e.g., 2024)"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                {/* Expertise */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Expertise <span className="text-error">*</span>
                                    </label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, expertise: 'technical' })}
                                            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${formData.expertise === 'technical'
                                                ? 'border-primary bg-primary-50 text-primary'
                                                : 'border-border hover:border-primary'
                                                }`}
                                        >
                                            Technical
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, expertise: 'non-technical' })}
                                            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${formData.expertise === 'non-technical'
                                                ? 'border-primary bg-primary-50 text-primary'
                                                : 'border-border hover:border-primary'
                                                }`}
                                        >
                                            Non-Technical
                                        </button>
                                    </div>
                                </div>

                                {/* Expertise Looking For */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Expertise You&apos;re Looking For <span className="text-error">*</span>
                                    </label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, expertiseLookingFor: 'technical' })}
                                            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${formData.expertiseLookingFor === 'technical'
                                                ? 'border-primary bg-primary-50 text-primary'
                                                : 'border-border hover:border-primary'
                                                }`}
                                        >
                                            Technical
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, expertiseLookingFor: 'non-technical' })}
                                            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${formData.expertiseLookingFor === 'non-technical'
                                                ? 'border-primary bg-primary-50 text-primary'
                                                : 'border-border hover:border-primary'
                                                }`}
                                        >
                                            Non-Technical
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Your Skills <span className="text-error">*</span>
                                    </label>
                                    <div className="flex gap-2 mb-3">
                                        <Input
                                            type="text"
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                            placeholder="e.g., React, Marketing, Sales"
                                        />
                                        <Button type="button" onClick={addSkill} variant="outline">Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <AnimatePresence>
                                            {formData.skills.map((skill) => (
                                                <motion.div key={skill} variants={scaleIn} initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.8 }}>
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

                                {/* Skills Looking For */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Skills You&apos;re Looking For <span className="text-error">*</span>
                                    </label>
                                    <div className="flex gap-2 mb-3">
                                        <Input
                                            type="text"
                                            value={skillLookingInput}
                                            onChange={(e) => setSkillLookingInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillLooking())}
                                            placeholder="e.g., Backend, Finance, Design"
                                        />
                                        <Button type="button" onClick={addSkillLooking} variant="outline">Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <AnimatePresence>
                                            {formData.skillsLookingFor.map((skill) => (
                                                <motion.div key={skill} variants={scaleIn} initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.8 }}>
                                                    <Badge variant="secondary" className="flex items-center gap-1 cursor-pointer" onClick={() => removeSkillLooking(skill)}>
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

                                {/* Starting From */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Where are you starting from? <span className="text-error">*</span>
                                    </label>
                                    <div className="space-y-2">
                                        {([
                                            { value: 'own_idea', label: 'Working on your own idea' },
                                            { value: 'join_idea', label: "I am looking to join someone else's idea" },
                                            { value: 'either', label: 'Either works' },
                                        ] as const).map(({ value, label }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, startingFrom: value })}
                                                className={`w-full text-left py-3 px-4 rounded-lg border-2 font-medium transition-all ${formData.startingFrom === value
                                                    ? 'border-primary bg-primary-50 text-primary'
                                                    : 'border-border hover:border-primary'
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Has Cofounder */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Do you have a co-founder? <span className="text-error">*</span>
                                    </label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, hasCofounder: true })}
                                            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${formData.hasCofounder === true
                                                ? 'border-primary bg-primary-50 text-primary'
                                                : 'border-border hover:border-primary'
                                                }`}
                                        >
                                            <span className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${formData.hasCofounder === true ? 'border-primary bg-primary text-white' : 'border-gray-300'
                                                }`}>
                                                {formData.hasCofounder === true && '✓'}
                                            </span>
                                            Yes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, hasCofounder: false })}
                                            className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-2 ${formData.hasCofounder === false
                                                ? 'border-primary bg-primary-50 text-primary'
                                                : 'border-border hover:border-primary'
                                                }`}
                                        >
                                            <span className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${formData.hasCofounder === false ? 'border-primary bg-primary text-white' : 'border-gray-300'
                                                }`}>
                                                {formData.hasCofounder === false && '✓'}
                                            </span>
                                            No
                                        </button>
                                    </div>
                                </div>

                                {/* Suitability */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        What best suits you? <span className="text-error">*</span>
                                    </label>
                                    <div className="space-y-2">
                                        {([
                                            { value: 'cofounder_with_idea', label: 'Cofounder with an idea' },
                                            { value: 'cofounder_looking', label: 'Cofounder who is looking for other startups to join' },
                                            { value: 'either', label: 'Either works' },
                                        ] as const).map(({ value, label }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, suitability: value })}
                                                className={`w-full text-left py-3 px-4 rounded-lg border-2 font-medium transition-all ${formData.suitability === value
                                                    ? 'border-primary bg-primary-50 text-primary'
                                                    : 'border-border hover:border-primary'
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3">
                        {step === 1 ? (
                            <Button type="button" onClick={handleNext} className="w-full" size="lg">
                                Next
                            </Button>
                        ) : (
                            <>
                                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                                    Back
                                </Button>
                                <Button type="submit" loading={loading} className="flex-1" size="lg">
                                    Complete Profile
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </Card>
        </motion.div>
    );
}
