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
import { Plus, Loader2, Check, Target, Layers, Workflow, Info } from 'lucide-react';
import { MetricDefinition } from '@/lib/types';
import { getNextMetricId } from '@/lib/mock-data/learning-metrics';
import { METRIC_CLASSES, UPDATE_FREQUENCIES } from '@/lib/constants';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { useMetricDefinitions, useCreateMetricDefinition, useDeleteMetricDefinition } from '@/hooks/use-metric-definitions';
import { toast } from 'sonner';

export function AddMetricForm() {
    const { data: hierarchy, isLoading: hierarchyLoading } = useOrgHierarchy();
    const { data: metrics = [], isLoading: metricsLoading } = useMetricDefinitions();
    const createMetricMutation = useCreateMetricDefinition();
    const deleteMetricMutation = useDeleteMetricDefinition();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        accountId: '',
        marketName: '',
        projectId: '',
        teamId: '',
        metricClass: '' as string,
        threshold: '',
        updateFrequency: 'weekly' as string,
        rangeMin: '0',
        rangeMax: '100',
    });

    // Extract available entities from hierarchy
    const markets = hierarchy?.markets || [];
    const accounts = markets.flatMap(m => (m.accounts || []).map(acc => ({ ...acc, marketName: m.name })));

    // Filtered lists based on selection
    const selectedAccountObj = accounts.find(a => a.id === formData.accountId);

    const availableMarkets = selectedAccountObj ? [selectedAccountObj.marketName] : [];

    // Projects are extracted from teams within the selected account
    // We group by project ID/Name to unique list
    const projectsMap = new Map();
    selectedAccountObj?.teams.forEach(t => {
        if (t.project) {
            projectsMap.set(t.project.id, t.project.name);
        }
    });
    const availableProjects = Array.from(projectsMap.entries()).map(([id, name]) => ({ id, name }));

    const availableTeams = selectedAccountObj
        ? selectedAccountObj.teams
            .filter(t => !formData.projectId || t.projectId === formData.projectId)
        : [];

    // Handle account change - reset children
    const handleAccountChange = (accountId: string) => {
        const acc = accounts.find(a => a.id === accountId);
        setFormData({
            ...formData,
            accountId: accountId,
            marketName: acc?.marketName || '',
            projectId: '',
            teamId: '',
        });
    };

    const nextId = getNextMetricId(metrics);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.accountId || !formData.metricClass) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const selectedAccount = accounts.find(a => a.id === formData.accountId);
            const selectedProject = selectedAccount?.teams.find(t => t.projectId === formData.projectId)?.project;
            const selectedTeam = selectedAccount?.teams.find(t => t.id === formData.teamId);

            const payload = {
                name: formData.name,
                metricType: '',
                metricClass: formData.metricClass,
                threshold: parseFloat(formData.threshold) || 0,
                updateFrequency: formData.updateFrequency,
                rangeMin: parseFloat(formData.rangeMin) || 0,
                rangeMax: parseFloat(formData.rangeMax) || 100,
                accountId: formData.accountId,
                accountName: selectedAccount?.name || '',
                marketName: formData.marketName,
                projectId: formData.projectId,
                projectName: selectedProject?.name || '',
                teamId: formData.teamId,
                teamName: selectedTeam?.name || '',
            };

            await createMetricMutation.mutateAsync(payload);

            setFormData({
                name: '', accountId: '', marketName: '', projectId: '', teamId: '',
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
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Account *</Label>
                                    <Select value={formData.accountId} onValueChange={handleAccountChange}>
                                        <SelectTrigger className="rounded-xl border-border/50 focus:ring-primary/20">
                                            <SelectValue placeholder={hierarchyLoading ? "Loading..." : "Select account"} />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Market</Label>
                                    <Select
                                        value={formData.marketName}
                                        onValueChange={(v) => setFormData({ ...formData, marketName: v })}
                                        disabled={!formData.accountId}
                                    >
                                        <SelectTrigger className="rounded-xl border-border/50">
                                            <SelectValue placeholder={formData.accountId ? "Select market" : "Select account first"} />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {availableMarkets.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Project</Label>
                                    <Select
                                        value={formData.projectId}
                                        onValueChange={(v) => setFormData({ ...formData, projectId: v, teamId: '' })}
                                        disabled={!formData.accountId}
                                    >
                                        <SelectTrigger className="rounded-xl border-border/50">
                                            <SelectValue placeholder={formData.accountId ? "Select project" : "Select account first"} />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {availableProjects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Team</Label>
                                    <Select
                                        value={formData.teamId}
                                        onValueChange={(v) => setFormData({ ...formData, teamId: v })}
                                        disabled={!formData.accountId}
                                    >
                                        <SelectTrigger className="rounded-xl border-border/50">
                                            <SelectValue placeholder={formData.accountId ? "Select team" : "Select account first"} />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {availableTeams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
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
                        metrics.map((m: MetricDefinition) => (
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
                                                {(m as any).accountName || m.account} {((m as any).marketName || m.market) ? `· ${(m as any).marketName || m.market}` : ''} {((m as any).projectName || m.project) ? `· ${(m as any).projectName || m.project}` : ''} {((m as any).teamName || m.team) ? `· ${(m as any).teamName || m.team}` : ''}
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
