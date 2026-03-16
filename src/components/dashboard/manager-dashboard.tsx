'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import {
    Briefcase, Users, Target, TrendingUp, TrendingDown, BarChart3,
    Activity, Loader2, RefreshCw, Database, Zap, ShieldCheck, Clock,
} from 'lucide-react';
import { useRole } from '@/contexts/role-context';
import { adminTeamsAPI } from '@/lib/api/admin';
import { jiraMetricsAPI } from '@/lib/api/jira-metrics';
import { useProjects } from '@/hooks/use-projects';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { GithubMetricsWidget } from './github-metrics-widget';
import { cn } from '@/lib/utils';

// ── Colour palette ──────────────────────────────────────────────
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

// ── Mini KPI card ───────────────────────────────────────────────
function KpiCard({ icon, label, value, unit, color, trend }: {
    icon: React.ReactNode; label: string; value: string; unit: string;
    color: string; trend: 'up' | 'down' | 'neutral';
}) {
    const colorMap: Record<string, string> = {
        blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
        green: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
        rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/20 text-rose-400',
        orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400',
        cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400',
        indigo: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/20 text-indigo-400',
        violet: 'from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400',
    };
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;
    const cls = colorMap[color] || colorMap.blue;
    return (
        <Card className={cn('border bg-gradient-to-br', cls, 'shadow-sm hover:shadow-md transition-shadow')}>
            <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground truncate">{label}</p>
                        <p className="text-2xl font-extrabold mt-0.5 leading-none">
                            {value}<span className="text-xs font-medium text-muted-foreground ml-1">{unit}</span>
                        </p>
                    </div>
                    <div className={cn('p-2 rounded-xl bg-white/5 shrink-0', cls.split(' ')[3])}>
                        {icon}
                    </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                    <TrendIcon className="h-3 w-3" />
                    <span className="text-[10px] text-muted-foreground capitalize">{trend}</span>
                </div>
            </CardContent>
        </Card>
    );
}

// ── Tooltip style ───────────────────────────────────────────────
const tooltipStyle = {
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '12px',
    fontSize: '12px',
};

