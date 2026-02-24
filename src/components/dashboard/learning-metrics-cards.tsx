'use client';

import { LearningMetric } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, ChevronUp, ChevronDown, Settings2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface LearningMetricsCardsProps {
    metrics: LearningMetric[];
    onDrillUp?: () => void;
    onDrillDown?: () => void;
}

export function LearningMetricsCards({ metrics, onDrillUp, onDrillDown }: LearningMetricsCardsProps) {
    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {metrics.map((metric) => {
                const progress = Math.round((metric.value / metric.target) * 100);
                const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
                const trendColor = metric.trend === 'up' ? 'text-emerald-500' : metric.trend === 'down' ? 'text-red-500' : 'text-yellow-500';
                const progressColor = progress >= 90 ? 'from-emerald-500 to-emerald-400' : progress >= 70 ? 'from-blue-500 to-blue-400' : 'from-amber-500 to-amber-400';

                return (
                    <Card
                        key={metric.id}
                        className="group overflow-hidden border-border/40 shadow-lg shadow-black/5 dark:shadow-black/20 bg-card/50 backdrop-blur-md hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5 relative"
                    >
                        <div className="absolute inset-0 border border-primary/5 rounded-2xl pointer-events-none group-hover:border-primary/20 transition-colors duration-500" />
                        <CardContent className="pt-5 pb-4 px-5 relative z-10">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 mb-1">{metric.category}</p>
                                    <h3 className="text-sm font-semibold text-foreground truncate">{metric.name}</h3>
                                </div>
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${trendColor} bg-current/10`}>
                                    <TrendIcon className="h-3 w-3" />
                                </div>
                                <div className="ml-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/50 shadow-xl">
                                            <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Drill Actions</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                className="gap-2 focus:bg-primary/5 focus:text-primary cursor-pointer rounded-lg"
                                                onClick={onDrillUp}
                                                disabled={!onDrillUp}
                                            >
                                                <ChevronUp className="h-4 w-4" />
                                                <span>Drill Up</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="gap-2 focus:bg-primary/5 focus:text-primary cursor-pointer rounded-lg"
                                                onClick={onDrillDown}
                                            >
                                                <ChevronDown className="h-4 w-4" />
                                                <span>Drill Down</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="gap-2 focus:bg-primary/5 focus:text-primary cursor-pointer rounded-lg">
                                                <Settings2 className="h-4 w-4" />
                                                <span>Customize Drill</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Value */}
                            <div className="flex items-baseline gap-2 mb-3">
                                <span className="text-2xl font-extrabold tracking-tight">{metric.value}</span>
                                <span className="text-sm text-muted-foreground">/ {metric.target} {metric.unit}</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-bold">{progress}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-muted/50 shadow-inner">
                                    <div
                                        className={`h-full bg-gradient-to-r ${progressColor} shadow-sm transition-all duration-700 ease-out`}
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Mini Sparkline */}
                            <div className="mt-3 flex items-end gap-0.5 h-8">
                                {metric.sparkline.map((val, idx) => {
                                    const max = Math.max(...metric.sparkline);
                                    const min = Math.min(...metric.sparkline);
                                    const range = max - min || 1;
                                    const height = ((val - min) / range) * 100;
                                    return (
                                        <div
                                            key={idx}
                                            className="flex-1 rounded-sm bg-primary/30 group-hover:bg-primary/50 transition-colors"
                                            style={{ height: `${Math.max(height, 8)}%` }}
                                        />
                                    );
                                })}
                            </div>

                            {/* Action Row */}
                            <div className="mt-4 pt-3 flex items-center justify-between border-t border-border/20">
                                <div className="flex gap-1.5">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-sm hover:bg-primary/10 hover:text-primary"
                                        title="Drill Up"
                                        onClick={onDrillUp}
                                        disabled={!onDrillUp}
                                    >
                                        <ChevronUp className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-sm hover:bg-primary/10 hover:text-primary"
                                        title="Drill Down"
                                        onClick={onDrillDown}
                                    >
                                        <ChevronDown className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 hover:text-primary flex gap-1">
                                    <Settings2 className="h-3 w-3" />
                                    Customize
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
