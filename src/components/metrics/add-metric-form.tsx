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
import { Plus, Loader2, Check, Hash, Target, Layers, Workflow, Info } from 'lucide-react';
import { MetricDefinition } from '@/lib/types';
import { mockMetricDefinitions, getNextMetricId } from '@/lib/mock-data/learning-metrics';
import { METRIC_CLASSES, UPDATE_FREQUENCIES, METRIC_DATA_TYPES, MOCK_ACCOUNTS, MOCK_MARKETS, MOCK_PRODUCTS } from '@/lib/constants';
import { toast } from 'sonner';

const MOCK_TEAMS = [
    { id: 'team-1', name: 'Alpha Team' },
    { id: 'team-2', name: 'Beta Force' },
    { id: 'team-3', name: 'Gamma Squad' },
    { id: 'team-4', name: 'Delta Unit' },
    { id: 'team-5', name: 'Epsilon Group' },
];

export function AddMetricForm() {
    const [metrics, setMetrics] = useState<MetricDefinition[]>(mockMetricDefinitions);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        account: '',
        market: '',
        project: '',
        team: '',
        metricClass: '' as string,
        threshold: '',
        updateFrequency: 'weekly' as string,
        rangeMin: '0',
        rangeMax: '100',
        dataType: 'number' as string,
    });

    const nextId = getNextMetricId(metrics);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.account || !formData.metricClass || !formData.dataType) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            const newMetric: MetricDefinition = {
                id: nextId,
                name: formData.name,
                metricClass: formData.metricClass as 'A' | 'B' | 'C',
                threshold: parseFloat(formData.threshold) || 0,
                updateFrequency: (formData.updateFrequency || 'daily') as 'daily' | 'weekly' | 'monthly',
                rangeMin: parseFloat(formData.rangeMin) || 0,
                rangeMax: parseFloat(formData.rangeMax) || 100,
                dataType: formData.dataType as any,
                account: formData.account,
                market: formData.market,
                project: formData.project,
                team: formData.team,
                createdAt: new Date(),
            };
            setMetrics([newMetric, ...metrics]);
            setFormData({
                name: '', account: '', market: '', project: '', team: '',
                metricClass: '', threshold: '', updateFrequency: 'weekly', rangeMin: '0', rangeMax: '100', dataType: 'number',
            });
            setIsSubmitting(false);
            toast.success(`Metric "${newMetric.name}" created successfully`);
        }, 1000);
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
                                    <Select value={formData.account} onValueChange={(v) => setFormData({ ...formData, account: v })}>
                                        <SelectTrigger className="rounded-xl border-border/50 focus:ring-primary/20"><SelectValue placeholder="Select account" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {MOCK_ACCOUNTS.map((a) => <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Market</Label>
                                    <Select value={formData.market} onValueChange={(v) => setFormData({ ...formData, market: v })}>
                                        <SelectTrigger className="rounded-xl border-border/50"><SelectValue placeholder="Select market" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {MOCK_MARKETS.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Project</Label>
                                    <Select value={formData.project} onValueChange={(v) => setFormData({ ...formData, project: v })}>
                                        <SelectTrigger className="rounded-xl border-border/50"><SelectValue placeholder="Select project" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {MOCK_PRODUCTS.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Team</Label>
                                    <Select value={formData.team} onValueChange={(v) => setFormData({ ...formData, team: v })}>
                                        <SelectTrigger className="rounded-xl border-border/50"><SelectValue placeholder="Select team" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {MOCK_TEAMS.map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-xs font-semibold">Metric Name *</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Code Review Velocity"
                                        className="rounded-xl border-border/50 h-11 focus:border-primary/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Metric ID (System Generated)</Label>
                                    <div className="h-11 flex items-center px-4 rounded-xl bg-primary/5 border border-primary/20 text-primary font-mono font-bold">
                                        <Hash className="h-4 w-4 mr-2 opacity-50" />
                                        {nextId}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Configuration */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary/70">
                                <Workflow className="h-4 w-4" />
                                Technical Configuration
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Data Type *</Label>
                                    <Select value={formData.dataType} onValueChange={(v) => setFormData({ ...formData, dataType: v })}>
                                        <SelectTrigger className="rounded-xl border-border/50"><SelectValue placeholder="Type" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {METRIC_DATA_TYPES.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
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
                    <Badge variant="secondary" className="rounded-full px-3">{metrics.length} Definitions</Badge>
                </div>
                <div className="grid gap-4">
                    {metrics.slice(0, 5).map((m) => (
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
                                            {m.account} {m.market ? `· ${m.market}` : ''} {m.team ? `· ${m.team}` : ''}
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
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Check className="h-4 w-4 text-emerald-500" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