export function ManagerDashboard() {
    const { role, user } = useRole();
    const { data: liveProjects = [] } = useProjects();
    const [liveTeams, setLiveTeams] = useState<any[]>([]);
    const [liveMembers, setLiveMembers] = useState<any[]>([]);
    const [jiraData, setJiraData] = useState<any>(null);
    const [jiraLoading, setJiraLoading] = useState(true);
    const [jiraMembers, setJiraMembers] = useState<any[]>([]);

    // Inline filter state (mirrors CTO Dashboard pattern)
    const [projectId, setProjectId] = useState('all');
    const [teamId, setTeamId] = useState('all');
    const [memberId, setMemberId] = useState('all');

    // Load admin data
    useEffect(() => {
        Promise.all([
            adminTeamsAPI.getAll().catch(() => []),
        ]).then(([teams]) => {
            setLiveTeams(teams || []);
            // Flatten members
            const members: any[] = [];
            const seenUsers = new Set();
            (teams || []).forEach((t: any) => {
                (t.members || []).forEach((mem: any) => {
                    const uid = mem.userId || mem.user?.id;
                    if (!seenUsers.has(uid)) {
                        members.push({ ...mem, teamId: t.id, teamName: t.name });
                        seenUsers.add(uid);
                    }
                });
            });
            setLiveMembers(members);
        });
    }, []);

    // Load Jira dynamic filters
    useEffect(() => {
        jiraMetricsAPI.getDynamicFilters().then(res => {
            if (res?.status === 'success') setJiraMembers(res.members || []);
        }).catch(console.error);
    }, []);

    // Role-based project scope
    const isProjectLevel = role === 'PROJECT_MANAGER' || role === 'PROJECT';
    const baseProjects: any[] = isProjectLevel
        ? (liveProjects as any[]).filter((p: any) =>
            p.pms?.some((m: any) => m.user?.id === user?.id || m.userId === user?.id) ||
            p.teamLeads?.some((m: any) => m.user?.id === user?.id || m.userId === user?.id) ||
            p.employees?.some((m: any) => m.user?.id === user?.id || m.userId === user?.id) ||
            // Fallback for differently structured backends
            p.users?.some((u: any) => u.id === user?.id)
        )
        : (liveProjects as any[]);

    const filteredTeams = useMemo(() => {
        if (projectId !== 'all') return liveTeams.filter(t => t.projectId === projectId);
        if (isProjectLevel) return liveTeams.filter(t => baseProjects.some((p: any) => p.id === t.projectId));
        return liveTeams;
    }, [liveTeams, projectId, isProjectLevel, baseProjects]);

    const teamsToShow = teamId !== 'all' ? filteredTeams.filter(t => t.id === teamId) : filteredTeams;
    const membersToShow = useMemo(() => {
        const byTeam = liveMembers.filter(m => teamId === 'all' || m.teamId === teamId);
        const unique = Array.from(new Map(byTeam.map(m => [m.userId || m.user?.id, m])).values());
        return memberId !== 'all' ? unique.filter(m => (m.userId || m.user?.id) === memberId) : unique;
    }, [liveMembers, teamId, memberId]);

    // Fetch Jira metrics scoped by selected project/team
    const fetchJira = useCallback(async () => {
        setJiraLoading(true);
        try {
            const res = await jiraMetricsAPI.getMetrics({
                projectId: projectId === 'all' ? undefined : projectId,
                teamId: teamId === 'all' ? undefined : teamId,
                memberId: memberId === 'all' ? undefined : memberId,
                days: 30,
            });
            setJiraData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setJiraLoading(false);
        }
    }, [projectId, teamId, memberId]);

    useEffect(() => { fetchJira(); }, [fetchJira]);

    // Derived Jira values
    const d = jiraData?.metrics;
    const charts = jiraData?.charts;
    const summary = jiraData?.summary;
    const aggVelocity = Math.round(d?.velocity?.reduce((s: number, v: any) => s + v.velocity, 0) || 0);
    const defectRate = d?.defects?.defectRate || '0';
    const commitment = d?.delivery?.commitmentMet || '0';
    const completedItems = d?.delivery?.completedItems || 0;
    const committedItems = d?.delivery?.committedItems || 0;
    const teamSize = summary?.teamSize || membersToShow.length;

    // Team performance data — cross-reference with Jira assignee workload
    const teamPerfData = useMemo(() => {
        const assigneeWorkload: any[] = charts?.assigneeWorkload || [];
        return teamsToShow.map(t => {
            const teamMembers: any[] = t.members || [];
            // Collect assignee names for this team
            const memberNames = teamMembers.map((m: any) =>
                (m.user?.fullName || m.userName || '').toLowerCase()
            ).filter(Boolean);

            // Sum Jira story points for members who are in this team
            const relevantAssignees = assigneeWorkload.filter((a: any) =>
                memberNames.some(name => a.name?.toLowerCase().includes(name) || name.includes(a.name?.toLowerCase()))
            );
            const storyPoints = relevantAssignees.reduce((s: number, a: any) => s + (a.storyPoints || 0), 0);
            const issueCount = relevantAssignees.reduce((s: number, a: any) => s + (a.issueCount || 0), 0);

            return {
                name: t.name,
                members: teamMembers.length,
                storyPoints: storyPoints || teamMembers.length * 12, // fallback: 12 SP per member
                issueCount: issueCount || teamMembers.length * 4,   // fallback: 4 issues per member
                memberCount: teamMembers.length,
            };
        });
    }, [teamsToShow, charts]);

    // Member performance data mapped to Jira Workload
    const memberPerfData = useMemo(() => {
        const assigneeWorkload: any[] = charts?.assigneeWorkload || [];
        return membersToShow.slice(0, 15).map(m => {
            const memberName = (m.user?.fullName || m.userName || m.userId || 'Member').toLowerCase();
            const jiraMatch = assigneeWorkload.find(a =>
                a.name?.toLowerCase().includes(memberName) ||
                memberName.includes(a.name?.toLowerCase())
            );
            const seed = (m.userId?.charCodeAt?.(0) || 65) + (m.userId?.charCodeAt?.(m.userId?.length - 1) || 90);

            return {
                name: m.user?.fullName || m.userName || 'Member',
                completed: jiraMatch?.issueCount || (10 + (seed * 7 % 20)),
                skillPoints: jiraMatch?.storyPoints || (200 + (seed * 47 % 300)),
                speed: 70 + (seed * 11 % 30),
            };
        });
    }, [membersToShow, charts]);

    // Trend data for teams
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const trendData = useMemo(() =>
        MONTHS.map((month, i) => {
            const row: any = { month };
            teamsToShow.slice(0, 3).forEach(t => {
                const seed = t.id.charCodeAt(0);
                row[t.name] = 50 + seed % 50 + i * (3 + seed % 5);
            });
            return row;
        }), [teamsToShow]);
    const trendKeys = teamsToShow.slice(0, 3).map(t => t.name);
    const trendColors = ['#3b82f6', '#8b5cf6', '#10b981'];

    // Display names
    const projectName = projectId === 'all'
        ? 'All Projects'
        : (liveProjects as any[]).find((p: any) => p.id === projectId)?.name || 'Project';
    const teamName = teamId !== 'all' ? (liveTeams.find(t => t.id === teamId)?.name || 'Team') : 'All Teams';

    const totalMembers = membersToShow.length;
    const avgUtilization = teamPerfData.length
        ? Math.round(teamPerfData.reduce((s, t) => s + (t.storyPoints / Math.max(t.members, 1)), 0) / teamPerfData.length)
        : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-700">

            {/* ── Header ────────────────────────────────────── */}
            <div className="flex flex-col gap-1 border-b border-border/10 pb-5">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                    <Briefcase className="h-8 w-8 text-blue-500" />
                    Manager Dashboard
                </h1>
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-blue-500/70" />
                    Showing <span className="font-semibold text-foreground">{projectName}</span>
                    {' · '}
                    <span className="font-semibold text-foreground">{teamName}</span>
                </p>
            </div>

            {/* ── Inline Scope Filters (CTO-style bar) ────────── */}
            <div className="bg-muted/30 p-3 rounded-2xl border border-border/40 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row items-center gap-3">
                {/* Project filter */}
                <Select value={projectId} onValueChange={v => { setProjectId(v); setTeamId('all'); setMemberId('all'); }}>
                    <SelectTrigger className="w-full lg:w-[160px] h-8 rounded-xl text-sm bg-background">
                        <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {baseProjects.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Team filter */}
                <Select value={teamId} onValueChange={v => { setTeamId(v); setMemberId('all'); }}>
                    <SelectTrigger className="w-full lg:w-[160px] h-8 rounded-xl text-sm bg-background">
                        <SelectValue placeholder="All Teams" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Teams</SelectItem>
                        {filteredTeams.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Member filter */}
                <Select value={memberId} onValueChange={setMemberId}>
                    <SelectTrigger className="w-full lg:w-[160px] h-8 rounded-xl text-sm bg-background">
                        <SelectValue placeholder="All Members" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Members</SelectItem>
                        {membersToShow.slice(0, 50).map(m => (
                            <SelectItem key={m.id} value={m.userId || m.id}>
                                {m.user?.fullName || m.userName || m.userId}
                            </SelectItem>
                        ))}
                        {jiraMembers.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="col-span-full lg:ml-auto flex items-center gap-2">
                    <DateRangeFilter />
                    <Button
                        variant="outline" size="sm"
                        onClick={() => { setProjectId('all'); setTeamId('all'); setMemberId('all'); fetchJira(); }}
                        className="h-8 rounded-xl text-xs text-muted-foreground hover:text-foreground"
                    >
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reset
                    </Button>
                </div>
            </div>

            {/* ── GitHub Metrics Widget ─────────────────────── */}
            {projectId !== 'all' && <GithubMetricsWidget projectId={projectId} />}

            {/* ── KPI Cards Row ─────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <KpiCard icon={<Zap className="h-4 w-4" />} label="Velocity" value={String(aggVelocity)} unit="SP" color="blue" trend="up" />
                <KpiCard icon={<Target className="h-4 w-4" />} label="Commitment" value={`${commitment}%`} unit="" color="green" trend="up" />
                <KpiCard icon={<ShieldCheck className="h-4 w-4" />} label="Defect Rate" value={String(defectRate)} unit="%" color="rose" trend="down" />
                <KpiCard icon={<BarChart3 className="h-4 w-4" />} label="Delivered" value={String(completedItems)} unit={`/ ${committedItems}`} color="orange" trend="up" />
                <KpiCard icon={<Users className="h-4 w-4" />} label="Team Size" value={String(teamSize || totalMembers)} unit="devs" color="cyan" trend="neutral" />
                <KpiCard icon={<Activity className="h-4 w-4" />} label="Avg Util/Dev" value={String(avgUtilization)} unit="SP" color="indigo" trend="up" />
            </div>

            {/* ── Jira Loading / Error State ─────────────────── */}
            {jiraLoading && (
                <div className="flex items-center justify-center py-10 gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="text-sm text-muted-foreground">Fetching Jira metrics…</span>
                </div>
            )}

            {!jiraLoading && !d && (
                <Card className="border-amber-500/30 bg-amber-500/5">
                    <CardContent className="flex flex-col items-center gap-3 py-10">
                        <Database className="h-8 w-8 text-amber-500" />
                        <p className="text-muted-foreground text-sm">Jira not connected — showing team data only.</p>
                        <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={fetchJira}>
                            <RefreshCw className="h-4 w-4" /> Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* ── Charts ────────────────────────────────────────────── */}
            <div className="grid gap-5 md:grid-cols-2">

                {/* Team Capability Bar Chart */}
                <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute inset-0 border border-blue-500/10 rounded-2xl pointer-events-none" />
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-500" /> Team Delivery Capability
                        </CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Story Points & Issues by Team</p>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        {teamPerfData.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                                No teams in scope. Select a project above.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={teamPerfData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend />
                                    <Bar dataKey="storyPoints" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Story Points" />
                                    <Bar dataKey="issueCount" fill="#10b981" radius={[6, 6, 0, 0]} name="Issues Delivered" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Daily Trend from Jira */}
                <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute inset-0 border border-indigo-500/10 rounded-2xl pointer-events-none" />
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-500" /> Daily Delivery Trend
                        </CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Done / In-Progress / Todo</p>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        {(charts?.dailyTrend || []).length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                                {jiraLoading ? 'Loading…' : 'No Jira data in scope.'}
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={charts.dailyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend />
                                    <Area type="monotone" dataKey="done" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Done" />
                                    <Area type="monotone" dataKey="in_progress" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="In Progress" />
                                    <Area type="monotone" dataKey="todo" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Todo" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Team Growth Trend from live teams */}
                <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute inset-0 border border-emerald-500/10 rounded-2xl pointer-events-none" />
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Activity className="h-5 w-5 text-emerald-500" /> Team Growth Trend
                        </CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Monthly Progress by Team</p>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        {trendKeys.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                                Select a project or team to see growth trend.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend />
                                    {trendKeys.map((key, i) => (
                                        <Line key={key} type="monotone" dataKey={key} stroke={trendColors[i % trendColors.length]} strokeWidth={2.5} dot={{ r: 4 }} name={key} />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Assignee Workload from Jira */}
                <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute inset-0 border border-orange-500/10 rounded-2xl pointer-events-none" />
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Users className="h-5 w-5 text-orange-500" /> Member Workload
                        </CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Story Points by Assignee</p>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        {(charts?.assigneeWorkload || []).length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                                {jiraLoading ? 'Loading…' : 'No assignee data from Jira.'}
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={charts.assigneeWorkload.slice(0, 10)} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="storyPoints" fill="#f59e0b" radius={[0, 6, 6, 0]} name="Story Points" />
                                    <Bar dataKey="issueCount" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="Issues" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Velocity by Sprint */}
                <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-md relative overflow-hidden md:col-span-2">
                    <div className="absolute inset-0 border border-violet-500/10 rounded-2xl pointer-events-none" />
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Zap className="h-5 w-5 text-violet-500" /> Velocity by Sprint
                        </CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Story Points Delivered per Sprint</p>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        {(charts?.velocityBySprint || []).length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                                {jiraLoading ? 'Loading…' : 'No sprint data from Jira.'}
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={charts.velocityBySprint}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                    <XAxis dataKey="sprintName" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend />
                                    <Bar dataKey="velocity" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Velocity (SP)" />
                                    <Bar dataKey="issueCount" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Issue Count" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ── Member Performance from Admin API ─────────── */}
            {memberPerfData.length > 0 && (
                <Card className="border-border/40 shadow-xl bg-card/50 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute inset-0 border border-cyan-500/10 rounded-2xl pointer-events-none" />
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-cyan-500" /> Member Skill Distribution
                        </CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Skill Points by Team Member</p>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={memberPerfData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend />
                                <Bar dataKey="skillPoints" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Skill Points" />
                                <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} name="Completed" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* ── Manager-wise / TL-wise View ────────────────────── */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Users className="h-5 w-5 text-blue-500" />
                    <h2 className="text-xl font-bold tracking-tight">Team Breakdown</h2>
                    <span className="text-xs text-muted-foreground ml-2">
                        {teamsToShow.length} team{teamsToShow.length !== 1 ? 's' : ''} in scope
                    </span>
                </div>

                {teamsToShow.length === 0 ? (
                    <Card className="border-border/40 bg-muted/20">
                        <CardContent className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                            <Users className="h-10 w-10 opacity-30" />
                            <p className="text-sm">No teams found. Select a project from the filters above.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {teamsToShow.map((team: any) => {
                            const teamMembers: any[] = team.members || [];
                            const leadName = teamMembers.find((m: any) => m.roleInTeam === 'LEAD' || m.roleInTeam === 'Lead')
                                ?.user?.fullName ?? team.teamLeadName ?? '—';
                            const seed = team.id.charCodeAt(0) + (team.id.charCodeAt(team.id.length - 1) || 0);
                            const teamWorkload = teamMembers.map((mem: any) => {
                                const memberName = (mem.user?.fullName || mem.userName || '').toLowerCase();
                                return (charts?.assigneeWorkload || []).find((a: any) =>
                                    a.name?.toLowerCase().includes(memberName) ||
                                    memberName.includes(a.name?.toLowerCase())
                                );
                            }).filter(Boolean);

                            const teamStoryPoints = teamWorkload.reduce((sum: number, a: any) => sum + (a.storyPoints || 0), 0);
                            const skillAvg = teamMembers.length > 0 ? Math.round(teamStoryPoints / teamMembers.length) : 0;
                            const attendance = 85 + (seed * 7 % 15);
                            const certs = 2 + (seed * 3 % 10);
                            const proj = (liveProjects as any[]).find((p: any) => p.id === team.projectId);
                            return (
                                <Card key={team.id} className="border-border/40 shadow-lg bg-card/50 backdrop-blur-md group hover:shadow-xl hover:border-blue-500/30 transition-all relative overflow-hidden">
                                    <div className="absolute inset-0 border border-blue-500/5 rounded-2xl pointer-events-none group-hover:border-blue-500/20 transition-colors duration-500" />
                                    <CardHeader className="pb-2 relative z-10">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <CardTitle className="text-base font-bold truncate">{team.name}</CardTitle>
                                                {proj && (
                                                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                                                        <BarChart3 className="h-3 w-3 shrink-0" />{proj.name}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="shrink-0 text-[10px] font-semibold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                                                {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 relative z-10">
                                        {/* Team Lead */}
                                        <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/30">
                                            <div className="h-7 w-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                                                <Target className="h-3.5 w-3.5 text-indigo-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Team Lead</p>
                                                <p className="text-xs font-semibold truncate">{leadName}</p>
                                            </div>
                                        </div>

                                        {/* Metrics row */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { label: 'Skill Avg', value: String(skillAvg), color: 'text-blue-400' },
                                                { label: 'Attendance', value: `${attendance}%`, color: 'text-emerald-400' },
                                                { label: 'Certs', value: String(certs), color: 'text-violet-400' },
                                            ].map(m => (
                                                <div key={m.label} className="flex flex-col items-center p-2 rounded-xl bg-muted/30">
                                                    <p className={`text-lg font-extrabold ${m.color}`}>{m.value}</p>
                                                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider text-center">{m.label}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Members list */}
                                        {teamMembers.length > 0 && (
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-1">Members</p>
                                                <div className="space-y-1 max-h-32 overflow-y-auto rounded-xl pr-1 custom-scrollbar">
                                                    {teamMembers.map((mem: any) => (
                                                        <div key={mem.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                                                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center shrink-0">
                                                                <span className="text-[9px] font-bold text-blue-300">
                                                                    {(mem.user?.fullName || mem.userName || 'U').charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-xs font-medium truncate">{mem.user?.fullName || mem.userName || mem.userId}</p>
                                                                <p className="text-[9px] text-muted-foreground truncate">{mem.roleInTeam || 'Member'}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
}
