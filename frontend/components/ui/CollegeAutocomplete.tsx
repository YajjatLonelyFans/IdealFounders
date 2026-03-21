'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CollegeAutocompleteProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    colleges: string[];
    placeholder?: string;
    error?: string;
    className?: string;
}

export function CollegeAutocomplete({
    label,
    value,
    onChange,
    colleges,
    placeholder = 'Search your college...',
    error,
    className,
}: CollegeAutocompleteProps) {
    const [query, setQuery] = React.useState(value || '');
    const [isOpen, setIsOpen] = React.useState(false);
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const listRef = React.useRef<HTMLUListElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Sync query with external value changes 
    React.useEffect(() => {
        setQuery(value || '');
    }, [value]);

    // Filter colleges based on query
    const filtered = React.useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return colleges
            .filter((c) => c.toLowerCase().includes(q))
            .slice(0, 8); // Show max 8 results
    }, [query, colleges]);

    // Close dropdown on outside click
    React.useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll highlighted item into view
    React.useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const items = listRef.current.children;
            if (items[highlightedIndex]) {
                (items[highlightedIndex] as HTMLElement).scrollIntoView({
                    block: 'nearest',
                });
            }
        }
    }, [highlightedIndex]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        onChange(val);
        setIsOpen(true);
        setHighlightedIndex(-1);
    };

    const handleSelect = (college: string) => {
        setQuery(college);
        onChange(college);
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || filtered.length === 0) {
            if (e.key === 'ArrowDown' && query.trim() && filtered.length > 0) {
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filtered.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : filtered.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
                    handleSelect(filtered[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    // Highlight matching text
    const renderHighlighted = (text: string) => {
        if (!query.trim()) return text;
        const q = query.toLowerCase();
        const idx = text.toLowerCase().indexOf(q);
        if (idx === -1) return text;
        return (
            <>
                {text.slice(0, idx)}
                <span className="font-semibold text-primary">{text.slice(idx, idx + query.length)}</span>
                {text.slice(idx + query.length)}
            </>
        );
    };

    return (
        <div ref={wrapperRef} className={cn('relative w-full', className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (query.trim() && filtered.length > 0) setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    className={cn(
                        'flex h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 py-2 text-sm transition-all duration-200',
                        'placeholder:text-gray-400',
                        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:shadow-lg focus:shadow-primary/10',
                        'hover:border-primary/30',
                        error && 'border-error focus:ring-error/50 focus:border-error'
                    )}
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-autocomplete="list"
                    aria-haspopup="listbox"
                />
            </div>

            {/* Dropdown */}
            {isOpen && filtered.length > 0 && (
                <ul
                    ref={listRef}
                    role="listbox"
                    className="absolute z-50 mt-1 w-full bg-white border border-border rounded-xl shadow-xl max-h-52 overflow-auto animate-in fade-in slide-in-from-top-1 duration-150"
                    style={{ animationDuration: '150ms' }}
                >
                    {filtered.map((college, idx) => (
                        <li
                            key={college}
                            role="option"
                            aria-selected={highlightedIndex === idx}
                            onClick={() => handleSelect(college)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            className={cn(
                                'px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-2',
                                highlightedIndex === idx
                                    ? 'bg-primary/5 text-primary'
                                    : 'text-gray-700 hover:bg-gray-50',
                                idx === 0 && 'rounded-t-xl',
                                idx === filtered.length - 1 && 'rounded-b-xl'
                            )}
                        >
                            <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                            </svg>
                            <span>{renderHighlighted(college)}</span>
                        </li>
                    ))}
                </ul>
            )}

            {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
        </div>
    );
}
