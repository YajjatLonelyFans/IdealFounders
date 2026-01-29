import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    mongodbUri: process.env.MONGODB_URI,
    clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    clerkSecretKey: process.env.CLERK_SECRET_KEY,
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    upstash: {
        redisUrl: process.env.UPSTASH_REDIS_REST_URL,
        redisToken: process.env.UPSTASH_REDIS_REST_TOKEN,
    },
};
