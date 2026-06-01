'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState, useEffect, useMemo } from 'react';
import { Maximize2, X, Activity, Layers, Zap, BarChart3, LayoutGrid, Download, Edit3, Check, Settings2, Plus, Trash2, Shield, Globe, FileText, ArrowUp, ArrowDown, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSprintAnalytics, useSprintMetrics, useMetrics } from '@/hooks/use-metrics';
import { Button } from '@/components/ui/button';
import { pivotData, newPlotConfig, computeTransformationSprints, X_AXIS_OPTIONS, METRICS_FIELDS, type PlotConfig, COLORS } from './powerbi-engine';
import { PowerBIChart } from './powerbi-chart';
import { PlotEditorDialog } from './powerbi-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PDFReportGenerator } from './pdf-report-generator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ResponsiveContainer,
    ComposedChart,
    LineChart, Line,
    BarChart, Bar, Cell,
    PieChart, Pie,
    Area,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ReferenceLine
} from 'recharts';

// Default starter plots
const STARTER_PLOTS: PlotConfig[] = [
    {
        id: 'starter-1', title: 'Velocity Trend (Consolidated)', subtitle: 'Total velocity across sprints',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'none', chartType: 'AreaChart',
        metrics: [{ key: 'velocityPoints', agg: 'sum', color: '#8b5cf6', type: 'area' }], span: 1,
    },
    {
        id: 'starter-2', title: 'Throughput Trend (Consolidated)', subtitle: 'Total throughput across sprints',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'none', chartType: 'AreaChart',
        metrics: [{ key: 'throughputPoints', agg: 'sum', color: '#3b82f6', type: 'area' }], span: 1,
    },
    {
        id: 'starter-3', title: 'Quality Trend (Consolidated)', subtitle: 'Avg quality score across sprints',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'none', chartType: 'AreaChart',
        metrics: [{ key: 'qualityScore', agg: 'avg', color: '#10b981', type: 'area' }], span: 1,
    },
    {
        id: 'starter-4', title: 'Done-to-Said Trend (Consolidated)', subtitle: 'Avg done-to-said ratio across sprints',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'none', chartType: 'AreaChart',
        metrics: [{ key: 'doneToSaidRatio', agg: 'avg', color: '#f59e0b', type: 'area' }], span: 1,
    },
    {
        id: 'starter-5', title: 'Tech Debt Trend (Consolidated)', subtitle: 'Avg tech debt index across sprints',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'none', chartType: 'AreaChart',
        metrics: [{ key: 'technicalDebtIndex', agg: 'avg', color: '#ec4899', type: 'area' }], span: 1,
    },
];

const AI_MONITOR_PLOTS: PlotConfig[] = [
    {
        id: 'ai-1', title: 'Velocity (Transformation Phases)', subtitle: 'Average velocity comparison',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'aiBaseline', chartType: 'AreaChart',
        metrics: [{ key: 'velocityPoints', agg: 'avg', color: '#3b82f6', type: 'area' }], span: 1,
    },
    {
        id: 'ai-2', title: 'Throughput (Transformation Phases)', subtitle: 'Average throughput comparison',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'aiBaseline', chartType: 'AreaChart',
        metrics: [{ key: 'throughputPoints', agg: 'avg', color: '#3b82f6', type: 'area' }], span: 1,
    },
    {
        id: 'ai-3', title: 'Quality (Transformation Phases)', subtitle: 'Quality score comparison',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'aiBaseline', chartType: 'AreaChart',
        metrics: [{ key: 'qualityScore', agg: 'avg', color: '#3b82f6', type: 'area' }], span: 1,
    },
    {
        id: 'ai-4', title: 'Done-to-Said (Transformation Phases)', subtitle: 'Done-to-said ratio comparison',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'aiBaseline', chartType: 'AreaChart',
        metrics: [{ key: 'doneToSaidRatio', agg: 'avg', color: '#3b82f6', type: 'area' }], span: 1,
    },
    {
        id: 'ai-5', title: 'Tech Debt (Transformation Phases)', subtitle: 'Tech debt index comparison',
        dataSource: 'team_productivity', scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
        aiFilter: 'all', sprintRange: [1, 10], xAxis: 'sprintNumber', legend: 'aiBaseline', chartType: 'AreaChart',
        metrics: [{ key: 'technicalDebtIndex', agg: 'avg', color: '#3b82f6', type: 'area' }], span: 1,
    },
];

const STARTER_METRIC_CONFIGS: Record<string, {
    key: string;
    label: string;
    agg: 'sum' | 'avg';
    unit: string;
    color: string;
    title: string;
    subtitle: string;
    kpiColors: { avg: string; highest: string; lowest: string; stability: string; total: string };
}> = {
    'starter-1': {
        key: 'velocityPoints',
        label: 'Velocity',
        agg: 'sum',
        unit: 'Points',
        color: '#8b5cf6',
        title: 'Velocity Trend (Consolidated)',
        subtitle: 'Total velocity across sprints',
        kpiColors: { avg: 'text-violet-500', highest: 'text-emerald-500', lowest: 'text-rose-500', stability: 'text-blue-500', total: 'text-amber-500' }
    },
    'starter-2': {
        key: 'throughputPoints',
        label: 'Throughput',
        agg: 'sum',
        unit: 'Points',
        color: '#3b82f6',
        title: 'Throughput Trend (Consolidated)',
        subtitle: 'Total throughput across sprints',
        kpiColors: { avg: 'text-violet-500', highest: 'text-emerald-500', lowest: 'text-rose-500', stability: 'text-blue-500', total: 'text-amber-500' }
    },
    'starter-3': {
        key: 'qualityScore',
        label: 'Quality Score',
        agg: 'avg',
        unit: '%',
        color: '#10b981',
        title: 'Quality Trend (Consolidated)',
        subtitle: 'Avg quality score across sprints',
        kpiColors: { avg: 'text-violet-500', highest: 'text-emerald-500', lowest: 'text-rose-500', stability: 'text-blue-500', total: 'text-amber-500' }
    },
    'starter-4': {
        key: 'doneToSaidRatio',
        label: 'Done-to-Said Ratio',
        agg: 'avg',
        unit: '%',
        color: '#f59e0b',
        title: 'Done-to-Said Trend (Consolidated)',
        subtitle: 'Avg done-to-said ratio across sprints',
        kpiColors: { avg: 'text-violet-500', highest: 'text-emerald-500', lowest: 'text-rose-500', stability: 'text-blue-500', total: 'text-amber-500' }
    },
    'starter-5': {
        key: 'technicalDebtIndex',
        label: 'Tech Debt Index',
        agg: 'avg',
        unit: '',
        color: '#ec4899',
        title: 'Tech Debt Trend (Consolidated)',
        subtitle: 'Avg tech debt index across sprints',
        kpiColors: { avg: 'text-violet-500', highest: 'text-emerald-500', lowest: 'text-rose-500', stability: 'text-blue-500', total: 'text-amber-500' }
    }
};

