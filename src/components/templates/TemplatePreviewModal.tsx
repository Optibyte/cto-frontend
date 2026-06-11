'use client';

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemplateSetData } from './TemplateCard';
import { renderMiniChart } from './MiniChartPreviews';

interface TemplatePreviewModalProps {
    set: TemplateSetData | null;
    isOpen: boolean;
    onClose: () => void;
    onSelect: () => void;
    isSelected: boolean;
}

export function TemplatePreviewModal({
    set,
    isOpen,
    onClose,
    onSelect,
    isSelected,
}: TemplatePreviewModalProps) {
    if (!set) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent showCloseButton={false} className="sm:max-w-[85vw] md:max-w-[75vw] lg:max-w-[70vw] max-h-[85vh] p-0 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md",
                            set.category === 'Relay' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                            set.category === 'Analytics' ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" :
                            set.category === 'Business' ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" :
                            "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                        )}>
                            {set.category}
                        </span>
                        <DialogTitle className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                            Previewing {set.title}
                        </DialogTitle>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full h-8 w-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer"
                        aria-label="Close dialog"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div>
                        <DialogDescription className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                            {set.description}
                        </DialogDescription>
                    </div>

                    {/* Larger previews grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {set.charts.map((chart, idx) => (
                            <div
                                key={chart}
                                className="flex flex-col bg-slate-50/50 dark:bg-slate-900/10 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-4 hover:border-violet-500/30 dark:hover:border-violet-500/30 transition-all duration-300"
                            >
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    {idx + 1}. {chart}
                                </span>
                                <div className="h-28 w-full flex items-center justify-center bg-white dark:bg-slate-950/40 border border-slate-200/20 dark:border-slate-850/40 rounded-xl p-2 shadow-inner">
                                    {renderMiniChart(chart)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            onSelect();
                            onClose();
                        }}
                        disabled={isSelected}
                        className={cn(
                            "py-2 px-6 rounded-xl text-xs font-black tracking-wide transition-all shadow-md flex items-center gap-1.5 cursor-pointer select-none",
                            isSelected
                                ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-200/50 cursor-not-allowed"
                                : "bg-violet-600 hover:bg-violet-700 text-white hover:shadow-lg hover:shadow-violet-500/20"
                        )}
                    >
                        {isSelected ? (
                            <>
                                <Check className="h-3.5 w-3.5" />
                                Currently Applied
                            </>
                        ) : 'Apply This Template'}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
