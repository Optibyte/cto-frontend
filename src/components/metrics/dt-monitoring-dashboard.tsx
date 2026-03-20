'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertTriangle,
    AlertCircle,
    TrendingUp,
    TrendingDown,
    Activity,
    Zap,
    BarChart3,
    CheckCircle2,
    Info,
    Minus,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    ReferenceLine,
    ReferenceArea,
    Legend,
    Area,
    AreaChart,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useMetrics } from '@/hooks/use-metrics';
import { useMetricDefinitions } from '@/hooks/use-metric-definitions';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { useProjects } from '@/hooks/use-projects';

// ─── Types ────────────────────────────────────────────────────────────────────

type DTPhase = 'before' | 'during' | 'after';

interface PhaseDataPoint {
    label: string;
    value: number | null;
    phase: DTPhase;
    date: Date;
}

interface MetricAnalysis {
    metricType: string;
    metricName: string;
    baseline: number;
    baselineCount: number;
    duringAvg: number | null;
    afterAvg: number | null;
    phaseData: PhaseDataPoint[];
    alerts: DTAlert[];
}

interface DTAlert {
    id: string;
    metricName: string;
    phase: 'during' | 'after';
    currentAvg: number;
    baseline: number;
    delta: number;
    severity: 'critical' | 'warning';
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getPhase(date: Date, dtStart: Date, dtEnd: Date): DTPhase {
    if (date < dtStart) return 'before';
    if (date <= dtEnd) return 'during';
    return 'after';
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function avg(arr: number[]): number {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// ─── Phase Band color config ──────────────────────────────────────────────────
const PHASE_COLORS: Record<DTPhase, string> = {
    before: '#6366f1',
    during: '#f59e0b',
    after: '#10b981',
};

const PHASE_BG: Record<DTPhase, string> = {
    before: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    during: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    after: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, baseline }: any) {
    if (!active || !payload || !payload.length) return null;

    const valueEntry = payload.find((p: any) => p.dataKey === 'value');
    const val = valueEntry?.value;
    const phase: DTPhase = payload[0]?.payload?.phase || 'before';

    return (
        <div className="bg-background/95 backdrop-blur-xl border border-border/50 p-4 rounded-2xl shadow-2xl min-w-[200px]">
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-2">{label}</p>
            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-black" style={{ color: PHASE_COLORS[phase] }}>
                    {val !== null && val !== undefined ? Number(val).toFixed(2) : '—'}
                </span>
            </div>
            <Badge className={cn('text-[9px] font-black border px-2 py-0.5', PHASE_BG[phase])}>
                {phase.toUpperCase()} DT
            </Badge>
            {val !== null && val !== undefined && baseline !== undefined && (
                <div className="mt-2 pt-2 border-t border-border/20">
                    <p className="text-[10px] text-muted-foreground">
                        {val >= baseline
                            ? <span className="text-emerald-400 font-bold">↑ {(val - baseline).toFixed(2)} above baseline</span>
                            : <span className="text-rose-400 font-bold">↓ {(baseline - val).toFixed(2)} below baseline</span>
                        }
                    </p>
                </div>
            )}
        </div>
    );
}

// ─── Alert Card ───────────────────────────────────────────────────────────────
function AlertCard({ alert }: { alert: DTAlert }) {
    const isCritical = alert.severity === 'critical';
    return (
        <div className={cn(
            'flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-md',
            isCritical
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-rose-500/5'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        )}>
            <div className={cn('p-2 rounded-xl shrink-0', isCritical ? 'bg-rose-500/20' : 'bg-amber-500/20')}>
                {isCritical ? <AlertCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                        DT {alert.phase.toUpperCase()} ALERT
                    </span>
                    <Badge variant="outline" className={cn(
                        'h-4 text-[9px] border-none font-black px-1.5',
                        isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    )}>
                        {(alert.delta * 100).toFixed(1)}% below
                    </Badge>
                </div>
                <p className="text-sm font-bold tracking-tight">{alert.metricName}</p>
                <p className="text-xs opacity-70 font-medium leading-relaxed mt-0.5">
                    {alert.metricName} {alert.phase} DT is below pre-DT baseline
                    {' '}(Avg: {Number(alert.currentAvg).toFixed(2)} vs Baseline: {Number(alert.baseline).toFixed(2)})
                </p>
            </div>
        </div>
    );
}

// ─── Metric Chart Card ────────────────────────────────────────────────────────
function MetricChartCard({ analysis }: { analysis: MetricAnalysis }) {
    const chartData = analysis.phaseData.map(p => ({
        label: p.label,
        value: p.value,
        phase: p.phase,
        baseline: analysis.baseline,
    }));

    const dtStartIndex = analysis.phaseData.findIndex(p => p.phase === 'during');
    const dtEndIndex = (() => {
        let last = -1;
        analysis.phaseData.forEach((p, i) => { if (p.phase === 'during') last = i; });
        return last;
    })();
    const dtStartLabel = dtStartIndex >= 0 ? analysis.phaseData[dtStartIndex].label : null;
    const dtEndLabel = dtEndIndex >= 0 ? analysis.phaseData[dtEndIndex].label : null;

    const lineColor = "#2563eb"; 
    const dividerColor = "#64748b";

    return (
        <Card className="rounded-[1rem] border-border bg-card overflow-hidden shadow-sm">
            <CardHeader className="p-4 pb-2 text-center">
                <CardTitle className="text-base font-medium">DT Transformation Monitoring - {analysis.metricName}</CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-2 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        
                        <XAxis
                            dataKey="label"
                            axisLine={{ stroke: '#94a3b8' }}
                            tickLine={{ stroke: '#94a3b8' }}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            dy={8}
                            label={{ value: 'Timeline', position: 'insideBottom', offset: -20, fill: '#0f172a', fontSize: 12, fontWeight: 500 }}
                        />
                        
                        <YAxis
                            axisLine={{ stroke: '#94a3b8' }}
                            tickLine={{ stroke: '#94a3b8' }}
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            tickFormatter={(v) => Number(v).toFixed(2)}
                            domain={['auto', 'auto']}
                            label={{ value: analysis.metricName, angle: -90, position: 'insideLeft', offset: -5, fill: '#0f172a', fontSize: 12, fontWeight: 500 }}
                        />
                        
                        <RechartsTooltip 
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />

                        {/* Top-left Legend */}
                        <Legend verticalAlign="top" align="left" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', color: '#0f172a' }} />

                        {/* DT Boundaries (Vertical Lines) */}
                        {dtStartLabel && (
                            <ReferenceLine
                                x={dtStartLabel}
                                stroke={dividerColor}
                                strokeDasharray="4 4"
                            />
                        )}
                        {dtEndLabel && dtEndLabel !== dtStartLabel && (
                            <ReferenceLine
                                x={dtEndLabel}
                                stroke={dividerColor}
                                strokeDasharray="4 4"
                            />
                        )}

                        {/* Phase Labels at bottom */}
                        {chartData.length > 0 && dtStartLabel && (
                            <ReferenceArea 
                                x1={chartData[0].label} x2={dtStartLabel} 
                                fill="transparent" 
                                label={{ position: 'insideBottom', value: 'Before DT', fontSize: 11, fill: '#0f172a', fontWeight: 500 }} 
                            />
                        )}
                        {dtStartLabel && dtEndLabel && (
                            <ReferenceArea 
                                x1={dtStartLabel} x2={dtEndLabel} 
                                fill="transparent" 
                                label={{ position: 'insideBottom', value: 'During DT', fontSize: 11, fill: '#0f172a', fontWeight: 500 }} 
                            />
                        )}
                        {dtEndLabel && chartData.length > 0 && (
                            <ReferenceArea 
                                x1={dtEndLabel} x2={chartData[chartData.length - 1].label} 
                                fill="transparent" 
                                label={{ position: 'insideBottom', value: 'After DT', fontSize: 11, fill: '#0f172a', fontWeight: 500 }} 
                            />
                        )}

                        {/* Main Value Line */}
                        <Line
                            name={`${analysis.metricName} Trend`}
                            type="linear"
                            dataKey="value"
                            stroke={lineColor}
                            strokeWidth={2}
                            dot={{ r: 4, fill: lineColor, stroke: lineColor }}
                            activeDot={{ r: 6, fill: lineColor }}
                            connectNulls
                        />
                        
                        {/* Fake Line for Baseline (to show in legend & draw across entire chart) */}
                        <Line
                            name={`Baseline (${Number(analysis.baseline).toFixed(2)})`}
                            type="linear"
                            dataKey="baseline"
                            stroke={lineColor}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={false}
                            isAnimationActive={false}
                        />

                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

// ─── Summary Stats ────────────────────────────────────────────────────────────
function SummaryStatCard({
    label, value, sub, icon, trend, color
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'flat';
    color?: string;
}) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-5 shadow-lg">
            <div className="flex items-start justify-between mb-3">
                <div className={cn('p-2.5 rounded-xl', color || 'bg-primary/10 text-primary')}>
                    {icon}
                </div>
                {trend && (
                    <div className={cn(
                        'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black',
                        trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' :
                            trend === 'down' ? 'bg-rose-500/10 text-rose-400' :
                                'bg-muted/20 text-muted-foreground'
                    )}>
                        {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : trend === 'down' ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
                    </div>
                )}
            </div>
            <p className="text-3xl font-black tracking-tight">{value}</p>
            <p className="text-xs font-bold text-muted-foreground mt-1">{label}</p>
            {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function DTMonitoringDashboard() {
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');

    const { data: allProjects = [] } = useProjects();
    const { data: metrics = [], isLoading: metricsLoading } = useMetrics({ source: 'manual' });
    const { data: definitions = [], isLoading: defLoading } = useMetricDefinitions();
    const { data: hierarchy } = useOrgHierarchy();

    // Only DT projects
    const dtProjects = useMemo(() =>
        (allProjects as any[]).filter((p: any) => p.isDigitalTransformation === true),
        [allProjects]
    );

    // Select first DT project by default
    const effectiveProjectId = selectedProjectId || dtProjects[0]?.id || '';

    const selectedProject = useMemo(() =>
        (allProjects as any[]).find((p: any) => p.id === effectiveProjectId),
        [allProjects, effectiveProjectId]
    );

    // Derive teams for this project
    const projectTeams = useMemo(() => {
        if (!hierarchy || !effectiveProjectId) return [];
        const teams: any[] = [];
        hierarchy.markets?.forEach((m: any) =>
            m.accounts?.forEach((a: any) =>
                a.teams?.forEach((t: any) => {
                    if (t.projectId === effectiveProjectId) teams.push(t);
                })
            )
        );
        return teams;
    }, [hierarchy, effectiveProjectId]);

    const projectTeamIds = useMemo(() => projectTeams.map((t: any) => t.id), [projectTeams]);

    // DT boundary dates
    const dtStart = useMemo(() => {
        const d = selectedProject?.digitalTransformationStartDate;
        return d ? new Date(d) : null;
    }, [selectedProject]);

    const dtEnd = useMemo(() => {
        const d = selectedProject?.digitalTransformationEndDate;
        return d ? new Date(d) : null;
    }, [selectedProject]);

    // Filter metrics to this project's teams
    const projectMetrics = useMemo(() =>
        (metrics as any[]).filter((m: any) => projectTeamIds.includes(m.teamId)),
        [metrics, projectTeamIds]
    );

    // Compute per-metric analysis
    const metricAnalyses = useMemo((): MetricAnalysis[] => {
        if (!dtStart || !dtEnd || !definitions.length) return [];

        // Group metrics by type
        const byType: Record<string, any[]> = {};
        projectMetrics.forEach((m: any) => {
            if (!byType[m.metricType]) byType[m.metricType] = [];
            byType[m.metricType].push(m);
        });

        return Object.entries(byType).map(([metricType, mList]) => {
            const def = (definitions as any[]).find((d: any) => d.metricType === metricType);
            const metricName = def?.name || metricType;

            // Sort by time
            const sorted = [...mList].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

            // Group by month for display
            const byMonth: Record<string, { values: number[]; phase: DTPhase; date: Date }> = {};
            sorted.forEach((m: any) => {
                const date = new Date(m.time);
                const phase = getPhase(date, dtStart, dtEnd);
                const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                if (!byMonth[key]) byMonth[key] = { values: [], phase, date };
                byMonth[key].values.push(Number(m.value));
            });

            const phaseData: PhaseDataPoint[] = Object.entries(byMonth).map(([label, { values, phase, date }]) => ({
                label,
                value: avg(values),
                phase,
                date,
            }));

            const beforeValues = phaseData.filter(p => p.phase === 'before').map(p => p.value as number);
            const duringValues = phaseData.filter(p => p.phase === 'during').map(p => p.value as number);
            const afterValues = phaseData.filter(p => p.phase === 'after').map(p => p.value as number);

            const baseline = beforeValues.length > 0 ? avg(beforeValues) : 0;
            const duringAvg = duringValues.length > 0 ? avg(duringValues) : null;
            const afterAvg = afterValues.length > 0 ? avg(afterValues) : null;

            // Alert logic
            const alerts: DTAlert[] = [];
            if (baseline > 0) {
                if (duringAvg !== null && duringAvg < baseline) {
                    const delta = (baseline - duringAvg) / baseline;
                    alerts.push({
                        id: `${metricType}-during`,
                        metricName,
                        phase: 'during',
                        currentAvg: duringAvg,
                        baseline,
                        delta,
                        severity: delta > 0.15 ? 'critical' : 'warning',
                    });
                }
                if (afterAvg !== null && afterAvg < baseline) {
                    const delta = (baseline - afterAvg) / baseline;
                    alerts.push({
                        id: `${metricType}-after`,
                        metricName,
                        phase: 'after',
                        currentAvg: afterAvg,
                        baseline,
                        delta,
                        severity: delta > 0.15 ? 'critical' : 'warning',
                    });
                }
            }

            return {
                metricType,
                metricName,
                baseline,
                baselineCount: beforeValues.length,
                duringAvg,
                afterAvg,
                phaseData,
                alerts,
            };
        });
    }, [projectMetrics, definitions, dtStart, dtEnd]);

    const allAlerts = useMemo(() =>
        metricAnalyses.flatMap(a => a.alerts).sort((a, b) =>
            (a.severity === 'critical' ? -1 : 1) - (b.severity === 'critical' ? -1 : 1)
        ),
        [metricAnalyses]
    );

    // Summary stats
    const summaryStats = useMemo(() => {
        const improving = metricAnalyses.filter(a =>
            a.afterAvg !== null && a.afterAvg >= a.baseline
        ).length;
        const improving_during = metricAnalyses.filter(a =>
            a.duringAvg !== null && a.duringAvg >= a.baseline
        ).length;
        const declining = metricAnalyses.filter(a =>
            (a.afterAvg !== null && a.afterAvg < a.baseline) ||
            (a.duringAvg !== null && a.duringAvg < a.baseline)
        ).length;
        const aboveBaselineAfter = metricAnalyses.filter(a => a.afterAvg !== null && a.afterAvg > a.baseline).length;
        return { improving, improving_during, declining, aboveBaselineAfter, total: metricAnalyses.length };
    }, [metricAnalyses]);

    // ─── No DT Projects State ──────────────────────────────────────────────────
    if (dtProjects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 rounded-3xl border border-dashed border-border/50 bg-card/30">
                <div className="relative">
                    <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
                    <div className="relative bg-card border border-border/50 p-5 rounded-full shadow-xl">
                        <Activity className="h-10 w-10 text-muted-foreground" />
                    </div>
                </div>
                <div className="space-y-2 max-w-md">
                    <h3 className="text-xl font-bold">No DT Projects Configured</h3>
                    <p className="text-muted-foreground text-sm">
                        Enable the <strong>DT Flag</strong> on a project and set DT Start/End dates to begin monitoring Digital Transformation performance.
                    </p>
                </div>
                <Badge className="text-xs px-3 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    Go to Projects → Edit → Enable DT Flag
                </Badge>
            </div>
        );
    }

    if (metricsLoading || defLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <Activity className="h-8 w-8 animate-pulse text-primary" />
                    <span className="text-muted-foreground font-medium">Loading DT monitoring data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header + Project Selector */}
            <div className="flex flex-wrap items-center gap-4 bg-muted/20 p-5 rounded-3xl border border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mr-auto">
                    <div className="p-2.5 rounded-2xl bg-violet-500/10 text-violet-400">
                        <Activity className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">DT Transformation Monitor</h2>
                        <p className="text-xs text-muted-foreground font-medium">
                            Baseline vs. During vs. After DT performance analysis
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">
                        DT Project
                    </span>
                    <Select value={effectiveProjectId} onValueChange={setSelectedProjectId}>
                        <SelectTrigger className="w-[220px] rounded-xl bg-background/50 border-border/50 h-10">
                            <SelectValue placeholder="Select DT Project" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            {dtProjects.map((p: any) => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* DT Period Banner */}
            {selectedProject && (
                <div className="flex flex-wrap gap-3 items-center p-4 rounded-2xl bg-violet-500/5 border border-violet-500/20">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-violet-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-violet-400">DT Period</span>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        <Badge className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold text-xs px-3 py-1">
                            Before: Pre {dtStart ? formatDate(dtStart) : '—'}
                        </Badge>
                        <span className="text-muted-foreground text-xs">→</span>
                        <Badge className="bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold text-xs px-3 py-1">
                            During: {dtStart ? formatDate(dtStart) : '—'} → {dtEnd ? formatDate(dtEnd) : '—'}
                        </Badge>
                        <span className="text-muted-foreground text-xs">→</span>
                        <Badge className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold text-xs px-3 py-1">
                            After: Post {dtEnd ? formatDate(dtEnd) : '—'}
                        </Badge>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground font-medium">
                        {projectTeamIds.length} team{projectTeamIds.length !== 1 ? 's' : ''} tracked
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryStatCard
                    label="Metrics Tracked"
                    value={summaryStats.total}
                    sub="With DT baseline"
                    icon={<BarChart3 className="h-5 w-5" />}
                    color="bg-violet-500/10 text-violet-400"
                />
                <SummaryStatCard
                    label="Above Baseline After DT"
                    value={summaryStats.aboveBaselineAfter}
                    sub="Post-DT improvement"
                    icon={<TrendingUp className="h-5 w-5" />}
                    trend={summaryStats.aboveBaselineAfter > 0 ? 'up' : 'flat'}
                    color="bg-emerald-500/10 text-emerald-400"
                />
                <SummaryStatCard
                    label="Active DT Alerts"
                    value={allAlerts.length}
                    sub={`${allAlerts.filter(a => a.severity === 'critical').length} critical`}
                    icon={<AlertCircle className="h-5 w-5" />}
                    trend={allAlerts.length > 0 ? 'down' : 'flat'}
                    color="bg-rose-500/10 text-rose-400"
                />
                <SummaryStatCard
                    label="DT Data Points"
                    value={projectMetrics.length}
                    sub="Manual metric entries"
                    icon={<Zap className="h-5 w-5" />}
                    color="bg-amber-500/10 text-amber-400"
                />
            </div>

            {/* Alerts */}
            {allAlerts.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="h-4 w-4 text-rose-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-rose-400">
                            DT Performance Alerts ({allAlerts.length})
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allAlerts.map(alert => (
                            <AlertCard key={alert.id} alert={alert} />
                        ))}
                    </div>
                </div>
            )}

            {/* Metric Charts */}
            {metricAnalyses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 rounded-2xl border border-dashed border-border/40 bg-card/30">
                    <Info className="h-8 w-8 text-muted-foreground/40" />
                    <div>
                        <p className="font-bold text-muted-foreground">No metric data for this project's teams yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            Record manual metrics for the project's teams to enable DT analysis
                        </p>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                            Metric Timelines ({metricAnalyses.length})
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {metricAnalyses.map(analysis => (
                            <MetricChartCard key={analysis.metricType} analysis={analysis} />
                        ))}
                    </div>
                </div>
            )}

            {/* No alerts positive banner */}
            {allAlerts.length === 0 && metricAnalyses.length > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <div>
                        <p className="font-bold text-emerald-400 text-sm">All metrics are performing at or above pre-DT baseline</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            No performance degradation detected during or after the Digital Transformation period
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
