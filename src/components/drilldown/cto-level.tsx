'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { drillToPM } from '@/redux/slices/drilldownSlice';
import { useProjects } from '@/hooks/use-projects';
import { useHierarchy } from '@/hooks/use-hierarchy';
import { EmptyState } from './empty-state';
import { ArrowRight, Loader2, Mail, Shield } from 'lucide-react';

export function CTOLevel() {
    const dispatch = useAppDispatch();
    const { selectedProject, selectedProjectName } = useAppSelector((s) => s.drilldown);
    const { data: allProjects = [], isLoading: projectsLoading } = useProjects();
    const { data: hierarchy = [], isLoading: hierarchyLoading } = useHierarchy();

    const isLoading = projectsLoading || hierarchyLoading;

    // Get CTOs assigned to the selected project
    const project = allProjects.find((p: any) => p.id === selectedProject);
    const projectCTOs = project?.ctos || [];

    // Enrich CTO data with hierarchy info (PM count, TL count, etc.)
    const ctos = projectCTOs.map((cto: any) => {
        const hierarchyCTO = hierarchy.find((h: any) => h.id === cto.id);
        const pms = hierarchyCTO?.projects || [];
        const totalTLs = pms.reduce((acc: number, pm: any) => acc + (pm.teamLeads?.length || 0), 0);
        const totalEmployees = pms.reduce((acc: number, pm: any) =>
            acc + (pm.teamLeads?.reduce((a: number, tl: any) => a + (tl.employees?.length || 0), 0) || 0), 0);
        const initials = (cto.user?.fullName || 'UN').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

        return {
            id: cto.id,
            name: cto.user?.fullName || 'Unknown CTO',
            email: cto.user?.email || '',
            avatar: initials,
            pmCount: pms.length,
            tlCount: totalTLs,
            employeeCount: totalEmployees,
        };
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-muted-foreground font-medium">Loading CTOs...</span>
                </div>
            </div>
        );
    }

    if (ctos.length === 0) {
        return <EmptyState title="No CTOs Assigned" description={`No CTOs are assigned to "${selectedProjectName || 'this project'}".`} />;
    }

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {selectedProjectName} — CTOs
                </h1>
                <p className="text-muted-foreground">Click on a CTO to view their Project Managers</p>
            </div>

            {/* CTO Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ctos.map((cto: any) => (
                    <Card
                        key={cto.id}
                        className="overflow-hidden relative group rounded-2xl border border-border/40 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/30"
                        onClick={() => dispatch(drillToPM({ ctoId: cto.id, ctoName: cto.name }))}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600/80 to-purple-400/40 flex items-center justify-center text-sm font-semibold text-white shadow-lg shadow-purple-500/20">
                                    {cto.avatar}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-semibold">{cto.name}</h3>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Shield className="h-3 w-3" /> CTO
                                    </p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <Mail className="h-3.5 w-3.5" />
                                <span className="truncate">{cto.email}</span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-center p-2 rounded-xl bg-blue-500/10">
                                    <p className="text-lg font-bold text-blue-500">{cto.pmCount}</p>
                                    <p className="text-xs text-muted-foreground">PMs</p>
                                </div>
                                <div className="text-center p-2 rounded-xl bg-cyan-500/10">
                                    <p className="text-lg font-bold text-cyan-500">{cto.tlCount}</p>
                                    <p className="text-xs text-muted-foreground">TLs</p>
                                </div>
                                <div className="text-center p-2 rounded-xl bg-emerald-500/10">
                                    <p className="text-lg font-bold text-emerald-500">{cto.employeeCount}</p>
                                    <p className="text-xs text-muted-foreground">Devs</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
