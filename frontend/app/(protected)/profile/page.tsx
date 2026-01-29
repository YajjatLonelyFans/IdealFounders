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
import { Modal } from '@/components/ui/Modal';
import { getCurrentUser, deleteProfile } from '@/lib/api';
import { User } from '@/types';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

export default function ProfilePage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        async function loadUser() {
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
            } catch (err: any) {
                // If user not found (404), redirect to onboarding
                if (err.message.includes('not found') || err.message.includes('onboarding')) {
                    router.push('/onboarding?redirected=true');
                    return;
                }
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, [getToken, router]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            await deleteProfile(token);

            // Use hard redirect to force full page reload and clear all state
            // Redirect to sign-in instead of homepage to avoid loop
            window.location.href = '/sign-in';
        } catch (err: any) {
            alert(err.message);
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) return <LoadingPage message="Loading your profile..." />;
    if (error) return <div className="max-w-4xl mx-auto px-4 py-12"><ErrorMessage message={error} /></div>;
    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <motion.div
                className="flex justify-between items-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
                <Button variant="outline" onClick={() => router.push('/edit-profile')}>
                    Edit Profile
                </Button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <Card>
                    <CardContent className="pt-6">
                        {/* Avatar & Basic Info */}
                        <motion.div
                            className="flex flex-col md:flex-row gap-6 mb-6"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="flex-shrink-0">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-primary-100">
                                    {user.avatar?.url ? (
                                        <Image
                                            src={user.avatar.url}
                                            alt={user.fullName}
                                            width={128}
                                            height={128}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-4xl font-bold text-primary">
                                                {user.fullName.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.fullName}</h2>
                                <Badge variant="primary" className="mb-3 capitalize">
                                    {user.role}
                                </Badge>
                                <p className="text-gray-600">{user.email}</p>
                            </div>
                        </motion.div>

                        {/* Bio */}
                        <motion.div
                            className="mb-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bio</h3>
                            <p className="text-gray-700">{user.bio}</p>
                        </motion.div>

                        {/* Skills */}
                        <motion.div
                            className="mb-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {user.skills.map((skill) => (
                                    <Badge key={skill} variant="primary">
                                        {skill}
                                    </Badge>
                                ))}
                                {user.skills.length === 0 && (
                                    <p className="text-gray-500">No skills added yet</p>
                                )}
                            </div>
                        </motion.div>

                        {/* Looking For */}
                        <motion.div
                            className="mb-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Looking For</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Role</p>
                                    <p className="text-gray-900 font-medium">
                                        {user.lookingFor.role || 'Not specified'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Industry</p>
                                    <p className="text-gray-900 font-medium">
                                        {user.lookingFor.industry || 'Not specified'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Danger Zone */}
                        <motion.div
                            className="border-t border-border pt-6 mt-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <h3 className="text-lg font-semibold text-error mb-2">Danger Zone</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Once you delete your profile, there is no going back. Please be certain.
                            </p>
                            <Button
                                variant="danger"
                                onClick={() => setShowDeleteModal(true)}
                                loading={deleting}
                            >
                                Delete Profile
                            </Button>
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Profile"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            loading={deleting}
                        >
                            Delete Forever
                        </Button>
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
