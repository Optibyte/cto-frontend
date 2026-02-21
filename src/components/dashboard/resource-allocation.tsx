'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResourceAllocation as ResourceAllocationType } from '@/lib/mock-data/dashboard-filtered';
import { PieChart, Users } from 'lucide-react';

interface ResourceAllocationProps {
    data: ResourceAllocationType[];
}

export function ResourceAllocation({ data }: ResourceAllocationProps) {
    const totalAllocated = data.reduce((sum, r) => sum + r.allocated, 0);
    const totalTeam = data.length > 0 ? data[0].total : 50;

    return (
        <Card className="lg:col-span-2 h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <PieChart className="h-5 w-5 text-primary" />
                        Resource Allocation
                    </CardTitle>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="font-semibold text-foreground">{totalAllocated}</span>
                        <span>/ {totalTeam} members</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {data.map((resource) => {
                    const pct = Math.round((resource.allocated / resource.total) * 100);
                    return (
                        <div key={resource.projectId} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: resource.color }}
                                    />
                                    <span className="font-medium">{resource.project}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{resource.allocated} members</span>
                                    <span className="font-semibold text-xs px-2 py-0.5 rounded-full bg-muted">{pct}%</span>
                                </div>
                            </div>
                            <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                    style={{
                                        width: `${pct}%`,
                                        backgroundColor: resource.color,
                                        opacity: 0.85,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}

                {/* Unallocated */}
                {totalAllocated < totalTeam && (
                    <div className="space-y-2 opacity-60">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                                <span className="font-medium text-muted-foreground">Unallocated</span>
                            </div>
                            <span className="text-muted-foreground">{totalTeam - totalAllocated} members</span>
                        </div>
                        <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full rounded-full bg-muted-foreground/20"
                                style={{ width: `${Math.round(((totalTeam - totalAllocated) / totalTeam) * 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
