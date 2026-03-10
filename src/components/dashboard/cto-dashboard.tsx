'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar,
    ComposedChart, Scatter
} from 'recharts';
import {
    TrendingUp, TrendingDown, Minus, RefreshCw, Loader2,
    Zap, Bug, Users, Target, Clock, BarChart3, ShieldCheck, Activity,
    FlaskConical, AlertTriangle, Database, CheckCircle2, XCircle, Gauge,
    Layers, GitBranch, Shield, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { jiraMetricsAPI } from '@/lib/api/jira-metrics';
import { useRole } from '@/contexts/role-context';
import { marketsAPI, adminAccountsAPI, adminProjectsAPI, adminTeamsAPI } from '@/lib/api/admin';
import { useAppSelector } from '@/redux/store';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { useProjects } from '@/hooks/use-projects';
import { GithubMetricsWidget } from '@/components/dashboard/github-metrics-widget';

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

interface DailyTrend {
    date: string;
    done: number;
    in_progress: number;
    todo: number;
    story_points: number;
}

interface MetricsResponse {
    status: string;
    metrics: {
        velocity: { sprintName: string; velocity: number; issueCount: number }[];
        defects: { bugCount: number; totalCount: number; defectRate: string };
        trend: any[];
        delivery: { completedItems: number; committedItems: number; commitmentMet: string };
        productivity: {
            productivity: string;
            doneToSaidRatio: string;
            velocityPerPerson: string;
            resourceUtilization: string;
        };
        advancedQuality: {
            defectLeakage: string;
            defectDensityEffort: string;
            requirementsStability: string;
            defectReopenRate: string;
            qaDefectRejectionRate: string;
        };
    };
    charts: {
        dailyTrend: DailyTrend[];
        statusDistribution: { name: string; value: number }[];
        priorityDistribution: { name: string; value: number }[];
        typeDistribution: { name: string; value: number }[];
        assigneeWorkload: { name: string; storyPoints: number; issueCount: number }[];
        velocityBySprint: { sprintName: string; velocity: number; issueCount: number }[];
    };
    summary: {
        totalIssues: number;
        totalEvents: number;
        deliveredSP: number;
        plannedSP: number;
        teamSize: number;
        totalBugs: number;
        doneCount: number;
        inProgressCount: number;
        todoCount: number;
    };
    detailedMetrics: DetailedMetric[];
    generatedAt: string;
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
    pink: '#ec4899',
    teal: '#14b8a6',
    lime: '#84cc16',
    sky: '#0ea5e9',
};
const PIE_COLORS = [COLORS.green, COLORS.blue, COLORS.amber, COLORS.rose, COLORS.cyan, COLORS.orange, COLORS.indigo, COLORS.pink];
const PRIORITY_COLORS: Record<string, string> = {
    'Highest': '#ef4444', 'High': '#f97316', 'Medium': '#f59e0b',
    'Low': '#22c55e', 'Lowest': '#6b7280', 'None': '#9ca3af',
};

// ─────────────────────────────────────────────
// Day presets
// ─────────────────────────────────────────────


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
                    {p.name}: <b>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</b>
                </p>
            ))}
        </div>
    );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function CTODashboard() {
    const { role } = useRole();
    const [days, setDays] = useState('30');

    // Dynamic Filter states
    const [marketId, setMarketId] = useState('all');
    const [accountId, setAccountId] = useState('all');
    const [projectId, setProjectId] = useState('all');
    const [teamId, setTeamId] = useState('all');
    const [memberId, setMemberId] = useState('all');

    // Jira Dynamic Data (directly from webhooks)
    const [jiraProjects, setJiraProjects] = useState<any[]>([]);
    const [jiraTeams, setJiraTeams] = useState<any[]>([]);
    const [jiraMembers, setJiraMembers] = useState<any[]>([]);

    const { data: hierarchy } = useOrgHierarchy();
    const { data: allProjects = [] } = useProjects();
    const [data, setData] = useState<MetricsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { dateRange } = useAppSelector((s) => s.dashboard);

    const markets = hierarchy?.markets || [];
    const currentMarket = markets.find(m => m.id === marketId);
    const accounts = currentMarket?.accounts || [];
    const currentAccount = accounts.find(a => a.id === accountId);

    // For projects: if an account is selected, show its projects. Otherwise show all projects.
    let filteredProjects: any[] = [];
    if (accountId !== 'all') {
        const accountTeams = currentAccount?.teams || [];
        const projectMap = new Map();
        accountTeams.forEach((t: any) => {
            if (t.project) projectMap.set(t.project.id, t.project);
        });
        filteredProjects = Array.from(projectMap.values());
    } else {
        filteredProjects = allProjects;
    }

    const filteredTeams = accountId !== 'all'
        ? (currentAccount?.teams || [])
        : (projectId !== 'all' ? (allProjects.find((p: any) => p.id === projectId)?.teams || []) : []);
    const [dynamicMarkets, setDynamicMarkets] = useState<any[]>([]);
    const [dynamicAccounts, setDynamicAccounts] = useState<any[]>([]);
    const [dynamicProjects, setDynamicProjects] = useState<any[]>([]);
    const [dynamicTeams, setDynamicTeams] = useState<any[]>([]);

    useEffect(() => {
        async function fetchDropdowns() {
            try {
                const [m, a, p, t] = await Promise.all([
                    marketsAPI.getAll().catch(() => []),
                    adminAccountsAPI.getAll().catch(() => []),
                    adminProjectsAPI.getAll().catch(() => []),
                    adminTeamsAPI.getAll().catch(() => [])
                ]);
                setDynamicMarkets(m || []);
                setDynamicAccounts(a || []);
                setDynamicProjects(p || []);
                setDynamicTeams(t || []);
            } catch (e) {
                console.error("Failed to fetch dropdowns:", e);
            }
        }
        async function fetchJiraFilters() {
            try {
                const res = await jiraMetricsAPI.getDynamicFilters();
                if (res.status === 'success') {
                    setJiraProjects(res.projects || []);
                    setJiraTeams(res.teams || []);
                    setJiraMembers(res.members || []);
                }
            } catch (e) {
                console.error("Failed to fetch Jira dynamic filters:", e);
            }
        }

        fetchDropdowns();
        fetchJiraFilters();
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await jiraMetricsAPI.getMetrics({
                days: Number(days),
                marketId,
                accountId,
                projectId,
                teamId,
                memberId,
                start: dateRange?.from,
                end: dateRange?.to
            });
            setData(result);
            setLastUpdated(new Date());
        } catch (err: any) {
            console.error('Failed to load Jira metrics:', err);
            setError(err.message || 'Failed to load metrics');
        } finally {
            setLoading(false);
        }
    }, [days, marketId, accountId, projectId, teamId, memberId, dateRange]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const [drillDownData, setDrillDownData] = useState<any[] | null>(null);
    const [drillView, setDrillView] = useState<string>('none');

    const handleDrill = async (view: string) => {
        setLoading(true);
        setDrillView(view);
        try {
            if (view === 'none') {
                setDrillDownData(null);
            } else if (view === 'market') {
                const res = await jiraMetricsAPI.getByMarket();
                setDrillDownData(res.metrics);
            } else if (view === 'account') {
                const res = await jiraMetricsAPI.getByAccount();
                setDrillDownData(res.metrics);
            } else if (view === 'team') {
                const res = await jiraMetricsAPI.getByTeam();
                setDrillDownData(res.metrics);
            } else if (view === 'project') {
                const res = await jiraMetricsAPI.getByProject();
                setDrillDownData(res.metrics);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    // ── Offline / No data state ──────────────────────────────────
    if (!loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="p-5 rounded-full bg-amber-500/10">
                    <Database className="h-10 w-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold">Jira Not Connected</h3>
                <p className="text-muted-foreground text-center max-w-sm text-sm">
                    {error || 'No data returned from backend for your scope.'}
                </p>
                <Button variant="outline" className="rounded-xl gap-2" onClick={fetchAll}>
                    <RefreshCw className="h-4 w-4" /> Retry
                </Button>
            </div>
        );
    }

    // Shortcut references
    const d = data?.metrics;
    const charts = data?.charts;
    const summary = data?.summary;
    const detailedMetrics = data?.detailedMetrics || [];

    // Aggregate values
    const aggVelocity = d?.velocity?.reduce((sum, s) => sum + s.velocity, 0) || 0;
    const aggVelocityString = Math.round(aggVelocity).toString();
    const aggBugs = d?.defects?.bugCount || 0;
    const aggDefectRate = d?.defects?.defectRate || '0.00';
    const aggCommitment = (d?.delivery?.commitmentMet || '0') + '%';
    const completedItems = d?.delivery?.completedItems || 0;
    const totalItems = d?.delivery?.committedItems || 0;

    // Chart data
    const dailyTrend = charts?.dailyTrend || [];
    const statusDistribution = charts?.statusDistribution || [];
    const priorityDistribution = charts?.priorityDistribution || [];
    const typeDistribution = charts?.typeDistribution || [];
    const assigneeWorkload = charts?.assigneeWorkload || [];
    const velocityBySprint = charts?.velocityBySprint || [];

    const filteredDynamicAccounts = dynamicAccounts.filter(a => marketId === 'all' || a.marketId === marketId);
    const filteredDynamicProjects = accountId === 'all' ? dynamicProjects : dynamicProjects.filter(p => !p.accountId || p.accountId === accountId);
    const filteredDynamicTeams = projectId === 'all' ? dynamicTeams : dynamicTeams.filter(t => !t.projectId || t.projectId === projectId);

    // Merge CTO admin projects with dynamic Jira projects (unique by id)
    const combinedProjects = [...filteredDynamicProjects];
    jiraProjects.forEach(jp => {
        if (!combinedProjects.find(p => p.id === jp.id || p.jiraProjectKey === jp.id)) {
            combinedProjects.push(jp);
        }
    });

    // Merge CTO admin teams with dynamic Jira teams (sprints)
    const combinedTeams = [...filteredDynamicTeams];
    jiraTeams.forEach(jt => {
        if (!combinedTeams.find(t => t.id === jt.id || t.name === jt.name)) {
            combinedTeams.push(jt);
        }
    });

    return (
        <div className="space-y-6">

            {/* ── GitHub Metrics Widget (shown when a project is selected) ── */}
            {projectId !== 'all' && (
                <GithubMetricsWidget projectId={projectId} />
            )}

            {/* ── Header Bar ──────────────────────────────────── */}
            <div className="flex flex-col gap-4">

                {/* Inline Scope Filters */}
                <div className="bg-muted/30 p-3 rounded-2xl border border-border/40 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row items-center gap-3">

                    {(role === 'ORG') && (
                        <Select value={marketId} onValueChange={(v) => { setMarketId(v); setAccountId('all'); setProjectId('all'); setTeamId('all'); setMemberId('all'); }}>
                            <SelectTrigger className="w-full lg:w-[160px] h-8 rounded-xl text-sm bg-background">
                                <SelectValue placeholder="All Markets" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Markets</SelectItem>
                                {markets.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                                {dynamicMarkets.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                    {(role === 'ORG' || role === 'MARKET') && (
                        <Select value={accountId} onValueChange={(v) => { setAccountId(v); setProjectId('all'); setTeamId('all'); setMemberId('all'); }}>
                            <SelectTrigger className="w-full lg:w-[160px] h-8 rounded-xl text-sm bg-background">
                                <SelectValue placeholder="All Accounts" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Accounts</SelectItem>
                                {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                {filteredDynamicAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                    {(role === 'ORG' || role === 'MARKET' || role === 'ACCOUNT') && (
                        <Select value={projectId} onValueChange={(v) => { setProjectId(v); setTeamId('all'); setMemberId('all'); }}>
                            <SelectTrigger className="w-full lg:w-[160px] h-8 rounded-xl text-sm bg-background">
                                <SelectValue placeholder="All Projects" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Projects</SelectItem>
                                {filteredProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                {combinedProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                    {role !== 'TEAM' && (
                        <Select value={teamId} onValueChange={(v) => { setTeamId(v); setMemberId('all'); }}>
                            <SelectTrigger className="w-full lg:w-[160px] h-8 rounded-xl text-sm bg-background">
                                <SelectValue placeholder="All Teams" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Teams</SelectItem>
                                {filteredTeams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                {combinedTeams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                    {role !== 'TEAM' && (
                        <Select value={memberId} onValueChange={setMemberId}>
                            <SelectTrigger className="w-full lg:w-[160px] h-8 rounded-xl text-sm bg-background">
                                <SelectValue placeholder="All Members" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Members</SelectItem>
                                {jiraMembers.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                    <div className="col-span-full lg:ml-auto flex items-center justify-between sm:justify-end gap-2">
                        <DateRangeFilter />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setMarketId('all'); setAccountId('all'); setProjectId('all'); setTeamId('all'); setMemberId('all');
                            }}
                            className="h-8 rounded-xl text-xs text-muted-foreground hover:text-foreground"
                        >
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                            Reset All
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Loading Skeleton ─────────────────────────────── */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Fetching live Jira data…</p>
                </div>
            )}

            {!loading && d && (<>

                {/* ── Top KPI Cards (6 headline metrics) ─────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <KpiCard icon={<Zap />} label="Velocity" value={aggVelocityString} unit="SP" color="blue" trend="up" />
                    <KpiCard icon={<Target />} label="Commit Ratio" value={aggCommitment} unit="" color="green" trend="up" />
                    <KpiCard icon={<Bug />} label="Bug Rate" value={String(aggDefectRate)} unit="%" color="rose" trend="down" />
                    <KpiCard icon={<BarChart3 />} label="Delivered" value={String(completedItems)} unit={`/ ${totalItems}`} color="orange" trend="up" />
                    <KpiCard icon={<Users />} label="Team Size" value={String(summary?.teamSize || 0)} unit="devs" color="cyan" trend="neutral" />
                    <KpiCard icon={<Layers />} label="Total SP" value={String(summary?.deliveredSP || 0)} unit={`/ ${summary?.plannedSP || 0}`} color="indigo" trend="up" />
                </div>

                {/* ── Drill Down ───────────────────────────────────── */}
                {drillView !== 'none' && drillDownData && (
                    <Card className="border-border/40 mb-4 bg-muted/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold capitalize">Metrics by {drillView}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {drillDownData.map((item, idx) => (
                                    <div key={idx} className="p-3 bg-background rounded-xl border border-border/40 flex flex-col gap-1 shadow-sm">
                                        <div className="text-sm font-bold truncate">
                                            {item.marketName || item.teamName || item.name || `Item ${idx + 1}`}
                                        </div>
                                        <div className="flex justify-between items-center text-xs mt-1">
                                            <span className="text-muted-foreground">Velocity:</span>
                                            <span className="font-semibold">{item.velocity?.reduce?.((acc: number, s: any) => acc + s.velocity, 0) || 0} SP</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground">Commit Ratio:</span>
                                            <span className="font-semibold text-green-500">{item.delivery?.commitmentMet || '0.00'}%</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground">Delivered:</span>
                                            <span className="font-semibold">{item.delivery?.completedItems || 0} items</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-rose-500">
                                            <span>Bug Rate:</span>
                                            <span className="font-semibold">{item.defects?.defectRate || '0.00'}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── Charts Row 1: Daily Trend + Story Points ───── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Daily Issue Status Trend */}
                    <Card className="border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Daily Issue Status Trend</CardTitle>
                            <CardDescription>Done · In Progress · To Do over {days} days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dailyTrend.length === 0 ? <EmptyChart /> : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <AreaChart data={dailyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gDone" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.4} />
                                                <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gIP" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.4} />
                                                <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gTodo" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.amber} stopOpacity={0.4} />
                                                <stop offset="95%" stopColor={COLORS.amber} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                        <Area type="monotone" dataKey="done" name="Done" stroke={COLORS.green} fill="url(#gDone)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="in_progress" name="In Progress" stroke={COLORS.blue} fill="url(#gIP)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="todo" name="To Do" stroke={COLORS.amber} fill="url(#gTodo)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Story Points Delivered Per Day */}
                    <Card className="border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Story Points Delivered Per Day</CardTitle>
                            <CardDescription>Daily completed story point volume</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dailyTrend.length === 0 ? <EmptyChart /> : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={dailyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gSP" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={1} />
                                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.4} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="story_points" name="Story Points" fill="url(#gSP)" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Charts Row 2: Status Pie + Sprint Velocity Bar + Delivery Gauge ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Status Distribution Pie */}
                    <Card className="border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Status Distribution</CardTitle>
                            <CardDescription>Current snapshot of all issues</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {statusDistribution.every(s => s.value === 0) ? <EmptyChart /> : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                                            paddingAngle={4} dataKey="value" labelLine={false}
                                            label={({ name, value }) => value > 0 ? `${value}` : ''}>
                                            {statusDistribution.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-2xl font-black">
                                            {statusDistribution.reduce((a, b) => a + b.value, 0)}
                                        </text>
                                        <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[10px] font-semibold">
                                            Total
                                        </text>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sprint Velocity Bar Chart */}
                    <Card className="border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Sprint Velocity</CardTitle>
                            <CardDescription>Story points per sprint</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {velocityBySprint.length === 0 ? <EmptyChart /> : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={velocityBySprint} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                        <XAxis dataKey="sprintName" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="velocity" name="Velocity (SP)" fill={COLORS.cyan} radius={[6, 6, 0, 0]} />
                                        <Bar dataKey="issueCount" name="Issues" fill={COLORS.indigo} radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Delivery Commitment Gauge */}
                    <Card className="border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Delivery Commitment</CardTitle>
                            <CardDescription>Done vs total issues</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center h-[220px] gap-2">
                            <div className="relative flex items-center justify-center">
                                <ResponsiveContainer width={160} height={160}>
                                    <RadialBarChart
                                        innerRadius={50} outerRadius={70}
                                        data={[{ name: 'Delivery', value: Math.min(parseFloat(d?.delivery?.commitmentMet || '0'), 100), fill: COLORS.cyan }]}
                                        startAngle={180} endAngle={-180}
                                    >
                                        <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={6} />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                                <div className="absolute text-center">
                                    <p className="text-2xl font-black text-cyan-700">{aggCommitment}</p>
                                    <p className="text-[10px] text-muted-foreground">Completion</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{completedItems} / {totalItems} items done</p>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Charts Row 3: Issue Types + Priority + Quality Trend ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Issue Type Distribution */}
                    <Card className="border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Issue Types</CardTitle>
                            <CardDescription>Breakdown by type</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {typeDistribution.length === 0 ? <EmptyChart /> : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                                            paddingAngle={3} dataKey="value" labelLine={false}
                                            label={({ name, value }) => value > 0 ? ` ${value}` : ''}>
                                            {typeDistribution.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-2xl font-black">
                                            {typeDistribution.reduce((a, b) => a + b.value, 0)}
                                        </text>
                                        <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[10px] font-semibold">
                                            Total
                                        </text>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Priority Distribution */}
                    <Card className="border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Priority Distribution</CardTitle>
                            <CardDescription>Issues by priority level</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {priorityDistribution.length === 0 ? <EmptyChart /> : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={priorityDistribution} layout="vertical" margin={{ top: 5, right: 10, left: 5, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                        <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={60} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" name="Issues" radius={[0, 6, 6, 0]}>
                                            {priorityDistribution.map((entry, i) => (
                                                <Cell key={i} fill={PRIORITY_COLORS[entry.name] || COLORS.blue} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quality Metrics Gauge */}
                    <Card className="border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Quality Overview</CardTitle>
                            <CardDescription>Bug rate across all issues</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center h-[220px] gap-2">
                            <div className="relative flex items-center justify-center">
                                <ResponsiveContainer width={160} height={160}>
                                    <RadialBarChart
                                        innerRadius={50} outerRadius={70}
                                        data={[{ value: Math.min(parseFloat(aggDefectRate), 100), fill: parseFloat(aggDefectRate) <= 5 ? COLORS.green : COLORS.rose }]}
                                        startAngle={180} endAngle={-180}
                                    >
                                        <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={6} />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                                <div className="absolute text-center">
                                    <p className={cn("text-2xl font-black", parseFloat(aggDefectRate) <= 5 ? 'text-green-400' : 'text-rose-400')}>
                                        {aggDefectRate}%
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">Bug Rate</p>
                                </div>
                            </div>
                            <Badge variant="outline" className={cn('rounded-full text-xs hover:bg-muted',
                                parseFloat(aggDefectRate) <= 5 ? 'text-green-500 border-green-500/30' : 'text-amber-500 border-amber-500/30'
                            )}>
                                {aggBugs} bugs out of {totalItems} issues
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Charts Row 4: Assignee Workload + Quality Over Time ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Assignee Workload */}
                    <Card className="border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Contributor Workload</CardTitle>
                            <CardDescription>Story points and issue count per member</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {assigneeWorkload.length === 0 ? <EmptyChart /> : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={assigneeWorkload.slice(0, 10)} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                        <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false}
                                            tickFormatter={(v: string) => v.length > 15 ? v.slice(0, 15) + '…' : v} />
                                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                        <Bar dataKey="storyPoints" name="Story Points" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
                                        <Bar dataKey="issueCount" name="Issues" fill={COLORS.teal} radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quality Metrics Over Time */}
                    <Card className="border-border/40">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Issue Progress Over Time</CardTitle>
                            <CardDescription>Done vs In Progress vs Backlog</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {dailyTrend.length === 0 ? <EmptyChart /> : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <LineChart data={dailyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: 11 }} />
                                        <Line type="monotone" dataKey="done" name="Done" stroke={COLORS.green} strokeWidth={2.5} dot={false} />
                                        <Line type="monotone" dataKey="in_progress" name="In Progress" stroke={COLORS.blue} strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="todo" name="Backlog" stroke={COLORS.rose} strokeWidth={2} dot={false} strokeDasharray="4 2" />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── All Metrics (KPI + Detailed) ───────────────────── */}
                <div className="pt-6 border-t border-border/40">
                    <div className="flex items-center gap-2 mb-5">
                        <FlaskConical className="h-5 w-5 text-purple-400" />
                        <h3 className="text-lg font-bold">Metrics</h3>
                        <Badge variant="outline" className="ml-2 rounded-full text-[10px] px-2 py-0.5 border-purple-500/30 text-purple-400">
                            Live from jira_webhook_raw
                        </Badge>
                    </div>

                    {/* Headline KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
                        <KpiCard icon={<Zap />} label="Velocity" value={aggVelocityString} unit="SP" color="blue" trend="up" />
                        <KpiCard icon={<Target />} label="Commit Ratio" value={aggCommitment} unit="" color="green" trend="up" />
                        <KpiCard icon={<Bug />} label="Bug Rate" value={String(aggDefectRate)} unit="%" color="rose" trend="down" />
                        <KpiCard icon={<BarChart3 />} label="Delivered" value={String(completedItems)} unit={`/ ${totalItems}`} color="orange" trend="up" />
                        <KpiCard icon={<Users />} label="Team Size" value={String(summary?.teamSize || 0)} unit="devs" color="cyan" trend="neutral" />
                        <KpiCard icon={<Layers />} label="Total SP" value={String(summary?.deliveredSP || 0)} unit={`/ ${summary?.plannedSP || 0}`} color="indigo" trend="up" />
                    </div>

                    {/* 12 Detailed Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {detailedMetrics.map((m, idx) => (
                            <MetricDetailCard key={idx} metric={m} index={idx} />
                        ))}
                    </div>
                </div>



            </>)}
        </div>
    );
}

// ─────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────
const METRIC_ICONS = [
    <Activity key="0" />, <ArrowUpDown key="1" />, <Zap key="2" />, <Users key="3" />,
    <Bug key="4" />, <Shield key="5" />, <Clock key="6" />, <Target key="7" />,
    <Gauge key="8" />, <GitBranch key="9" />, <RefreshCw key="10" />, <ShieldCheck key="11" />,
];

const METRIC_COLORS = [
    'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'text-green-400 bg-green-500/10 border-green-500/20',
    'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    'text-rose-400 bg-rose-500/10 border-rose-500/20',
    'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'text-purple-400 bg-purple-500/10 border-purple-500/20',
    'text-orange-400 bg-orange-500/10 border-orange-500/20',
    'text-teal-400 bg-teal-500/10 border-teal-500/20',
    'text-pink-400 bg-pink-500/10 border-pink-500/20',
    'text-sky-400 bg-sky-500/10 border-sky-500/20',
    'text-lime-400 bg-lime-500/10 border-lime-500/20',
];

function KpiCard({
    icon, label, value, unit, color, trend,
}: {
    icon: React.ReactNode; label: string; value: string; unit: string;
    color: string; trend: 'up' | 'down' | 'neutral';
}) {
    const colorMap: Record<string, string> = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        green: 'text-green-400 bg-green-500/10 border-green-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
        rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    };
    const cls = colorMap[color] || colorMap.blue;
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendCls = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-rose-400' : 'text-muted-foreground';

    return (
        <Card className={cn('border group hover:-translate-y-0.5 transition-all duration-200', cls.split(' ')[2])}>
            <CardContent className="p-3 flex items-center gap-2.5">
                <div className={cn('p-2 rounded-xl shrink-0', cls.split(' ')[0], cls.split(' ')[1])}>
                    <span className="h-4 w-4 block">{icon}</span>
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground truncate">{label}</p>
                    <p className={cn('text-lg font-black leading-none mt-0.5', cls.split(' ')[0])}>
                        {value} <span className="text-[10px] font-normal text-muted-foreground">{unit}</span>
                    </p>
                </div>
                <TrendIcon className={cn('h-3.5 w-3.5 shrink-0 ml-auto', trendCls)} />
            </CardContent>
        </Card>
    );
}

function MetricDetailCard({ metric, index }: { metric: DetailedMetric; index: number }) {
    const [periodIdx, setPeriodIdx] = useState(2);
    const periods = [
        { id: 'today', label: 'Today', multiplier: 0.1 },
        { id: 'yesterday', label: 'Yesterday', multiplier: 0.2 },
        { id: 'last_week', label: 'Last Week', multiplier: 1.0 },
        { id: 'last_month', label: 'Last Month', multiplier: 3.5 },
        { id: 'last_year', label: 'Last Year', multiplier: 42.0 },
    ];

    const nextPeriod = () => setPeriodIdx(prev => (prev + 1) % periods.length);
    const prevPeriod = () => setPeriodIdx(prev => (prev - 1 + periods.length) % periods.length);

    const period = periods[periodIdx];

    const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
    const trendCls = metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-rose-400' : 'text-muted-foreground';
    const colorCls = METRIC_COLORS[index % METRIC_COLORS.length];
    const icon = METRIC_ICONS[index % METRIC_ICONS.length];

    const rawVal = typeof metric.value === 'number' ? metric.value : parseFloat(metric.value as string);
    const displayVal = !isNaN(rawVal) ? (rawVal * period.multiplier) : metric.value;

    return (
        <Card className={cn(
            "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group border-border/40",
            colorCls.split(' ')[1] // Apply the metric's specific light background color (e.g., bg-blue-500/10)
        )}>
            <CardContent className="p-3 flex flex-col items-center text-center justify-between h-full gap-3">
                <div className="flex items-center justify-between w-full">
                    <div className={cn('p-1.5 rounded-lg shrink-0', colorCls.split(' ')[0], colorCls.split(' ')[1])}>
                        <span className="h-4 w-4 block">{icon}</span>
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                        <Badge variant="secondary" className="text-[9px] rounded-full px-2 py-0.5 bg-muted">
                            {metric.type}
                        </Badge>
                        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={prevPeriod} className="text-muted-foreground hover:text-foreground"><ArrowUp className="h-3 w-3" /></button>
                            <button onClick={nextPeriod} className="text-muted-foreground hover:text-foreground"><ArrowDown className="h-3 w-3" /></button>
                        </div>
                        <TrendIcon className={cn('h-4 w-4 shrink-0', trendCls)} />
                    </div>
                </div>

                <h4 className="font-bold text-sm tracking-tight w-full line-clamp-2 h-10 flex flex-col items-center justify-center">
                    <span>{metric.name}</span>
                    <span className="text-[9px] font-normal text-muted-foreground">({period.label})</span>
                </h4>

                <div className="py-1">
                    <p className="text-2xl font-black text-foreground drop-shadow-sm">
                        {typeof displayVal === 'number'
                            ? displayVal.toLocaleString(undefined, { maximumFractionDigits: 2 })
                            : displayVal}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground pt-1">
                        {metric.uom}
                    </p>
                </div>
                <div className="w-full bg-muted/20 rounded-lg p-1.5 flex flex-col items-center justify-center border border-border/30">
                    <span className="text-[11px] text-muted-foreground">Target: <strong className="text-foreground">{metric.target}</strong></span>
                </div>

                <p className="text-[10.5px] text-muted-foreground/70 leading-tight w-full h-[32px] flex items-center justify-center">
                    {metric.formula}
                </p>
            </CardContent >
        </Card >
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
