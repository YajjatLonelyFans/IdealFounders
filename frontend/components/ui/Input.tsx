import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, helperText, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {label}
                        {props.required && <span className="text-error ml-1">*</span>}
                    </label>
                )}
                <input
                    type={type}
                    className={cn(
                        'flex h-11 w-full rounded-xl border border-border bg-white px-4 py-2 text-sm transition-all duration-200',
                        'placeholder:text-gray-400',
                        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:shadow-lg focus:shadow-primary/10',
                        'hover:border-primary/30',
                        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
                        error && 'border-error focus:ring-error/50 focus:border-error',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input };
