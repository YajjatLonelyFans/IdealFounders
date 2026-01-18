import { clerkMiddleware, requireAuth } from '@clerk/express';

export const initClerkMiddleware = clerkMiddleware();
export const protectRoute = requireAuth();
