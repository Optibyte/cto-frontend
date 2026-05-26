'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState, useEffect, useMemo } from 'react';
import { Maximize2, X, Activity, Layers, Zap, BarChart3, LayoutGrid, Download, Edit3, Check, Settings2, Plus, Trash2, Shield, Globe, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSprintAnalytics, useSprintMetrics, useMetrics } from '@/hooks/use-metrics';
import { Button } from '@/components/ui/button';
import { pivotData, newPlotConfig, X_AXIS_OPTIONS, METRICS_FIELDS, type PlotConfig } from './powerbi-engine';
import { PowerBIChart } from './powerbi-chart';
import { PlotEditorDialog } from './powerbi-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PDFReportGenerator } from './pdf-report-generator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Default starter plots
const STARTER_PLOTS: PlotConfig[] = [
    {
        id: 'starter-1', title: 'Velocity Trend (Consolidated)', subtitle: 'Total velocity across sprints',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'none', chartType: 'LineChart',
        metrics: [{ key: 'velocityPoints', agg: 'sum', color: '#8b5cf6', type: 'line' }], span: 1,
    },
    {
        id: 'starter-2', title: 'Throughput Trend (Consolidated)', subtitle: 'Total throughput across sprints',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'none', chartType: 'LineChart',
        metrics: [{ key: 'throughputPoints', agg: 'sum', color: '#3b82f6', type: 'line' }], span: 1,
    },
    {
        id: 'starter-3', title: 'Quality Trend (Consolidated)', subtitle: 'Avg quality score across sprints',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'none', chartType: 'LineChart',
        metrics: [{ key: 'qualityScore', agg: 'avg', color: '#10b981', type: 'line' }], span: 1,
    },
    {
        id: 'starter-4', title: 'Done-to-Said Trend (Consolidated)', subtitle: 'Avg done-to-said ratio across sprints',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'none', chartType: 'LineChart',
        metrics: [{ key: 'doneToSaidRatio', agg: 'avg', color: '#f59e0b', type: 'line' }], span: 1,
    },
    {
        id: 'starter-5', title: 'Tech Debt Trend (Consolidated)', subtitle: 'Avg tech debt index across sprints',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'none', chartType: 'LineChart',
        metrics: [{ key: 'technicalDebtIndex', agg: 'avg', color: '#ec4899', type: 'line' }], span: 1,
    },
];

