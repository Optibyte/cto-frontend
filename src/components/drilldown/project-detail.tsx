'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAppSelector } from '@/redux/store';
import { getProjectsByFilters } from '@/lib/mock-data/drilldown';
import { EmptyState } from './empty-state';
import { Calendar, User, BarChart3 } from 'lucide-react';

export function ProjectDetail() {
    const { selectedEmployee, selectedEmployeeName, selectedTL, selectedManager, selectedTeam } =
        useAppSelector((s) => s.drilldown);

    const projects = getProjectsByFilters({
        employeeId: selectedEmployee || undefined,
        tlId: selectedEmployee ? undefined : selectedTL || undefined,
        managerId: selectedEmployee || selectedTL ? undefined : selectedManager || undefined,
        teamId: selectedEmployee || selectedTL || selectedManager ? undefined : selectedTeam || undefined,
    });

    if (projects.length === 0) {
        return <EmptyState title="No Projects Found" description={`No projects found for ${selectedEmployeeName || 'this selection'}.`} />;
    }

    const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
        active: { label: 'Active', bg: 'bg-blue-500/10', text: 'text-blue-500' },
        completed: { label: 'Completed', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
        delayed: { label: 'Delayed', bg: 'bg-red-500/10', text: 'text-red-500' },
        'on-hold': { label: 'On Hold', bg: 'bg-amber-500/10', text: 'text-amber-500' },
    };

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {selectedEmployeeName ? `${selectedEmployeeName} — Projects` : 'Project Details'}
                </h1>
                <p className="text-muted-foreground">{projects.length} project(s) found</p>
            </div>

            {/* Project Table */}
            <Card className="rounded-2xl border border-border/40 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/30 bg-muted/30">
                                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Name</th>
                                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start Date</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">End Date</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project) => {
                                    const status = statusConfig[project.status] || statusConfig['active'];
                                    const progressColor =
                                        project.progressPercent >= 75
                                            ? 'bg-emerald-500'
                                            : project.progressPercent >= 40
                                                ? 'bg-amber-500'
                                                : 'bg-red-500';

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
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">{project.client}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(project.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(project.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3 min-w-[120px]">
                                                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${progressColor} transition-all duration-700`}
                                                            style={{ width: `${project.progressPercent}%`, opacity: 0.85 }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold text-muted-foreground w-8 text-right">
                                                        {project.progressPercent}%
                                                    </span>
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
