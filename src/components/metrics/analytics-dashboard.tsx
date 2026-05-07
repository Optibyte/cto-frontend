'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Maximize2, X, Activity, Layers, Zap, BarChart3, LayoutGrid, Download, Edit3, Check, Settings2, Plus, Trash2, Shield, Globe, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSprintAnalytics, useSprintMetrics, useMetrics } from '@/hooks/use-metrics';
import { Button } from '@/components/ui/button';
import { pivotData, newPlotConfig, X_AXIS_OPTIONS, METRICS_FIELDS, type PlotConfig } from './powerbi-engine';
import { PowerBIChart } from './powerbi-chart';
import { PlotEditorDialog } from './powerbi-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PDFReportGenerator } from './pdf-report-generator';

// Default starter plots
const STARTER_PLOTS: PlotConfig[] = [
    {
        id: 'starter-1', title: 'Velocity Trend (All Teams)', subtitle: 'Avg velocity across sprints',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'none', chartType: 'LineChart',
        metrics: [{ key: 'velocityPoints', agg: 'avg', color: '#8b5cf6', type: 'line' }], span: 1,
    },
    {
        id: 'starter-2', title: 'AI vs Traditional Quality', subtitle: 'Quality score comparison',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'aiEnabled', chartType: 'BarChart',
        metrics: [{ key: 'qualityScore', agg: 'avg', color: '#3b82f6', type: 'bar' }], span: 1,
    },
    {
        id: 'starter-3', title: 'Throughput by Market', subtitle: 'Total throughput per market',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'market', legend: 'none', chartType: 'BarChart',
        metrics: [{ key: 'throughputPoints', agg: 'sum', color: '#10b981', type: 'bar' }, { key: 'velocityPoints', agg: 'sum', color: '#f59e0b', type: 'bar' }], span: 1,
    },
    {
        id: 'starter-4', title: 'Manual Assessment Overview', subtitle: 'Average scores from manual audits',
        dataSource: 'manual_metrics', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'market', legend: 'none', chartType: 'BarChart',
        metrics: [{ key: 'value', agg: 'avg', color: '#f59e0b', type: 'bar' }], span: 1,
    },
    {
        id: 'starter-5', title: 'Sprint Velocity Stability', subtitle: 'Sum of velocity points by project',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'project', legend: 'none', chartType: 'AreaChart',
        metrics: [{ key: 'velocityPoints', agg: 'sum', color: '#ec4899', type: 'area' }], span: 1,
    },
];

function StatCard({ title, value, unit, icon, color }: any) {
    return (
        <Card className="rounded-[2rem] border-[1.5px] border-border/50 bg-background/50 backdrop-blur-2xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-500 group">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-5">
                    <div className={cn("p-2.5 rounded-2xl bg-muted/50 border border-border/50 shadow-inner group-hover:scale-110 transition-transform duration-500", color)}>{icon}</div>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground/60 mb-1.5">{title}</p>
                <div className="flex items-baseline gap-1">
                    <h4 className="text-3xl font-black tracking-tighter">{value}</h4>
                    {unit && <span className="text-sm font-bold text-muted-foreground/50">{unit}</span>}
                </div>
            </CardContent>
        </Card>
    );
}

