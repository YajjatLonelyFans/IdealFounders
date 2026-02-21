'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { EmptyState, EmptyIcons } from '@/components/ui/EmptyState';
import { useCurrentUser } from '@/context/UserContext';
import { getConversations, markAsRead } from '@/lib/api';
import { Conversation } from '@/types';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function InboxPage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const { loading: userLoading, error: userError } = useCurrentUser();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [convsLoading, setConvsLoading] = useState(true);

    useEffect(() => {
        if (userLoading) return;

        async function loadConversations() {
            try {
                const token = await getToken();
                if (token) {
                    const data = await getConversations(token);
                    setConversations(data);
                }
            } catch (error) {
                console.error('Failed to load conversations:', error);
            } finally {
                setConvsLoading(false);
            }
        }

        loadConversations();
    }, [userLoading, getToken]);

    const handleOpenChat = async (roomId: string, hasUnread: boolean) => {
        if (hasUnread) {
            try {
                const token = await getToken();
                if (token) markAsRead(roomId, token).catch(() => { });
            } catch (error) { }
        }
        router.push(`/chat/${btoa(roomId)}`);
    };

    if (userLoading) return <LoadingPage message="Loading your conversations..." />;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <motion.h1
                className="text-3xl font-bold text-gray-900 mb-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                Messages
            </motion.h1>

            {/* Skeleton while conversations load */}
            {convsLoading && (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-xl border border-border bg-white p-4 flex items-center gap-4 animate-pulse">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-32" />
                                <div className="h-3 bg-gray-200 rounded w-56" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!convsLoading && conversations.length === 0 && (
                <EmptyState
                    icon={EmptyIcons.NoMessages}
                    title="No messages yet"
                    description="Connect with other founders or investors to start chatting."
                    action={{
                        label: 'Find Matches',
                        onClick: () => router.push('/matches'),
                    }}
                />
            )}

            {!convsLoading && conversations.length > 0 && (
                <motion.div
                    className="space-y-4"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {conversations.map((conv) => (
                        <motion.div
                            key={conv._id}
                            variants={staggerItem}
                            onClick={() => handleOpenChat(conv.roomId, conv.hasUnread)}
                            className="cursor-pointer"
                        >
                            <Card hover className="transition-colors hover:bg-gray-50">
                                <CardContent className="p-4 flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="relative w-12 h-12 flex-shrink-0">
                                        {conv.participant.avatar?.url ? (
                                            <Image
                                                src={conv.participant.avatar.url}
                                                alt={conv.participant.fullName}
                                                fill
                                                className="rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold text-lg">
                                                {conv.participant.fullName.charAt(0)}
                                            </div>
                                        )}
                                        {conv.hasUnread && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className={`truncate ${conv.hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'}`}>
                                                {conv.participant.fullName}
                                            </h3>
                                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className={`text-sm truncate ${conv.hasUnread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                            {conv.lastMessage}
                                        </p>
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
