'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { useCurrentUser } from '@/context/UserContext';
import { getConversations, getMessages, markAsRead } from '@/lib/api';
import { connectSocket, joinRoom, sendMessage, onReceiveMessage, offReceiveMessage } from '@/lib/socket';
import { Conversation, Message, User } from '@/types';
import { formatTime } from '@/lib/utils';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const AVATAR_COLORS = [
    { bg: 'bg-blue-100', text: 'text-blue-600' },
    { bg: 'bg-indigo-100', text: 'text-indigo-600' },
    { bg: 'bg-violet-100', text: 'text-violet-600' },
    { bg: 'bg-cyan-100', text: 'text-cyan-600' },
    { bg: 'bg-teal-100', text: 'text-teal-600' },
    { bg: 'bg-slate-100', text: 'text-slate-600' },
];

function getAvatarColor(name: string) {
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function MessagesPage() {
    const { getToken } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, loading: userLoading } = useCurrentUser();
    const autoOpenRoomRef = useRef<string | null>(searchParams.get('room'));

    // Inbox state
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [convsLoading, setConvsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Active chat state
    const [activeConv, setActiveConv] = useState<Conversation | null>(null);
    const [chatPartner, setChatPartner] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const activeRoomRef = useRef<string>('');
    const openChatRef = useRef<(conv: Conversation) => void>(() => {});

    // ─── Open a chat ───
    const openChat = useCallback(async (conv: Conversation) => {
        if (!user) return;
        setActiveConv(conv);
        setChatLoading(true);
        setMessages([]);
        setNewMessage('');

        try {
            const token = await getToken();
            if (!token) return;

            activeRoomRef.current = conv.roomId;

            // Extract partner ID from roomId
            let otherUserId = conv.roomId.split('--').find(id => id !== user.clerkId);
            if (!otherUserId && conv.roomId.includes(user.clerkId)) {
                otherUserId = conv.roomId.replace(user.clerkId, '').replace(/^-+|-+$|^_+|_+$/g, '');
            }

            // Fetch partner + messages in parallel
            const [partnerResponse, history] = await Promise.all([
                otherUserId
                    ? fetch(`${API_BASE}/api/users/${otherUserId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                    : Promise.resolve(null),
                getMessages(conv.roomId, token).catch(() => [] as unknown as Message[]),
            ]);

            if (partnerResponse?.ok) {
                const partnerData = await partnerResponse.json();
                setChatPartner(partnerData.user);
            } else {
                setChatPartner({
                    _id: otherUserId || '', clerkId: otherUserId || '',
                    fullName: conv.participant.fullName,
                    email: '', bio: '', birthdate: '', gender: 'male',
                    graduateStatus: 'graduated',
                    location: { state: '', city: '', locality: '' },
                    education: { collegeName: '', degree: '', yearOfPassing: '' },
                    expertise: 'technical', expertiseLookingFor: 'technical',
                    skills: [], skillsLookingFor: [],
                    startingFrom: 'either', hasCofounder: false, suitability: 'either',
                    avatar: { url: conv.participant.avatar?.url || '', publicId: '' },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                } as User);
            }

            setMessages(history as unknown as Message[]);
            markAsRead(conv.roomId, token).catch(() => { });

            // Mark conversation as read locally
            setConversations(prev => prev.map(c =>
                c._id === conv._id ? { ...c, hasUnread: false } : c
            ));

            // Socket connection
            offReceiveMessage();
            connectSocket();
            joinRoom(conv.roomId);

            onReceiveMessage(async (data) => {
                if (data.senderId !== user.clerkId) {
                    setMessages(prev => [...prev, {
                        _id: crypto.randomUUID(),
                        content: data.message,
                        senderId: data.senderId,
                        senderName: data.senderName,
                        conversationId: 'temp',
                        createdAt: data.timestamp,
                        updatedAt: data.timestamp,
                    }]);

                    const currentToken = await getToken();
                    if (currentToken) {
                        markAsRead(activeRoomRef.current, currentToken).catch(() => { });
                    }
                }
            });

        } catch (error) {
            console.error('Failed to open chat:', error);
        } finally {
            setChatLoading(false);
        }
    }, [user, getToken]);

    // Keep ref in sync with latest openChat
    useEffect(() => { openChatRef.current = openChat; }, [openChat]);

    // ─── Load conversations (runs once when user is ready) ───
    useEffect(() => {
        if (userLoading || !user) return;

        async function loadConversations() {
            try {
                const token = await getToken();
                if (token) {
                    const data = await getConversations(token);
                    setConversations(data);

                    // Auto-open conversation from ?room= query param
                    const roomParam = autoOpenRoomRef.current;
                    if (roomParam) {
                        autoOpenRoomRef.current = null; // only auto-open once
                        let decodedRoom = roomParam;
                        try { decodedRoom = atob(roomParam); } catch (e) { }

                        const matchingConv = data.find((c: Conversation) => c.roomId === decodedRoom);
                        if (matchingConv) {
                            openChatRef.current(matchingConv);
                        } else {
                            const tempConv: Conversation = {
                                _id: `temp-${decodedRoom}`,
                                roomId: decodedRoom,
                                lastMessage: '',
                                lastMessageAt: new Date().toISOString(),
                                hasUnread: false,
                                participant: {
                                    fullName: 'Loading...',
                                    avatar: { url: '' },
                                },
                            };
                            openChatRef.current(tempConv);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load conversations:', error);
            } finally {
                setConvsLoading(false);
            }
        }

        loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userLoading, user, getToken]);

    // ─── Close chat ───
    const closeChat = useCallback(() => {
        offReceiveMessage();
        setActiveConv(null);
        setChatPartner(null);
        setMessages([]);
        setNewMessage('');
        activeRoomRef.current = '';
    }, []);

    // ─── Send message ───
    const handleSend = useCallback(() => {
        if (!newMessage.trim() || !user || !activeConv) return;

        const messagePayload: Message = {
            _id: crypto.randomUUID(),
            content: newMessage,
            senderId: user.clerkId,
            senderName: user.fullName,
            conversationId: 'temp',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, messagePayload]);
        sendMessage(activeConv.roomId, newMessage, user.clerkId, user.fullName);

        // Update conversation last message locally
        setConversations(prev => prev.map(c =>
            c._id === activeConv._id
                ? { ...c, lastMessage: newMessage, lastMessageAt: new Date().toISOString() }
                : c
        ));

        setNewMessage('');
    }, [newMessage, user, activeConv]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Filtered conversations
    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        return conversations.filter(c =>
            c.participant.fullName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [conversations, searchQuery]);

    // Unread count
    const unreadCount = useMemo(() => conversations.filter(c => c.hasUnread).length, [conversations]);

    if (userLoading) return <LoadingPage message="Loading messages..." />;

    const isChatActive = activeConv !== null;

    return (
        <div className="min-h-screen bg-[#f0f5ff] font-sans flex flex-col">
            {/* Ambient Background */}
            <div className="ambient-bg" />

            {/* Main Content */}
            <main className="msg-app-wrapper" style={{ paddingTop: '6rem' }}>
                <div className={`msg-app-glass ${isChatActive ? 'chat-active' : ''}`}>

                    {/* ────── LEFT PANE: Inbox ────── */}
                    <div className="msg-pane-inbox">
                        {/* Header */}
                        <div className="msg-inbox-header">
                            <div className="flex justify-between items-center">
                                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Messages</h1>
                                {unreadCount > 0 && (
                                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                        {unreadCount} New
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    className="msg-search-input"
                                    placeholder="Search chats..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Conversation List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {convsLoading && (
                                <div className="p-4 space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center gap-3 animate-pulse">
                                            <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-slate-200 rounded w-28" />
                                                <div className="h-3 bg-slate-200 rounded w-40" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!convsLoading && filteredConversations.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                    <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <p className="text-slate-500 font-medium text-sm">
                                        {searchQuery ? 'No chats found' : 'No messages yet'}
                                    </p>
                                    {!searchQuery && (
                                        <button
                                            onClick={() => router.push('/matches')}
                                            className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                        >
                                            Find Matches →
                                        </button>
                                    )}
                                </div>
                            )}

                            {!convsLoading && filteredConversations.map((conv) => {
                                const color = getAvatarColor(conv.participant.fullName);
                                const isActive = activeConv?._id === conv._id;

                                return (
                                    <div
                                        key={conv._id}
                                        className={`msg-contact-row ${isActive ? 'active' : ''}`}
                                        onClick={() => openChat(conv)}
                                    >
                                        <div className={`msg-avatar-lg ${color.bg} ${color.text}`}>
                                            {conv.participant.avatar?.url ? (
                                                <Image
                                                    src={conv.participant.avatar.url}
                                                    alt={conv.participant.fullName}
                                                    width={48} height={48}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                conv.participant.fullName.charAt(0)
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h3 className={`text-[0.95rem] truncate ${conv.hasUnread ? 'font-bold text-slate-800' : 'font-semibold text-slate-700'}`}>
                                                    {conv.participant.fullName}
                                                </h3>
                                                <span className={`text-xs flex-shrink-0 ml-2 ${conv.hasUnread ? 'font-semibold text-blue-600' : 'text-slate-400'}`}>
                                                    {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: false })}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={`text-sm truncate ${conv.hasUnread ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                                                    {conv.lastMessage}
                                                </p>
                                                {conv.hasUnread && (
                                                    <span className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ────── RIGHT PANE: Chat ────── */}
                    <div className="msg-pane-chat">
                        {chatLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                            </div>
                        ) : activeConv && chatPartner ? (
                            <>
                                {/* Chat Header */}
                                <div className="msg-chat-header">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Mobile back */}
                                        <button onClick={closeChat} className="msg-close-btn msg-mobile-back -ml-2">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>

                                        <div className={`msg-avatar-sm ${getAvatarColor(chatPartner.fullName).bg} ${getAvatarColor(chatPartner.fullName).text} border border-slate-200 shadow-sm flex-shrink-0`}>
                                            {chatPartner.avatar?.url ? (
                                                <Image src={chatPartner.avatar.url} alt={chatPartner.fullName} width={38} height={38} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                chatPartner.fullName.charAt(0)
                                            )}
                                        </div>

                                        <div className="truncate pr-2">
                                            <h2 className="text-[0.95rem] font-bold text-slate-800 truncate">{chatPartner.fullName}</h2>
                                            <p className="text-[0.7rem] font-medium text-slate-500 truncate capitalize">
                                                {chatPartner.expertise || 'Active now'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Desktop close */}
                                    <button onClick={closeChat} className="msg-close-btn msg-desktop-close" title="Close chat">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Chat Stream */}
                                <div className="msg-chat-stream custom-scrollbar">
                                    <div className="msg-date-pill">Today</div>

                                    {messages.length === 0 && (
                                        <div className="flex-1 flex items-center justify-center py-12">
                                            <p className="text-slate-400 text-sm">Start the conversation by sending a message below.</p>
                                        </div>
                                    )}

                                    {messages.map((msg, index) => {
                                        const isSent = msg.senderId === user?.clerkId;
                                        return (
                                            <div
                                                key={msg._id || index}
                                                className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                                                style={{ maxWidth: '75%', alignSelf: isSent ? 'flex-end' : 'flex-start' }}
                                            >
                                                {!isSent && (
                                                    <div className={`msg-avatar-sm ${getAvatarColor(chatPartner.fullName).bg} ${getAvatarColor(chatPartner.fullName).text} flex-shrink-0 mb-5 mr-2 border border-slate-200`}>
                                                        {chatPartner.fullName.charAt(0)}
                                                    </div>
                                                )}
                                                <div className={`flex flex-col ${isSent ? 'items-end' : ''} w-full`}>
                                                    <div className={`msg-bubble ${isSent ? 'msg-bubble-sent' : 'msg-bubble-received'}`}>
                                                        {msg.content || (msg as any).message}
                                                    </div>
                                                    <div className={`flex items-center gap-1 text-[0.65rem] font-medium text-slate-400 mt-1 ${isSent ? 'mr-1 justify-end' : 'ml-1'}`}>
                                                        {formatTime(msg.createdAt || (msg as any).timestamp || '')}
                                                        {isSent && (
                                                            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Dock */}
                                <div className="msg-input-dock">
                                    <div className="msg-input-wrapper">
                                        <input
                                            type="text"
                                            className="msg-chat-input"
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                        />
                                    </div>
                                    <button
                                        className="msg-send-btn"
                                        onClick={handleSend}
                                        disabled={!newMessage.trim()}
                                        title="Send message"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'translateX(1px)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* Empty state when no chat selected (only visible on desktop when expanded somehow) */
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-slate-400 text-sm">Select a conversation to start chatting.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
