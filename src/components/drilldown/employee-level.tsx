'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { drillToEmployeeProjects } from '@/redux/slices/drilldownSlice';
import { useHierarchy } from '@/hooks/use-hierarchy';
import { EmptyState } from './empty-state';
import { ArrowRight, Loader2, Mail, User } from 'lucide-react';

export function EmployeeLevel() {
    const dispatch = useAppDispatch();
    const { selectedCTO, selectedPM, selectedTL, selectedTLName } = useAppSelector((s) => s.drilldown);
    const { data: hierarchy = [], isLoading } = useHierarchy();

    // Navigate: CTO → PM → TL → Employees
    const selectedCTOData = hierarchy.find((cto: any) => cto.id === selectedCTO);
    const selectedPMData = selectedCTOData?.projects?.find((pm: any) => pm.id === selectedPM);
    const selectedTLData = selectedPMData?.teamLeads?.find((tl: any) => tl.id === selectedTL);
    const employees = (selectedTLData?.employees || []).map((emp: any) => {
        const initials = (emp.user?.fullName || 'UN').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

        return {
            id: emp.id,
            name: emp.user?.fullName || 'Unknown Employee',
            email: emp.user?.email || '',
            role: emp.user?.role || 'TEAM',
            avatar: initials,
            trackingId: emp.trackingId || '',
        };
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-muted-foreground font-medium">Loading employees...</span>
                </div>
            </div>
        );
    }

    if (employees.length === 0) {
        return <EmptyState title="No Employees Found" description={`No employees found under ${selectedTLName || 'this team lead'}.`} />;
    }

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {selectedTLName} — Employees
                </h1>
                <p className="text-muted-foreground">Click on an employee to view their collaborated projects</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {employees.map((emp: any) => (
                    <Card
                        key={emp.id}
                        className="overflow-hidden relative group rounded-2xl border border-border/40 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/30"
                        onClick={() => dispatch(drillToEmployeeProjects({ employeeId: emp.id, employeeName: emp.name }))}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-600/80 to-emerald-400/40 flex items-center justify-center text-sm font-semibold text-white shadow-lg shadow-emerald-500/20">
                                    {emp.avatar}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold">{emp.name}</h3>
                                    <p className="text-xs text-muted-foreground capitalize">{emp.role}</p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-3.5 w-3.5" />
                                    <span className="truncate">{emp.email}</span>
                                </div>
                                {emp.trackingId && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User className="h-3.5 w-3.5" />
                                        <span className="font-mono text-xs">{emp.trackingId}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
