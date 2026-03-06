'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar
} from 'recharts';
import {
    TrendingUp, TrendingDown, Minus, RefreshCw, Loader2,
    Zap, Bug, Users, Target, Clock, BarChart3, ShieldCheck,
    FlaskConical, AlertTriangle, Database, CheckCircle2, XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { jiraMetricsAPI } from '@/lib/api/jira-metrics';
import { useRole } from '@/contexts/role-context';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface DetailedMetric {
    type: string;
    name: string;
    uom: string;
    formula: string;
    value: string | number;
    target: string;
    trend: 'up' | 'down' | 'neutral';
}

interface MetricsData {
    connected: boolean;
    scopeLabel: string;
    scopeType: string;
    projectKeys: string[];
    data: {
        velocity: number;
        commit_ratio: string;
        productivity: number;
        defect_density: number;
        planned: number;
        delivered: number;
        assignees: number;
        bugs: number;
        velocity_per_person: number;
        delivery_commitment: string;
        defect_leakage: string;
        utilization: string;
        rsi: string;
        reopen_rate: string;
        qa_rejection_rate: string;
        detailed_metrics: DetailedMetric[];
        start_date: string;
        end_date: string;
    };
}

interface ChartData {
    connected: boolean;
    scopeLabel: string;
    data: {
        date: string;
        done: number;
        in_progress: number;
        todo: number;
        story_points: number;
    }[];
}

// ─────────────────────────────────────────────
// Colours
// ─────────────────────────────────────────────
const COLORS = {
    primary: '#8b5cf6',
    blue: '#3b82f6',
    green: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    cyan: '#06b6d4',
    orange: '#f97316',
    indigo: '#6366f1',
};
const PIE_COLORS = [COLORS.green, COLORS.blue, COLORS.amber];

// ─────────────────────────────────────────────
// Day presets
// ─────────────────────────────────────────────
const DAY_OPTIONS = [
    { label: 'Last 7 days', value: '7' },
    { label: 'Last 30 days', value: '30' },
    { label: 'Last 60 days', value: '60' },
    { label: 'Last 90 days', value: '90' },
];

// ─────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-border/60 bg-background/95 backdrop-blur-md p-3 shadow-xl text-sm">
            <p className="font-semibold text-foreground mb-2">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} className="flex items-center gap-2" style={{ color: p.color }}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                    {p.name}: <b>{p.value}</b>
                </p>
            ))}
        </div>
    );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function JiraAnalyticsTab() {
    const { role } = useRole();
    const [days, setDays] = useState('30');
    const [metrics, setMetrics] = useState<MetricsData | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [m, c] = await Promise.all([
                jiraMetricsAPI.getMetrics({ days: Number(days) }),
                jiraMetricsAPI.getChartData({ days: Number(days) }),
            ]);
            setMetrics(m);
            setChartData(c);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to load Jira metrics:', err);
        } finally {
            setLoading(false);
        }
    }, [days]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const d = metrics?.data;
    const cd = chartData?.data ?? [];
    const dms = d?.detailed_metrics ?? [];

    // ── Offline / No data state ──────────────────────────────────
    if (!loading && (!metrics?.connected || !d)) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="p-5 rounded-full bg-amber-500/10">
                    <Database className="h-10 w-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold">Jira Not Connected</h3>
                <p className="text-muted-foreground text-center max-w-sm text-sm">
                    Your Jira backend is offline or no projects are linked.
                    Go to <b>Integrations → Connect Jira</b> and map your project keys.
                </p>
                <Button variant="outline" className="rounded-xl gap-2" onClick={fetchAll}>
                    <RefreshCw className="h-4 w-4" /> Retry
                </Button>
            </div>
        );
    }

    // Pie chart for issue status breakdown from chart data
    const latestDay = cd.length > 0 ? cd[cd.length - 1] : null;
    const statusPieData = latestDay ? [
        { name: 'Done', value: latestDay.done },
        { name: 'In Progress', value: latestDay.in_progress },
        { name: 'To Do', value: latestDay.todo },
    ] : [];

    // Group detailed metrics by type
    const grouped = dms.reduce((acc: Record<string, DetailedMetric[]>, m) => {
        (acc[m.type] = acc[m.type] || []).push(m);
        return acc;
    }, {});

    return (
        <div className="space-y-6">

            {/* ── Header Bar ──────────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    {/* Scope badge */}
                    <Badge variant="outline" className="rounded-full px-3 py-1 bg-primary/10 border-primary/30 text-primary font-semibold">
                        {metrics?.scopeLabel ?? '…'}
                    </Badge>
                    {metrics?.projectKeys && metrics.projectKeys.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap">
                            {metrics.projectKeys.map(k => (
                                <Badge key={k} variant="outline" className="rounded-full text-[10px] px-2 bg-blue-500/5 border-blue-500/20 text-blue-400">
                                    {k}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {lastUpdated && (
                        <span className="text-[11px] text-muted-foreground">
                            Updated {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <Select value={days} onValueChange={setDays}>
                        <SelectTrigger className="w-36 h-8 rounded-xl text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {DAY_OPTIONS.map(o => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" className="h-8 rounded-xl gap-1.5" onClick={fetchAll} disabled={loading}>
                        <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* ── Loading Skeleton ─────────────────────────────────── */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Fetching live Jira data…</p>
                </div>
            )}

            {!loading && d && (<>

                {/* ── Top KPI Cards (8 cards) ──────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <KpiCard icon={<Zap />} label="Velocity" value={String(Math.round(d.delivered))} unit="SP" color="blue" trend="up" />
                    <KpiCard icon={<Target />} label="Commit Ratio" value={d.commit_ratio} unit="" color="green" trend="up" />
                    <KpiCard icon={<TrendingUp />} label="Productivity" value={String(d.productivity)} unit="ratio" color="purple" trend="up" />
                    <KpiCard icon={<Users />} label="Contributors" value={String(d.assignees)} unit="devs" color="indigo" trend="neutral" />
                    <KpiCard icon={<Bug />} label="Defect Density" value={String(d.defect_density)} unit="/SP" color="rose" trend="down" />
                    <KpiCard icon={<ShieldCheck />} label="Defect Leakage" value={d.defect_leakage} unit="" color="amber" trend="down" />
                    <KpiCard icon={<Clock />} label="Utilization" value={d.utilization} unit="" color="cyan" trend="up" />
                    <KpiCard icon={<BarChart3 />} label="Delivery %" value={d.delivery_commitment} unit="" color="orange" trend="up" />
                </div>

                {/* ── Charts Row 1: Status Trend + Story Points ───────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Status Trend */}
                    <Card className="border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Daily Issue Status Trend</CardTitle>
                            <CardDescription>Done · In Progress · To Do over {days} days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {cd.length === 0 ? <EmptyChart /> : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={cd} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.amber} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={COLORS.amber} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                        <Area type="monotone" dataKey="done" name="Done" stroke={COLORS.green} fill="url(#gg)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="in_progress" name="In Progress" stroke={COLORS.blue} fill="url(#gb)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="todo" name="To Do" stroke={COLORS.amber} fill="url(#ga)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Story Points Delivered */}
                    <Card className="border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Story Points Delivered Per Day</CardTitle>
                            <CardDescription>Daily completed story point volume</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {cd.length === 0 ? <EmptyChart /> : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={cd} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={1} />
                                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.4} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="story_points" name="Story Points" fill="url(#gp)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Charts Row 2: Status Pie + Velocity Per Person + RSI ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Status Distribution Pie */}
                    <Card className="border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Status Distribution</CardTitle>
                            <CardDescription>Latest day snapshot</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {statusPieData.every(s => s.value === 0) ? <EmptyChart /> : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                                            paddingAngle={4} dataKey="value" labelLine={false}
                                            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                            {statusPieData.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Velocity Per Person */}
                    <Card className="border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Velocity per Contributor</CardTitle>
                            <CardDescription>Story points delivered per active dev</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center h-[220px] gap-2">
                            <div className="relative flex items-center justify-center">
                                <ResponsiveContainer width={160} height={160}>
                                    <RadialBarChart
                                        innerRadius={50} outerRadius={70}
                                        data={[{ name: 'Velocity/Person', value: Math.min(Number(d.velocity_per_person ?? 0), 20), fill: COLORS.cyan }]}
                                        startAngle={180} endAngle={-180}
                                    >
                                        <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={6} />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                                <div className="absolute text-center">
                                    <p className="text-3xl font-black text-cyan-400">{d.velocity_per_person ?? 0}</p>
                                    <p className="text-[10px] text-muted-foreground">SP / dev</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{d.assignees} contributors total</p>
                        </CardContent>
                    </Card>

                    {/* RSI Gauge */}
                    <Card className="border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Requirements Stability Index</CardTitle>
                            <CardDescription>% of sprint scope unchanged after start</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center h-[220px] gap-2">
                            <div className="relative flex items-center justify-center">
                                <ResponsiveContainer width={160} height={160}>
                                    <RadialBarChart
                                        innerRadius={50} outerRadius={70}
                                        data={[{ value: parseFloat(String(d.rsi ?? 0)), fill: COLORS.indigo }]}
                                        startAngle={180} endAngle={-180}
                                    >
                                        <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={6} />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                                <div className="absolute text-center">
                                    <p className="text-3xl font-black text-indigo-400">{d.rsi ?? '—'}</p>
                                    <p className="text-[10px] text-muted-foreground">Stability</p>
                                </div>
                            </div>
                            <Badge variant="outline" className={cn('rounded-full text-xs',
                                parseFloat(String(d.rsi ?? 0)) >= 85 ? 'text-green-500 border-green-500/30' : 'text-amber-500 border-amber-500/30'
                            )}>
                                Target: &gt; 85%
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Charts Row 3: Quality Metrics Line Chart ─────────── */}
                <Card className="border-border/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Quality Metrics Over Time</CardTitle>
                        <CardDescription>Done issues vs Bug count per day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {cd.length === 0 ? <EmptyChart /> : (
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={cd} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 11 }} />
                                    <Line type="monotone" dataKey="done" name="Done Issues" stroke={COLORS.green} strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="todo" name="Backlog" stroke={COLORS.rose} strokeWidth={2} dot={false} strokeDasharray="4 2" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* ── All 12 Metrics Detailed Table ────────────────────── */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold">All 12 Agile Metrics — {metrics?.scopeLabel}</h3>
                    {Object.entries(grouped).map(([type, items]) => (
                        <div key={type}>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 ml-1">
                                {type}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {items.map((m) => (
                                    <MetricDetailCard key={m.name} metric={m} />
                                ))}
                            </div>
                        </div>
                    ))}

                    {dms.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground text-sm">
                            No metric data available yet. Connect Jira and trigger some webhook events.
                        </div>
                    )}
                </div>

                {/* ── Date Range ───────────────────────────────────────── */}
                {d.start_date && (
                    <p className="text-[11px] text-muted-foreground text-center">
                        Data range: {d.start_date} → {d.end_date}
                    </p>
                )}
            </>)}
        </div>
    );
}

// ─────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────

function KpiCard({
    icon, label, value, unit, color, trend,
}: {
    icon: React.ReactNode; label: string; value: string; unit: string;
    color: 'blue' | 'green' | 'purple' | 'indigo' | 'rose' | 'amber' | 'cyan' | 'orange'; trend: 'up' | 'down' | 'neutral';
}) {
    const colorMap: Record<string, string> = {
        blue: 'text-blue-400   bg-blue-500/10   border-blue-500/20',
        green: 'text-green-400  bg-green-500/10  border-green-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        rose: 'text-rose-400   bg-rose-500/10   border-rose-500/20',
        amber: 'text-amber-400  bg-amber-500/10  border-amber-500/20',
        cyan: 'text-cyan-400   bg-cyan-500/10   border-cyan-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    };
    const cls = colorMap[color];
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendCls = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-rose-400' : 'text-muted-foreground';

    return (
        <Card className={cn('border group hover:-translate-y-0.5 transition-all duration-200', cls.split(' ')[2])}>
            <CardContent className="p-4 flex items-center gap-3">
                <div className={cn('p-2.5 rounded-xl shrink-0', cls.split(' ')[0], cls.split(' ')[1])}>
                    <span className="h-4 w-4 block">{icon}</span>
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground truncate">{label}</p>
                    <p className={cn('text-xl font-black leading-none mt-0.5', cls.split(' ')[0])}>
                        {value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
                    </p>
                </div>
                <TrendIcon className={cn('h-4 w-4 shrink-0 ml-auto', trendCls)} />
            </CardContent>
        </Card>
    );
}

function MetricDetailCard({ metric }: { metric: DetailedMetric }) {
    const isBad = metric.trend === 'down';
    const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
    const trendCls = metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-rose-400' : 'text-muted-foreground';

    return (
        <Card className="border-border/40 hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold leading-tight">{metric.name}</p>
                    <TrendIcon className={cn('h-4 w-4 shrink-0 mt-0.5', trendCls)} />
                </div>
                <p className="text-2xl font-black text-foreground">
                    {typeof metric.value === 'number'
                        ? metric.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                        : metric.value}
                    <span className="text-xs font-normal text-muted-foreground ml-1">{metric.uom}</span>
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Target: <b>{metric.target}</b></span>
                    <Badge variant="outline" className="text-[9px] rounded-full px-2 py-0">
                        {metric.type}
                    </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border/30 pt-2">
                    {metric.formula}
                </p>
            </CardContent>
        </Card>
    );
}

function EmptyChart() {
    return (
        <div className="flex flex-col items-center justify-center h-[180px] gap-2 text-muted-foreground">
            <AlertTriangle className="h-6 w-6" />
            <p className="text-xs">No data for this period</p>
        </div>
    );
}
