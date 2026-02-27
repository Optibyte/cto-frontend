'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch } from '@/redux/store';
import { drillToCTO } from '@/redux/slices/drilldownSlice';
import { useProjects } from '@/hooks/use-projects';
import { FolderKanban, Users, Loader2, Shield, UserCheck, UserCog, User } from 'lucide-react';

const COLORS = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#84CC16'];

export function ProjectLevel() {
    const dispatch = useAppDispatch();
    const { data: projects = [], isLoading } = useProjects();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-muted-foreground font-medium">Loading projects...</span>
                </div>
            </div>
        );
    }

    const projectCards = projects.map((project: any, index: number) => {
        const ctoCount = project.ctos?.length || 0;
        const pmCount = project.pms?.length || 0;
        const tlCount = project.teamLeads?.length || 0;
        const empCount = project.employees?.length || 0;
        const total = ctoCount + pmCount + tlCount + empCount;

        return {
            id: project.id,
            name: project.name,
            ctoCount,
            pmCount,
            tlCount,
            empCount,
            total,
            color: COLORS[index % COLORS.length],
            createdAt: project.createdAt,
        };
    });

    const totalMembers = projectCards.reduce((s: number, p: any) => s + p.total, 0);
    const totalCTOs = projectCards.reduce((s: number, p: any) => s + p.ctoCount, 0);
    const totalPMs = projectCards.reduce((s: number, p: any) => s + p.pmCount, 0);
    const totalEmployees = projectCards.reduce((s: number, p: any) => s + p.empCount, 0);

    const summaryCards = [
        { title: 'Projects', value: projectCards.length, icon: FolderKanban, color: 'from-purple-500/20 to-purple-600/10', textColor: 'text-purple-500', iconBg: 'bg-purple-500/10' },
        { title: 'Total CTOs', value: totalCTOs, icon: Shield, color: 'from-blue-500/20 to-blue-600/10', textColor: 'text-blue-500', iconBg: 'bg-blue-500/10' },
        { title: 'Total PMs', value: totalPMs, icon: UserCog, color: 'from-cyan-500/20 to-cyan-600/10', textColor: 'text-cyan-500', iconBg: 'bg-cyan-500/10' },
        { title: 'Total Members', value: totalMembers, icon: Users, color: 'from-emerald-500/20 to-emerald-600/10', textColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10' },
    ];

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Projects Overview</h1>
                <p className="text-muted-foreground">Click on a project to drill down into its team structure</p>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summaryCards.map((card, i) => (
                    <Card key={i} className="overflow-hidden relative group rounded-2xl border border-border/40 shadow-lg shadow-black/5 dark:shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30">
                        <div className={`absolute inset-0 bg-gradient-to-br opacity-30 group-hover:opacity-50 transition-opacity duration-300 ${card.color}`} />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{card.title}</p>
                                    <h3 className="text-4xl font-bold tracking-tight">{card.value}</h3>
                                </div>
                                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <card.icon className={`h-7 w-7 ${card.textColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Project Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projectCards.map((project: any) => (
                    <Card
                        key={project.id}
                        className="overflow-hidden relative group rounded-2xl border border-border/40 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/30"
                        onClick={() => dispatch(drillToCTO({ projectId: project.id, projectName: project.name }))}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl" style={{ backgroundColor: project.color }} />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">{project.name}</h3>
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                <div className="text-center p-2 rounded-xl bg-purple-500/10">
                                    <p className="text-lg font-bold text-purple-500">{project.ctoCount}</p>
                                    <p className="text-xs text-muted-foreground">CTOs</p>
                                </div>
                                <div className="text-center p-2 rounded-xl bg-blue-500/10">
                                    <p className="text-lg font-bold text-blue-500">{project.pmCount}</p>
                                    <p className="text-xs text-muted-foreground">PMs</p>
                                </div>
                                <div className="text-center p-2 rounded-xl bg-cyan-500/10">
                                    <p className="text-lg font-bold text-cyan-500">{project.tlCount}</p>
                                    <p className="text-xs text-muted-foreground">TLs</p>
                                </div>
                                <div className="text-center p-2 rounded-xl bg-emerald-500/10">
                                    <p className="text-lg font-bold text-emerald-500">{project.empCount}</p>
                                    <p className="text-xs text-muted-foreground">Devs</p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{project.total} total members</span>
                                <span className="text-xs text-primary font-medium group-hover:translate-x-1 transition-transform">
                                    View Team →
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {projectCards.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-border/50 bg-card/50">
                    <FolderKanban className="h-10 w-10 text-muted-foreground" />
                    <h3 className="text-xl font-bold">No Projects Found</h3>
                    <p className="text-muted-foreground">Create projects to see them here.</p>
                </div>
            )}
        </div>
    );
}
