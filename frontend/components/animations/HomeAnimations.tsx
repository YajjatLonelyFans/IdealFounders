'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { ReactNode } from 'react';

export function HeroSection({ children }: { children: ReactNode }) {
    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto"
        >
            {children}
        </motion.div>
    );
}

export function FeatureGrid({ children }: { children: ReactNode }) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-3 gap-8 mt-24"
        >
            {children}
        </motion.div>
    );
}

export function FeatureCard({ children }: { children: ReactNode }) {
    return (
        <motion.div
            variants={staggerItem}
            className="group relative"
        >
            {children}
        </motion.div>
    );
}
