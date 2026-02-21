'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskAlert } from '@/lib/mock-data/dashboard-filtered';
import { ShieldAlert, AlertTriangle, Ban, Link2, Clock } from 'lucide-react';

interface RiskAlertsPanelProps {
    data: RiskAlert[];
}

const typeConfig = {
    'sla-breach': { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10' },
    'blocker': { icon: Ban, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    'warning': { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    'dependency': { icon: Link2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
};

const severityBadge = {
    high: 'bg-red-500/15 text-red-500 border-red-500/20',
    medium: 'bg-amber-500/15 text-amber-500 border-amber-500/20',
    low: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
};

export function RiskAlertsPanel({ data }: RiskAlertsPanelProps) {
    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ShieldAlert className="h-5 w-5 text-red-500" />
                        Risk & Alerts
                    </CardTitle>
                    {data.length > 0 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
                            {data.length} active
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <ShieldAlert className="h-8 w-8 mb-2 opacity-40" />
                        <span className="text-sm">No active alerts</span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {data.map((alert) => {
                            const config = typeConfig[alert.type];
                            const AlertIcon = config.icon;
                            return (
                                <div
                                    key={alert.id}
                                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                                >
                                    <div className={`flex-shrink-0 p-1.5 rounded-lg ${config.bg}`}>
                                        <AlertIcon className={`h-4 w-4 ${config.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium leading-tight truncate">{alert.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-muted-foreground">{alert.project}</span>
                                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${severityBadge[alert.severity]}`}>
                                                {alert.severity}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                                        <Clock className="h-3 w-3" />
                                        {alert.time}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
