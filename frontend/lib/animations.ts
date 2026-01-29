import { Variants } from 'framer-motion';

/**
 * Fade in animation
 */
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.3 }
    }
};

/**
 * Fade in with slide up
 */
export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
    }
};

/**
 * Fade in with slide down
 */
export const fadeInDown: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
    }
};

/**
 * Fade in with slide from left
 */
export const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
    }
};

/**
 * Fade in with slide from right
 */
export const fadeInRight: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
    }
};

/**
 * Scale in animation
 */
export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3, ease: 'easeOut' }
    }
};

/**
 * Stagger container for child animations
 */
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

/**
 * Stagger item (use with staggerContainer)
 */
export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
    }
};

/**
 * Modal backdrop animation
 */
export const modalBackdrop: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.2 }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

/**
 * Modal content animation
 */
export const modalContent: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 20,
        transition: { duration: 0.2 }
    }
};

/**
 * Hover lift effect
 */
export const hoverLift = {
    rest: { y: 0 },
    hover: {
        y: -4,
        transition: { duration: 0.2, ease: 'easeOut' }
    }
};

/**
 * Button press animation
 */
export const buttonPress = {
    rest: { scale: 1 },
    tap: { scale: 0.97 }
};

/**
 * Page transition
 */
export const pageTransition: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

/**
 * Utility to check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation variants with reduced motion support
 */
export const getAnimationVariants = (variants: Variants): Variants => {
    if (prefersReducedMotion()) {
        // Return instant transitions if user prefers reduced motion
        return {
            hidden: variants.hidden,
            visible: { ...variants.visible, transition: { duration: 0 } }
        };
    }
    return variants;
};
