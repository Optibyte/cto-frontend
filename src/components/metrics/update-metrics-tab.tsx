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
import { Save, Filter, RefreshCw, Search, ArrowUpDown, History, TrendingUp, Target } from 'lucide-react';
import { MetricDefinition } from '@/lib/types';
import { mockMetricDefinitions } from '@/lib/mock-data/learning-metrics';
import { MOCK_ACCOUNTS, MOCK_MARKETS, MOCK_PRODUCTS } from '@/lib/constants';
import { toast } from 'sonner';

const MOCK_TEAMS = [
    { id: 'team-1', name: 'Alpha Team' },
    { id: 'team-2', name: 'Beta Force' },
    { id: 'team-3', name: 'Gamma Squad' },
    { id: 'team-4', name: 'Delta Unit' },
    { id: 'team-5', name: 'Epsilon Group' },
];

const MOCK_MEMBERS = [
    { id: 'mem-1', name: 'Alice Johnson' },
    { id: 'mem-2', name: 'Bob Smith' },
    { id: 'mem-3', name: 'Charlie Brown' },
    { id: 'mem-4', name: 'Diana Prince' },
    { id: 'mem-5', name: 'Edward Kim' },
];

export function UpdateMetricsTab() {
    const [filters, setFilters] = useState({
        account: '',
        market: '',
        product: '',
        team: '',
        member: '',
    });
    const [metricValues, setMetricValues] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter metrics based on selected filters and search query
    const filteredMetrics = mockMetricDefinitions.filter((m) => {
        if (filters.account && m.account !== filters.account) return false;
        if (filters.market && m.market !== filters.market) return false;
        if (filters.product && m.project !== filters.product) return false;
        if (filters.team && m.team !== filters.team) return false;
        if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const handleValueChange = (metricId: string, value: string) => {
        setMetricValues({ ...metricValues, [metricId]: value });
    };

    const handleSave = () => {
        const updatedEntries = Object.keys(metricValues).filter(k => metricValues[k]);
        if (updatedEntries.length === 0) {
            toast.error('No values entered to save');
            return;
        }
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success(`Succesfully recorded ${updatedEntries.length} metric updates`);
            setMetricValues({});
        }, 1200);
    };

    const handleReset = () => {
        setFilters({ account: '', market: '', product: '', team: '', member: '' });
        setMetricValues({});
        setSearchQuery('');
    };

    const classColors: Record<string, string> = {
        A: 'bg-rose-500/10 text-rose-500 border-rose-500/30 font-bold',
        B: 'bg-amber-500/10 text-amber-500 border-amber-500/30 font-bold',
        C: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-bold',
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Control Panel */}
            <Card className="border-border/50 shadow-xl bg-card/40 backdrop-blur-md overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
                <CardHeader className="pb-4 border-b border-border/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Filter className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold">Data Capture Workbench</CardTitle>
                                <CardDescription>Filter across the organization to input periodic metric values</CardDescription>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs h-8 rounded-lg gap-2 hover:bg-primary/5 hover:text-primary">
                            <RefreshCw className="h-3.5 w-3.5" />
                            Clear Workspace
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Account</Label>
                            <Select value={filters.account} onValueChange={(v) => setFilters({ ...filters, account: v })}>
                                <SelectTrigger className="rounded-xl border-border/50 h-10 bg-background/50"><SelectValue placeholder="All Accounts" /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {MOCK_ACCOUNTS.map((a) => <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Market</Label>
                            <Select value={filters.market} onValueChange={(v) => setFilters({ ...filters, market: v })}>
                                <SelectTrigger className="rounded-xl border-border/50 h-10 bg-background/50"><SelectValue placeholder="All Markets" /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {MOCK_MARKETS.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Product</Label>
                            <Select value={filters.product} onValueChange={(v) => setFilters({ ...filters, product: v })}>
                                <SelectTrigger className="rounded-xl border-border/50 h-10 bg-background/50"><SelectValue placeholder="All Products" /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {MOCK_PRODUCTS.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Team</Label>
                            <Select value={filters.team} onValueChange={(v) => setFilters({ ...filters, team: v })}>
                                <SelectTrigger className="rounded-xl border-border/50 h-10 bg-background/50"><SelectValue placeholder="All Teams" /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {MOCK_TEAMS.map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5 text-center flex flex-col justify-end">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name..."
                                    className="pl-9 rounded-xl border-border/50 h-10 bg-background/50"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Metrics Value Entry Table */}
            <Card className="border-border/50 shadow-2xl bg-card/60 backdrop-blur-xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 bg-primary/5">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Value Entry
                        </CardTitle>
                        <CardDescription>Filtering {filteredMetrics.length} metrics for current scope</CardDescription>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="rounded-xl px-8 shadow-lg shadow-primary/20 bg-primary hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
                    >
                        {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Commit Changes
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredMetrics.length === 0 ? (
                        <div className="text-center py-20 px-6">
                            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                                <Filter className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">No metrics found</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">Try broadening your organization filters or check your search query.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/10 bg-muted/20">
                                        <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reference</th>
                                        <th className="text-left py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Metric Configuration</th>
                                        <th className="text-left py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Status</th>
                                        <th className="text-left py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current State</th>
                                        <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground min-w-[200px]">New Input Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMetrics.map((m) => (
                                        <tr key={m.id} className="border-b border-border/10 hover:bg-primary/5 transition-all duration-300 group">
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-[11px] font-extrabold text-primary mb-1">{m.id}</span>
                                                    <span className="text-[10px] font-bold uppercase text-muted-foreground">{m.account}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm group-hover:text-primary transition-colors">{m.name}</span>
                                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                                                        <History className="h-3 w-3" />
                                                        Update {m.updateFrequency}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Badge variant="outline" className={`${classColors[m.metricClass]} rounded-lg px-2.5 py-0.5 text-[10px]`}>
                                                    CL-{m.metricClass}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <Target className="h-3 w-3 text-primary/60" />
                                                        <span className="text-xs font-extrabold">{m.threshold}%</span>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground mt-0.5">Range: {m.rangeMin} – {m.rangeMax}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="relative group/input">
                                                    <Input
                                                        type="number"
                                                        value={metricValues[m.id] || ''}
                                                        onChange={(e) => handleValueChange(m.id, e.target.value)}
                                                        placeholder="Enter new value"
                                                        className="rounded-xl border-border/50 h-10 bg-background/40 focus:bg-background focus:ring-primary/20 transition-all text-sm font-semibold"
                                                    />
                                                    <div className="absolute right-3 top-2.5 opacity-0 group-focus-within/input:opacity-100 transition-opacity">
                                                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
