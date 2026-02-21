'use client';

import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface SLAStatusWidgetProps {
    data: {
        met: number;
        atRisk: number;
        missed: number;
    };
}

export function SLAStatusWidget({ data }: SLAStatusWidgetProps) {
    const total = data.met + data.atRisk + data.missed;
    const metPercent = (data.met / total) * 100;
    const atRiskPercent = (data.atRisk / total) * 100;
    const missedPercent = (data.missed / total) * 100;

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">Met</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{data.met}</span>
                        <span className="text-xs text-muted-foreground">
                            ({metPercent.toFixed(0)}%)
                        </span>
                    </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full bg-green-500"
                        style={{ width: `${metPercent}%` }}
                    />
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm font-medium">At Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{data.atRisk}</span>
                        <span className="text-xs text-muted-foreground">
                            ({atRiskPercent.toFixed(0)}%)
                        </span>
                    </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full bg-yellow-500"
                        style={{ width: `${atRiskPercent}%` }}
                    />
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-medium">Missed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{data.missed}</span>
                        <span className="text-xs text-muted-foreground">
                            ({missedPercent.toFixed(0)}%)
                        </span>
                    </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full bg-red-500"
                        style={{ width: `${missedPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
