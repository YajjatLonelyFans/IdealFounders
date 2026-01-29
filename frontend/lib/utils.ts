import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format timestamp to human-readable format
 */
export function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    }
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

/**
 * Format time only (e.g., "2:30 PM")
 */
export function formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

/**
 * Generate unique room ID for chat
 */
export function generateRoomId(userId1: string, userId2: string): string {
    const rawId = [userId1, userId2].sort().join('--');
    return typeof window === 'undefined'
        ? Buffer.from(rawId).toString('base64')
        : btoa(rawId);
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

/**
 * Calculate match percentage from score
 */
export function calculateMatchPercentage(score: number): number {
    // Max realistic score: 5 shared skills (50) + industry match (20) = 70
    const maxScore = 100;
    return Math.min(Math.round((score / maxScore) * 100), 100);
}
