// User types
export interface User {
    _id: string;
    clerkId: string;
    email: string;
    role: 'founder' | 'investor';
    fullName: string;
    bio: string;
    skills: string[];
    lookingFor: {
        role: string;
        industry: string;
    };
    avatar: {
        url: string;
        publicId: string;
    };
    createdAt: string;
    updatedAt: string;
}

// Match type (User with match score)
export interface Match extends User {
    matchScore: number;
}

// Message type for chat
export interface Message {
    _id: string; // MongoDB ID
    conversationId: string;
    senderId: string;
    senderName: string;
    content: string; // New field
    message?: string; // Old field (optional for compatibility)
    timestamp?: string; // Old field
    createdAt: string;
    updatedAt: string;
    isMe?: boolean; // Frontend only helper
}

// API Error type
export interface ApiError {
    error: string;
    message: string;
    details?: string;
}

// API Response types
export interface MatchesResponse {
    matches: Match[];
    total: number;
    filter: 'opposite' | 'same';
}

export interface UserResponse {
    message: string;
    user: User;
}

// Form types
export interface OnboardingFormData {
    fullName: string;
    bio: string;
    role: 'founder' | 'investor';
    skills: string[];
    lookingFor: {
        role: string;
        industry: string;
    };
    avatar?: File;
}

export interface Conversation {
    _id: string;
    roomId: string;
    lastMessage: string;
    lastMessageAt: string;
    hasUnread: boolean;
    participant: {
        fullName: string;
        avatar: { url: string };
        role: string;
    };
}
