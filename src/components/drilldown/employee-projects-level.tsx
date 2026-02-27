'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAppSelector } from '@/redux/store';
import { useProjects } from '@/hooks/use-projects';
import { EmptyState } from './empty-state';
import { Calendar, Users, BarChart3, Loader2, FolderKanban } from 'lucide-react';

export function EmployeeProjectsLevel() {
    const { selectedEmployee, selectedEmployeeName } = useAppSelector((s) => s.drilldown);
    const { data: allProjects = [], isLoading } = useProjects();

    // Filter projects where this employee is a collaborator
    const projects = allProjects.filter((project: any) => {
        const employeeIds = (project.employees || []).map((e: any) => e.id);
        return employeeIds.includes(selectedEmployee);
    });

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

    if (projects.length === 0) {
        return <EmptyState title="No Collaborated Projects" description={`${selectedEmployeeName || 'This employee'} is not assigned to any projects yet.`} />;
    }

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {selectedEmployeeName} — Collaborated Projects
                </h1>
                <p className="text-muted-foreground">{projects.length} project(s) found</p>
            </div>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="overflow-hidden relative group rounded-2xl border border-border/40 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/10 opacity-30" />
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Total Projects</p>
                                <h3 className="text-4xl font-bold">{projects.length}</h3>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/10">
                                <FolderKanban className="h-7 w-7 text-purple-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden relative group rounded-2xl border border-border/40 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 opacity-30" />
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Total Colleagues</p>
                                <h3 className="text-4xl font-bold">
                                    {projects.reduce((sum: number, p: any) =>
                                        sum + (p.ctos?.length || 0) + (p.pms?.length || 0) + (p.teamLeads?.length || 0) + (p.employees?.length || 0), 0)}
                                </h3>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10">
                                <Users className="h-7 w-7 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Project Table */}
            <Card className="rounded-2xl border border-border/40 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/30 bg-muted/30">
                                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Name</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">CTOs</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">PMs</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">TLs</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employees</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project: any) => {
                                    const ctoCount = project.ctos?.length || 0;
                                    const pmCount = project.pms?.length || 0;
                                    const tlCount = project.teamLeads?.length || 0;
                                    const empCount = project.employees?.length || 0;
                                    const total = ctoCount + pmCount + tlCount + empCount;

                                    return (
                                        <tr
                                            key={project.id}
                                            className="border-b border-border/20 hover:bg-primary/5 transition-colors duration-200"
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <BarChart3 className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <span className="font-medium">{project.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500">
                                                    {ctoCount}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                                                    {pmCount}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-500">
                                                    {tlCount}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                                                    {empCount}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-bold">{total}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {project.createdAt
                                                        ? new Date(project.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                                        : 'N/A'}
                                                </div>
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
