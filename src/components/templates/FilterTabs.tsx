'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type FilterCategory = 'All' | 'Favorites' | 'Relay' | 'Analytics' | 'Business' | 'Monitoring';

interface FilterTabsProps {
    selected: FilterCategory;
    onSelect: (category: FilterCategory) => void;
    favoritesCount: number;
}

export function FilterTabs({ selected, onSelect, favoritesCount }: FilterTabsProps) {
    const categories: { name: FilterCategory; label: string; count?: number }[] = [
        { name: 'All', label: 'All Templates' },
        { name: 'Favorites', label: 'Favorites', count: favoritesCount },
        { name: 'Relay', label: 'Relay Charts' },
        { name: 'Analytics', label: 'Analytics' },
        { name: 'Business', label: 'Business' },
        { name: 'Monitoring', label: 'Monitoring' },
    ];

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto py-2">
            {categories.map((cat) => {
                const isActive = selected === cat.name;
                const showCount = cat.count !== undefined && cat.count > 0;

                return (
                    <button
                        key={cat.name}
                        onClick={() => onSelect(cat.name)}
                        className={cn(
                            "relative px-4 py-2 rounded-xl text-sm font-semibold tracking-wide transition-colors cursor-pointer select-none",
                            isActive 
                                ? "text-violet-600 dark:text-violet-400" 
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-white/40 dark:bg-card/40 border border-slate-200/50 dark:border-slate-800/50"
                        )}
                    >
                        {isActive && (
                            <motion.span
                                layoutId="activeFilterChip"
                                className="absolute inset-0 bg-violet-600/10 dark:bg-violet-400/10 border border-violet-500/30 dark:border-violet-500/20 rounded-xl"
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                            {cat.label}
                            {showCount && (
                                <span className={cn(
                                    "px-1.5 py-0.5 text-[10px] rounded-full font-bold",
                                    isActive 
                                        ? "bg-violet-600 text-white" 
                                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                )}>
                                    {cat.count}
                                </span>
                            )}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
