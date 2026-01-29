import { User, Match, MatchesResponse, UserResponse, ApiError, Conversation, Message } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Fetch wrapper with error handling and Clerk token
 */
async function fetchWithAuth(
    endpoint: string,
    options: RequestInit = {},
    token?: string
): Promise<Response> {
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };

    // Add Clerk token if provided
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Add Content-Type for JSON requests (unless it's FormData)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
    });

    return response;
}

/**
 * Handle API errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
            error: 'Unknown error',
            message: 'An unexpected error occurred',
        }));

        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get current user profile
 */
export async function getCurrentUser(token: string): Promise<User> {
    const response = await fetchWithAuth('/api/users/me', { method: 'GET' }, token);
    return handleResponse<User>(response);
}

/**
 * Update user profile (onboarding)
 */
export async function updateProfile(
    data: {
        fullName?: string;
        bio?: string;
        role?: string;
        skills?: string[];
        lookingFor?: { role: string; industry: string };
    },
    avatar: File | null,
    token: string
): Promise<UserResponse> {
    const formData = new FormData();

    // Append text fields
    if (data.fullName) formData.append('fullName', data.fullName);
    if (data.bio) formData.append('bio', data.bio);
    if (data.role) formData.append('role', data.role);
    if (data.skills) formData.append('skills', JSON.stringify(data.skills));
    if (data.lookingFor) formData.append('lookingFor', JSON.stringify(data.lookingFor));

    // Append avatar file
    if (avatar) {
        formData.append('avatar', avatar);
    }

    const response = await fetchWithAuth(
        '/api/users/onboard',
        {
            method: 'POST',
            body: formData,
        },
        token
    );

    return handleResponse<UserResponse>(response);
}

/**
 * Delete user profile
 */
export async function deleteProfile(token: string): Promise<{ message: string }> {
    const response = await fetchWithAuth('/api/users/me', { method: 'DELETE' }, token);
    return handleResponse<{ message: string }>(response);
}

/**
 * Get match recommendations
 */
export async function getMatches(
    filter: 'opposite' | 'same',
    token: string
): Promise<MatchesResponse> {
    const response = await fetchWithAuth(
        `/api/matches/recommendations?filter=${filter}`,
        { method: 'GET' },
        token
    );
    return handleResponse<MatchesResponse>(response);
}

// Chat API
export async function getConversations(token: string): Promise<Conversation[]> {
    const response = await fetchWithAuth('/api/chat/conversations', { method: 'GET' }, token);
    return handleResponse<Conversation[]>(response);
}

export async function getMessages(roomId: string, token: string): Promise<Message[]> {
    const response = await fetchWithAuth(`/api/chat/${roomId}/messages`, { method: 'GET' }, token);
    return handleResponse<Message[]>(response);
}

export async function markAsRead(roomId: string, token: string): Promise<{ success: boolean }> {
    const response = await fetchWithAuth(`/api/chat/${roomId}/mark-read`, { method: 'POST' }, token);
    return handleResponse<{ success: boolean }>(response);
}

export async function getUnreadCount(token: string): Promise<{ count: number }> {
    const response = await fetchWithAuth('/api/chat/unread-count', { method: 'GET' }, token);
    return handleResponse(response);
}
