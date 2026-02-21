'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { drillToTL } from '@/redux/slices/drilldownSlice';
import { getManagersByTeam } from '@/lib/mock-data/drilldown';
import { EmptyState } from './empty-state';
import { ArrowRight, Users, FolderKanban, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function ManagerLevel() {
    const dispatch = useAppDispatch();
    const { selectedTeam, selectedTeamName } = useAppSelector((s) => s.drilldown);

    const managers = selectedTeam ? getManagersByTeam(selectedTeam) : [];

    if (managers.length === 0) {
        return <EmptyState title="No Managers Found" description={`No managers found for ${selectedTeamName || 'this team'}.`} />;
    }

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {selectedTeamName} — Managers
                </h1>
                <p className="text-muted-foreground">Click on a manager to view their team leads</p>
            </div>

            {/* Manager Table */}
            <Card className="rounded-2xl border border-border/40 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/30 bg-muted/30">
                                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Manager</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team Size</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Projects</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delayed</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {managers.map((manager) => (
                                    <tr
                                        key={manager.id}
                                        onClick={() => dispatch(drillToTL({ managerId: manager.id, managerName: manager.name }))}
                                        className="border-b border-border/20 hover:bg-primary/5 cursor-pointer transition-colors duration-200 group"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                                                    {manager.avatar}
                                                </div>
                                                <span className="font-medium">{manager.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>{manager.teamSize}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-semibold">{manager.totalProjects}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                                                {manager.activeProjects}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                                                {manager.delayedProjects}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                                                {manager.completedProjects}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
