'use client';

import { Card, CardContent } from '@/components/ui/card';

export function LoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="space-y-2">
                <div className="h-8 w-48 bg-muted rounded-lg" />
                <div className="h-4 w-72 bg-muted/60 rounded-lg" />
            </div>

            {/* KPI Cards skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                        <CardContent className="p-6">
                            <div className="space-y-3">
                                <div className="h-3 w-24 bg-muted rounded" />
                                <div className="h-10 w-20 bg-muted rounded-lg" />
                                <div className="h-2 w-full bg-muted rounded" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Chart skeleton */}
            <Card>
                <CardContent className="p-6">
                    <div className="h-64 bg-muted/40 rounded-xl flex items-end gap-4 p-6">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-muted rounded-t-lg shimmer"
                                style={{ height: `${30 + Math.random() * 60}%` }}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
