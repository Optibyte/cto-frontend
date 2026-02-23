'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricTypeCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
    onAddClick: () => void;
    className?: string;
}

export function MetricTypeCard({
    title,
    description,
    icon: Icon,
    color,
    onAddClick,
    className,
}: MetricTypeCardProps) {
    return (
        <Card className={cn(
            'overflow-hidden relative group',
            'rounded-2xl border border-border/40',
            'shadow-lg shadow-black/5 dark:shadow-black/20',
            'transition-all duration-300 ease-out',
            'hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10',
            'hover:border-primary/30',
            'fade-in backdrop-blur-sm',
            className
        )}>
            {/* Subtle Gradient Background */}
            <div className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300',
                color
            )} />

            <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-xl',
                        'bg-background border border-border/50',
                        'group-hover:scale-110 group-hover:rotate-3 transition-all duration-300',
                        'shadow-md'
                    )}>
                        <Icon className={cn('h-6 w-6', color.replace('from-', 'text-').split(' ')[0])} />
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {description}
                    </p>
                </div>

                <div className="mt-6">
                    <Button
                        onClick={onAddClick}
                        className="w-full rounded-xl gap-2 font-semibold shadow-lg shadow-primary/20 group/btn"
                    >
                        <Plus className="h-4 w-4 group-hover/btn:rotate-90 transition-transform duration-300" />
                        Add Metrics
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
