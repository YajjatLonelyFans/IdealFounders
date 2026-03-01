// User types
export interface User {
    _id: string;
    clerkId: string;
    email: string;
    fullName: string;
    birthdate: string;
    gender: 'male' | 'female';
    location: {
        state: string;
        city: string;
        locality: string;
    };
    education: {
        degree: string;
        yearOfPassing: string;
    };
    expertise: 'technical' | 'non-technical';
    expertiseLookingFor: 'technical' | 'non-technical';
    bio: string;
    skills: string[];
    skillsLookingFor: string[];
    startingFrom: 'own_idea' | 'join_idea' | 'either';
    hasCofounder: boolean;
    suitability: 'cofounder_with_idea' | 'cofounder_looking' | 'either';
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
    _id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    content: string;
    message?: string;
    timestamp?: string;
    createdAt: string;
    updatedAt: string;
    isMe?: boolean;
}

// API Error type
export interface ApiError {
    error: string;
    message: string;
    details?: string | string[];
}

// API Response types
export interface MatchesResponse {
    matches: Match[];
    total: number;
}

export interface UserResponse {
    message: string;
    user: User;
}

// Form types
export interface OnboardingFormData {
    fullName: string;
    birthdate: string;
    gender: 'male' | 'female';
    location: {
        state: string;
        city: string;
        locality: string;
    };
    education: {
        degree: string;
        yearOfPassing: string;
    };
    expertise: 'technical' | 'non-technical';
    expertiseLookingFor: 'technical' | 'non-technical';
    bio: string;
    skills: string[];
    skillsLookingFor: string[];
    startingFrom: 'own_idea' | 'join_idea' | 'either';
    hasCofounder: boolean;
    suitability: 'cofounder_with_idea' | 'cofounder_looking' | 'either';
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
    };
}
