'use client';

import { motion } from 'framer-motion';
import { Check, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FavoriteButton } from './FavoriteButton';
import { renderMiniChart } from './MiniChartPreviews';

export interface TemplateSetData {
    id: string;
    title: string;
    category: 'Relay' | 'Analytics' | 'Business' | 'Monitoring';
    description: string;
    charts: string[];
}

interface TemplateCardProps {
    set: TemplateSetData;
    isSelected: boolean;
    isFavorite: boolean;
    onSelect: () => void;
    onPreview: () => void;
    onToggleFavorite: () => void;
}

export function TemplateCard({
    set,
    isSelected,
    isFavorite,
    onSelect,
    onPreview,
    onToggleFavorite,
}: TemplateCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "relative flex flex-col justify-between bg-white dark:bg-card rounded-3xl border transition-all duration-300 overflow-hidden",
                isSelected
                    ? "border-violet-500 shadow-xl shadow-violet-500/10 ring-2 ring-violet-500/20"
                    : "border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-1"
            )}
        >
            {/* Selected check badge */}
            {isSelected && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-violet-600 text-white text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full shadow-md shadow-violet-500/30">
                    <Check className="h-3 w-3" />
                    ACTIVE
                </div>
            )}

            {/* Favorite Star at Top Right */}
            <div className="absolute top-4 right-4 z-20">
                <FavoriteButton isFavorite={isFavorite} onClick={onToggleFavorite} />
            </div>

            {/* Content Container */}
            <div className="p-5 flex-1 flex flex-col">
                {/* Header */}
                <div className="mt-8 mb-4">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className={cn(
                            "text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md",
                            set.category === 'Relay' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                            set.category === 'Analytics' ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" :
                            set.category === 'Business' ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" :
                            "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                        )}>
                            {set.category}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                        {set.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1 line-clamp-2" title={set.description}>
                        {set.description}
                    </p>
                </div>

                {/* Inline miniature charts grid */}
                <div className="grid grid-cols-3 gap-2.5 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40 mb-4 flex-1">
                    {set.charts.map((chart, idx) => (
                        <div
                            key={chart}
                            className="flex flex-col bg-white dark:bg-card/75 border border-slate-200/40 dark:border-slate-800/40 rounded-xl p-1.5 hover:shadow-sm hover:border-slate-200 dark:hover:border-slate-700 transition-all group/chart overflow-hidden"
                        >
                            <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 truncate tracking-tight mb-1 select-none group-hover/chart:text-violet-500 transition-colors">
                                {idx + 1}. {chart}
                            </span>
                            <div className="h-10 w-full flex items-center justify-center bg-slate-50/30 dark:bg-slate-950/20 rounded-md">
                                {renderMiniChart(chart)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center gap-2 p-4 bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-800/40 shrink-0">
                <button
                    onClick={onPreview}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
                >
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                </button>
                <button
                    onClick={onSelect}
                    disabled={isSelected}
                    className={cn(
                        "flex-1 py-2 px-3 rounded-xl text-xs font-black tracking-wide transition-all shadow-sm cursor-pointer select-none",
                        isSelected
                            ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-200/50 cursor-not-allowed"
                            : "bg-violet-600 hover:bg-violet-700 text-white hover:shadow-md hover:shadow-violet-500/10 border border-transparent"
                    )}
                >
                    {isSelected ? 'Applied' : 'Use Template'}
                </button>
            </div>
        </motion.div>
    );
}
