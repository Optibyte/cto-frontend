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
    Download,
    Calendar,
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
} from 'recharts';
import { cn } from '@/lib/utils';
import { useSprintMetrics } from '@/hooks/use-metrics';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { useProjects } from '@/hooks/use-projects';

// ─── Types ────────────────────────────────────────────────────────────────────

type DTPhase = 'before' | 'during' | 'after';

interface PhaseDataPoint {
    label: string;
    value: number | null;
    phase: DTPhase;
    date: Date;
    sprintNumber: number;
}

interface MetricAnalysis {
    metricType: string;
    metricName: string;
    baseline: number;
    ucl: number;
    lcl: number;
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

function getPhaseForMetric(m: any, defaultProject: any): DTPhase {
    const sDate = m.sprintDate ? new Date(m.sprintDate) : (m.time ? new Date(m.time) : null);
    
    // Look for team-level dates first, fallback to project-level dates
    const tStart = m.team?.transformationStartDate ? new Date(m.team.transformationStartDate) : 
                   (defaultProject?.digitalTransformationStartDate ? new Date(defaultProject.digitalTransformationStartDate) : null);
    const tEnd = m.team?.transformationEndDate ? new Date(m.team.transformationEndDate) : 
                 (defaultProject?.digitalTransformationEndDate ? new Date(defaultProject.digitalTransformationEndDate) : null);

    if (!sDate || !tStart) {
        // Fall back to sprint number rule
        const sprint = Number(m.sprintNumber || 1);
        if (sprint <= 3) return 'before';
        if (sprint <= 7) return 'during';
        return 'after';
    }

    if (sDate < tStart) return 'before';
    if (tEnd && sDate > tEnd) return 'after';
    return 'during';
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
function CustomTooltip({ active, payload, label, analysis }: any) {
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
            {val !== null && val !== undefined && analysis && (
                <div className="mt-2 pt-2 border-t border-border/20 space-y-1 text-[10px] text-muted-foreground">
                    <p>
                        {val >= analysis.baseline
                            ? <span className="text-emerald-400 font-bold">↑ {(val - analysis.baseline).toFixed(2)} above baseline</span>
                            : <span className="text-rose-400 font-bold">↓ {(analysis.baseline - val).toFixed(2)} below baseline</span>
                        }
                    </p>
                    {val > analysis.ucl && (
                        <p className="text-emerald-500 font-bold">⚠️ Exceeds UCL (+2σ)</p>
                    )}
                    {val < analysis.lcl && (
                        <p className="text-rose-500 font-bold">⚠️ Below LCL (-2σ)</p>
                    )}
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
                        TRANSFORMATION {alert.phase.toUpperCase()} ALERT
                    </span>
                    <Badge variant="outline" className={cn(
                        'h-4 text-[9px] border-none font-black px-1.5',
                        isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    )}>
                        {(alert.delta * 100).toFixed(1)}% drop
                    </Badge>
                </div>
                <p className="text-sm font-bold tracking-tight">{alert.metricName}</p>
                <p className="text-xs opacity-70 font-medium leading-relaxed mt-0.5">
                    {alert.metricName} {alert.phase} DT dropped by {(alert.delta * 100).toFixed(1)}% compared to baseline
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
        ucl: analysis.ucl,
        lcl: analysis.lcl,
    }));

    const dtStartIndex = analysis.phaseData.findIndex(p => p.phase === 'during');
    const dtEndIndex = (() => {
        let last = -1;
        analysis.phaseData.forEach((p, i) => { if (p.phase === 'during') last = i; });
        return last;
    })();
    const dtStartLabel = dtStartIndex >= 0 ? analysis.phaseData[dtStartIndex].label : null;
    const dtEndLabel = dtEndIndex >= 0 ? analysis.phaseData[dtEndIndex].label : null;

    const lineColor = "#6366f1"; 
    const dividerColor = "#94a3b8";

    return (
        <Card className="rounded-[2rem] border-border/50 bg-background/50 backdrop-blur-2xl overflow-hidden shadow-xl">
            <CardHeader className="p-6 pb-2">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg font-black tracking-tight">{analysis.metricName}</CardTitle>
                        <CardDescription className="text-[10px] font-medium">Control limits based on Pre-Transformation baseline phase</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-bold">SPC Mode</Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 pt-2 h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                        
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                            dy={8}
                        />
                        
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                            tickFormatter={(v) => Number(v).toFixed(1)}
                            domain={['auto', 'auto']}
                        />
                        
                        <RechartsTooltip 
                            content={<CustomTooltip analysis={analysis} />}
                        />

                        {/* Central Line / Baseline Reference */}
                        <ReferenceLine
                            y={analysis.baseline}
                            stroke="#10b981"
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            label={{ value: `CL: ${analysis.baseline.toFixed(1)}`, position: 'insideTopLeft', fill: '#10b981', fontSize: 9, fontWeight: 'bold' }}
                        />

                        {/* UCL and LCL Control Limits */}
                        <ReferenceLine
                            y={analysis.ucl}
                            stroke="#ef4444"
                            strokeWidth={1.5}
                            strokeDasharray="2 3"
                            label={{ value: `UCL (+2σ): ${analysis.ucl.toFixed(1)}`, position: 'insideTopRight', fill: '#ef4444', fontSize: 9, fontWeight: 'bold' }}
                        />
                        <ReferenceLine
                            y={analysis.lcl}
                            stroke="#ef4444"
                            strokeWidth={1.5}
                            strokeDasharray="2 3"
                            label={{ value: `LCL (-2σ): ${analysis.lcl.toFixed(1)}`, position: 'insideBottomRight', fill: '#ef4444', fontSize: 9, fontWeight: 'bold' }}
                        />

                        {/* DT Phase Boundaries (Vertical Lines) */}
                        {dtStartLabel && (
                            <ReferenceLine
                                x={dtStartLabel}
                                stroke={dividerColor}
                                strokeWidth={1}
                                strokeDasharray="3 3"
                            />
                        )}
                        {dtEndLabel && dtEndLabel !== dtStartLabel && (
                            <ReferenceLine
                                x={dtEndLabel}
                                stroke={dividerColor}
                                strokeWidth={1}
                                strokeDasharray="3 3"
                            />
                        )}

                        {/* Main Value Line */}
                        <Line
                            name={`${analysis.metricName} Value`}
                            type="monotone"
                            dataKey="value"
                            stroke={lineColor}
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: lineColor, stroke: lineColor }}
                            activeDot={{ r: 6, fill: lineColor }}
                            connectNulls
                        />

                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function DTMonitoringDashboard() {
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [sprintFilter, setSprintFilter] = useState<'all' | 'recent' | 'recent5' | 'recent10'>('all');

    const { data: allProjects = [] } = useProjects();
    const { data: sprintMetrics = [], isLoading: metricsLoading } = useSprintMetrics();
    const { data: hierarchy } = useOrgHierarchy();

    // All active projects
    const dtProjects = useMemo(() =>
        (allProjects as any[]).filter((p: any) => p.isDigitalTransformation === true || p.aiEnabled === true),
        [allProjects]
    );

    const effectiveProjectId = selectedProjectId || dtProjects[0]?.id || '';

    const selectedProject = useMemo(() =>
        (allProjects as any[]).find((p: any) => p.id === effectiveProjectId),
        [allProjects, effectiveProjectId]
    );

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

    const projectMetrics = useMemo(() =>
        (sprintMetrics as any[]).filter((m: any) => projectTeamIds.includes(m.teamId)),
        [sprintMetrics, projectTeamIds]
    );

    // Compute metrics
    const metricAnalyses = useMemo((): MetricAnalysis[] => {
        if (projectMetrics.length === 0) return [];

        const sprintFields = [
            { key: 'velocityPoints', name: 'Sprint Velocity', higherIsBetter: true },
            { key: 'throughputPoints', name: 'Throughput Points', higherIsBetter: true },
            { key: 'qualityScore', name: 'Quality Score (%)', higherIsBetter: true },
            { key: 'doneToSaidRatio', name: 'Done to Said Ratio (%)', higherIsBetter: true },
            { key: 'technicalDebtIndex', name: 'Technical Debt Index', higherIsBetter: false },
        ];

        return sprintFields.map(field => {
            const mList = projectMetrics.map(m => ({
                 value: Number(m[field.key] || 0),
                 sprintNumber: Number(m.sprintNumber || 1),
                 sprintDate: m.sprintDate || m.time || null,
                 team: m.team,
            })).sort((a, b) => a.sprintNumber - b.sprintNumber);

            // Group by Sprint Number
            const bySprint: Record<number, { values: number[]; phase: DTPhase; sprintNumber: number }> = {};
            mList.forEach((m: any) => {
                const sprint = m.sprintNumber;
                const phase = getPhaseForMetric(m, selectedProject);
                if (!bySprint[sprint]) bySprint[sprint] = { values: [], phase, sprintNumber: sprint };
                bySprint[sprint].values.push(m.value);
            });

            // Convert to phase datapoints
            let phaseData: PhaseDataPoint[] = Object.values(bySprint).map(({ values, phase, sprintNumber }) => ({
                label: `Sprint ${sprintNumber}`,
                value: avg(values),
                phase,
                date: new Date(), 
                sprintNumber
            })).sort((a, b) => a.sprintNumber - b.sprintNumber);

            // Calculate UCL/LCL on BEFORE phase values
            const beforeValues = phaseData.filter(p => p.phase === 'before').map(p => p.value as number);
            const baseline = beforeValues.length > 0 ? avg(beforeValues) : 0;
            
            let std = 0;
            if (beforeValues.length > 1) {
                const variance = beforeValues.reduce((sum, v) => sum + Math.pow(v - baseline, 2), 0) / (beforeValues.length - 1);
                std = Math.sqrt(variance);
            }
            const ucl = baseline + 2 * std;
            const lcl = Math.max(0, baseline - 2 * std);

            const duringValues = phaseData.filter(p => p.phase === 'during').map(p => p.value as number);
            const afterValues = phaseData.filter(p => p.phase === 'after').map(p => p.value as number);
            const duringAvg = duringValues.length > 0 ? avg(duringValues) : null;
            const afterAvg = afterValues.length > 0 ? avg(afterValues) : null;

            // Apply Date Wise / Recent Sprint Filtering
            if (sprintFilter === 'recent') {
                phaseData = phaseData.slice(-1);
            } else if (sprintFilter === 'recent5') {
                phaseData = phaseData.slice(-5);
            } else if (sprintFilter === 'recent10') {
                phaseData = phaseData.slice(-10);
            }

            // Anomaly/Degradation Alerts (degradation of 50% or violating LCL/UCL control limits)
            const alerts: DTAlert[] = [];
            if (baseline > 0) {
                if (duringAvg !== null) {
                    const isWorse = field.higherIsBetter ? duringAvg < baseline : duringAvg > baseline;
                    if (isWorse) {
                        const delta = Math.abs(baseline - duringAvg) / baseline;
                        if (delta >= 0.50) {
                            alerts.push({
                                id: `${field.key}-during`,
                                metricName: field.name,
                                phase: 'during',
                                currentAvg: duringAvg,
                                baseline,
                                delta,
                                severity: 'critical',
                            });
                        }
                    }
                }
                if (afterAvg !== null) {
                    const isWorse = field.higherIsBetter ? afterAvg < baseline : afterAvg > baseline;
                    if (isWorse) {
                        const delta = Math.abs(baseline - afterAvg) / baseline;
                        if (delta >= 0.50) {
                            alerts.push({
                                id: `${field.key}-after`,
                                metricName: field.name,
                                phase: 'after',
                                currentAvg: afterAvg,
                                baseline,
                                delta,
                                severity: 'critical',
                            });
                        }
                    }
                }
            }

            return {
                metricType: field.key,
                metricName: field.name,
                baseline,
                ucl,
                lcl,
                baselineCount: beforeValues.length,
                duringAvg,
                afterAvg,
                phaseData,
                alerts,
            };
        });
    }, [projectMetrics, selectedProject, sprintFilter]);

    const allAlerts = useMemo(() =>
        metricAnalyses.flatMap(a => a.alerts).sort((a, b) =>
            (a.severity === 'critical' ? -1 : 1) - (b.severity === 'critical' ? -1 : 1)
        ),
        [metricAnalyses]
    );

    const handleExportReport = () => {
        if (metricAnalyses.length === 0) return;

        let csv = 'Metric,Phase,Sprint,Value,Baseline,UCL,LCL,Variance\n';

        metricAnalyses.forEach(analysis => {
            analysis.phaseData.forEach(p => {
                if (p.value !== null) {
                    const variance = p.value - analysis.baseline;
                    csv += `"${analysis.metricName}","${p.phase}","${p.label}",${p.value.toFixed(2)},${analysis.baseline.toFixed(2)},${analysis.ucl.toFixed(2)},${analysis.lcl.toFixed(2)},${variance.toFixed(2)}\n`;
                }
            });
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Transformation_Metrics_Report_${selectedProject?.name?.replace(/\s+/g, '_') || 'Project'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const summaryStats = useMemo(() => {
        const improving = metricAnalyses.filter(a =>
            a.afterAvg !== null && a.afterAvg >= a.baseline
        ).length;
        const aboveBaselineAfter = metricAnalyses.filter(a => a.afterAvg !== null && a.afterAvg > a.baseline).length;
        return { improving, aboveBaselineAfter, total: metricAnalyses.length };
    }, [metricAnalyses]);

    if (dtProjects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 rounded-[2rem] border border-dashed border-border/50 bg-card/30">
                <div className="relative">
                    <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
                    <div className="relative bg-card border border-border/50 p-5 rounded-full shadow-xl">
                        <Activity className="h-10 w-10 text-muted-foreground" />
                    </div>
                </div>
                <div className="space-y-2 max-w-md">
                    <h3 className="text-xl font-bold">No Transformation Projects</h3>
                    <p className="text-muted-foreground text-sm">
                        Enable Transformation or AI flags on projects to monitor performance timelines.
                    </p>
                </div>
            </div>
        );
    }

    if (metricsLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                    <Activity className="h-8 w-8 animate-pulse text-primary" />
                    <span className="text-muted-foreground font-semibold uppercase tracking-widest text-xs">Loading Transformation Monitor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Selector */}
            <div className="flex flex-wrap items-center justify-between gap-5 p-6 rounded-[2rem] bg-white/50 dark:bg-black/20 border border-border/50 backdrop-blur-xl shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight">Transformation Monitor</h2>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                            Date-wise performance monitoring relative to Before, During, and After transformation phases
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Sprint Filter */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Filter Sprints
                        </span>
                        <Select value={sprintFilter} onValueChange={(val: any) => setSprintFilter(val)}>
                            <SelectTrigger className="w-[180px] rounded-xl bg-background/50 border-border/50 h-10 font-bold text-xs shadow-sm">
                                <SelectValue placeholder="All Sprints" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                <SelectItem value="all" className="font-bold text-xs">All Sprints</SelectItem>
                                <SelectItem value="recent" className="font-bold text-xs">Recent Sprint Completed</SelectItem>
                                <SelectItem value="recent5" className="font-bold text-xs">Last 5 Sprints</SelectItem>
                                <SelectItem value="recent10" className="font-bold text-xs">Last 10 Sprints</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Project Selector */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">Project Scope</span>
                        <Select value={effectiveProjectId} onValueChange={setSelectedProjectId}>
                            <SelectTrigger className="w-[200px] rounded-xl bg-background/50 border-border/50 h-10 font-bold text-xs shadow-sm">
                                <SelectValue placeholder="Select Project" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                {dtProjects.map((p: any) => (
                                    <SelectItem key={p.id} value={p.id} className="font-bold text-xs">{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <Button 
                        onClick={handleExportReport} 
                        disabled={metricAnalyses.length === 0}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 font-bold text-xs mt-4"
                    >
                        <Download className="h-4 w-4 mr-2" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Timeline phase banner */}
            {selectedProject && (
                <div className="flex flex-wrap gap-4 items-center p-5 rounded-[2rem] bg-indigo-500/[0.03] border border-indigo-500/10">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Date-wise Phases</span>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-black text-[10px] px-3 py-1">
                            Before Transformation
                        </Badge>
                        <span className="text-muted-foreground/40 text-xs">→</span>
                        <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black text-[10px] px-3 py-1">
                            During Transformation
                        </Badge>
                        <span className="text-muted-foreground/40 text-xs">→</span>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-[10px] px-3 py-1">
                            After Transformation (Target Achieved)
                        </Badge>
                    </div>
                    <div className="ml-auto text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {projectTeamIds.length} Teams Monitored
                    </div>
                </div>
            )}

            {/* Alerts */}
            {allAlerts.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-rose-500">
                            Transformation Alerts ({allAlerts.length})
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
                        {allAlerts.map(alert => (
                            <AlertCard key={alert.id} alert={alert} />
                        ))}
                    </div>
                </div>
            )}

            {/* Timelines Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {metricAnalyses.map(analysis => (
                    <MetricChartCard key={analysis.metricType} analysis={analysis} />
                ))}
            </div>

            {/* Perfect state banner */}
            {allAlerts.length === 0 && metricAnalyses.length > 0 && (
                <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-emerald-500/[0.04] border border-emerald-500/25 shadow-xl shadow-emerald-500/[0.02]">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                    <div>
                        <p className="font-bold text-emerald-400 text-sm">Transformation target objectives satisfied</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            All performance timelines are operating within standard baseline limits or demonstrating positive growth.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
