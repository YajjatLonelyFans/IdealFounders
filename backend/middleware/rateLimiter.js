import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import config from '../config.js';

const redis = new Redis({
    url: config.upstash.redisUrl,
    token: config.upstash.redisToken,
});

// Create rate limiter with sliding window
// Development: 100 requests per 10 seconds (generous for testing)
// Production: Consider reducing to 20-30 requests per 10 seconds
const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, '10 s'),
    analytics: true,
});

// Rate limiter middleware
export const rateLimiter = async (req, res, next) => {
    try {
        // Get identifier: prefer userId from Clerk, fallback to IP
        let identifier = req.auth?.userId;

        // If no userId, use IP address (handle x-forwarded-for)
        if (!identifier) {
            identifier =
                req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                req.ip ||
                req.connection.remoteAddress ||
                'unknown';
        }

        // Check rate limit
        const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', reset);

        if (!success) {
            return res.status(429).json({
                error: 'Too many requests',
                message: 'Rate limit exceeded. Please try again later.',
                retryAfter: Math.ceil((reset - Date.now()) / 1000),
            });
        }

        next();
    } catch (error) {
        console.error('Rate limiter error:', error);
        // On error, allow the request to proceed (fail open)
        next();
    }
};
