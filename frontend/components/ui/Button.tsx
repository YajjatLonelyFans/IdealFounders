'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { buttonPress } from '@/lib/animations';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary: 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5',
                secondary: 'bg-gradient-to-r from-secondary to-secondary-dark text-white hover:shadow-xl hover:shadow-secondary/25 hover:-translate-y-0.5',
                outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20',
                ghost: 'text-primary hover:bg-primary-50 hover:text-primary-dark',
                danger: 'bg-gradient-to-r from-error to-red-700 text-white hover:shadow-xl hover:shadow-error/25 hover:-translate-y-0.5',
            },
            size: {
                sm: 'h-9 px-4 text-xs',
                md: 'h-11 px-6 text-sm',
                lg: 'h-13 px-8 text-base',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

export interface ButtonProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'>,
    VariantProps<typeof buttonVariants> {
    loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
        return (
            <motion.button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || loading}
                variants={buttonPress}
                initial="rest"
                whileTap="tap"
                {...(props as any)}
            >
                {loading && (
                    <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                )}
                {children}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
