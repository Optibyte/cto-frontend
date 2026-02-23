'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { drillToEmployee } from '@/redux/slices/drilldownSlice';
import { useHierarchy } from '@/hooks/use-hierarchy';
import { EmptyState } from './empty-state';
import { Users, ArrowRight, Loader2, Mail } from 'lucide-react';

export function TLLevel() {
    const dispatch = useAppDispatch();
    const { selectedCTO, selectedPM, selectedPMName } = useAppSelector((s) => s.drilldown);
    const { data: hierarchy = [], isLoading } = useHierarchy();

    // Navigate: CTO → PM → get TLs
    const selectedCTOData = hierarchy.find((cto: any) => cto.id === selectedCTO);
    const selectedPMData = selectedCTOData?.projects?.find((pm: any) => pm.id === selectedPM);
    const tls = (selectedPMData?.teamLeads || []).map((tl: any) => {
        const employeeCount = tl.employees?.length || 0;
        const initials = (tl.user?.fullName || 'UN').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

        return {
            id: tl.id,
            name: tl.user?.fullName || 'Unknown TL',
            email: tl.user?.email || '',
            avatar: initials,
            teamSize: employeeCount,
        };
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-muted-foreground font-medium">Loading team leads...</span>
                </div>
            </div>
        );
    }

    if (tls.length === 0) {
        return <EmptyState title="No Team Leads Found" description={`No team leads found under ${selectedPMName || 'this PM'}.`} />;
    }

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {selectedPMName} — Team Leads
                </h1>
                <p className="text-muted-foreground">Click on a team lead to view their employees</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tls.map((tl: any) => (
                    <Card
                        key={tl.id}
                        className="overflow-hidden relative group rounded-2xl border border-border/40 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/30"
                        onClick={() => dispatch(drillToEmployee({ tlId: tl.id, tlName: tl.name }))}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-600/80 to-cyan-400/40 flex items-center justify-center text-sm font-semibold text-white shadow-lg shadow-cyan-500/20">
                                    {tl.avatar}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-semibold">{tl.name}</h3>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Mail className="h-3 w-3" /> {tl.email}
                                    </p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>

                            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                                <Users className="h-5 w-5 text-emerald-500" />
                                <span className="text-lg font-bold">{tl.teamSize}</span>
                                <span className="text-sm text-muted-foreground">Employees</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
