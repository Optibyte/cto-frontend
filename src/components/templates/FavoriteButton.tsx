'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
    isFavorite: boolean;
    onClick: (e: React.MouseEvent) => void;
    className?: string;
}

export function FavoriteButton({ isFavorite, onClick, className }: FavoriteButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
                e.stopPropagation();
                onClick(e);
            }}
            className={cn(
                "p-2 rounded-full backdrop-blur-md transition-colors duration-200 cursor-pointer shadow-sm border border-border/10",
                isFavorite 
                    ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/20" 
                    : "bg-white/80 dark:bg-card/80 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            )}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
            <Star
                className={cn(
                    "h-4 w-4 transition-all duration-300",
                    isFavorite ? "fill-amber-500 stroke-amber-500" : "stroke-current fill-none"
                )}
            />
        </motion.button>
    );
}
