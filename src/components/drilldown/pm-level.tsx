'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { drillToTL } from '@/redux/slices/drilldownSlice';
import { useHierarchy } from '@/hooks/use-hierarchy';
import { EmptyState } from './empty-state';
import { ArrowRight, Users, Loader2, Mail } from 'lucide-react';

export function PMLevel() {
    const dispatch = useAppDispatch();
    const { selectedCTO, selectedCTOName } = useAppSelector((s) => s.drilldown);
    const { data: hierarchy = [], isLoading } = useHierarchy();

    // Find the selected CTO in hierarchy and get their PMs
    const selectedCTOData = hierarchy.find((cto: any) => cto.id === selectedCTO);
    const pms = (selectedCTOData?.projects || []).map((pm: any) => {
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
                    <span className="text-muted-foreground font-medium">Loading PMs...</span>
                </div>
            </div>
        );
    }

    if (pms.length === 0) {
        return <EmptyState title="No Project Managers Found" description={`No PMs found under ${selectedCTOName || 'this CTO'}.`} />;
    }

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {selectedCTOName} — Project Managers
                </h1>
                <p className="text-muted-foreground">Click on a PM to view their Team Leads</p>
            </div>

            <Card className="rounded-2xl border border-border/40 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/30 bg-muted/30">
                                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project Manager</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team Size</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team Leads</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employees</th>
                                    <th className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {pms.map((pm: any) => (
                                    <tr
                                        key={pm.id}
                                        onClick={() => dispatch(drillToTL({ pmId: pm.id, pmName: pm.name }))}
                                        className="border-b border-border/20 hover:bg-primary/5 cursor-pointer transition-colors duration-200 group"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600/80 to-blue-400/40 flex items-center justify-center text-sm font-semibold text-white shadow-lg shadow-blue-500/20">
                                                    {pm.avatar}
                                                </div>
                                                <span className="font-medium">{pm.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                                                <Mail className="h-3.5 w-3.5" />
                                                <span>{pm.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>{pm.teamSize}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-500">
                                                {pm.totalTLs}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                                                {pm.totalEmployees}
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
