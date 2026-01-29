'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { hoverLift } from '@/lib/animations';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
    hover?: boolean;
    animate?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, hover, animate = false, children, ...props }, ref) => {
        if (!animate) {
            return (
                <div
                    ref={ref}
                    className={cn(
                        'rounded-2xl border border-border/50 bg-surface p-6 shadow-card backdrop-blur-sm',
                        'relative overflow-hidden',
                        'before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-br before:from-primary/10 before:to-transparent before:-z-10',
                        hover && 'transition-all duration-300 hover:shadow-card-hover hover:shadow-primary/5 hover:border-primary/20 cursor-pointer',
                        className
                    )}
                    {...props}
                >
                    {children}
                </div>
            );
        }

        return (
            <motion.div
                ref={ref}
                className={cn(
                    'rounded-2xl border border-border/50 bg-surface p-6 shadow-card backdrop-blur-sm',
                    'relative overflow-hidden',
                    'before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-br before:from-primary/10 before:to-transparent before:-z-10',
                    hover && 'cursor-pointer',
                    className
                )}
                initial="rest"
                whileHover={hover ? 'hover' : undefined}
                variants={hover ? hoverLift : undefined}
                {...(props as any)}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props} />
    )
);

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('text-xl font-semibold leading-none tracking-tight text-gray-900', className)}
            {...props}
        />
    )
);

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-gray-500', className)} {...props} />
));

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('', className)} {...props} />
    )
);

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex items-center gap-3 mt-4', className)} {...props} />
    )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
