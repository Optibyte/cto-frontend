'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Plus, Loader2, Target, Layers, Calculator, Info, Code } from 'lucide-react';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { useMetricDefinitions, useCreateMetricDefinition, useDeleteMetricDefinition } from '@/hooks/use-metric-definitions';
import { toast } from 'sonner';
import { MetricDefinition } from '@/lib/types';
import { METRIC_CLASSES } from '@/lib/constants';

export function AddFormulaMetricForm() {
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
        metricClass: 'A' as string,
        threshold: '',
        formula: '',
        uom: '%',
    });

    const markets = hierarchy?.markets || [];
    const accounts = markets.flatMap(m => (m.accounts || []).map(acc => ({ ...acc, marketName: m.name })));
    const selectedAccountObj = accounts.find(a => a.id === formData.accountId);
    const availableMarkets = selectedAccountObj ? [selectedAccountObj.marketName] : [];
    
    const projectsMap = new Map();
    selectedAccountObj?.teams.forEach(t => {
        if (t.project) {
            projectsMap.set(t.project.id, t.project.name);
        }
    });
    const availableProjects = Array.from(projectsMap.entries()).map(([id, name]) => ({ id, name }));

    const handleAccountChange = (accountId: string) => {
        const acc = accounts.find(a => a.id === accountId);
        setFormData({
            ...formData,
            accountId: accountId,
            marketName: acc?.marketName || '',
            projectId: '',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.accountId || !formData.formula) {
            toast.error('Please fill in name, account, and formula');
            return;
        }

        setIsSubmitting(true);
        try {
            const selectedAccount = accounts.find(a => a.id === formData.accountId);
            const selectedProject = availableProjects.find(p => p.id === formData.projectId);

            const payload = {
                name: formData.name,
                metricType: formData.name.toLowerCase().replace(/\s+/g, '_'),
                metricClass: formData.metricClass,
                threshold: parseFloat(formData.threshold) || 0,
                updateFrequency: 'computed',
                rangeMin: 0,
                rangeMax: 100,
                accountId: formData.accountId,
                accountName: selectedAccount?.name || '',
                marketName: formData.marketName,
                projectId: formData.projectId,
                projectName: selectedProject?.name || '',
                formula: formData.formula,
                uom: formData.uom,
                indicator: 'Higher is better',
            };

            await createMetricMutation.mutateAsync(payload);

            setFormData({
                name: '', accountId: '', marketName: '', projectId: '',
                metricClass: 'A', threshold: '', formula: '', uom: '%',
            });
            toast.success(`Formula metric "${payload.name}" created successfully`);
        } catch (error) {
            console.error('Failed to create metric', error);
            toast.error('Failed to create metric. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formulaMetrics = metrics.filter((m: MetricDefinition) => m.formula || (m.updateFrequency as string) === 'computed');

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <Card className="border-border/50 shadow-2xl bg-card/50 backdrop-blur-xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent pointer-events-none" />
                <CardHeader className="relative z-10 border-b border-border/10 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-violet-500/10 text-violet-500">
                            <Calculator className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">New Formula Metric</CardTitle>
                            <CardDescription>Define a metric derived from other data points via a formula</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-8 relative z-10">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Scope Selection */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-violet-500/70">
                                <Layers className="h-4 w-4" />
                                Organizational Scope
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Account *</Label>
                                    <Select value={formData.accountId} onValueChange={handleAccountChange}>
                                        <SelectTrigger className="rounded-xl border-border/50">
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
                                        onValueChange={(v) => setFormData({ ...formData, projectId: v })}
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
                            </div>
                        </div>

                        {/* Metric Identity & Formula */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-violet-500/70">
                                <Target className="h-4 w-4" />
                                Metric Configuration
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Metric Name *</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Weighted Quality Score"
                                        className="rounded-xl border-border/50 h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Unit (UoM)</Label>
                                    <Input
                                        value={formData.uom}
                                        onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                                        placeholder="e.g. %, index, points"
                                        className="rounded-xl border-border/50 h-11"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold flex items-center gap-2">
                                    <Code className="h-3.5 w-3.5" />
                                    Formula *
                                </Label>
                                <div className="relative">
                                    <Input
                                        value={formData.formula}
                                        onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                                        placeholder="(Metric_A * 0.7) + (Metric_B * 0.3)"
                                        className="rounded-xl border-border/50 h-12 font-mono text-sm bg-muted/20 pl-4"
                                    />
                                    <div className="mt-2 p-3 rounded-lg bg-violet-500/5 border border-violet-500/10 flex items-start gap-2">
                                        <Info className="h-4 w-4 text-violet-500 mt-0.5" />
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            Use clear metric names or identifiers in your formula. Example: 
                                            <code className="mx-1 text-violet-600 bg-violet-500/10 px-1 rounded">(code_quality + performance_index) / 2</code>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Threshold */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Priority Class</Label>
                                <Select value={formData.metricClass} onValueChange={(v) => setFormData({ ...formData, metricClass: v })}>
                                    <SelectTrigger className="rounded-xl border-border/50"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {METRIC_CLASSES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Target Threshold ({formData.uom})</Label>
                                <Input
                                    type="number"
                                    value={formData.threshold}
                                    onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                                    placeholder="85"
                                    className="rounded-xl border-border/50"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end pt-6 border-t border-border/10">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-2xl h-11 px-10 shadow-lg shadow-violet-500/20 bg-violet-600 hover:bg-violet-700 hover:shadow-violet-500/40 transition-all"
                            >
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                Create Formula Metric
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* List Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold px-2">Existing Formula Definitions</h3>
                <div className="grid gap-3">
                    {metricsLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : formulaMetrics.length === 0 ? (
                        <div className="text-center p-8 border border-dashed rounded-2xl text-muted-foreground text-sm">
                            No formula metrics defined yet.
                        </div>
                    ) : (
                        formulaMetrics.map((m: MetricDefinition) => (
                            <Card key={m.id} className="border-border/40 bg-card/30 hover:border-violet-500/30 transition-all group overflow-hidden">
                                <CardContent className="p-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                            <Calculator className="h-4 w-4 text-violet-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-sm">{m.name}</p>
                                                <Badge variant="outline" className="text-[9px] h-4 bg-violet-500/5 text-violet-600 border-violet-500/20">
                                                    {m.uom || '%'}
                                                </Badge>
                                            </div>
                                            <p className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate max-w-[400px]">
                                                {m.formula}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive"
                                        onClick={() => deleteMetricMutation.mutate(m.id)}
                                    >
                                        <Plus className="h-4 w-4 rotate-45" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
