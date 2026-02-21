'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, CheckCircle, Info, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        title: 'SLA Breach Alert',
        message: 'Team Alpha missed the "Response Time" SLA for the third time this week.',
        time: '2 hours ago',
        type: 'critical',
        read: false,
    },
    {
        id: 2,
        title: 'New Integration Connected',
        message: 'GitHub repository "cto-platform" was successfully synced.',
        time: '5 hours ago',
        type: 'success',
        read: false,
    },
    {
        id: 3,
        title: 'Weekly Report Ready',
        message: 'Your weekly performance summary is available for review.',
        time: '1 day ago',
        type: 'info',
        read: true,
    },
];

const typeConfig = {
    critical: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
    success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
};

export default function NotificationsPage() {
    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-muted-foreground">
                        Stay updated on system events and alerts
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl">Mark all as read</Button>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <Card className="border-border/50 shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border/30">
                        {MOCK_NOTIFICATIONS.map((notification) => {
                            const config = typeConfig[notification.type as keyof typeof typeConfig];
                            const Icon = config.icon;

                            return (
                                <div key={notification.id} className={`p-4 flex gap-4 hover:bg-accent/30 transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}>
                                    <div className={`mt-1 p-2 rounded-full ${config.bg} ${config.color} shadow-sm`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {notification.title}
                                            </p>
                                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="self-center">
                                            <div className="h-2 w-2 rounded-full bg-primary shadow-lg shadow-primary/50 animate-pulse" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="p-4 text-center border-t border-border/30">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-xl">
                            View All History
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
