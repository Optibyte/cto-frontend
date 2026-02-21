'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle, AlertTriangle, XCircle, Trash2, Edit, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSLAs, useDeleteSLA } from '@/hooks/use-sla';
import { toast } from 'sonner';

const statusConfig = {
    met: {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        label: 'Met',
    },
    at_risk: {
        icon: AlertTriangle,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        label: 'At Risk',
    },
    missed: {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        label: 'Missed',
    },
};

export default function SLAPage() {
    const { data: slaDefinitions = [], isLoading } = useSLAs() as { data: any[] | undefined, isLoading: boolean };
    const { mutate: deleteSLA } = useDeleteSLA();

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this SLA?')) {
            deleteSLA(id, {
                onSuccess: () => toast.success('SLA deleted successfully'),
                onError: () => toast.error('Failed to delete SLA'),
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">SLA Management</h1>
                    <p className="text-muted-foreground">
                        Monitor and manage service level agreements
                    </p>
                </div>
                <Link href="/sla/new">
                    <Button className="gap-2 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
                        <Plus className="h-4 w-4" />
                        Create SLA
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {slaDefinitions.map((sla: any) => {
                    // Default to 'met' if status is missing or unknown
                    const statusKey = (sla.status as keyof typeof statusConfig) || 'met';
                    const config = statusConfig[statusKey] || statusConfig.met;
                    const Icon = config.icon;

                    return (
                        <Card key={sla.id} className="group flex flex-col justify-between overflow-hidden border-border/50 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/20">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-semibold tracking-tight">
                                            <Link href={`/sla/${sla.id}`} className="hover:text-primary transition-colors">
                                                {sla.name}
                                            </Link>
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {sla.description}
                                        </p>
                                    </div>
                                    <Badge className={`${config.bgColor} ${config.color} border ${config.borderColor} rounded-full px-3 py-1 shadow-sm`}>
                                        <Icon className="h-3.5 w-3.5 mr-1.5" />
                                        {config.label}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4 rounded-xl bg-secondary/30 p-4 border border-border/50">
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target</p>
                                        <p className="text-xl font-bold tracking-tight">
                                            {sla.targetValue} <span className="text-sm font-normal text-muted-foreground">{sla.unit}</span>
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current</p>
                                        <p className={`text-xl font-bold tracking-tight ${config.color}`}>
                                            {sla.currentValue} <span className="text-sm font-normal text-muted-foreground">{sla.unit}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-accent/50 transition-colors">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                            Team
                                        </span>
                                        <span className="font-semibold">{sla.teamName || sla.team?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-accent/50 transition-colors">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                                            Breaches
                                        </span>
                                        <span className="font-semibold text-red-500">{sla.breachCount || sla._count?.breaches || 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between gap-3 border-t border-border/30 pt-4 bg-secondary/5">
                                <Link href={`/sla/editsla`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full rounded-xl border-border/50 hover:bg-accent hover:text-accent-foreground transition-all group-hover:border-primary/30">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(sla.id)}
                                    className="rounded-xl px-3 text-red-500 hover:text-red-700 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
            {slaDefinitions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-border/50 bg-card/50">
                    <div className="p-4 rounded-full bg-secondary/50">
                        <CheckCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">No SLAs Found</h3>
                        <p className="text-muted-foreground max-w-sm mt-1">
                            Create your first Service Level Agreement to start monitoring team performance.
                        </p>
                    </div>
                    <Link href="/sla/new">
                        <Button variant="outline" className="rounded-xl mt-4">
                            Create SLA <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
