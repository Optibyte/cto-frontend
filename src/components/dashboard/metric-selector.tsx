'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Eye } from 'lucide-react';
import { LearningMetric } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface MetricSelectorProps {
    metrics: LearningMetric[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
}

export function MetricSelector({ metrics, selectedIds, onSelectionChange }: MetricSelectorProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggle = (id: string) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter((s) => s !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    const allSelected = selectedIds.length === metrics.length;
    const toggleAll = () => {
        if (allSelected) {
            onSelectionChange([]);
        } else {
            onSelectionChange(metrics.map((m) => m.id));
        }
    };

    return (
        <div ref={ref} className="relative">
            <Button
                variant="outline"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 rounded-xl border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all px-4 py-2 h-auto"
            >
                <Eye className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">
                    Metrics ({selectedIds.length}/{metrics.length})
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
            </Button>

            {open && (
                <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-popover/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                        Select Metrics to Display
                    </div>
                    <div className="border-t border-border/30 my-1" />

                    {/* Select All */}
                    <button
                        onClick={toggleAll}
                        className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-muted/50 transition-all cursor-pointer"
                    >
                        <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${allSelected ? 'bg-primary border-primary' : 'border-border/60'}`}>
                            {allSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm font-bold">Select All</span>
                    </button>
                    <div className="border-t border-border/30 my-1" />

                    {/* Individual Metrics */}
                    <div className="max-h-64 overflow-y-auto space-y-0.5 p-1">
                        {metrics.map((metric) => {
                            const checked = selectedIds.includes(metric.id);
                            return (
                                <button
                                    key={metric.id}
                                    onClick={() => toggle(metric.id)}
                                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-muted/50 transition-all cursor-pointer"
                                >
                                    <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${checked ? 'bg-primary border-primary' : 'border-border/60'}`}>
                                        {checked && <Check className="h-3 w-3 text-white" />}
                                    </div>
                                    <div className="flex flex-col items-start text-left flex-1 min-w-0">
                                        <span className="text-sm font-semibold truncate w-full">{metric.name}</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{metric.category}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