export function AnalyticsDashboard({ filters, onFilterChange }: { filters: any; onFilterChange?: (key: any, value: string) => void }) {
    const { data: analytics, isLoading: isLoadingAnalytics } = useSprintAnalytics(filters);
    const { data: rawMetricsData, isLoading: isLoadingRaw } = useSprintMetrics(filters);
    const { data: manualMetricsData, isLoading: isLoadingManual } = useMetrics({ ...filters, source: 'manual' });

    const [editMode, setEditMode] = useState(false);
    const [plots, setPlots] = useState<PlotConfig[]>(STARTER_PLOTS);
    const [editingPlot, setEditingPlot] = useState<PlotConfig | null>(null);
    const [expandingPlot, setExpandingPlot] = useState<PlotConfig | null>(null);

    // Standard Analytics State
    const [showStandard, setShowStandard] = useState(true);
    const [standardMetric, setStandardMetric] = useState('throughputPoints');
    const [standardDim, setStandardDim] = useState('project');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isExpandOpen, setIsExpandOpen] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('powerbi_plots_v2');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length && parsed[0].scopeOrgs !== undefined) {
                    setPlots(parsed);
                }
            }
        } catch { }
    }, []);

    const savePlots = (next: PlotConfig[]) => {
        setPlots(next);
        localStorage.setItem('powerbi_plots_v2', JSON.stringify(next));
    };

    if (isLoadingAnalytics || isLoadingRaw || isLoadingManual) {
        return <div className="flex justify-center py-20 animate-pulse text-muted-foreground font-black tracking-widest uppercase">Loading BI Engine...</div>;
    }

    const rawData = Array.isArray(rawMetricsData) ? rawMetricsData : [];
    const manualData = Array.isArray(manualMetricsData) ? manualMetricsData : [];
    const maxSprint = rawData.length ? Math.max(...rawData.map((r: any) => r.sprintNumber || 1)) : 10;

    // Build Standard Plots
    const selectedMetric = METRICS_FIELDS.find(m => m.id === standardMetric) || METRICS_FIELDS[0];
    const trendConfig: PlotConfig = {
        id: 'std-trend', title: `${selectedMetric.label} Trend`, subtitle: 'Across all sprints',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, maxSprint], xAxis: 'sprintNumber', legend: 'none', chartType: 'LineChart',
        metrics: [{ key: standardMetric, agg: 'avg', color: '#8b5cf6', type: 'line' }], span: 1
    };
    const compConfig: PlotConfig = {
        id: 'std-comp', title: `${selectedMetric.label} by ${X_AXIS_OPTIONS.find(x => x.id === standardDim)?.label || 'Dimension'}`, subtitle: 'Current aggregate comparison',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, maxSprint], xAxis: standardDim, legend: 'none', chartType: 'BarChart',
        metrics: [{ key: standardMetric, agg: 'sum', color: '#3b82f6', type: 'bar' }], span: 1
    };
    const aiCompConfig: PlotConfig = {
        id: 'std-ai', title: `AI vs Traditional: ${selectedMetric.label}`, subtitle: 'Performance impact analysis',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, maxSprint], xAxis: 'sprintNumber', legend: 'aiEnabled', chartType: 'ComposedChart',
        metrics: [{ key: standardMetric, agg: 'avg', color: '#10b981', type: 'bar' }], span: 1
    };

    const standardPlots = [trendConfig, compConfig, aiCompConfig];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-10">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Avg Done to Said" value={`${Number((analytics?.kpi?.avgDoneToSaid || 0) > 1 ? analytics?.kpi?.avgDoneToSaid : (analytics?.kpi?.avgDoneToSaid || 0) * 100).toFixed(1)}%`} icon={<Activity className="h-5 w-5" />} color="text-emerald-500" />
                <StatCard title="Tech Debt Index" value={Number(analytics?.kpi?.avgTechDebt || 0).toFixed(2)} icon={<Layers className="h-5 w-5" />} color="text-amber-500" />
                <StatCard title="Project Landscape" value={analytics?.kpi?.totalProjectCount || analytics?.kpi?.projectCount || 0} icon={<Zap className="h-5 w-5" />} color="text-purple-500" />
                <StatCard title="Avg Throughput" value={Number(analytics?.kpi?.avgThroughput || 0).toFixed(1)} unit="Pts" icon={<BarChart3 className="h-5 w-5" />} color="text-blue-500" />
            </div>
            {/* Standard Analytics Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Standard Insights</h2>
                            <p className="text-xs text-muted-foreground">Pre-configured analytical perspectives</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={standardMetric} onValueChange={setStandardMetric}>
                            <SelectTrigger className="w-[180px] h-9 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm">
                                <SelectValue placeholder="Select Metric" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/50">
                                {METRICS_FIELDS.map(m => <SelectItem key={m.id} value={m.id} className="text-xs">{m.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={standardDim} onValueChange={setStandardDim}>
                            <SelectTrigger className="w-[150px] h-9 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm">
                                <SelectValue placeholder="Compare By" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/50">
                                {X_AXIS_OPTIONS.filter(o => o.id !== 'sprintNumber').map(o => <SelectItem key={o.id} value={o.id} className="text-xs">{o.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" onClick={() => setShowStandard(!showStandard)} className="rounded-xl text-xs font-bold uppercase tracking-wider">
                            {showStandard ? 'Collapse' : 'Expand Insights'}
                        </Button>
                    </div>
                </div>

                {showStandard && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500 pb-4">
                        {standardPlots.map(plot => (
                            <div key={plot.id} className="relative group transition-all duration-300">
                                <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Button size="icon" variant="secondary" className="h-7 w-7 rounded-lg shadow-md bg-background/80 backdrop-blur-sm" onClick={() => { setExpandingPlot(plot); setIsExpandOpen(true); }}><Maximize2 className="w-3.5 h-3.5" /></Button>
                                </div>
                                <Card className="h-full rounded-[2rem] border-border/50 bg-background/50 backdrop-blur-2xl shadow-xl overflow-hidden hover:border-primary/20 transition-colors">
                                    <CardHeader className="p-6 pb-2 text-center sm:text-left">
                                        <CardTitle className="text-lg font-black tracking-tight">{plot.title}</CardTitle>
                                        <CardDescription className="text-[10px] font-medium opacity-70">{plot.subtitle}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-2 h-[300px]">
                                        <PowerBIChart data={pivotData(rawData, plot)} config={plot} />
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="border-t border-border/10 pt-2" />

            {/* BI Canvas Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white/50 dark:bg-black/20 border border-border/50 backdrop-blur-xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600"><LayoutGrid className="w-5 h-5" /></div>
                    <div>
                        <h2 className="text-lg font-black tracking-tight leading-none">Power BI Canvas</h2>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Fully customizable — scope any hierarchy, plot any metric, compare anything</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setEditMode(!editMode)} className={cn("rounded-xl font-bold text-xs transition-all", editMode ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "")}>
                        {editMode ? <><Check className="w-4 h-4 mr-1.5" /> Done</> : <><Edit3 className="w-4 h-4 mr-1.5" /> Edit</>}
                    </Button>
                    {!editMode && (
                        <Button variant="outline" className="rounded-xl font-bold text-xs" onClick={() => (window as any).generatePDFReport?.()}>
                            <FileText className="w-4 h-4 mr-1.5" /> Export PDF
                        </Button>
                    )}
                    {editMode && (
                        <Button onClick={() => { setEditingPlot(newPlotConfig(maxSprint)); setIsDialogOpen(true); }} className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 font-bold text-xs">
                            <Plus className="h-4 w-4 mr-1.5" /> Add Plot
                        </Button>
                    )}
                </div>
            </div>

            {/* Plot Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {plots.map(plot => {
                    const chartData = pivotData(plot.dataSource === 'manual_metrics' ? manualData : rawData, plot);
                    const xLabel = X_AXIS_OPTIONS.find(o => o.id === plot.xAxis)?.label || plot.xAxis;
                    const scopeParts: string[] = [];
                    if (plot.scopeOrgs.length) scopeParts.push(`Org: ${plot.scopeOrgs.join(', ')}`);
                    if (plot.scopeMarkets.length) scopeParts.push(`Mkt: ${plot.scopeMarkets.join(', ')}`);
                    if (plot.scopeAccounts.length) scopeParts.push(`Acc: ${plot.scopeAccounts.join(', ')}`);
                    if (plot.scopeProjects.length) scopeParts.push(`Proj: ${plot.scopeProjects.join(', ')}`);
                    if (plot.scopeTeams.length) scopeParts.push(`Team: ${plot.scopeTeams.join(', ')}`);
                    const scopeLabel = scopeParts.length ? scopeParts.join(' › ') : 'All Data';

                    return (
                        <div key={plot.id} id={`plot-card-${plot.id}`} className={cn("relative group transition-all duration-300", plot.span === 2 ? 'lg:col-span-2' : plot.span === 3 ? 'lg:col-span-3' : '')}>
                            {editMode && (
                                <div className="absolute top-3 right-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="secondary" className="h-7 w-7 rounded-lg shadow-md" onClick={() => { setExpandingPlot(plot); setIsExpandOpen(true); }}><Maximize2 className="w-3.5 h-3.5" /></Button>
                                    {!plot.id.startsWith('starter-') && (
                                        <>
                                            <Button size="icon" variant="secondary" className="h-7 w-7 rounded-lg shadow-md" onClick={() => { setEditingPlot(plot); setIsDialogOpen(true); }}><Settings2 className="w-3.5 h-3.5" /></Button>
                                            <Button size="icon" variant="destructive" className="h-7 w-7 rounded-lg shadow-md" onClick={() => savePlots(plots.filter(p => p.id !== plot.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                                        </>
                                    )}
                                </div>
                            )}
                            {!editMode && (
                                <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="secondary" className="h-7 w-7 rounded-lg shadow-md bg-background/80 backdrop-blur-sm" onClick={() => { setExpandingPlot(plot); setIsExpandOpen(true); }}><Maximize2 className="w-3.5 h-3.5" /></Button>
                                </div>
                            )}
                            <Card className={cn(
                                "h-full rounded-[2rem] border-[1.5px] shadow-xl overflow-hidden transition-all duration-300 relative",
                                plot.dataSource === 'manual_metrics' 
                                    ? "border-amber-500/40 bg-amber-500/[0.04] border-dashed shadow-amber-500/5" 
                                    : "border-border/50 bg-background/50 backdrop-blur-2xl",
                                editMode && "ring-1 ring-violet-500/20"
                            )}>
                                {plot.dataSource === 'manual_metrics' && (
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0 z-20" />
                                )}
                                <CardHeader className="p-6 pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-0.5 min-w-0">
                                            <CardTitle className="text-lg font-black tracking-tight truncate flex items-center gap-2">
                                                {plot.dataSource === 'manual_metrics' && <Activity className="h-4 w-4 text-amber-500" />}
                                                {plot.title || 'Untitled Plot'}
                                            </CardTitle>
                                            {plot.subtitle && <CardDescription className="text-[10px] font-medium truncate">{plot.subtitle}</CardDescription>}
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <Badge variant={plot.dataSource === 'manual_metrics' ? 'secondary' : 'outline'} className={cn("text-[8px] font-black rounded-full px-2 py-0.5 uppercase tracking-tighter", plot.dataSource === 'manual_metrics' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "")}>
                                                {plot.dataSource === 'manual_metrics' ? 'Manual Assessment' : 'Sprint Data'}
                                            </Badge>
                                            <Badge variant="outline" className="text-[8px] font-bold rounded-full px-2 py-0.5">{xLabel}</Badge>
                                            {plot.legend !== 'none' && <Badge variant="secondary" className="text-[8px] font-bold rounded-full px-2 py-0.5">By: {X_AXIS_OPTIONS.find(o => o.id === plot.legend)?.label}</Badge>}
                                        </div>
                                    </div>
                                    <p className="text-[8px] font-medium text-muted-foreground/60 truncate mt-1" title={scopeLabel}>📊 {scopeLabel}{plot.aiFilter !== 'all' ? ` • ${plot.aiFilter.toUpperCase()}` : ''}</p>
                                </CardHeader>
                                <CardContent className="p-5 pt-2 h-[350px]">
                                    <PowerBIChart data={chartData} config={plot} />
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
            </div>

            {/* Editor Dialog */}
            {isDialogOpen && editingPlot && (
                <PlotEditorDialog
                    isOpen={isDialogOpen}
                    onClose={() => { setIsDialogOpen(false); setEditingPlot(null); }}
                    plot={editingPlot}
                    maxSprint={maxSprint}
                    rawData={rawData}
                    onSave={(p) => {
                        if (plots.find(x => x.id === p.id)) savePlots(plots.map(x => x.id === p.id ? p : x));
                        else savePlots([...plots, p]);
                        setIsDialogOpen(false);
                        setEditingPlot(null);
                        toast.success(`Plot "${p.title}" saved`);
                    }}
                />
            )}

            {/* Expansion Dialog */}
            <Dialog open={isExpandOpen} onOpenChange={setIsExpandOpen}>
                <DialogContent className="sm:max-w-[95vw] sm:max-h-[95vh] h-[90vh] p-0 rounded-[2.5rem] border-border/50 bg-background/95 backdrop-blur-3xl overflow-hidden flex flex-col">
                    {expandingPlot && (
                        <>
                            <div className="p-8 border-b border-border/10 flex items-center justify-between bg-muted/5">
                                <div>
                                    <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                        {expandingPlot.dataSource === 'manual_metrics' && <Activity className="h-6 w-6 text-amber-500" />}
                                        {expandingPlot.title || 'Untitled Plot'}
                                    </DialogTitle>
                                    <DialogDescription className="text-sm text-muted-foreground font-medium">{expandingPlot.subtitle}</DialogDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant={expandingPlot.dataSource === 'manual_metrics' ? 'secondary' : 'outline'} className={cn("rounded-full px-3 py-1 font-black uppercase text-[10px]", expandingPlot.dataSource === 'manual_metrics' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "")}>
                                        {expandingPlot.dataSource === 'manual_metrics' ? 'Manual Assessment' : 'Sprint Data'}
                                    </Badge>
                                    <Button variant="ghost" size="icon" onClick={() => setIsExpandOpen(false)} className="rounded-full h-10 w-10"><X className="h-5 w-5" /></Button>
                                </div>
                            </div>
                            <div className="flex-1 p-10">
                                <PowerBIChart
                                    data={pivotData(expandingPlot.dataSource === 'manual_metrics' ? manualData : rawData, expandingPlot)}
                                    config={expandingPlot}
                                />
                            </div>
                            <div className="p-6 border-t border-border/10 bg-muted/5 flex items-center justify-center gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-violet-500" /> Multi-Source Engine</div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Interactive BI Canvas</div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Real-time Sync</div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* PDF Engine */}
            <PDFReportGenerator
                analytics={analytics}
                plots={plots}
                filters={filters}
            />
        </div>
    );
}