const CustomDot = ({ cx, cy, payload, value, highestVal, highestSprintLabel, lowestVal, lowestSprintLabel }: any) => {
    if (value === highestVal && payload.sprintLabel === highestSprintLabel) {
        return (
            <g>
                <circle cx={cx} cy={cy} r={6} fill="#10b981" stroke="#fff" strokeWidth={2} />
                <g transform={`translate(${cx - 25}, ${cy - 30})`}>
                    <rect width={50} height={18} rx={6} fill="#10b981" />
                    <text x={25} y={12} fill="#fff" fontSize={9} fontWeight="bold" textAnchor="middle">Highest</text>
                    <path d="M 21 18 L 25 22 L 29 18 Z" fill="#10b981" />
                </g>
            </g>
        );
    }
    if (value === lowestVal && payload.sprintLabel === lowestSprintLabel) {
        return (
            <g>
                <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                <g transform={`translate(${cx - 25}, ${cy + 12})`}>
                    <rect width={50} height={18} rx={6} fill="#ef4444" />
                    <text x={25} y={12} fill="#fff" fontSize={9} fontWeight="bold" textAnchor="middle">Lowest</text>
                    <path d="M 21 0 L 25 -4 L 29 0 Z" fill="#ef4444" />
                </g>
            </g>
        );
    }
    return <circle cx={cx} cy={cy} r={4} fill="#3b82f6" stroke="#fff" strokeWidth={1.5} />;
};

const renderPillLabel = (text: string, color: string, value: number) => (props: any) => {
    const { viewBox } = props;
    if (!viewBox) return null;
    const x = viewBox.width + 5;
    const y = viewBox.y;
    return (
        <g transform={`translate(${x}, ${y - 8})`}>
            <rect width={55} height={16} rx={4} fill={color} />
            <text x={27.5} y={11} fill="#fff" fontSize={8} fontWeight="bold" textAnchor="middle">{`${text}: ${value.toFixed(1)}`}</text>
        </g>
    );
};

