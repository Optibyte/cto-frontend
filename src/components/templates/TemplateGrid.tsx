'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Star, LayoutGrid } from 'lucide-react';
import { TemplateCard, TemplateSetData } from './TemplateCard';
import { FilterCategory } from './FilterTabs';

interface TemplateGridProps {
    sets: TemplateSetData[];
    selectedTemplate: string;
    favoriteTemplates: string[];
    onSelect: (id: string) => void;
    onPreview: (set: TemplateSetData) => void;
    onToggleFavorite: (id: string) => void;
    currentFilter: FilterCategory;
}

export function TemplateGrid({
    sets,
    selectedTemplate,
    favoriteTemplates,
    onSelect,
    onPreview,
    onToggleFavorite,
    currentFilter,
}: TemplateGridProps) {
    if (sets.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-card border border-slate-200/50 dark:border-slate-800/50 rounded-3xl max-w-md mx-auto shadow-sm my-10"
            >
                {currentFilter === 'Favorites' ? (
                    <>
                        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-500 mb-5 shadow-inner">
                            <Star className="h-8 w-8 stroke-[1.5] fill-none" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            No Favorite Templates
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-[280px] mt-2 leading-relaxed">
                            Click the star icon (⭐) on any template card to save it here for quick access.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800/50 text-slate-400 mb-5 shadow-inner">
                            <LayoutGrid className="h-8 w-8 stroke-[1.5]" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            No Templates Found
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-[280px] mt-2 leading-relaxed">
                            No templates match your search criteria. Try using different keywords or resetting filters.
                        </p>
                    </>
                )}
            </motion.div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6"
        >
            <AnimatePresence mode="popLayout">
                {sets.map((set) => (
                    <TemplateCard
                        key={set.id}
                        set={set}
                        isSelected={selectedTemplate === set.id}
                        isFavorite={favoriteTemplates.includes(set.id)}
                        onSelect={() => onSelect(set.id)}
                        onPreview={() => onPreview(set)}
                        onToggleFavorite={() => onToggleFavorite(set.id)}
                    />
                ))}
            </AnimatePresence>
        </motion.div>
    );
}
