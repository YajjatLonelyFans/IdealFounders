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

interface FeatureCardProps {
    title: string;
    description: string;
    icon: string;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
    return (
        <motion.div
            variants={staggerItem}
            className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary/30"
        >
            <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-primary transition-colors">
                {title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
                {description}
            </p>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        </motion.div>
    );
}