const AI_MONITOR_PLOTS: PlotConfig[] = [
    {
        id: 'ai-1', title: 'Velocity (AI vs Baseline)', subtitle: 'Average velocity comparison',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'aiBaseline', chartType: 'LineChart',
        metrics: [{ key: 'velocityPoints', agg: 'avg', color: '#3b82f6', type: 'line' }], span: 1,
    },
    {
        id: 'ai-2', title: 'Throughput (AI vs Baseline)', subtitle: 'Average throughput comparison',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'aiBaseline', chartType: 'LineChart',
        metrics: [{ key: 'throughputPoints', agg: 'avg', color: '#3b82f6', type: 'line' }], span: 1,
    },
    {
        id: 'ai-3', title: 'Quality (AI vs Baseline)', subtitle: 'Quality score comparison',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'aiBaseline', chartType: 'LineChart',
        metrics: [{ key: 'qualityScore', agg: 'avg', color: '#3b82f6', type: 'line' }], span: 1,
    },
    {
        id: 'ai-4', title: 'Done-to-Said (AI vs Baseline)', subtitle: 'Done-to-said ratio comparison',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'aiBaseline', chartType: 'LineChart',
        metrics: [{ key: 'doneToSaidRatio', agg: 'avg', color: '#3b82f6', type: 'line' }], span: 1,
    },
    {
        id: 'ai-5', title: 'Tech Debt (AI vs Baseline)', subtitle: 'Tech debt index comparison',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'aiBaseline', chartType: 'LineChart',
        metrics: [{ key: 'technicalDebtIndex', agg: 'avg', color: '#3b82f6', type: 'line' }], span: 1,
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

const KPI_METRIC_OPTIONS = [
    { value: 'avgDoneToSaid', label: 'Avg Done to Said', icon: Activity, defaultTitle: 'Avg Done to Said', unit: '%' },
    { value: 'avgTechDebt', label: 'Tech Debt Index', icon: Layers, defaultTitle: 'Tech Debt Index', unit: '' },
    { value: 'projectLandscape', label: 'Project Landscape', icon: Zap, defaultTitle: 'Project Landscape', unit: '' },
    { value: 'avgThroughput', label: 'Avg Throughput', icon: BarChart3, defaultTitle: 'Avg Throughput', unit: 'Pts' },
    { value: 'avgQuality', label: 'Avg Quality Score', icon: Check, defaultTitle: 'Avg Quality Score', unit: '%' },
    { value: 'avgVelocity', label: 'Avg Velocity', icon: Zap, defaultTitle: 'Avg Velocity', unit: 'Pts' },
    { value: 'sprintCount', label: 'Total Sprints', icon: LayoutGrid, defaultTitle: 'Total Sprints', unit: '' },
];

export function AnalyticsDashboard({ filters, onFilterChange }: { filters: any; onFilterChange?: (key: any, value: string) => void }) {
    const { data: analytics, isLoading: isLoadingAnalytics } = useSprintAnalytics(filters);
    const { data: rawMetricsData, isLoading: isLoadingRaw } = useSprintMetrics(filters);
    const { data: manualMetricsData, isLoading: isLoadingManual } = useMetrics({ ...filters, source: 'manual' });

    const [editMode, setEditMode] = useState(false);
    const [plots, setPlots] = useState<PlotConfig[]>(STARTER_PLOTS);
    const [aiPlots, setAiPlots] = useState<PlotConfig[]>(AI_MONITOR_PLOTS);
    const [editingPlot, setEditingPlot] = useState<PlotConfig | null>(null);
    const [expandingPlot, setExpandingPlot] = useState<PlotConfig | null>(null);

    // KPI Custom Cards configuration
    const [kpiCards, setKpiCards] = useState([
        { id: '1', metric: 'avgDoneToSaid', title: 'Avg Done to Said', color: 'text-emerald-500' },
        { id: '2', metric: 'avgTechDebt', title: 'Tech Debt Index', color: 'text-amber-500' },
        { id: '3', metric: 'projectLandscape', title: 'Project Landscape', color: 'text-purple-500' },
        { id: '4', metric: 'avgThroughput', title: 'Avg Throughput', color: 'text-blue-500' }
    ]);
    const [isKpiConfigOpen, setIsKpiConfigOpen] = useState(false);

    const getKpiValueAndUnit = (metric: string) => {
        switch (metric) {
            case 'avgDoneToSaid': {
                const raw = analytics?.kpi?.avgDoneToSaid || 0;
                const value = raw > 1 ? raw : raw * 100;
                return { value: `${value.toFixed(1)}%`, unit: '' };
            }
            case 'avgTechDebt':
                return { value: Number(analytics?.kpi?.avgTechDebt || 0).toFixed(2), unit: '' };
            case 'projectLandscape':
                return { value: String(analytics?.kpi?.totalProjectCount || analytics?.kpi?.projectCount || 0), unit: '' };
            case 'avgThroughput':
                return { value: Number(analytics?.kpi?.avgThroughput || 0).toFixed(1), unit: 'Pts' };
            case 'avgQuality':
                return { value: `${Number(analytics?.kpi?.avgQuality || 0).toFixed(1)}%`, unit: '' };
            case 'avgVelocity':
                return { value: Number(analytics?.kpi?.avgVelocity || 0).toFixed(1), unit: 'Pts' };
            case 'sprintCount':
                return { value: String(analytics?.kpi?.sprintCount || 0), unit: '' };
            default:
                return { value: '0', unit: '' };
        }
    };

    const getKpiIcon = (metric: string) => {
        switch (metric) {
            case 'avgDoneToSaid': return Activity;
            case 'avgTechDebt': return Layers;
            case 'projectLandscape': return Zap;
            case 'avgThroughput': return BarChart3;
            case 'avgQuality': return Check;
            case 'avgVelocity': return Zap;
            case 'sprintCount': return LayoutGrid;
            default: return Activity;
        }
    };

    // Standard Analytics State
    const [activeTab, setActiveTab] = useState('consolidated');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isExpandOpen, setIsExpandOpen] = useState(false);
    const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
    const [pdfSelectedIds, setPdfSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        try {
            const saved = localStorage.getItem('powerbi_plots_v3');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length && parsed[0].scopeOrgs !== undefined) {
                    setPlots(parsed);
                }
            }
            
            const savedCards = localStorage.getItem('dashboard_kpi_cards_v1');
            if (savedCards) {
                setKpiCards(JSON.parse(savedCards));
            }
        } catch { }
    }, []);

    const saveKpiCards = (next: typeof kpiCards) => {
        setKpiCards(next);
        localStorage.setItem('dashboard_kpi_cards_v1', JSON.stringify(next));
        toast.success('KPI Cards updated successfully!');
    };

    const savePlots = (next: PlotConfig[]) => {
        setPlots(next);
        localStorage.setItem('powerbi_plots_v3', JSON.stringify(next));
    };

    const saveAiPlots = (next: PlotConfig[]) => {
        setAiPlots(next);
    };

    const openPdfDialog = () => {
        const allPlots = [...plots, ...aiPlots, ...dynamicBarPlots];
        setPdfSelectedIds(new Set(allPlots.map(p => p.id)));
        setIsPdfDialogOpen(true);
    };

    const rawData = Array.isArray(rawMetricsData) ? rawMetricsData : [];
    const manualData = Array.isArray(manualMetricsData) ? manualMetricsData : [];
    const maxSprint = rawData.length ? Math.max(...rawData.map((r: any) => r.sprintNumber || 1)) : 10;

    const dynamicDim = useMemo(() => {
        if (filters.project && filters.project !== 'all') return 'team';
        if (filters.account && filters.account !== 'all') return 'project';
        if (filters.market && filters.market !== 'all') return 'account';
        if (filters.org && filters.org !== 'all') return 'market';
        return 'market'; // Default when no filter
    }, [filters]);

    const dynamicBarPlots = useMemo(() => {
        return METRICS_FIELDS.map((m, i) => ({
            id: `dyn-bar-${m.id}`,
            title: `${m.label} by ${X_AXIS_OPTIONS.find(x => x.id === dynamicDim)?.label || dynamicDim}`,
            subtitle: `Comparison across ${dynamicDim}s`,
            dataSource: 'team_productivity' as const, scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
            aiFilter: 'all' as const, sprintRange: [1, maxSprint] as [number, number], xAxis: dynamicDim, legend: 'none', chartType: 'BarChart',
            metrics: [{ key: m.id, agg: m.defaultAgg, color: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'][i % 5], type: 'bar' }], span: 1
        }));
    }, [dynamicDim, maxSprint]);

    if (isLoadingAnalytics || isLoadingRaw || isLoadingManual) {
        return <div className="flex justify-center py-20 animate-pulse text-muted-foreground font-black tracking-widest uppercase">Loading BI Engine...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-10">
            {/* KPI Cards Header & Grid */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-75">
                        Performance KPIs
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsKpiConfigOpen(true)}
                        className="rounded-xl h-8 text-[10px] font-black tracking-wider uppercase text-violet-600 hover:text-violet-700 hover:bg-violet-500/10 transition-colors"
                    >
                        <Settings2 className="w-3.5 h-3.5 mr-1.5" /> Customize KPIs
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpiCards.map((card, idx) => {
                        const valObj = getKpiValueAndUnit(card.metric);
                        const MetricIcon = getKpiIcon(card.metric);
                        return (
                            <StatCard
                                key={idx}
                                title={card.title}
                                value={valObj.value}
                                unit={valObj.unit}
                                icon={<MetricIcon className="h-5 w-5" />}
                                color={card.color}
                            />
                        );
                    })}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-background/50 border border-border/50 h-12 p-1 rounded-2xl w-full max-w-md mx-auto flex">
                    <TabsTrigger value="consolidated" className="flex-1 rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Consolidated Analytics</TabsTrigger>
                    <TabsTrigger value="ai-monitor" className="flex-1 rounded-xl text-xs font-bold data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md">Transformation Comparison</TabsTrigger>
                </TabsList>

                <TabsContent value="consolidated" className="space-y-6">
                    {/* BI Canvas Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white/50 dark:bg-black/20 border border-border/50 backdrop-blur-xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600"><LayoutGrid className="w-5 h-5" /></div>
                    <div>
                        <h2 className="text-lg font-black tracking-tight leading-none">Canvas</h2>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Fully customizable — scope any hierarchy, plot any metric, compare anything</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setEditMode(!editMode)} className={cn("rounded-xl font-bold text-xs transition-all", editMode ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "")}>
                        {editMode ? <><Check className="w-4 h-4 mr-1.5" /> Done</> : <><Edit3 className="w-4 h-4 mr-1.5" /> Edit</>}
                    </Button>
                    {!editMode && (
                        <Button variant="outline" className="rounded-xl font-bold text-xs" onClick={openPdfDialog}>
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

            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white/50 dark:bg-black/20 border border-border/50 backdrop-blur-xl shadow-sm mt-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600"><BarChart3 className="w-5 h-5" /></div>
                    <div>
                        <h2 className="text-lg font-black tracking-tight leading-none">Entity Comparison</h2>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Dynamic comparison across {dynamicDim}s</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
                {dynamicBarPlots.map(plot => {
                    const chartData = pivotData(rawData, plot);
                    const xLabel = X_AXIS_OPTIONS.find(o => o.id === plot.xAxis)?.label || plot.xAxis;
                    return (
                        <div key={plot.id} className="relative group transition-all duration-300">
                            <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="secondary" className="h-7 w-7 rounded-lg shadow-md bg-background/80 backdrop-blur-sm" onClick={() => { setExpandingPlot(plot); setIsExpandOpen(true); }}><Maximize2 className="w-3.5 h-3.5" /></Button>
                            </div>
                            <Card className="h-full rounded-[2rem] border-[1.5px] border-border/50 bg-background/50 backdrop-blur-2xl shadow-xl overflow-hidden hover:border-primary/20 transition-colors relative">
                                <CardHeader className="p-6 pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-0.5 min-w-0">
                                            <CardTitle className="text-lg font-black tracking-tight truncate flex items-center gap-2">
                                                {plot.title}
                                            </CardTitle>
                                            <CardDescription className="text-[10px] font-medium truncate">{plot.subtitle}</CardDescription>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <Badge variant="outline" className="text-[8px] font-bold rounded-full px-2 py-0.5">{xLabel}</Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-5 pt-2 h-[350px]">
                                    <PowerBIChart data={chartData} config={plot} />
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
            </div>
            </TabsContent>

            <TabsContent value="ai-monitor" className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white/50 dark:bg-black/20 border border-violet-500/30 backdrop-blur-xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-violet-600 text-white"><Activity className="w-5 h-5" /></div>
                        <div>
                            <h2 className="text-lg font-black tracking-tight leading-none text-violet-700 dark:text-violet-400">Transformation Comparison</h2>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Comparing transformation-enabled projects against non-transformation traditional aggregates</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="rounded-xl font-bold text-xs" onClick={openPdfDialog}>
                            <FileText className="w-4 h-4 mr-1.5" /> Export PDF
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {aiPlots.map(plot => {
                        const chartData = pivotData(plot.dataSource === 'manual_metrics' ? manualData : rawData, plot);
                        const xLabel = X_AXIS_OPTIONS.find(o => o.id === plot.xAxis)?.label || plot.xAxis;
                        
                        return (
                            <div key={plot.id} id={`plot-card-${plot.id}`} className={cn("relative group transition-all duration-300", plot.span === 2 ? 'lg:col-span-2' : plot.span === 3 ? 'lg:col-span-3' : '')}>
                                <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="secondary" className="h-7 w-7 rounded-lg shadow-md bg-background/80 backdrop-blur-sm" onClick={() => { setExpandingPlot(plot); setIsExpandOpen(true); }}><Maximize2 className="w-3.5 h-3.5" /></Button>
                                </div>
                                <Card className="h-full rounded-[2rem] border-[1.5px] border-violet-500/20 bg-background/50 backdrop-blur-2xl shadow-xl overflow-hidden hover:border-violet-500/40 transition-colors relative">
                                    <CardHeader className="p-6 pb-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="space-y-0.5 min-w-0">
                                                <CardTitle className="text-lg font-black tracking-tight truncate flex items-center gap-2">
                                                    <Globe className="h-4 w-4 text-violet-500" />
                                                    {plot.title}
                                                </CardTitle>
                                                <CardDescription className="text-[10px] font-medium truncate">{plot.subtitle}</CardDescription>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <Badge variant="outline" className="text-[8px] font-bold rounded-full px-2 py-0.5 text-violet-600 border-violet-500/30 bg-violet-500/5">AI Monitor</Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-2 h-[350px]">
                                        <PowerBIChart data={chartData} config={plot} />
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>
            </TabsContent>
            </Tabs>

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

            {/* PDF Selection Dialog */}
            <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl p-6 border-border/50 bg-background/95 backdrop-blur-xl">
                    <DialogTitle className="text-xl font-black">Export PDF Report</DialogTitle>
                    <DialogDescription className="text-xs font-medium">Select the plots you want to include in the generated PDF.</DialogDescription>
                    
                    <div className="space-y-2 mt-4 max-h-[50vh] overflow-y-auto pr-2">
                        {[...plots, ...aiPlots, ...dynamicBarPlots].map(plot => (
                            <label key={plot.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/40 hover:bg-muted/30 cursor-pointer transition-colors group">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded-md border-border/50 text-violet-600 focus:ring-violet-500 bg-background"
                                    checked={pdfSelectedIds.has(plot.id)}
                                    onChange={(e) => {
                                        const next = new Set(pdfSelectedIds);
                                        if (e.target.checked) next.add(plot.id);
                                        else next.delete(plot.id);
                                        setPdfSelectedIds(next);
                                    }}
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold leading-none group-hover:text-primary transition-colors">{plot.title}</span>
                                    <span className="text-[10px] text-muted-foreground font-medium mt-1">{plot.chartType}</span>
                                </div>
                            </label>
                        ))}
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6">
                        <Button variant="ghost" onClick={() => setIsPdfDialogOpen(false)} className="rounded-xl text-xs font-bold">Cancel</Button>
                        <Button 
                            className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-lg shadow-violet-500/20"
                            disabled={pdfSelectedIds.size === 0}
                            onClick={() => {
                                setIsPdfDialogOpen(false);
                                setTimeout(() => {
                                    (window as any).generatePDFReport?.();
                                }, 150);
                            }}
                        >
                            <FileText className="w-4 h-4 mr-2" /> Generate Report
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* KPI Customize Dialog */}
            <Dialog open={isKpiConfigOpen} onOpenChange={setIsKpiConfigOpen}>
                <DialogContent className="sm:max-w-2xl rounded-3xl p-6 border-border/50 bg-background/95 backdrop-blur-xl max-h-[85vh] overflow-y-auto">
                    <DialogTitle className="text-xl font-black">Customize KPI Cards</DialogTitle>
                    <DialogDescription className="text-xs font-medium">Configure metrics, labels, and styles for the 4 dashboard status cards.</DialogDescription>

                    <div className="space-y-6 mt-6">
                        {kpiCards.map((card, idx) => (
                            <div key={card.id} className="p-4 rounded-2xl border border-border/40 bg-muted/20 space-y-4">
                                <div className="flex items-center justify-between border-b border-border/10 pb-2">
                                    <span className="text-xs font-black uppercase tracking-wider text-violet-500">Card Slot {idx + 1}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Metric Selection */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Select Metric</label>
                                        <Select
                                            value={card.metric}
                                            onValueChange={(val) => {
                                                const defaultTitle = KPI_METRIC_OPTIONS.find(o => o.value === val)?.defaultTitle || '';
                                                const next = [...kpiCards];
                                                next[idx] = { ...next[idx], metric: val, title: defaultTitle };
                                                setKpiCards(next);
                                            }}
                                        >
                                            <SelectTrigger className="rounded-xl h-10 text-xs font-bold bg-background">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl text-xs font-bold">
                                                {KPI_METRIC_OPTIONS.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Custom Label */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Label</label>
                                        <input
                                            type="text"
                                            value={card.title}
                                            onChange={(e) => {
                                                const next = [...kpiCards];
                                                next[idx] = { ...next[idx], title: e.target.value };
                                                setKpiCards(next);
                                            }}
                                            className="w-full rounded-xl border border-border/50 h-10 px-3 text-xs font-bold bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
                                        />
                                    </div>

                                    {/* Color Picker */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Style Color</label>
                                        <Select
                                            value={card.color}
                                            onValueChange={(val) => {
                                                const next = [...kpiCards];
                                                next[idx] = { ...next[idx], color: val };
                                                setKpiCards(next);
                                            }}
                                        >
                                            <SelectTrigger className="rounded-xl h-10 text-xs font-bold bg-background">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl text-xs font-bold">
                                                <SelectItem value="text-emerald-500">Emerald Green</SelectItem>
                                                <SelectItem value="text-amber-500">Amber Gold</SelectItem>
                                                <SelectItem value="text-purple-500">Purple Violet</SelectItem>
                                                <SelectItem value="text-blue-500">Ocean Blue</SelectItem>
                                                <SelectItem value="text-rose-500">Rose Red</SelectItem>
                                                <SelectItem value="text-indigo-500">Indigo Royal</SelectItem>
                                                <SelectItem value="text-teal-500">Teal Turquoise</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6">
                        <Button variant="ghost" onClick={() => setIsKpiConfigOpen(false)} className="rounded-xl text-xs font-bold">Cancel</Button>
                        <Button
                            className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-lg shadow-violet-500/20"
                            onClick={() => {
                                saveKpiCards(kpiCards);
                                setIsKpiConfigOpen(false);
                            }}
                        >
                            <Check className="w-4 h-4 mr-2" /> Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* PDF Engine */}
            <PDFReportGenerator
                analytics={analytics}
                plots={[...plots, ...aiPlots, ...dynamicBarPlots].filter(p => pdfSelectedIds.has(p.id))}
                filters={filters}
                rawData={rawData}
            />
        </div>
    );
}
