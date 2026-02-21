'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from '@/components/ui/animated-number';

interface KPICardProps {
    title: string;
    value: string | number;
    unit?: string;
    change: number;
    trend: 'up' | 'down' | 'neutral';
    icon?: LucideIcon;
    sparklineData?: number[];
    className?: string;
}

export function KPICard({
    title,
    value,
    unit,
    change,
    trend,
    icon: Icon,
    sparklineData,
    className,
}: KPICardProps) {
    const isPositive = trend === 'up';
    const isNegative = trend === 'down';

    const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

    const trendColor = isPositive
        ? 'text-green-500 dark:text-green-400'
        : isNegative
            ? 'text-red-500 dark:text-red-400'
            : 'text-gray-500 dark:text-gray-400';

    const gradientClass = isPositive
        ? 'from-green-500/10 to-emerald-500/5'
        : isNegative
            ? 'from-red-500/10 to-rose-500/5'
            : 'from-primary/10 to-purple-500/5';

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
                'absolute inset-0 bg-gradient-to-br opacity-30 group-hover:opacity-50 transition-opacity duration-300',
                gradientClass
            )} />

            {/* Soft Glow on Hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
            </div>

            <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            {title}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                                {typeof value === 'number' ? (
                                    <AnimatedNumber value={value} decimals={1} />
                                ) : (
                                    value
                                )}
                            </h3>
                            {unit && (
                                <span className="text-sm text-muted-foreground font-medium">{unit}</span>
                            )}
                        </div>
                    </div>

                    {Icon && (
                        <div className={cn(
                            'flex h-14 w-14 items-center justify-center rounded-xl',
                            'bg-gradient-to-br from-primary/20 to-primary/5',
                            'group-hover:scale-110 group-hover:rotate-6 transition-all duration-300',
                            'shadow-lg shadow-primary/20'
                        )}>
                            <Icon className="h-7 w-7 text-primary" />
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <div className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-full',
                        'bg-background/50 backdrop-blur-sm',
                        trendColor
                    )}>
                        <TrendIcon className="h-4 w-4" />
                        <span className="text-sm font-semibold">
                            <AnimatedNumber value={Math.abs(change)} decimals={1} suffix="%" />
                        </span>
                    </div>
                    <span className="text-xs text-muted-foreground">vs last period</span>
                </div>

                {sparklineData && sparklineData.length > 0 && (
                    <div className="mt-4 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Sparkline data={sparklineData} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function Sparkline({ data }: { data: number[] }) {
    if (data.length === 0) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data
        .map((value, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((value - min) / range) * 100;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg
            className="h-10 w-full text-primary drop-shadow-lg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            {/* Gradient fill under the line */}
            <defs>
                <linearGradient id="sparkline-gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
            </defs>
            <polyline
                points={`0,100 ${points} 100,100`}
                fill="url(#sparkline-gradient)"
            />
            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}
