import * as React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
            {/* Animated background gradient */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-full blur-3xl animate-pulse"></div>
            </div>

            {icon && (
                <div className="mb-6 relative">
                    <div className="text-gray-300 transform hover:scale-110 transition-transform duration-300">
                        {icon}
                    </div>
                    {/* Icon glow */}
                    <div className="absolute inset-0 -z-10 blur-xl opacity-20 bg-gradient-to-br from-primary to-secondary"></div>
                </div>
            )}

            <h3 className="text-xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {title}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mb-8 leading-relaxed">{description}</p>

            {action && (
                <Button onClick={action.onClick} variant="primary" className="group">
                    {action.label}
                    <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Button>
            )}
        </div>
    );
}

// Enhanced icons with gradients
export const EmptyIcons = {
    NoMatches: (
        <svg
            className="h-20 w-20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0066FF" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#1E90FF" stopOpacity="0.4" />
                </linearGradient>
            </defs>
            <path
                stroke="url(#gradient1)"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            />
        </svg>
    ),
    NoMessages: (
        <svg
            className="h-20 w-20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <defs>
                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0066FF" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#00CED1" stopOpacity="0.4" />
                </linearGradient>
            </defs>
            <path
                stroke="url(#gradient2)"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
        </svg>
    ),
};
