'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatNumber } from '@/lib/utils';
import { METRIC_TYPES, SOURCE_TYPES } from '@/lib/constants';
import { BarChart3, Plus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useMetrics, useCreateMetric, useDeleteMetric } from '@/hooks/use-metrics';
import { useTeams } from '@/hooks/use-teams';
import { useUsers } from '@/hooks/use-users';
import { toast } from 'sonner';

export default function MetricsPage() {
    const { data: allMetrics = [], isLoading } = useMetrics() as { data: any[] | undefined, isLoading: boolean };
    const { data: teams = [] }: { data: any[] | undefined } = useTeams() as any;
    const { data: users = [] }: { data: any[] | undefined } = useUsers() as any;
    const { mutate: createMetric, isPending: isCreating } = useCreateMetric();
    const { mutate: deleteMetric } = useDeleteMetric();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        metricType: '',
        value: '',
        unit: '',
        teamId: '',
        source: 'MANUAL',
    });

    // Take first 50 metrics for display
    const displayMetrics = allMetrics ? allMetrics.slice(0, 50) : [];

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this metric?')) {
            deleteMetric(id, {
                onSuccess: () => toast.success('Metric deleted successfully'),
                onError: () => toast.error('Failed to delete metric'),
            });
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!formData.teamId) {
            toast.error('Please select a Team');
            return;
        }
        if (!formData.metricType) {
            toast.error('Please select a Metric Type');
            return;
        }

        // Get the first user ID as createdBy (ideally this should be from auth context)
        const createdBy = users[0]?.id || formData.teamId;

        createMetric({
            time: new Date().toISOString(),
            teamId: formData.teamId,
            metricType: formData.metricType,
            value: Number(formData.value),
            unit: formData.unit,
            source: formData.source.toLowerCase(),
            createdBy: createdBy,
        }, {
            onSuccess: () => {
                toast.success('Metric added successfully');
                setIsDialogOpen(false);
                setFormData({
                    metricType: '',
                    value: '',
                    unit: '',
                    teamId: '',
                    source: 'MANUAL',
                });
            },
            onError: (error: any) => {
                const message = error.response?.data?.message;
                if (Array.isArray(message)) {
                    message.forEach((msg: string) => toast.error(msg));
                } else {
                    toast.error(message || 'Failed to add metric');
                }
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Metrics Explorer</h1>
                    <p className="text-muted-foreground">
                        View and analyze team performance metrics
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Metric
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Metric</DialogTitle>
                            <DialogDescription>
                                Manually record a performance metric for a team.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="teamId">Team</Label>
                                <Select
                                    value={formData.teamId}
                                    onValueChange={(val: string) => setFormData({ ...formData, teamId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select team" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teams?.map((team: any) => (
                                            <SelectItem key={team.id} value={team.id}>
                                                {team.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="metricType">Metric Type</Label>
                                <Select
                                    value={formData.metricType}
                                    onValueChange={(val: string) => setFormData({ ...formData, metricType: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="velocity">Velocity</SelectItem>
                                        <SelectItem value="quality">Quality</SelectItem>
                                        <SelectItem value="throughput">Throughput</SelectItem>
                                        <SelectItem value="cycle_time">Cycle Time</SelectItem>
                                        <SelectItem value="lead_time">Lead Time</SelectItem>
                                        <SelectItem value="bug_rate">Bug Rate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="value">Value</Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        step="0.01"
                                        value={formData.value}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, value: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="unit">Unit</Label>
                                    <Input
                                        id="unit"
                                        value={formData.unit}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, unit: e.target.value })}
                                        placeholder="e.g. %"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Add Metric
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Recent Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/30">
                                    <th className="pb-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                                    <th className="pb-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Team</th>
                                    <th className="pb-4 text-left text-sm font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                                    <th className="pb-4 text-right text-sm font-semibold text-muted-foreground uppercase tracking-wider">Value</th>
                                    <th className="pb-4 text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">Source</th>
                                    <th className="pb-4 text-right text-sm font-semibold text-muted-foreground uppercase tracking-wider pr-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayMetrics.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                            No metrics found. Add one to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    displayMetrics.map((metric: any) => (
                                        <tr key={metric.id} className="border-b border-border/20 last:border-0 hover:bg-accent/30 group transition-colors">
                                            <td className="py-4 text-sm text-muted-foreground">
                                                {formatDate(metric.timestamp || metric.time)}
                                            </td>
                                            <td className="py-4 text-sm font-semibold">
                                                {metric.team?.name || metric.teamName || 'N/A'}
                                            </td>
                                            <td className="py-4 text-sm">
                                                <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/5 text-primary font-medium px-3">
                                                    {METRIC_TYPES.find((t) => t.value === metric.metricType)?.label || metric.metricType}
                                                </Badge>
                                            </td>
                                            <td className="py-4 text-right text-sm font-bold">
                                                {formatNumber(metric.value, 1)} <span className="text-muted-foreground font-normal">{metric.unit}</span>
                                            </td>
                                            <td className="py-4 text-center">
                                                <Badge variant="secondary" className="text-xs rounded-full px-3 bg-secondary/50">
                                                    {metric.source}
                                                </Badge>
                                            </td>
                                            <td className="py-4 text-right pr-4">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-all bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                                                    onClick={() => handleDelete(metric.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