function StatCard({ title, value, unit, icon, color, subtext }: any) {
    return (
        <Card className="rounded-[2rem] border-[1.5px] border-border/50 bg-background/50 backdrop-blur-2xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-500 group">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-2.5 rounded-2xl bg-muted/50 border border-border/50 shadow-inner group-hover:scale-110 transition-transform duration-500", color)}>{icon}</div>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground/60 mb-1.5">{title}</p>
                <div className="flex items-baseline gap-1">
                    <h4 className="text-3xl font-black tracking-tighter">{value}</h4>
                    {unit && <span className="text-sm font-bold text-muted-foreground/50">{unit}</span>}
                </div>
                {subtext && (
                    <p className={cn("text-[10px] font-bold mt-2", color)}>{subtext}</p>
                )}
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
    const [expandingStarterKey, setExpandingStarterKey] = useState<string | null>(null);

    const [selectedStarterId, setSelectedStarterId] = useState<string>('starter-1');

    const activeStarterConfig = useMemo(() => {
        if (!selectedStarterId || selectedStarterId === 'custom') return null;
        return STARTER_METRIC_CONFIGS[selectedStarterId];
    }, [selectedStarterId]);

    const starterStats = useMemo(() => {
        if (!activeStarterConfig || !rawMetricsData || !Array.isArray(rawMetricsData) || rawMetricsData.length === 0) return null;

        const metricKey = activeStarterConfig.key;
        const aggType = activeStarterConfig.agg;

        const sprintDataMap: Record<number, { sprintNumber: number; total: number; count: number; teams: Record<string, number> }> = {};

        rawMetricsData.forEach((row: any) => {
            const sNum = row.sprintNumber;
            if (sNum === undefined || sNum === null) return;
            if (!sprintDataMap[sNum]) {
                sprintDataMap[sNum] = { sprintNumber: sNum, total: 0, count: 0, teams: {} };
            }
            const val = Number(row[metricKey] || 0);
            sprintDataMap[sNum].total += val;
            sprintDataMap[sNum].count += 1;

            const teamName = row.team?.name || row.teamName || 'Unknown';
            sprintDataMap[sNum].teams[teamName] = (sprintDataMap[sNum].teams[teamName] || 0) + val;
        });

        const sprintsList = Object.values(sprintDataMap)
            .sort((a, b) => a.sprintNumber - b.sprintNumber)
            .map(s => {
                let value = aggType === 'avg' ? (s.total / s.count) : s.total;
                if (metricKey === 'doneToSaidRatio' && value <= 1) {
                    value = value * 100;
                }
                return {
                    sprintNumber: s.sprintNumber,
                    sprintLabel: `Sprint ${s.sprintNumber}`,
                    value: Number(value.toFixed(1)),
                    teams: s.teams
                };
            });

        if (sprintsList.length === 0) return null;

        const values = sprintsList.map(s => s.value);
        const totalCount = sprintsList.length;

        const avg = values.reduce((sum, v) => sum + v, 0) / totalCount;

        let highestVal = -Infinity;
        let highestSprintLabel = '';
        sprintsList.forEach(s => {
            if (s.value > highestVal) {
                highestVal = s.value;
                highestSprintLabel = s.sprintLabel;
            }
        });

        let lowestVal = Infinity;
        let lowestSprintLabel = '';
        sprintsList.forEach(s => {
            if (s.value < lowestVal) {
                lowestVal = s.value;
                lowestSprintLabel = s.sprintLabel;
            }
        });

        const mean = avg;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (totalCount > 1 ? totalCount - 1 : 1);
        const stdDev = Math.sqrt(variance);

        const ucl = mean + 2 * stdDev;
        let lcl = mean - 2 * stdDev;
        if (metricKey === 'qualityScore' || metricKey === 'doneToSaidRatio') {
            lcl = Math.max(0, lcl);
        } else {
            lcl = Math.max(0, lcl);
        }

        const withinLimitsCount = sprintsList.filter(s => s.value >= lcl && s.value <= ucl).length;
        const stability = (withinLimitsCount / totalCount) * 100;

        let totalVal = 0;
        if (aggType === 'sum') {
            totalVal = values.reduce((sum, v) => sum + v, 0);
        } else {
            totalVal = avg;
        }

        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        const range = maxVal - minVal;

        let bucketSize = 10;
        if (range > 150) bucketSize = 50;
        else if (range > 70) bucketSize = 20;
        else if (range > 30) bucketSize = 10;
        else if (range > 10) bucketSize = 5;
        else bucketSize = 2;

        const startBucket = Math.floor(minVal / bucketSize) * bucketSize;
        const endBucket = Math.ceil(maxVal / bucketSize) * bucketSize;

        const buckets: Record<string, { rangeLabel: string; count: number; sortKey: number }> = {};
        for (let b = startBucket; b <= endBucket; b += bucketSize) {
            const label = `${b}-${b + bucketSize}`;
            buckets[label] = { rangeLabel: label, count: 0, sortKey: b };
        }

        sprintsList.forEach(s => {
            const b = Math.floor(s.value / bucketSize) * bucketSize;
            const label = `${b}-${b + bucketSize}`;
            if (buckets[label]) {
                buckets[label].count += 1;
            } else {
                buckets[label] = { rangeLabel: label, count: 1, sortKey: b };
            }
        });

        const distributionData = Object.values(buckets)
            .sort((a, b) => a.sortKey - b.sortKey);

        const teamContributions: Record<string, number> = {};
        let teamTotalSum = 0;

        rawMetricsData.forEach((row: any) => {
            let val = Number(row[metricKey] || 0);
            if (metricKey === 'doneToSaidRatio' && val <= 1) val = val * 100;
            const teamName = row.team?.name || row.teamName || 'Unknown';
            teamContributions[teamName] = (teamContributions[teamName] || 0) + val;
            teamTotalSum += val;
        });

        const donutData = Object.entries(teamContributions)
            .map(([name, value]) => ({
                name,
                value: Number(value.toFixed(1)),
                percentage: teamTotalSum > 0 ? Math.round((value / teamTotalSum) * 100) : 0
            }))
            .sort((a, b) => b.value - a.value);

        return {
            sprintsList,
            avg,
            highestVal,
            highestSprintLabel,
            lowestVal,
            lowestSprintLabel,
            stability,
            totalVal,
            stdDev,
            ucl,
            lcl,
            mean,
            distributionData,
            donutData,
            totalCount
        };
    }, [activeStarterConfig, rawMetricsData]);

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

            const savedStarter = localStorage.getItem('dashboard_selected_starter_v1');
            if (savedStarter) {
                setSelectedStarterId(savedStarter);
            }
        } catch { }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('dashboard_selected_starter_v1', selectedStarterId);
        } catch { }
    }, [selectedStarterId]);

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
        const allIds = new Set(allPlots.map(p => p.id));
        // Also pre-select the 5 starter chart panels when they are visible
        if (selectedStarterId !== 'custom' && starterStats && activeStarterConfig) {
            ['starter-chart-trend', 'starter-chart-sprint', 'starter-chart-control', 'starter-chart-dist', 'starter-chart-donut'].forEach(id => allIds.add(id));
        }
        setPdfSelectedIds(allIds);
        setIsPdfDialogOpen(true);
    };

    const rawData = Array.isArray(rawMetricsData) ? rawMetricsData : [];
    const manualData = Array.isArray(manualMetricsData) ? manualMetricsData : [];
    const maxSprint = rawData.length ? Math.max(...rawData.map((r: any) => r.sprintNumber || 1)) : 10;

    // Pre-compute transformation sprint labels once from the raw sprint data.
    // These are passed to the AI Monitor (Transformation Comparison) charts so
    // they can draw vertical phase-boundary lines on the sprint axis.
    const transformationSprints = useMemo(
        () => computeTransformationSprints(rawData),
        [rawData],
    );

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
                    {selectedStarterId === 'custom' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsKpiConfigOpen(true)}
                            className="rounded-xl h-8 text-[10px] font-black tracking-wider uppercase text-violet-600 hover:text-violet-700 hover:bg-violet-500/10 transition-colors"
                        >
                            <Settings2 className="w-3.5 h-3.5 mr-1.5" /> Customize KPIs
                        </Button>
                    )}
                </div>

                {selectedStarterId !== 'custom' && starterStats && activeStarterConfig ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {/* 1. Average Card */}
                        <StatCard
                            title={`AVERAGE ${activeStarterConfig.label}`}
                            value={starterStats.avg.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                            unit={activeStarterConfig.unit}
                            icon={<BarChart3 className="h-5 w-5" />}
                            color={activeStarterConfig.kpiColors.avg}
                            subtext={`Across ${starterStats.totalCount} Sprints`}
                        />
                        {/* 2. Highest Card */}
                        <StatCard
                            title={`HIGHEST ${activeStarterConfig.label}`}
                            value={starterStats.highestVal.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            unit={activeStarterConfig.unit}
                            icon={<ArrowUp className="h-5 w-5" />}
                            color={activeStarterConfig.kpiColors.highest}
                            subtext={starterStats.highestSprintLabel}
                        />
                        {/* 3. Lowest Card */}
                        <StatCard
                            title={`LOWEST ${activeStarterConfig.label}`}
                            value={starterStats.lowestVal.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            unit={activeStarterConfig.unit}
                            icon={<ArrowDown className="h-5 w-5" />}
                            color={activeStarterConfig.kpiColors.lowest}
                            subtext={starterStats.lowestSprintLabel}
                        />
                        {/* 4. Stability Card */}
                        <StatCard
                            title="STABILITY"
                            value={`${starterStats.stability.toFixed(1)}%`}
                            unit=""
                            icon={<Shield className="h-5 w-5" />}
                            color={activeStarterConfig.kpiColors.stability}
                            subtext="Within Control Limits"
                        />
                        {/* 5. Total Card */}
                        <StatCard
                            title={activeStarterConfig.agg === 'sum' ? `TOTAL ${activeStarterConfig.label}` : `AVG ${activeStarterConfig.label}`}
                            value={starterStats.totalVal.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            unit={activeStarterConfig.agg === 'sum' ? activeStarterConfig.unit : ''}
                            icon={<Target className="h-5 w-5" />}
                            color={activeStarterConfig.kpiColors.total}
                            subtext={activeStarterConfig.agg === 'sum' ? `Sum of ${starterStats.totalCount} Sprints` : `Mean of ${starterStats.totalCount} Sprints`}
                        />
                    </div>
                ) : (
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
                )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-background/50 border border-border/50 h-12 p-1 rounded-2xl w-full max-w-md mx-auto flex">
                    <TabsTrigger value="consolidated" className="flex-1 rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Consolidated Analytics</TabsTrigger>
                    <TabsTrigger value="ai-monitor" className="flex-1 rounded-xl text-xs font-bold data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md">Transformation Comparison</TabsTrigger>
                </TabsList>

                <TabsContent value="consolidated" className="space-y-6">
                    {selectedStarterId !== 'custom' && starterStats && activeStarterConfig ? (
                        <>
                            {/* Consolidated Starter Plot Dashboard Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white/50 dark:bg-black/20 border border-border/50 backdrop-blur-xl shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600">
                                        <BarChart3 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black tracking-tight leading-none">
                                            {activeStarterConfig.title}
                                        </h2>
                                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                            {activeStarterConfig.subtitle}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Dropdown Selector */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select</span>
                                        <Select value={selectedStarterId} onValueChange={setSelectedStarterId}>
                                            <SelectTrigger className="w-[200px] rounded-xl bg-background/50 border-border/50 h-9 font-bold shadow-sm text-xs">
                                                <SelectValue placeholder="Select starter plot" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                                                <SelectItem value="starter-1" className="font-bold text-xs">Velocity Trend (Consolidated)</SelectItem>
                                                <SelectItem value="starter-2" className="font-bold text-xs">Throughput Trend (Consolidated)</SelectItem>
                                                <SelectItem value="starter-3" className="font-bold text-xs">Quality Trend (Consolidated)</SelectItem>
                                                <SelectItem value="starter-4" className="font-bold text-xs">Done-to-Said Trend (Consolidated)</SelectItem>
                                                <SelectItem value="starter-5" className="font-bold text-xs">Tech Debt Trend (Consolidated)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button 
                                        variant="outline" 
                                        onClick={() => { setSelectedStarterId('custom'); setEditMode(true); }} 
                                        className="rounded-xl font-bold text-xs h-9 bg-background/50 border-border/50"
                                    >
                                        <Edit3 className="w-4 h-4 mr-1.5" /> Edit
                                    </Button>

                                    <Button 
                                        variant="outline" 
                                        className="rounded-xl font-bold text-xs h-9 bg-background/50 border-border/50" 
                                        onClick={openPdfDialog}
                                    >
                                        <FileText className="w-4 h-4 mr-1.5" /> Export PDF
                                    </Button>
                                </div>
                            </div>

                            {/* 5-Chart Dashboard Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                {/* Chart 1: [Metric] Trend (spans 2 columns, left) */}
                                <div className="lg:col-span-2">
                                    <Card id="starter-chart-trend" className="rounded-[2rem] border-[1.5px] border-border/50 bg-background/50 backdrop-blur-2xl shadow-xl overflow-hidden p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-base font-black tracking-tight">{activeStarterConfig.label} Trend</h3>
                                                <p className="text-[10px] text-muted-foreground font-semibold">Consolidated sprint trend with control limits</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase border border-border/50 rounded-lg px-2 py-1 bg-muted/20">Line</span>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => setExpandingStarterKey('trend')}><Maximize2 className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg"><Settings2 className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                                            </div>
                                        </div>
                                        <div className="h-[280px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ComposedChart data={starterStats.sprintsList} margin={{ top: 25, right: 30, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor={activeStarterConfig.color} stopOpacity={0.2} />
                                                            <stop offset="100%" stopColor={activeStarterConfig.color} stopOpacity={0.0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                                                    <XAxis dataKey="sprintLabel" tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: 700 }} dy={5} />
                                                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                                                    <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} />

                                                    <ReferenceLine
                                                        y={starterStats.mean}
                                                        stroke="#10b981"
                                                        strokeDasharray="4 4"
                                                        label={{
                                                            value: `Average (${starterStats.mean.toFixed(1)})`,
                                                            position: 'insideBottomLeft',
                                                            fill: '#10b981',
                                                            fontSize: 9,
                                                            fontWeight: 'bold'
                                                        }}
                                                    />

                                                    <ReferenceLine
                                                        y={starterStats.lcl}
                                                        stroke="#ef4444"
                                                        strokeDasharray="4 4"
                                                        label={{
                                                            value: `LCL (${starterStats.lcl.toFixed(1)})`,
                                                            position: 'insideBottomRight',
                                                            fill: '#ef4444',
                                                            fontSize: 9,
                                                            fontWeight: 'bold'
                                                        }}
                                                    />

                                                    <Area type="monotone" dataKey="value" stroke="none" fill="url(#trendGradient)" />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="value"
                                                        stroke={activeStarterConfig.color}
                                                        strokeWidth={2.5}
                                                        dot={<CustomDot highestVal={starterStats.highestVal} highestSprintLabel={starterStats.highestSprintLabel} lowestVal={starterStats.lowestVal} lowestSprintLabel={starterStats.lowestSprintLabel} />}
                                                    />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </div>

                                {/* Chart 2: [Metric] by Sprint (spans 1 column, right) */}
                                <div className="lg:col-span-1">
                                    <Card id="starter-chart-sprint" className="rounded-[2rem] border-[1.5px] border-border/50 bg-background/50 backdrop-blur-2xl shadow-xl overflow-hidden p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-base font-black tracking-tight">{activeStarterConfig.label} by Sprint</h3>
                                                <p className="text-[10px] text-muted-foreground font-semibold">Points per sprint with highlights</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase border border-border/50 rounded-lg px-2 py-1 bg-muted/20">Bar</span>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => setExpandingStarterKey('sprint')}><Maximize2 className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg"><Settings2 className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                                            </div>
                                        </div>
                                        <div className="h-[280px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={starterStats.sprintsList} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
                                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                                                    <XAxis dataKey="sprintLabel" tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: 700 }} dy={5} />
                                                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                                                    <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} />
                                                    <Bar
                                                        dataKey="value"
                                                        radius={[4, 4, 0, 0]}
                                                        label={{ position: 'top', fontSize: 9, fontWeight: '700', fill: '#4b5563' }}
                                                    >
                                                        {starterStats.sprintsList.map((entry: any, index: number) => {
                                                            let fill = 'url(#barGradient)';
                                                            if (entry.value === starterStats.highestVal) fill = '#10b981';
                                                            if (entry.value === starterStats.lowestVal) fill = '#ef4444';
                                                            return <Cell key={`cell-${index}`} fill={fill} />;
                                                        })}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </div>

                                {/* Chart 3: Control Chart (I-MR) (spans 1 column, left) */}
                                <div className="lg:col-span-1">
                                    <Card id="starter-chart-control" className="rounded-[2rem] border-[1.5px] border-border/50 bg-background/50 backdrop-blur-2xl shadow-xl overflow-hidden p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-base font-black tracking-tight">Control Chart (I-MR)</h3>
                                                <p className="text-[10px] text-muted-foreground font-semibold">Statistical process control limits</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase border border-border/50 rounded-lg px-2 py-1 bg-muted/20">I Chart</span>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => setExpandingStarterKey('control')}><Maximize2 className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg"><Settings2 className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                                            </div>
                                        </div>
                                        <div className="h-[280px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={starterStats.sprintsList} margin={{ top: 20, right: 65, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                                                    <XAxis dataKey="sprintLabel" tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: 700 }} dy={5} />
                                                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                                                    <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} />

                                                    <ReferenceLine
                                                        y={starterStats.mean}
                                                        stroke="#10b981"
                                                        strokeDasharray="4 4"
                                                        label={renderPillLabel('CL', '#10b981', starterStats.mean)}
                                                    />

                                                    <ReferenceLine
                                                        y={starterStats.ucl}
                                                        stroke="#ef4444"
                                                        strokeDasharray="2 3"
                                                        label={renderPillLabel('UCL', '#ef4444', starterStats.ucl)}
                                                    />

                                                    <ReferenceLine
                                                        y={starterStats.lcl}
                                                        stroke="#ef4444"
                                                        strokeDasharray="2 3"
                                                        label={renderPillLabel('LCL', '#ef4444', starterStats.lcl)}
                                                    />

                                                    <Line
                                                        type="monotone"
                                                        dataKey="value"
                                                        stroke="#3b82f6"
                                                        strokeWidth={2.5}
                                                        dot={{ r: 4, stroke: '#fff', strokeWidth: 1.5, fill: '#3b82f6' }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </div>

                                {/* Chart 4: [Metric] Distribution (Histogram) (spans 1 column, center) */}
                                <div className="lg:col-span-1">
                                    <Card id="starter-chart-dist" className="rounded-[2rem] border-[1.5px] border-border/50 bg-background/50 backdrop-blur-2xl shadow-xl overflow-hidden p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-base font-black tracking-tight">{activeStarterConfig.label} Distribution</h3>
                                                <p className="text-[10px] text-muted-foreground font-semibold">Frequency distribution histogram</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase border border-border/50 rounded-lg px-2 py-1 bg-muted/20">Histogram</span>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => setExpandingStarterKey('dist')}><Maximize2 className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg"><Settings2 className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                                            </div>
                                        </div>
                                        <div className="h-[280px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={starterStats.distributionData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                                                    <XAxis dataKey="rangeLabel" tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: 700 }} dy={5} />
                                                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                                                    <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} />
                                                    <Bar
                                                        dataKey="count"
                                                        fill="#3b82f6"
                                                        radius={[4, 4, 0, 0]}
                                                        label={{ position: 'top', fontSize: 9, fontWeight: '700', fill: '#4b5563' }}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </div>

                                {/* Chart 5: Team / Source Contribution (Donut) (spans 1 column, right) */}
                                <div className="lg:col-span-1">
                                    <Card id="starter-chart-donut" className="rounded-[2rem] border-[1.5px] border-border/50 bg-background/50 backdrop-blur-2xl shadow-xl overflow-hidden p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h3 className="text-base font-black tracking-tight">Team / Source Contribution</h3>
                                                <p className="text-[10px] text-muted-foreground font-semibold">Breakdown of metrics by team</p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase border border-border/50 rounded-lg px-2 py-1 bg-muted/20">Donut</span>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => setExpandingStarterKey('donut')}><Maximize2 className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg"><Settings2 className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                                            </div>
                                        </div>
                                        <div className="h-[280px] flex flex-col justify-center">
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div className="w-full sm:w-1/2 h-[190px] relative">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={starterStats.donutData}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius="60%"
                                                                outerRadius="85%"
                                                                paddingAngle={3}
                                                                dataKey="value"
                                                                nameKey="name"
                                                            >
                                                                {starterStats.donutData.map((entry: any, index: number) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                        <span className="text-base font-black text-foreground">
                                                            {activeStarterConfig.agg === 'sum'
                                                                ? starterStats.totalVal.toLocaleString(undefined, { maximumFractionDigits: 0 })
                                                                : starterStats.avg.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                                        </span>
                                                        <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground opacity-60">
                                                            {activeStarterConfig.agg === 'sum' ? 'Total Points' : 'Avg Score'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="w-full sm:w-1/2 flex flex-col gap-2 max-h-[195px] overflow-y-auto pr-1">
                                                    {starterStats.donutData.slice(0, 5).map((item: any, idx: number) => (
                                                        <div key={item.name} className="flex items-center justify-between text-[10px]">
                                                            <div className="flex items-center gap-1.5 min-w-0">
                                                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                                                <span className="font-bold truncate text-muted-foreground" title={item.name}>{item.name}</span>
                                                            </div>
                                                            <span className="font-black text-foreground shrink-0 ml-1.5">
                                                                {item.value.toLocaleString()} ({item.percentage}%)
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* BI Canvas Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white/50 dark:bg-black/20 border border-border/50 backdrop-blur-xl shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600"><LayoutGrid className="w-5 h-5" /></div>
                                    <div>
                                        <h2 className="text-lg font-black tracking-tight leading-none">Canvas</h2>
                                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Fully customizable — scope any hierarchy, plot any metric, compare anything</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Dropdown Selector also visible in Custom Canvas to switch back! */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select</span>
                                        <Select
                                            value={selectedStarterId}
                                            onValueChange={(val) => {
                                                setSelectedStarterId(val);
                                                if (val !== 'custom') {
                                                    setEditMode(false);
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-[200px] rounded-xl bg-background/50 border-border/50 h-9 font-bold shadow-sm text-xs">
                                                <SelectValue placeholder="Select starter plot">
                                                    {selectedStarterId === 'custom' ? 'Custom BI Canvas' : undefined}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                                                <SelectItem value="starter-1" className="font-bold text-xs">Velocity Trend (Consolidated)</SelectItem>
                                                <SelectItem value="starter-2" className="font-bold text-xs">Throughput Trend (Consolidated)</SelectItem>
                                                <SelectItem value="starter-3" className="font-bold text-xs">Quality Trend (Consolidated)</SelectItem>
                                                <SelectItem value="starter-4" className="font-bold text-xs">Done-to-Said Trend (Consolidated)</SelectItem>
                                                <SelectItem value="starter-5" className="font-bold text-xs">Tech Debt Trend (Consolidated)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button variant="outline" onClick={() => setEditMode(!editMode)} className={cn("rounded-xl font-bold text-xs transition-all h-9", editMode ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "")}>
                                        {editMode ? <><Check className="w-4 h-4 mr-1.5" /> Done</> : <><Edit3 className="w-4 h-4 mr-1.5" /> Edit</>}
                                    </Button>
                                    {!editMode && (
                                        <Button variant="outline" className="rounded-xl font-bold text-xs h-9" onClick={openPdfDialog}>
                                            <FileText className="w-4 h-4 mr-1.5" /> Export PDF
                                        </Button>
                                    )}
                                    {editMode && (
                                        <Button onClick={() => { setEditingPlot(newPlotConfig(maxSprint)); setIsDialogOpen(true); }} className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 font-bold text-xs h-9">
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
                                                    <div className="flex items-center justify-between gap-2 min-w-0">
                                                        <div className="space-y-0.5 min-w-0">
                                                            <CardTitle className="text-lg font-black tracking-tight truncate flex items-center gap-2 min-w-0 w-full text-left">
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
                        </>
                    )}

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
                                            <div className="flex items-center justify-between gap-2 min-w-0">
                                                <div className="space-y-0.5 min-w-0">
                                                    <CardTitle className="text-lg font-black tracking-tight truncate flex items-center gap-2 min-w-0 w-full text-left">
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
                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Comparing before, during, and after transformation phases across teams</p>
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
                                            <div className="flex items-center justify-between gap-2 min-w-0">
                                                <div className="space-y-0.5 min-w-0">
                                                    <CardTitle className="text-lg font-black tracking-tight truncate flex items-center gap-2 min-w-0 w-full text-left">
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
                                            <PowerBIChart
                                                data={chartData}
                                                config={plot}
                                                transformationSprints={plot.legend === 'aiBaseline' ? transformationSprints : undefined}
                                            />
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
            <Dialog open={isExpandOpen || !!expandingStarterKey} onOpenChange={(open) => { if (!open) { setIsExpandOpen(false); setExpandingStarterKey(null); setExpandingPlot(null); } }}>
                <DialogContent showCloseButton={false} className="sm:max-w-[95vw] sm:max-h-[95vh] h-[90vh] p-0 rounded-[2.5rem] border-border/50 bg-background/95 backdrop-blur-3xl overflow-hidden flex flex-col">
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
                                    <Button variant="ghost" size="icon" onClick={() => { setIsExpandOpen(false); setExpandingPlot(null); }} className="rounded-full h-10 w-10"><X className="h-5 w-5" /></Button>
                                </div>
                            </div>
                            <div className="flex-1 p-10">
                                <PowerBIChart
                                    data={pivotData(expandingPlot.dataSource === 'manual_metrics' ? manualData : rawData, expandingPlot)}
                                    config={expandingPlot}
                                    transformationSprints={expandingPlot.legend === 'aiBaseline' ? transformationSprints : undefined}
                                />
                            </div>
                            <div className="p-6 border-t border-border/10 bg-muted/5 flex items-center justify-center gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-violet-500" /> Multi-Source Engine</div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Interactive BI Canvas</div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Real-time Sync</div>
                            </div>
                        </>
                    )}
                    {expandingStarterKey && activeStarterConfig && starterStats && (
                        <>
                            <div className="p-8 border-b border-border/10 flex items-center justify-between bg-muted/5">
                                <div>
                                    <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                        <BarChart3 className="h-6 w-6 text-violet-500" />
                                        {expandingStarterKey === 'trend' && `${activeStarterConfig.label} Trend`}
                                        {expandingStarterKey === 'sprint' && `${activeStarterConfig.label} by Sprint`}
                                        {expandingStarterKey === 'control' && `Control Chart (I-MR)`}
                                        {expandingStarterKey === 'dist' && `${activeStarterConfig.label} Distribution`}
                                        {expandingStarterKey === 'donut' && `Team / Source Contribution`}
                                    </DialogTitle>
                                    <DialogDescription className="text-sm text-muted-foreground font-medium">
                                        {expandingStarterKey === 'trend' && 'Consolidated sprint trend with control limits'}
                                        {expandingStarterKey === 'sprint' && 'Points per sprint with highlights'}
                                        {expandingStarterKey === 'control' && 'Statistical process control limits'}
                                        {expandingStarterKey === 'dist' && 'Frequency distribution histogram'}
                                        {expandingStarterKey === 'donut' && 'Breakdown of metrics by team'}
                                    </DialogDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="rounded-full px-3 py-1 font-black uppercase text-[10px] text-violet-600 border-violet-500/30 bg-violet-500/5">
                                        Starter Plot
                                    </Badge>
                                    <Button variant="ghost" size="icon" onClick={() => setExpandingStarterKey(null)} className="rounded-full h-10 w-10"><X className="h-5 w-5" /></Button>
                                </div>
                            </div>
                            <div className="flex-1 p-10 min-h-0 overflow-hidden">
                                {expandingStarterKey === 'trend' && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={starterStats.sprintsList} margin={{ top: 25, right: 30, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="trendGradientExpanded" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={activeStarterConfig.color} stopOpacity={0.2} />
                                                    <stop offset="100%" stopColor={activeStarterConfig.color} stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                                            <XAxis dataKey="sprintLabel" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 700 }} dy={5} />
                                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                                            <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} />

                                            <ReferenceLine
                                                y={starterStats.mean}
                                                stroke="#10b981"
                                                strokeDasharray="4 4"
                                                label={{
                                                    value: `Average (${starterStats.mean.toFixed(1)})`,
                                                    position: 'insideBottomLeft',
                                                    fill: '#10b981',
                                                    fontSize: 11,
                                                    fontWeight: 'bold'
                                                }}
                                            />

                                            <ReferenceLine
                                                y={starterStats.lcl}
                                                stroke="#ef4444"
                                                strokeDasharray="4 4"
                                                label={{
                                                    value: `LCL (${starterStats.lcl.toFixed(1)})`,
                                                    position: 'insideBottomRight',
                                                    fill: '#ef4444',
                                                    fontSize: 11,
                                                    fontWeight: 'bold'
                                                }}
                                            />

                                            <Area type="monotone" dataKey="value" stroke="none" fill="url(#trendGradientExpanded)" />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke={activeStarterConfig.color}
                                                strokeWidth={3}
                                                dot={<CustomDot highestVal={starterStats.highestVal} highestSprintLabel={starterStats.highestSprintLabel} lowestVal={starterStats.lowestVal} lowestSprintLabel={starterStats.lowestSprintLabel} />}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                )}

                                {expandingStarterKey === 'sprint' && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={starterStats.sprintsList} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="barGradientExpanded" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                                            <XAxis dataKey="sprintLabel" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 700 }} dy={5} />
                                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                                            <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} />
                                            <Bar
                                                dataKey="value"
                                                radius={[6, 6, 0, 0]}
                                                label={{ position: 'top', fontSize: 11, fontWeight: '700', fill: '#4b5563' }}
                                            >
                                                {starterStats.sprintsList.map((entry: any, index: number) => {
                                                    let fill = 'url(#barGradientExpanded)';
                                                    if (entry.value === starterStats.highestVal) fill = '#10b981';
                                                    if (entry.value === starterStats.lowestVal) fill = '#ef4444';
                                                    return <Cell key={`cell-${index}`} fill={fill} />;
                                                })}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}

                                {expandingStarterKey === 'control' && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={starterStats.sprintsList} margin={{ top: 20, right: 85, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                                            <XAxis dataKey="sprintLabel" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 700 }} dy={5} />
                                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                                            <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} />

                                            <ReferenceLine
                                                y={starterStats.mean}
                                                stroke="#10b981"
                                                strokeDasharray="4 4"
                                                label={renderPillLabel('CL', '#10b981', starterStats.mean)}
                                            />

                                            <ReferenceLine
                                                y={starterStats.ucl}
                                                stroke="#ef4444"
                                                strokeDasharray="2 3"
                                                label={renderPillLabel('UCL', '#ef4444', starterStats.ucl)}
                                            />

                                            <ReferenceLine
                                                y={starterStats.lcl}
                                                stroke="#ef4444"
                                                strokeDasharray="2 3"
                                                label={renderPillLabel('LCL', '#ef4444', starterStats.lcl)}
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                dot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: '#3b82f6' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}

                                {expandingStarterKey === 'dist' && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={starterStats.distributionData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                                            <XAxis dataKey="rangeLabel" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 700 }} dy={5} />
                                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 700 }} />
                                            <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} />
                                            <Bar
                                                dataKey="count"
                                                fill="#3b82f6"
                                                radius={[6, 6, 0, 0]}
                                                label={{ position: 'top', fontSize: 11, fontWeight: '700', fill: '#4b5563' }}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}

                                {expandingStarterKey === 'donut' && (
                                    <div className="h-full flex flex-col justify-center max-w-4xl mx-auto">
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                                            <div className="w-full md:w-1/2 h-[350px] relative">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={starterStats.donutData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius="65%"
                                                            outerRadius="90%"
                                                            paddingAngle={3}
                                                            dataKey="value"
                                                            nameKey="name"
                                                        >
                                                            {starterStats.donutData.map((entry: any, index: number) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <span className="text-3xl font-black text-foreground">
                                                        {activeStarterConfig.agg === 'sum'
                                                            ? starterStats.totalVal.toLocaleString(undefined, { maximumFractionDigits: 0 })
                                                            : starterStats.avg.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                                    </span>
                                                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground opacity-60">
                                                        {activeStarterConfig.agg === 'sum' ? 'Total Points' : 'Avg Score'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full md:w-1/2 flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2">
                                                {starterStats.donutData.map((item: any, idx: number) => (
                                                    <div key={item.name} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                                            <span className="font-bold truncate text-muted-foreground" title={item.name}>{item.name}</span>
                                                        </div>
                                                        <span className="font-black text-foreground shrink-0 ml-2.5">
                                                            {item.value.toLocaleString()} ({item.percentage}%)
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                <DialogContent className="sm:max-w-lg rounded-3xl p-6 border-border/50 bg-background/95 backdrop-blur-xl">
                    <DialogTitle className="text-xl font-black">Export PDF Report</DialogTitle>
                    <DialogDescription className="text-xs font-medium">Select all charts and plots to include in the generated PDF report.</DialogDescription>

                    <div className="space-y-2 mt-4 max-h-[55vh] overflow-y-auto pr-2">

                        {/* Starter Charts Section */}
                        {selectedStarterId !== 'custom' && starterStats && activeStarterConfig && (() => {
                            const starterChartItems = [
                                { id: 'starter-chart-trend', title: `${activeStarterConfig.label} Trend`, type: 'Line · Consolidated' },
                                { id: 'starter-chart-sprint', title: `${activeStarterConfig.label} by Sprint`, type: 'Bar · Per Sprint' },
                                { id: 'starter-chart-control', title: 'Control Chart (I-MR)', type: 'Line · SPC Limits' },
                                { id: 'starter-chart-dist', title: `${activeStarterConfig.label} Distribution`, type: 'Bar · Histogram' },
                                { id: 'starter-chart-donut', title: 'Team / Source Contribution', type: 'Donut · Breakdown' },
                            ];
                            return (
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-violet-500">Starter Plot — {activeStarterConfig.title}</p>
                                        <button
                                            type="button"
                                            className="text-[9px] font-black uppercase tracking-wider text-muted-foreground hover:text-violet-600 transition-colors"
                                            onClick={() => {
                                                const next = new Set(pdfSelectedIds);
                                                const allChecked = starterChartItems.every(c => next.has(c.id));
                                                starterChartItems.forEach(c => allChecked ? next.delete(c.id) : next.add(c.id));
                                                setPdfSelectedIds(next);
                                            }}
                                        >
                                            {starterChartItems.every(c => pdfSelectedIds.has(c.id)) ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                    {starterChartItems.map(chart => (
                                        <label key={chart.id} className="flex items-center gap-3 p-3 rounded-xl border border-violet-500/20 bg-violet-500/[0.03] hover:bg-violet-500/[0.07] cursor-pointer transition-colors group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded-md border-border/50 text-violet-600 focus:ring-violet-500 bg-background accent-violet-600"
                                                checked={pdfSelectedIds.has(chart.id)}
                                                onChange={(e) => {
                                                    const next = new Set(pdfSelectedIds);
                                                    if (e.target.checked) next.add(chart.id);
                                                    else next.delete(chart.id);
                                                    setPdfSelectedIds(next);
                                                }}
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold leading-none group-hover:text-violet-600 transition-colors">{chart.title}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium mt-1">{chart.type}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            );
                        })()}

                        {/* BI Canvas Plots Section */}
                        {[...plots, ...aiPlots, ...dynamicBarPlots].length > 0 && (
                            <div className="space-y-1.5" style={{ marginTop: selectedStarterId !== 'custom' && starterStats ? '12px' : '0' }}>
                                {(selectedStarterId !== 'custom' && starterStats) && (
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">BI Canvas Plots</p>
                                        <button
                                            type="button"
                                            className="text-[9px] font-black uppercase tracking-wider text-muted-foreground hover:text-blue-600 transition-colors"
                                            onClick={() => {
                                                const next = new Set(pdfSelectedIds);
                                                const allPlotIds = [...plots, ...aiPlots, ...dynamicBarPlots].map(p => p.id);
                                                const allChecked = allPlotIds.every(id => next.has(id));
                                                allPlotIds.forEach(id => allChecked ? next.delete(id) : next.add(id));
                                                setPdfSelectedIds(next);
                                            }}
                                        >
                                            {[...plots, ...aiPlots, ...dynamicBarPlots].every(p => pdfSelectedIds.has(p.id)) ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                )}
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
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <span className="text-[10px] text-muted-foreground font-bold">{pdfSelectedIds.size} item{pdfSelectedIds.size !== 1 ? 's' : ''} selected</span>
                        <div className="flex items-center gap-3">
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
                starterChartIds={
                    selectedStarterId !== 'custom' && starterStats && activeStarterConfig
                        ? [
                            { id: 'starter-chart-trend', title: `${activeStarterConfig.label} Trend`, subtitle: 'Consolidated sprint trend with control limits' },
                            { id: 'starter-chart-sprint', title: `${activeStarterConfig.label} by Sprint`, subtitle: 'Points per sprint with highlights' },
                            { id: 'starter-chart-control', title: 'Control Chart (I-MR)', subtitle: 'Statistical process control limits' },
                            { id: 'starter-chart-dist', title: `${activeStarterConfig.label} Distribution`, subtitle: 'Frequency distribution histogram' },
                            { id: 'starter-chart-donut', title: 'Team / Source Contribution', subtitle: 'Breakdown of metrics by team' },
                          ].filter(c => pdfSelectedIds.has(c.id))
                        : []
                }
            />
        </div>
    );
}
