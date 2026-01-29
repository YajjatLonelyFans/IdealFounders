'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserButton, useUser, useAuth } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { getUnreadCount } from '@/lib/api';

export function Navbar() {
    const { isSignedIn } = useUser();
    const { getToken } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread count on mount and periodically
    useEffect(() => {
        if (!isSignedIn) return;

        const fetchUnreadCount = async () => {
            try {
                const token = await getToken();
                if (token) {
                    const { count } = await getUnreadCount(token);
                    setUnreadCount(count);
                }
            } catch (error) {
                console.error('Failed to fetch unread count:', error);
            }
        };

        fetchUnreadCount();

        // Poll every 10 seconds for updates
        const interval = setInterval(fetchUnreadCount, 10000);

        return () => clearInterval(interval);
    }, [isSignedIn, getToken]);

    return (
        <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href={isSignedIn ? '/dashboard' : '/'} className="flex items-center gap-3">
                        <Image src="/logo.jpeg" alt="IdealFounders" width={40} height={40} className="rounded-lg" />
                        <span className="text-xl font-bold text-primary">IdealFounders</span>
                    </Link>

                    {/* Desktop Navigation */}
                    {isSignedIn && (
                        <div className="hidden md:flex items-center gap-6">
                            <Link
                                href="/dashboard"
                                className="text-gray-700 hover:text-primary font-medium transition-colors"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/matches"
                                className="text-gray-700 hover:text-primary font-medium transition-colors"
                            >
                                Matches
                            </Link>
                            <Link
                                href="/chat"
                                className="text-gray-700 hover:text-primary font-medium transition-colors relative"
                            >
                                Messages
                                {unreadCount > 0 && (
                                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                            <Link
                                href="/profile"
                                className="text-gray-700 hover:text-primary font-medium transition-colors"
                            >
                                Profile
                            </Link>
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    )}

                    {/* Mobile menu button */}
                    {isSignedIn && (
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                        >
                            <svg
                                className="h-6 w-6 text-gray-700"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {mobileMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    )}
                </div>

                {/* Mobile Navigation */}
                {isSignedIn && mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border">
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/dashboard"
                                className="text-gray-700 hover:text-primary font-medium py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/matches"
                                className="text-gray-700 hover:text-primary font-medium py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Matches
                            </Link>
                            <Link
                                href="/chat"
                                className="text-gray-700 hover:text-primary font-medium py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Messages
                            </Link>
                            <Link
                                href="/profile"
                                className="text-gray-700 hover:text-primary font-medium py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Profile
                            </Link>
                            <div className="pt-2">
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
