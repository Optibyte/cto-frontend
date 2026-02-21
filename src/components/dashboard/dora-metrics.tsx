'use client';

import { DORAMetrics as DORAMetricsType } from '@/lib/mock-data/dashboard-filtered';
import { Rocket, Clock, Wrench, ShieldAlert, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DORAMetricsProps {
    data: DORAMetricsType;
}

const metricConfig = [
    { key: 'deploymentFrequency' as const, label: 'Deploy Frequency', icon: Rocket, goodTrend: 'up' },
    { key: 'leadTime' as const, label: 'Lead Time', icon: Clock, goodTrend: 'down' },
    { key: 'mttr' as const, label: 'MTTR', icon: Wrench, goodTrend: 'down' },
    { key: 'changeFailureRate' as const, label: 'Change Fail Rate', icon: ShieldAlert, goodTrend: 'down' },
];

export function DORAMetrics({ data }: DORAMetricsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metricConfig.map(({ key, label, icon: Icon, goodTrend }) => {
                const metric = data[key];
                const isGood = metric.trend === goodTrend || metric.trend === 'neutral';
                const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;

                return (
                    <div
                        key={key}
                        className={cn(
                            'relative overflow-hidden rounded-2xl border border-border/40 p-5',
                            'bg-card shadow-lg shadow-black/5 dark:shadow-black/20',
                            'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/20',
                            'group'
                        )}
                    >
                        {/* Background gradient */}
                        <div className={cn(
                            'absolute inset-0 bg-gradient-to-br opacity-20 group-hover:opacity-40 transition-opacity',
                            isGood ? 'from-emerald-500/10 to-transparent' : 'from-red-500/10 to-transparent'
                        )} />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className={cn(
                                    'flex h-10 w-10 items-center justify-center rounded-xl',
                                    isGood ? 'bg-emerald-500/10' : 'bg-red-500/10',
                                    'group-hover:scale-110 transition-transform duration-300'
                                )}>
                                    <Icon className={cn('h-5 w-5', isGood ? 'text-emerald-500' : 'text-red-500')} />
                                </div>
                                <div className={cn(
                                    'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                                    isGood ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
                                )}>
                                    <TrendIcon className="h-3 w-3" />
                                    {Math.abs(metric.change).toFixed(1)}%
                                </div>
                            </div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold">{metric.value}</span>
                                <span className="text-sm text-muted-foreground">{metric.unit}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
