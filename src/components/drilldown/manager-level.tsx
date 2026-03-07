'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { drillToTL } from '@/redux/slices/drilldownSlice';
import { useHierarchy } from '@/hooks/use-hierarchy';
import { EmptyState } from './empty-state';
import { ArrowRight, Users, FolderKanban, Loader2 } from 'lucide-react';

export function ManagerLevel() {
    const dispatch = useAppDispatch();
    const { selectedCTO, selectedCTOName } = useAppSelector((s) => s.drilldown);
    const { data: hierarchy = [], isLoading } = useHierarchy();

    // Find the selected CTO and get their PMs
    const selectedCTOItem = hierarchy.find((cto: any) => cto.id === selectedCTO);
    const managers = (selectedCTOItem?.projects || []).map((pm: any) => {
        const totalTLs = pm.teamLeads?.length || 0;
        const totalEmployees = pm.teamLeads?.reduce((acc: number, tl: any) => acc + (tl.employees?.length || 0), 0) || 0;
        const initials = (pm.user?.fullName || 'UN').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

        return {
            id: pm.id,
            name: pm.user?.fullName || 'Unknown PM',
            email: pm.user?.email || '',
            avatar: initials,
            teamSize: totalTLs + totalEmployees,
            totalTLs,
            totalEmployees,
        };
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-muted-foreground font-medium">Loading managers...</span>
                </div>
            </div>
        );
    }

    if (managers.length === 0) {
        return <EmptyState title="No Managers Found" description={`No project managers found under ${selectedCTOName || 'this CTO'}.`} />;
    }

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {selectedCTOName} — Project Managers
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
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team Size</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team Leads</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employees</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {managers.map((manager: any) => (
                                    <tr
                                        key={manager.id}
                                        onClick={() => dispatch(drillToTL({ pmId: manager.id, pmName: manager.name }))}
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
                                        <td className="py-4 px-6 text-center text-sm text-muted-foreground">
                                            {manager.email}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>{manager.teamSize}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                                                {manager.totalTLs}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                                                {manager.totalEmployees}
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
