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
import { getMessages, getCurrentUser, markAsRead } from '@/lib/api';
import { Message, User } from '@/types';
import { formatTime } from '@/lib/utils';

export default function ChatPage() {
    const { getToken } = useAuth();
    const params = useParams();
    const roomId = params.roomId as string;

    const [currentUserId, setCurrentUserId] = useState('');
    const [currentUserName, setCurrentUserName] = useState('');
    const [chatPartner, setChatPartner] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Store decoded roomId in ref to avoid stale closure in socket callback
    const decodedRoomIdRef = useRef<string>('');

    useEffect(() => {
        async function initialize() {
            try {
                const token = await getToken();
                if (!token) return;

                const user = await getCurrentUser(token);
                setCurrentUserId(user.clerkId);
                setCurrentUserName(user.fullName);

                // Decode Base64 room ID
                let decodedRoomId = roomId;
                try {
                    decodedRoomId = atob(roomId);
                } catch (e) {
                    // Fallback if not valid base64 (for legacy links)
                    decodedRoomId = roomId;
                }

                // Store in ref for socket callback
                decodedRoomIdRef.current = decodedRoomId;

                // Extract the other user's ID from the room ID
                // Try splitting by new separator '--' first, then fallback to replacing current ID
                let otherUserId = decodedRoomId.split('--').find(id => id !== user.clerkId);

                // Fallback for legacy rooms (using '_') or if split failed
                if (!otherUserId && decodedRoomId.includes(user.clerkId)) {
                    // Robust extraction: Remove my ID and any separators from the mixed string
                    otherUserId = decodedRoomId.replace(user.clerkId, '').replace(/^-+|-+$|^_+|_+$/g, '');
                }



                // Fetch the other user's information
                if (otherUserId) {
                    try {
                        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/${otherUserId}`;

                        const response = await fetch(apiUrl, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                        });



                        if (response.ok) {
                            const partnerData = await response.json();
                            setChatPartner(partnerData.user);
                        } else {
                            const errorData = await response.json().catch(() => ({}));

                            // Set a fallback if user not found (404)
                            if (response.status === 404) {
                                setChatPartner({
                                    _id: otherUserId,
                                    clerkId: otherUserId,
                                    fullName: 'Chat Partner',
                                    role: 'founder',
                                    email: '',
                                    bio: '',
                                    skills: [],
                                    lookingFor: { role: '', industry: '' },
                                    avatar: { url: '', publicId: '' },
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                } as User);
                            }
                        }
                    } catch (error) {
                        console.error('Exception fetching chat partner:', error);
                    }
                } else {

                }

                // Fetch Message History
                try {
                    const history = await getMessages(decodedRoomId, token) as unknown as Message[];
                    setMessages(history);

                    // Mark conversation as read (if it exists)
                    try {
                        await markAsRead(decodedRoomId, token);
                    } catch (readError) {
                        // Silently fail - conversation might not exist yet
                        console.log('Could not mark as read (conversation may not exist yet)');
                    }
                } catch (error) {
                    console.error('Failed to load message history:', error);
                }

                // Connect to Socket.io
                const socket = connectSocket();
                joinRoom(decodedRoomId);

                // Listen for incoming messages
                onReceiveMessage(async (data) => {
                    // Only handle messages from other users (sender already has optimistic UI)
                    if (data.senderId !== user.clerkId) {
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
                        try {
                            const currentToken = await getToken();
                            if (currentToken) {
                                await markAsRead(decodedRoomIdRef.current, currentToken);
                            }
                        } catch (error) {
                            console.log('Could not mark message as read:', error);
                        }
                    }
                });

                setLoading(false);
            } catch (error) {
                console.error('Failed to initialize chat:', error);
                setLoading(false);
            }
        }

        initialize();

        return () => {
            offReceiveMessage();
        };
    }, [roomId]); // Only depend on roomId, not getToken

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        // Assuming `connectSocket()` returns a global socket instance or `sendMessage` uses it internally.
        // The `!socket` check here would require storing the socket instance in state if it's not global.
        // For now, we'll use `currentUserId` and `currentUserName` as `user.clerkId` and `user.fullName`.
        if (!newMessage.trim() || !currentUserId) return;

        // Decode room ID again for access (or store it in state, but simpler to decode local var if inside effect - wait, this is outside)
        // We need the decoded ID here.
        let decodedId = roomId;
        try { decodedId = atob(roomId); } catch (e) { }

        // Optimistic UI update
        const messagePayload = {
            _id: crypto.randomUUID(),
            content: newMessage,
            senderId: currentUserId || 'unknown',
            senderName: currentUserName || 'User',
            conversationId: 'temp',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, messagePayload]);

        // Send to server
        sendMessage(decodedId, newMessage, currentUserId, currentUserName || 'User');
        setNewMessage('');
    };

    if (loading) return <LoadingPage message="Loading chat..." />;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className="border-b border-border p-4">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
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
                        {/* Name and Role */}
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {chatPartner?.fullName || (!loading ? 'Unknown User' : 'Loading...')}
                            </h2>
                            {chatPartner?.role && (
                                <p className="text-sm text-gray-600 capitalize">{chatPartner.role}</p>
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
                            const isCurrentUser = msg.senderId === currentUserId;
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
                                        <p
                                            className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-100' : 'text-gray-500'
                                                }`}
                                        >
                                            {formatTime(msg.createdAt || msg.timestamp || '')}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    {/* Scroll anchor - auto-scroll to this element when messages change */}
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
