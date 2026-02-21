'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Deployment } from '@/lib/mock-data/dashboard-filtered';
import { GitBranch, CheckCircle2, XCircle, Loader2, RotateCcw, Clock, User } from 'lucide-react';

interface DeploymentPipelineProps {
    data: Deployment[];
}

const statusConfig = {
    'success': { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Success' },
    'failed': { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Failed' },
    'in-progress': { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'In Progress', animate: true },
    'rolled-back': { icon: RotateCcw, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Rolled Back' },
};

const envBadge = {
    production: 'bg-red-500/10 text-red-500 border-red-500/20',
    staging: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    development: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

export function DeploymentPipeline({ data }: DeploymentPipelineProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <GitBranch className="h-5 w-5 text-primary" />
                        Deployment Pipeline
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            {data.filter(d => d.status === 'success').length} passed
                        </span>
                        <span className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            {data.filter(d => d.status === 'failed').length} failed
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        No recent deployments
                    </div>
                ) : (
                    <div className="space-y-2">
                        {data.map((deploy) => {
                            const config = statusConfig[deploy.status];
                            const StatusIcon = config.icon;
                            return (
                                <div
                                    key={deploy.id}
                                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-all duration-200"
                                >
                                    <div className={`flex-shrink-0 p-2 rounded-xl ${config.bg}`}>
                                        <StatusIcon className={`h-4 w-4 ${config.color} ${'animate' in config && config.animate ? 'animate-spin' : ''}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">{deploy.service}</span>
                                            <span className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">{deploy.version}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-muted-foreground">{deploy.project}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${envBadge[deploy.environment]}`}>
                                            {deploy.environment}
                                        </span>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <User className="h-3 w-3" />
                                                {deploy.author}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                <Clock className="h-3 w-3" />
                                                {deploy.time}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
