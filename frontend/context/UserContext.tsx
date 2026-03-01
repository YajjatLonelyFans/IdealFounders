'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';
import { User } from '@/types';

interface UserContextValue {
    user: User | null;
    loading: boolean;
    error: string;
    refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
    user: null,
    loading: true,
    error: '',
    refetch: async () => { },
});

export function useCurrentUser() {
    return useContext(UserContext);
}

export function UserProvider({ children }: { children: ReactNode }) {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUser = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const userData = await getCurrentUser(token);

            if (!userData) {
                router.push('/onboarding?redirected=true');
                return;
            }

            setUser(userData);
        } catch (err: any) {
            const msg: string = err.message || '';
            if (
                msg.includes('404') ||
                msg.includes('not found') ||
                msg.includes('onboarding')
            ) {
                router.push('/onboarding?redirected=true');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    }, [getToken, router]);

    // Wait for Clerk to fully initialize before fetching user
    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) return;
        fetchUser();
    }, [isLoaded, isSignedIn, fetchUser]);

    return (
        <UserContext.Provider value={{ user, loading, error, refetch: fetchUser }}>
            {children}
        </UserContext.Provider>
    );
}
