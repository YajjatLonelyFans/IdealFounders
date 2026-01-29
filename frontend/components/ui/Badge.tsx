import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 border',
    {
        variants: {
            variant: {
                primary: 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-primary-200 hover:shadow-md hover:shadow-primary/10',
                secondary: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:shadow-md',
                success: 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 hover:shadow-md hover:shadow-green/10',
                error: 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 hover:shadow-md hover:shadow-red/10',
                warning: 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200 hover:shadow-md hover:shadow-yellow/10',
                info: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 hover:shadow-md hover:shadow-blue/10',
            },
        },
        defaultVariants: {
            variant: 'primary',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
