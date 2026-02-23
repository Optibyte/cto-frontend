'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Calculator, Info, Lock, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    CALCULATED_METRICS,
    TIME_PER_PRODUCT,
} from '@/lib/mock-data/metrics-data';

export function CalculatedMetricsTab() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calculator className="h-4 w-4" />
                Auto-computed from internal data — editing is disabled
            </div>

            {/* Calculated Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {CALCULATED_METRICS.map((metric) => (
                    <Card
                        key={metric.id}
                        className={cn(
                            'rounded-2xl border border-border/40 overflow-hidden',
                            'shadow-lg shadow-black/5 dark:shadow-black/20',
                            'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl',
                            'bg-gradient-to-br from-background to-accent/20'
                        )}
                    >
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-sm">{metric.name}</h4>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-[280px]">
                                                    <p className="font-medium mb-1">Formula</p>
                                                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                                        {metric.formula}
                                                    </code>
                                                    <p className="text-xs mt-2 opacity-70">{metric.description}</p>
                                                    {metric.breakdown && (
                                                        <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
                                                            {Object.entries(metric.breakdown).map(([k, v]) => (
                                                                <div key={k} className="flex justify-between text-xs">
                                                                    <span className="opacity-70">{k}</span>
                                                                    <span className="font-medium">{String(v)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                                <Badge
                                    variant="outline"
                                    className="rounded-full text-[10px] px-2 py-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30"
                                >
                                    <Calculator className="h-2.5 w-2.5 mr-1" />
                                    System Calculated
                                </Badge>
                            </div>

                            <div className="text-center py-2">
                                <span className="text-4xl font-black tracking-tight text-primary">
                                    {metric.value}
                                </span>
                                <span className="text-sm text-muted-foreground ml-1.5">
                                    {metric.unit}
                                </span>
                            </div>

                            <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-muted-foreground">
                                <Lock className="h-3 w-3" />
                                Edit disabled — auto-calculated
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Time Spent Per Product */}
            <Card className="rounded-2xl">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-base">Time Spent Per Product</h3>
                        <Badge
                            variant="outline"
                            className="ml-auto rounded-full text-[10px] px-2 py-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30"
                        >
                            <Calculator className="h-2.5 w-2.5 mr-1" />
                            System Calculated
                        </Badge>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/30">
                                    <th className="pb-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5">
                                            <Users className="h-3.5 w-3.5" />
                                            Member
                                        </div>
                                    </th>
                                    {/* Dynamic product columns */}
                                    {Array.from(
                                        new Set(
                                            TIME_PER_PRODUCT.flatMap((m) =>
                                                m.products.map((p) => p.name)
                                            )
                                        )
                                    ).map((product) => (
                                        <th
                                            key={product}
                                            className="pb-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                                        >
                                            {product}
                                        </th>
                                    ))}
                                    <th className="pb-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {TIME_PER_PRODUCT.map((member) => {
                                    const allProducts = Array.from(
                                        new Set(
                                            TIME_PER_PRODUCT.flatMap((m) =>
                                                m.products.map((p) => p.name)
                                            )
                                        )
                                    );
                                    const total = member.products.reduce(
                                        (acc, p) => acc + p.hours,
                                        0
                                    );

                                    return (
                                        <tr
                                            key={member.memberId}
                                            className="border-b border-border/20 last:border-0"
                                        >
                                            <td className="py-3 text-sm font-semibold">
                                                {member.memberName}
                                            </td>
                                            {allProducts.map((product) => {
                                                const hours =
                                                    member.products.find(
                                                        (p) => p.name === product
                                                    )?.hours ?? 0;
                                                return (
                                                    <td
                                                        key={product}
                                                        className="py-3 text-right text-sm"
                                                    >
                                                        {hours > 0 ? (
                                                            <span className="font-semibold">
                                                                {hours}{' '}
                                                                <span className="text-muted-foreground font-normal text-xs">
                                                                    hrs
                                                                </span>
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td className="py-3 text-right text-sm font-bold text-primary">
                                                {total} hrs
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
