'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { drillToEmployee } from '@/redux/slices/drilldownSlice';
import { getTLsByManager } from '@/lib/mock-data/drilldown';
import { EmptyState } from './empty-state';
import { Users, FolderKanban, TrendingUp, ArrowRight } from 'lucide-react';

export function TLLevel() {
    const dispatch = useAppDispatch();
    const { selectedManager, selectedManagerName } = useAppSelector((s) => s.drilldown);

    const tls = selectedManager ? getTLsByManager(selectedManager) : [];

    if (tls.length === 0) {
        return <EmptyState title="No Team Leads Found" description={`No team leads found under ${selectedManagerName || 'this manager'}.`} />;
    }

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {selectedManagerName} — Team Leads
                </h1>
                <p className="text-muted-foreground">Click on a team lead to view their employees</p>
            </div>

            {/* TL Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tls.map((tl) => {
                    const performanceColor =
                        tl.performance >= 85
                            ? 'text-emerald-500'
                            : tl.performance >= 70
                                ? 'text-amber-500'
                                : 'text-red-500';

                    const performanceBg =
                        tl.performance >= 85
                            ? 'bg-emerald-500'
                            : tl.performance >= 70
                                ? 'bg-amber-500'
                                : 'bg-red-500';

                    return (
                        <Card
                            key={tl.id}
                            className="overflow-hidden relative group rounded-2xl border border-border/40 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/30"
                            onClick={() => dispatch(drillToEmployee({ tlId: tl.id, tlName: tl.name }))}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <CardContent className="p-6 relative z-10">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                                        {tl.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-semibold">{tl.name}</h3>
                                        <p className="text-xs text-muted-foreground">Team Lead</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="text-center p-2.5 rounded-xl bg-muted/50">
                                        <Users className="h-4 w-4 text-primary mx-auto mb-1" />
                                        <p className="text-lg font-bold">{tl.teamSize}</p>
                                        <p className="text-xs text-muted-foreground">Members</p>
                                    </div>
                                    <div className="text-center p-2.5 rounded-xl bg-muted/50">
                                        <FolderKanban className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                                        <p className="text-lg font-bold">{tl.assignedProjects}</p>
                                        <p className="text-xs text-muted-foreground">Projects</p>
                                    </div>
                                    <div className="text-center p-2.5 rounded-xl bg-muted/50">
                                        <TrendingUp className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                                        <p className={`text-lg font-bold ${performanceColor}`}>{tl.performance}%</p>
                                        <p className="text-xs text-muted-foreground">Perf.</p>
                                    </div>
                                </div>

                                {/* Performance bar */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-muted-foreground">Performance</span>
                                        <span className={`font-medium ${performanceColor}`}>{tl.performance}%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${performanceBg} transition-all duration-700`}
                                            style={{ width: `${tl.performance}%`, opacity: 0.8 }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
