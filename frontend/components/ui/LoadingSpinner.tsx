import * as React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
};

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
    return (
        <div className="flex items-center justify-center">
            <div className={cn('relative', sizeMap[size])}>
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-4 border-primary-100"></div>
                {/* Spinning gradient ring */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary-light animate-spin"></div>
                {/* Inner glow */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-transparent animate-pulse"></div>
            </div>
        </div>
    );
}

interface LoadingPageProps {
    message?: string;
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
            <div className="relative">
                <LoadingSpinner size="lg" />
                {/* Animated background glow */}
                <div className="absolute inset-0 -z-10 blur-2xl opacity-30 bg-gradient-to-r from-primary via-secondary to-accent animate-pulse"></div>
            </div>
            <div className="text-center space-y-2">
                <p className="text-gray-700 font-medium animate-pulse">{message}</p>
                <div className="flex gap-1 justify-center">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}
