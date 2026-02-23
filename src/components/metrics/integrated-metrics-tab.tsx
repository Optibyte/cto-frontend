'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Github, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/utils';
import {
    GITHUB_METRICS,
    JIRA_METRICS,
    type IntegrationMetricData,
} from '@/lib/mock-data/metrics-data';

// Jira icon placeholder
function JiraIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.35V2.84a.84.84 0 0 0-.84-.84H11.53zM6.77 6.8a4.36 4.36 0 0 0 4.34 4.34h1.8v1.72a4.36 4.36 0 0 0 4.34 4.34V7.63a.84.84 0 0 0-.83-.83H6.77zM2 11.6a4.35 4.35 0 0 0 4.34 4.34h1.8v1.72A4.35 4.35 0 0 0 12.48 22v-9.57a.84.84 0 0 0-.84-.84H2z" />
        </svg>
    );
}

function IntegrationCard({ metric }: { metric: IntegrationMetricData }) {
    const isGithub = metric.source === 'github';

    return (
        <Card
            className={cn(
                'rounded-2xl border border-border/40 overflow-hidden',
                'shadow-lg shadow-black/5 dark:shadow-black/20',
                'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl',
                'group'
            )}
        >
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {isGithub ? (
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#24292e] dark:bg-[#f0f6fc]/10">
                                <Github className="h-4 w-4 text-white dark:text-[#f0f6fc]" />
                            </div>
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0052CC]/10">
                                <JiraIcon className="h-4 w-4 text-[#0052CC]" />
                            </div>
                        )}
                        <h4 className="font-semibold text-sm">{metric.name}</h4>
                    </div>
                </div>

                <div className="text-center py-3">
                    <span className="text-3xl font-black tracking-tight text-primary">
                        {metric.value}
                    </span>
                    {metric.unit && (
                        <span className="text-sm text-muted-foreground ml-1.5">
                            {metric.unit}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/20">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <RefreshCw className="h-3 w-3" />
                        {formatDateTime(metric.lastSynced)}
                    </div>
                    {metric.syncError ? (
                        <Badge variant="destructive" className="rounded-full text-[9px] px-1.5 h-5 gap-1">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Sync Error
                        </Badge>
                    ) : (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Lock className="h-3 w-3" />
                            Read-only
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function IntegratedMetricsTab() {
    return (
        <div className="space-y-8">
            {/* GitHub Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#24292e] dark:bg-[#f0f6fc]/10 shadow-lg">
                        <Github className="h-5 w-5 text-white dark:text-[#f0f6fc]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base">GitHub Metrics</h3>
                        <p className="text-xs text-muted-foreground">
                            Synced from GitHub — Last sync: {formatDateTime(GITHUB_METRICS[0]?.lastSynced)}
                        </p>
                    </div>
                    <Badge variant="outline" className="ml-auto rounded-full text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                        ● Connected
                    </Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {GITHUB_METRICS.map((metric) => (
                        <IntegrationCard key={metric.id} metric={metric} />
                    ))}
                </div>
            </div>

            {/* Jira Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0052CC]/10 shadow-lg">
                        <JiraIcon className="h-5 w-5 text-[#0052CC]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base">Jira Metrics</h3>
                        <p className="text-xs text-muted-foreground">
                            Synced from Jira — Last sync: {formatDateTime(JIRA_METRICS[0]?.lastSynced)}
                        </p>
                    </div>
                    <Badge variant="outline" className="ml-auto rounded-full text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                        ● Connected
                    </Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {JIRA_METRICS.map((metric) => (
                        <IntegrationCard key={metric.id} metric={metric} />
                    ))}
                </div>
            </div>
        </div>
    );
}
