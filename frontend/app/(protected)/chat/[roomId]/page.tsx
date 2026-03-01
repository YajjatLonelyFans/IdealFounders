'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { EmptyState, EmptyIcons } from '@/components/ui/EmptyState';
import { connectSocket, joinRoom, sendMessage, onReceiveMessage, offReceiveMessage } from '@/lib/socket';
import { getMessages, markAsRead } from '@/lib/api';
import { useCurrentUser } from '@/context/UserContext';
import { Message, User } from '@/types';
import { formatTime } from '@/lib/utils';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ChatPage() {
    const { getToken } = useAuth();
    const params = useParams();
    const roomId = params.roomId as string;

    // User from shared context — no extra getCurrentUser call needed
    const { user, loading: userLoading } = useCurrentUser();

    const [chatPartner, setChatPartner] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const decodedRoomIdRef = useRef<string>('');

    useEffect(() => {
        // Wait for user context to resolve before proceeding
        if (userLoading || !user) return;
        const currentUser = user; // narrowed to non-null for async function

        async function initialize() {
            try {
                const token = await getToken();
                if (!token) return;

                // Decode Base64 room ID
                let decodedRoomId = roomId;
                try { decodedRoomId = atob(roomId); } catch (e) { }
                decodedRoomIdRef.current = decodedRoomId;

                // Extract the other user's ID from the room ID
                let otherUserId = decodedRoomId.split('--').find(id => id !== currentUser.clerkId);
                if (!otherUserId && decodedRoomId.includes(currentUser.clerkId)) {
                    otherUserId = decodedRoomId.replace(currentUser.clerkId, '').replace(/^-+|-+$|^_+|_+$/g, '');
                }

                // Fetch chat partner info and message history in PARALLEL
                const [partnerResponse, history] = await Promise.all([
                    otherUserId
                        ? fetch(`${API_BASE}/api/users/${otherUserId}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                        : Promise.resolve(null),
                    getMessages(decodedRoomId, token).catch(() => [] as unknown as Message[]),
                ]);

                // Handle partner data
                if (partnerResponse?.ok) {
                    const partnerData = await partnerResponse.json();
                    setChatPartner(partnerData.user);
                } else if (partnerResponse?.status === 404 && otherUserId) {
                    setChatPartner({
                        _id: otherUserId, clerkId: otherUserId,
                        fullName: 'Chat Partner',
                        email: '', bio: '', birthdate: '', gender: 'male',
                        location: { state: '', city: '', locality: '' },
                        education: { degree: 'N/A', yearOfPassing: 'N/A' },
                        expertise: 'technical', expertiseLookingFor: 'technical',
                        skills: [], skillsLookingFor: [],
                        startingFrom: 'either', hasCofounder: false, suitability: 'either',
                        avatar: { url: '', publicId: '' },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    } as User);
                }

                // Set messages and silently mark as read
                setMessages(history as unknown as Message[]);
                markAsRead(decodedRoomId, token).catch(() => { });

                // Connect to Socket.io
                connectSocket();
                joinRoom(decodedRoomId);

                onReceiveMessage(async (data) => {
                    if (data.senderId !== currentUser.clerkId) {
                        setMessages((prev) => [...prev, {
                            _id: crypto.randomUUID(),
                            content: data.message,
                            senderId: data.senderId,
                            senderName: data.senderName,
                            conversationId: 'temp',
                            createdAt: data.timestamp,
                            updatedAt: data.timestamp,
                        }]);

                        // Mark as read since user is viewing the chat
                        const currentToken = await getToken();
                        if (currentToken) {
                            markAsRead(decodedRoomIdRef.current, currentToken).catch(() => { });
                        }
                    }
                });
            } catch (error) {
                console.error('Failed to initialize chat:', error);
            } finally {
                setLoading(false);
            }
        }

        initialize();

        return () => { offReceiveMessage(); };
    }, [roomId, user, userLoading, getToken]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!newMessage.trim() || !user) return;

        let decodedId = roomId;
        try { decodedId = atob(roomId); } catch (e) { }

        const messagePayload: Message = {
            _id: crypto.randomUUID(),
            content: newMessage,
            senderId: user.clerkId,
            senderName: user.fullName,
            conversationId: 'temp',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, messagePayload]);
        sendMessage(decodedId, newMessage, user.clerkId, user.fullName);
        setNewMessage('');
    };

    if (userLoading || loading) return <LoadingPage message="Loading chat..." />;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="border-b border-border p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 flex-shrink-0">
                            {chatPartner?.avatar?.url ? (
                                <Image
                                    src={chatPartner.avatar.url}
                                    alt={chatPartner.fullName}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-lg font-bold text-primary">
                                        {chatPartner?.fullName?.charAt(0) || '?'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {chatPartner?.fullName || 'Unknown User'}
                            </h2>
                            {chatPartner?.expertise && (
                                <p className="text-sm text-gray-600 capitalize">{chatPartner.expertise}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <EmptyState
                            icon={EmptyIcons.NoMessages}
                            title="No messages yet"
                            description="Start the conversation by sending a message below"
                        />
                    ) : (
                        messages.map((msg, index) => {
                            const isCurrentUser = msg.senderId === user?.clerkId;
                            return (
                                <div
                                    key={index}
                                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg px-4 py-2 ${isCurrentUser
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        {!isCurrentUser && (
                                            <p className="text-xs font-medium mb-1 opacity-75">
                                                {msg.senderName}
                                            </p>
                                        )}
                                        <p className="text-sm">{msg.content || msg.message}</p>
                                        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-100' : 'text-gray-500'}`}>
                                            {formatTime(msg.createdAt || msg.timestamp || '')}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-border p-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="flex-1 rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <Button onClick={handleSend} disabled={!newMessage.trim()}>
                            Send
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
