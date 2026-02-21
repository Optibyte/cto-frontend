'use client';

import { Activity } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ActivityFeedProps {
    activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    return (
        <div className="space-y-4">
            {activities.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                        {activity.severity === 'warning' && (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            </div>
                        )}
                        {activity.severity === 'error' && (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                            </div>
                        )}
                        {!activity.severity && (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <Info className="h-5 w-5 text-primary" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {activity.user && <span>{activity.user.name}</span>}
                            <span>•</span>
                            <span>{formatDateTime(activity.timestamp)}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
