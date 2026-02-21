'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectHealth } from '@/lib/mock-data/dashboard-filtered';
import { Activity, AlertTriangle, CheckCircle2, XCircle, Users, Bug } from 'lucide-react';

interface ProjectHealthCardProps {
    data: ProjectHealth[];
}

const statusConfig = {
    'healthy': { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', badge: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20', label: 'Healthy' },
    'at-risk': { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', badge: 'bg-amber-500/15 text-amber-500 border-amber-500/20', label: 'At Risk' },
    'critical': { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', badge: 'bg-red-500/15 text-red-500 border-red-500/20', label: 'Critical' },
};

export function ProjectHealthCard({ data }: ProjectHealthCardProps) {
    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="h-5 w-5 text-primary" />
                    Project Health
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {data.map((project) => {
                    const config = statusConfig[project.status];
                    const StatusIcon = config.icon;
                    return (
                        <div
                            key={project.id}
                            className="p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-all duration-200 group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium truncate flex-1">{project.name}</span>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${config.badge} flex items-center gap-1`}>
                                    <StatusIcon className="h-3 w-3" />
                                    {config.label}
                                </span>
                            </div>
                            <div className="relative h-2 rounded-full bg-muted overflow-hidden mb-2">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${project.status === 'healthy' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                                            project.status === 'at-risk' ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                                                'bg-gradient-to-r from-red-500 to-red-400'
                                        }`}
                                    style={{ width: `${project.completion}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{project.completion}% complete</span>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" /> {project.teams}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Bug className="h-3 w-3" /> {project.openIssues}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
