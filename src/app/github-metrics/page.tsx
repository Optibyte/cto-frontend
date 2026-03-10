'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GithubMetricsWidget } from '@/components/dashboard/github-metrics-widget';
import { useProjects } from '@/hooks/use-projects';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { useRole } from '@/contexts/role-context';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { GitBranch, Info } from 'lucide-react';

export default function GithubMetricsPage() {
    const { role } = useRole();
    const { data: allProjects = [] } = useProjects();
    const [projectId, setProjectId] = useState<string>('all');

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-2 pb-6 border-b border-border/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                            <GitBranch className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-gradient">
                                GitHub Intelligence
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Deep dive into repository metrics, deployment health, and contributor activity.
                            </p>
                        </div>
                    </div>
                    <DateRangeFilter />
                </div>
            </div>

            {/* Selection Bar */}
            <Card className="border-border/40 bg-muted/5">
                <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Select Project:</span>
                        <Select value={projectId} onValueChange={setProjectId}>
                            <SelectTrigger className="w-full md:w-[280px] h-10 rounded-xl bg-background border-border/40">
                                <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Projects (Overview)</SelectItem>
                                {allProjects.map((p: any) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {projectId === 'all' && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium">
                            <Info className="h-4 w-4" />
                            Please select a project to view detailed GitHub metrics.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Metrics Content */}
            {projectId !== 'all' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <GithubMetricsWidget projectId={projectId} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
                    {/* Placeholder or Global View if needed, but Widget requires projectId */}
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-muted/5 border-2 border-dashed border-border/20 rounded-3xl">
                        <GitBranch className="h-16 w-16 text-muted-foreground/20 mb-4" />
                        <h3 className="text-xl font-bold text-foreground/50">No Project Selected</h3>
                        <p className="text-muted-foreground text-center max-w-sm mt-2">
                            Select a project from the dropdown above to analyze its GitHub repository data, automation runs, and contributor health.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

