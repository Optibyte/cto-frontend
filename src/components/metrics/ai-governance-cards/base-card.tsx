import React from 'react';
import { Card } from '@/components/ui/card';
import { ChevronRight, LucideIcon } from 'lucide-react';

export interface MetricItem {
    label: string;
    value: string;
}

export interface BaseCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    theme: string;
    textColor: string;
    metrics: MetricItem[];
    onClick?: () => void;
}

export function BaseCard({
    title,
    description,
    icon: IconComponent,
    theme,
    textColor,
    metrics,
    onClick
}: BaseCardProps) {
    return (
        <Card
            onClick={onClick}
            className={`rounded-[2rem] border border-border/40 bg-gradient-to-br ${theme} shadow-md overflow-hidden p-6 hover:-translate-y-1 hover:shadow-xl cursor-pointer transition-all duration-300 flex flex-col justify-between h-[230px] group`}
        >
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl bg-background border border-border/30 ${textColor} shadow-sm group-hover:scale-105 transition-transform`}>
                        <IconComponent className="h-5 w-5" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground/75 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="text-base font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-1">
                    {title}
                </h3>
                <p className="text-[11px] text-muted-foreground leading-normal line-clamp-2">
                    {description}
                </p>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-border/20 pt-4 mt-2">
                {metrics.map((m, idx) => (
                    <div key={idx} className="min-w-0">
                        <p className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest truncate">
                            {m.label}
                        </p>
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1 truncate">
                            {m.value}
                        </p>
                    </div>
                ))}
            </div>
        </Card>
    );
}
