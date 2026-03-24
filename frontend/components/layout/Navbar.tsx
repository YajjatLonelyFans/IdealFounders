'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserButton, useUser, useAuth } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getUnreadCount } from '@/lib/api';

const NAV_LINKS = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/matches', label: 'Matches' },
    { href: '/chat', label: 'Messages' },
    { href: '/profile', label: 'Profile' },
];

export function Navbar() {
    const { isSignedIn } = useUser();
    const { getToken } = useAuth();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

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
        const interval = setInterval(fetchUnreadCount, 10000);
        return () => clearInterval(interval);
    }, [isSignedIn, getToken]);

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href={isSignedIn ? '/dashboard' : '/'} className="flex items-center gap-3 group">
                    <Image
                        src="/idealfounders.jpeg"
                        alt="IdealFounders"
                        width={36}
                        height={36}
                        className="rounded-xl shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow"
                    />
                    <span className="text-lg font-semibold text-slate-800 tracking-tight">
                        Ideal<span className="text-gradient">Founders</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                {isSignedIn && (
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 relative ${
                                    isActive(href)
                                        ? 'text-blue-600 font-medium bg-blue-50'
                                        : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            >
                                {label}
                                {label === 'Messages' && unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        ))}
                        <div className="ml-3">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </div>
                )}

                {/* Mobile menu button */}
                {isSignedIn && (
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                )}
            </div>

            {/* Mobile Navigation */}
            {isSignedIn && mobileMenuOpen && (
                <div className="md:hidden px-6 py-4 border-t border-slate-100/50">
                    <div className="flex flex-col gap-1">
                        {NAV_LINKS.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                                    isActive(href)
                                        ? 'text-blue-600 font-medium bg-blue-50'
                                        : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {label}
                                {label === 'Messages' && unreadCount > 0 && (
                                    <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>
                        ))}
                        <div className="pt-2 px-4">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
