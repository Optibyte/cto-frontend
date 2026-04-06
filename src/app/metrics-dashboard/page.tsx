'use client';

import { useState, useMemo } from 'react';
import { AnalyticsDashboard } from '@/components/metrics/analytics-dashboard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { useDataFence } from '@/contexts/role-context';

export default function MetricsDashboardPage() {
    const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
    const [selectedTeamId, setSelectedTeamId] = useState<string>('all');

    const { data: hierarchy } = useOrgHierarchy();
    const fence = useDataFence();

    // Replicate logic for project/team lists from dashboard to filters
    const resolvedAllowedProjectIds = useMemo(() => {
        if (!fence.isRestricted) return null;
        if (fence.allowedProjectIds && fence.allowedProjectIds.length > 0) return fence.allowedProjectIds;
        if (fence.allowedTeamIds && hierarchy) {
            const projectIds: string[] = [];
            hierarchy.markets?.forEach((m: any) => {
                m.accounts?.forEach((a: any) => {
                    a.teams?.forEach((t: any) => {
                        if (fence.allowedTeamIds!.includes(t.id) && t.projectId && !projectIds.includes(t.projectId)) {
                            projectIds.push(t.projectId);
                        }
                    });
                });
            });
            return projectIds.length > 0 ? projectIds : null;
        }
        return null;
    }, [fence, hierarchy]);

    const projects = useMemo(() => {
        if (!hierarchy) return [];
        const projs: any[] = [];
        hierarchy.markets?.forEach((m: any) => {
            m.accounts?.forEach((a: any) => {
                a.teams?.forEach((t: any) => {
                    if (t.project && !projs.find((p: any) => p.id === t.project.id)) {
                        const withinFence = !resolvedAllowedProjectIds || resolvedAllowedProjectIds.includes(t.project.id);
                        const withinTeamFence = !fence.allowedTeamIds || fence.allowedTeamIds.includes(t.id);
                        if (withinFence && withinTeamFence) projs.push(t.project);
                    }
                });
            });
        });
        return projs;
    }, [hierarchy, resolvedAllowedProjectIds, fence.allowedTeamIds]);

    const teams = useMemo(() => {
        if (!hierarchy) return [];
        let allTeams: any[] = [];
        hierarchy.markets?.forEach((m: any) => {
            m.accounts?.forEach((a: any) => {
                allTeams = [...allTeams, ...(a.teams || [])];
            });
        });
        if (selectedProjectId !== 'all') {
            allTeams = allTeams.filter((t: any) => t.projectId === selectedProjectId);
        }
        if (fence.allowedTeamIds) {
            allTeams = allTeams.filter((t: any) => fence.allowedTeamIds!.includes(t.id));
        }
        if (resolvedAllowedProjectIds) {
            allTeams = allTeams.filter((t: any) => resolvedAllowedProjectIds.includes(t.projectId));
        }
        return allTeams;
    }, [hierarchy, selectedProjectId, fence.allowedTeamIds, resolvedAllowedProjectIds]);

    return (
        <div className="space-y-8">
            {/* Page Header with Filters moved TOP */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/10">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gradient">
                        Metrics Dashboard
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium opacity-80">
                        View and analyze project and team performance metrics across all sources
                    </p>
                </div>

                {/* Filters Region */}
                <div className="flex items-center gap-4 bg-white dark:bg-card p-2.5 rounded-2xl border border-border/10  shadow-sm">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70 ml-1">Project </span>
                        <Select value={selectedProjectId} onValueChange={(val) => {
                            setSelectedProjectId(val);
                            setSelectedTeamId('all');
                        }}>
                            <SelectTrigger className="w-[200px] rounded-xl bg-background/50 border-border/50 h-11 font-bold shadow-sm transition-all hover:bg-muted/50 text-xs">
                                <SelectValue placeholder="All Projects" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                                <SelectItem value="all" className="font-bold text-xs uppercase tracking-wider">All Projects</SelectItem>
                                {projects.map(p => (
                                    <SelectItem key={p.id} value={p.id} className="font-bold text-xs">{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70 ml-1">Team Filter</span>
                        <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                            <SelectTrigger className="w-[200px] rounded-xl bg-background/50 border-border/50 h-11 font-bold shadow-sm transition-all hover:bg-muted/50 text-xs">
                                <SelectValue placeholder="All Teams" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                                <SelectItem value="all" className="font-bold text-xs uppercase tracking-wider">All Teams</SelectItem>
                                {teams.map(t => (
                                    <SelectItem key={t.id} value={t.id} className="font-bold text-xs">{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                <AnalyticsDashboard
                    selectedProjectId={selectedProjectId}
                    setSelectedProjectId={setSelectedProjectId}
                    selectedTeamId={selectedTeamId}
                    setSelectedTeamId={setSelectedTeamId}
                />
            </div>
        </div>
    );
}
