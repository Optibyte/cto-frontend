'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileSearch, Clock, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AuditPage() {
    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                <p className="text-muted-foreground">
                    Track all system activities and changes
                </p>
            </div>

            <Card className="border-border/50 shadow-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <FileSearch className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>System Activity</CardTitle>
                                <CardDescription>Recent actions performed by users</CardDescription>
                            </div>
                        </div>
                        <Badge variant="outline" className="rounded-full bg-primary/5 border-primary/20 text-primary">
                            Live Monitoring
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                            <div className="relative bg-card border border-border/50 p-4 rounded-full shadow-xl">
                                <Clock className="h-10 w-10 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="space-y-2 max-w-md">
                            <h3 className="text-lg font-semibold">No Recent Activity</h3>
                            <p className="text-muted-foreground">
                                System audit logs will appear here once users start interacting with the platform.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
