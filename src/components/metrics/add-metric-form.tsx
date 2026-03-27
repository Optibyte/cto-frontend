'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Plus, Loader2, Check, Target, Layers, Workflow, Info, Building2 } from 'lucide-react';
import { MetricDefinition } from '@/lib/types';
import { getNextMetricId } from '@/lib/mock-data/learning-metrics';
import { useMemo } from 'react';
import { METRIC_CLASSES, UPDATE_FREQUENCIES } from '@/lib/constants';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { useMetricDefinitions, useCreateMetricDefinition, useDeleteMetricDefinition } from '@/hooks/use-metric-definitions';
import { toast } from 'sonner';
import { MEMBERS_WITH_METRICS } from '@/lib/mock-data/metrics-data';
import { User } from 'lucide-react';
import { useEmployees } from '@/hooks/use-employees';
import { TeamMemberFull } from '@/lib/types';

export function AddMetricForm() {
    const { data: hierarchy, isLoading: hierarchyLoading } = useOrgHierarchy();
    const { data: metrics = [], isLoading: metricsLoading } = useMetricDefinitions();
    const { data: liveEmployees = [], isLoading: employeesLoading } = useEmployees();
    const createMetricMutation = useCreateMetricDefinition();
    const deleteMetricMutation = useDeleteMetricDefinition();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        accountId: '',
        marketName: '',
        projectId: '',
        metricClass: '' as string,
        threshold: '',
        updateFrequency: 'weekly' as string,
        rangeMin: '0',
        rangeMax: '100',
    });

    // Simplified Project mapping — extract all unique projects from hierarchy
    const availableProjects = useMemo(() => {
        const projectsMap = new Map();
        hierarchy?.markets.forEach(m => {
            m.accounts?.forEach(acc => {
                acc.teams?.forEach(t => {
                    if (t.project) {
                        projectsMap.set(t.project.id, {
                            id: t.project.id,
                            name: t.project.name,
                            accountId: acc.id,
                            accountName: acc.name,
                            marketName: m.name
                        });
                    }
                });
            });
        });
        return Array.from(projectsMap.values());
    }, [hierarchy]);

    const handleProjectChange = (projectId: string) => {
        const project = availableProjects.find(p => p.id === projectId);
        if (project) {
            setFormData({
                ...formData,
                projectId: project.id,
                accountId: project.accountId,
                marketName: project.marketName,
            });
        }
    };

    const uniqueMembers = []; // Not used in this simplified view

    const nextId = getNextMetricId(metrics);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.projectId || !formData.metricClass) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const project = availableProjects.find(p => p.id === formData.projectId);

            const payload = {
                name: formData.name,
                metricType: formData.name.toLowerCase().replace(/\s+/g, '_'),
                metricClass: formData.metricClass,
                threshold: parseFloat(formData.threshold) || 0,
                updateFrequency: formData.updateFrequency,
                rangeMin: parseFloat(formData.rangeMin) || 0,
                rangeMax: parseFloat(formData.rangeMax) || 100,
                accountId: formData.accountId,
                accountName: project?.accountName || '',
                marketName: formData.marketName,
                projectId: formData.projectId,
                projectName: project?.name || '',
            };

            await createMetricMutation.mutateAsync(payload);

            setFormData({
                name: '', accountId: '', marketName: '', projectId: '',
                metricClass: '', threshold: '', updateFrequency: 'weekly', rangeMin: '0', rangeMax: '100',
            });
            toast.success(`Metric "${payload.name}" created successfully`);
        } catch (error) {
            console.error('Failed to create metric', error);
            toast.error('Failed to create metric. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const classColors: Record<string, string> = {
        A: 'bg-rose-500/10 text-rose-500 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
        B: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
        C: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Form Section */}
            <Card className="border-border/50 shadow-2xl bg-card/50 backdrop-blur-xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                <CardHeader className="relative z-10 border-b border-border/10 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                            <Plus className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Define New Metric</CardTitle>
                            <CardDescription>Configure measurement parameters and organizational scope</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-8 relative z-10">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Scope Selection */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary/70">
                                <Layers className="h-4 w-4" />
                                Organizational Scope
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider opacity-60">Target Project *</Label>
                                    <Select 
                                        value={formData.projectId} 
                                        onValueChange={handleProjectChange}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:ring-primary/20 transition-all">
                                            <SelectValue placeholder={hierarchyLoading ? "Loading system hierarchy..." : "Select target project"} />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/50 bg-card/95 backdrop-blur-xl max-h-[300px]">
                                            {availableProjects.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    <div className="flex flex-col py-0.5">
                                                        <span className="font-black text-sm">{p.name}</span>
                                                        <span className="text-[9px] uppercase tracking-tighter text-muted-foreground font-bold">
                                                            {p.marketName} · {p.accountName}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formData.projectId && (
                                        <p className="text-[10px] text-primary/70 font-bold px-2 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2 lg:duration-500">
                                            <Building2 className="h-2.5 w-2.5" />
                                            Associated with {availableProjects.find(p => p.id === formData.projectId)?.accountName}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Metric Identity */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary/70">
                                <Target className="h-4 w-4" />
                                Metric Identity
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Metric Name *</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Code Review Velocity"
                                        className="rounded-xl border-border/50 h-11 focus:border-primary/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Configuration */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary/70">
                                <Workflow className="h-4 w-4" />
                                Technical Configuration
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Priority Class *</Label>
                                    <Select value={formData.metricClass} onValueChange={(v) => setFormData({ ...formData, metricClass: v })}>
                                        <SelectTrigger className="rounded-xl border-border/50"><SelectValue placeholder="Class" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {METRIC_CLASSES.map((c) => (
                                                <SelectItem key={c.value} value={c.value}>
                                                    <span className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${c.value === 'A' ? 'bg-rose-500' : c.value === 'B' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                        {c.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Target Threshold</Label>
                                    <Input
                                        type="number"
                                        value={formData.threshold}
                                        onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                                        placeholder="e.g. 80"
                                        className="rounded-xl border-border/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Frequency</Label>
                                    <Select value={formData.updateFrequency} onValueChange={(v) => setFormData({ ...formData, updateFrequency: v })}>
                                        <SelectTrigger className="rounded-xl border-border/50"><SelectValue placeholder="Frequency" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {UPDATE_FREQUENCIES.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-border/10">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-primary/70 transition-colors">
                                <Info className="h-4 w-4" />
                                * Indicators are required for baseline analysis
                            </div>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-2xl h-11 px-10 shadow-lg shadow-primary/20 bg-primary hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
                            >
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                Initialize Metric
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* List Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-lg font-bold">Recently Defined Metrics</h3>
                    <Badge variant="secondary" className="rounded-full px-3">
                        {metricsLoading ? '...' : metrics.length} Definitions
                    </Badge>
                </div>
                <div className="grid gap-4">
                    {metricsLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                        </div>
                    ) : metrics.length === 0 ? (
                        <div className="text-center p-8 border border-dashed border-border/50 rounded-2xl bg-muted/5">
                            <p className="text-sm text-muted-foreground">No metrics created yet. Use the form above to get started.</p>
                        </div>
                    ) : (
                        (() => {
                            const items = metrics.filter((m: any) => !formData.projectId || m.projectId === formData.projectId);
                            const seen = new Set();
                            return items.filter((m: any) => {
                                const id = m.metricType || m.id;
                                if (seen.has(id)) return false;
                                seen.add(id);
                                return true;
                            });
                        })().map((m: MetricDefinition) => (
                            <Card key={m.id} className="border-border/40 bg-card/30 backdrop-blur-sm hover:border-primary/30 transition-all group">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center font-mono text-xs font-bold text-primary group-hover:bg-primary/10 transition-colors">
                                            {m.id.split('-').pop()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-sm tracking-tight">{m.name}</p>
                                                <Badge variant="outline" className={`${classColors[m.metricClass]} text-[10px] h-4 px-1.5 rounded-sm border-0 font-extrabold`}>
                                                    CLASS {m.metricClass}
                                                </Badge>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">
                                                {(m as any).accountName || m.account} {((m as any).marketName || m.market) ? `· ${(m as any).marketName || m.market}` : ''} {((m as any).projectName || m.project) ? `· ${(m as any).projectName || m.project}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Goal</p>
                                            <p className="text-sm font-extrabold">{m.threshold}%</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Cycle</p>
                                            <p className="text-sm font-medium capitalize">{m.updateFrequency}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => deleteMetricMutation.mutate(m.id)}
                                        >
                                            <Plus className="h-4 w-4 rotate-45" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
