'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { ReactNode, useEffect, useRef } from 'react';

/* ─── Hero Section (framer-motion fade-in) ───────────────────── */
export function HeroSection({ children }: { children: ReactNode }) {
    return (
        <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
        >
            {children}
        </motion.div>
    );
}

/* ─── Scroll Reveal Wrapper ──────────────────────────────────── */
export function ScrollReveal({
    children,
    className = '',
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const delayClass =
        delay === 100
            ? 'reveal-delay-100'
            : delay === 200
                ? 'reveal-delay-200'
                : delay === 300
                    ? 'reveal-delay-300'
                    : '';

    return (
        <div ref={ref} className={`reveal ${delayClass} ${className}`}>
            {children}
        </div>
    );
}

/* ─── Bento Feature Grid ─────────────────────────────────────── */
export function BentoGrid({ children }: { children: ReactNode }) {
    return <div className="bento-grid">{children}</div>;
}

/* ─── Bento Feature Item ─────────────────────────────────────── */
interface BentoItemProps {
    title: string;
    description: string;
    icon: ReactNode;
    size?: 'large' | 'medium' | 'half';
    iconColorClass?: string;
    children?: ReactNode;
}

export function BentoItem({
    title,
    description,
    icon,
    size = 'half',
    iconColorClass = '',
    children,
}: BentoItemProps) {
    const sizeClass =
        size === 'large'
            ? 'bento-large'
            : size === 'medium'
                ? 'bento-medium'
                : 'bento-half';

    return (
        <ScrollReveal className={sizeClass}>
            <div className="bento-item h-full">
                <div className={`relative z-10 ${size === 'large' ? 'w-full md:w-1/2' : ''}`}>
                    <div className={`icon-wrapper ${iconColorClass}`}>{icon}</div>
                    <h3
                        className={`font-bold text-slate-900 mb-3 ${size === 'large' ? 'text-3xl mb-4' : 'text-2xl'
                            }`}
                    >
                        {title}
                    </h3>
                    <p
                        className={`text-slate-500 font-medium leading-relaxed ${size === 'large' ? 'text-lg' : 'text-base max-w-sm'
                            }`}
                    >
                        {description}
                    </p>
                </div>
                {children}
            </div>
        </ScrollReveal>
    );
}

/* ─── Feature Grid (legacy compat – wraps stagger container) ── */
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

/* ─── Feature Card (legacy compat) ────────────────────────────── */
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
            <p className="text-gray-600 leading-relaxed">{description}</p>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        </motion.div>
    );
}
