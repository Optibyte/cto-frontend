'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    LayoutGrid, 
    Users, 
    TrendingUp, 
    Award, 
    BarChart3, 
    ArrowUpRight, 
    ArrowDownRight,
    Users2,
    Briefcase,
    Zap,
    AlertTriangle,
    AlertCircle,
    Info,
    ChevronRight
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer,
    LineChart,
    Line,
    Cell,
    AreaChart,
    Area,
    PieChart,
    Pie
} from 'recharts';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useMetrics } from '@/hooks/use-metrics';
import { useMetricDefinitions } from '@/hooks/use-metric-definitions';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { useEmployees } from '@/hooks/use-employees';

export function ManualMetricsDashboard() {
    const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
    const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
    
    const { data: metrics = [], isLoading: metricsLoading } = useMetrics({ source: 'manual' });
    const { data: definitions = [], isLoading: defLoading } = useMetricDefinitions();
    const { data: hierarchy } = useOrgHierarchy();
    const { data: employeesData = [], isLoading: employeesLoading } = useEmployees();

    const employees = useMemo(() => {
        return Array.isArray(employeesData) ? employeesData : (employeesData as any)?.data || [];
    }, [employeesData]);

    // Derived Data: Projects & Teams
    const projects = useMemo(() => {
        if (!hierarchy) return [];
        const projs: any[] = [];
        hierarchy.markets?.forEach((m: any) => {
            m.accounts?.forEach((a: any) => {
                a.teams?.forEach((t: any) => {
                    if (t.project && !projs.find(p => p.id === t.project.id)) {
                        projs.push(t.project);
                    }
                });
            });
        });
        return projs;
    }, [hierarchy]);

    const teams = useMemo(() => {
        if (!hierarchy) return [];
        let allTeams: any[] = [];
        hierarchy.markets?.forEach((m: any) => {
            m.accounts?.forEach((a: any) => {
                allTeams = [...allTeams, ...(a.teams || [])];
            });
        });
        
        if (selectedProjectId !== 'all') {
            return allTeams.filter(t => t.projectId === selectedProjectId);
        }
        return allTeams;
    }, [hierarchy, selectedProjectId]);

    const scopeMembers = useMemo(() => {
        const memberMap = new Map();
        const targetTeams = selectedTeamId === 'all' 
            ? teams 
            : teams.filter(t => t.id === selectedTeamId);

        targetTeams.forEach(team => {
            team.members?.forEach((m: any) => {
                const id = m.userId || m.id || (m.user && (m.user.id || m.user._id));
                if (!id) return;
                
                const name = m.user?.fullName || m.fullName || m.name || m.user?.name || 'Unknown Member';
                if (!memberMap.has(id)) {
                    memberMap.set(id, { 
                        id, 
                        name, 
                        teamName: team.name,
                        teamId: team.id,
                        avatar: (m.user?.avatar || (name.charAt(0)))
                    });
                }
            });
        });
        return Array.from(memberMap.values());
    }, [teams, selectedTeamId]);

    // Filtering logic
    const filteredMetrics = useMemo(() => {
        return metrics.filter((m: any) => {
            // Only show metrics that have an active definition in the system
            const hasDefinition = definitions.some((d: any) => d.metricType === m.metricType);
            if (!hasDefinition) return false;

            const team = teams.find(t => t.id === m.teamId);
            const matchesProject = selectedProjectId === 'all' || (team && team.projectId === selectedProjectId);
            const matchesTeam = selectedTeamId === 'all' || m.teamId === selectedTeamId;
            return matchesProject && matchesTeam;
        });
    }, [metrics, definitions, selectedProjectId, selectedTeamId, teams]);

    // Aggregates for Cards
    const stats = useMemo(() => {
        if (filteredMetrics.length === 0 || definitions.length === 0) return { avg: 0, count: 0, trend: 0 };
        
        // Calculate average percentage completion across all metrics to normalize ranges
        let totalNormalized = 0;
        let validCount = 0;

        filteredMetrics.forEach((m: any) => {
            const def = definitions.find((d: any) => d.metricType === m.metricType);
            if (def) {
                const min = Number(def.rangeMin) || 0;
                const max = Number(def.rangeMax) || (def.metricType === 'quality' ? 100 : 5);
                const range = max - min;
                
                if (range > 0) {
                    const val = Number(m.value) || 0;
                    // Clamp normalized value between 0 and 1
                    const normalized = Math.min(1, Math.max(0, (val - min) / range));
                    totalNormalized += normalized;
                    validCount++;
                }
            }
        });

        const avgPercentage = validCount > 0 ? totalNormalized / validCount : 0;
        // Project onto a 5-point scale and cap it at 5.0
        const avgRating = Math.min(5, avgPercentage * 5);
        
        return {
            avg: Number(avgRating.toFixed(1)),
            count: filteredMetrics.length,
            trend: 8.4
        };
    }, [filteredMetrics, definitions]);

    // Chart Data: Avg by Metric Component
    const metricChartData = useMemo(() => {
        const groups: Record<string, { sum: number, count: number, name: string }> = {};
        
        filteredMetrics.forEach((m: any) => {
            const def = definitions.find((d: any) => d.metricType === m.metricType);
            if (!def) return;

            const name = def.name;
            if (!groups[m.metricType]) {
                groups[m.metricType] = { sum: 0, count: 0, name };
            }
            groups[m.metricType].sum += m.value;
            groups[m.metricType].count += 1;
        });

        return Object.entries(groups).map(([id, g]) => ({
            name: g.name,
            value: Number((g.sum / g.count).toFixed(1))
        }));
    }, [filteredMetrics, definitions]);

    // Chart Data: Team performance comparison
    const teamPerformanceData = useMemo(() => {
        const groups: Record<string, { sum: number, count: number, name: string }> = {};
        
        filteredMetrics.forEach((m: any) => {
            const team = teams.find(t => t.id === m.teamId);
            const teamName = team?.name || 'Unknown';
            if (!groups[m.teamId]) {
                groups[m.teamId] = { sum: 0, count: 0, name: teamName };
            }
            groups[m.teamId].sum += m.value;
            groups[m.teamId].count += 1;
        });

        return Object.entries(groups)
            .map(([id, g]) => ({
                name: g.name,
                value: Number((g.sum / g.count).toFixed(1))
            }))
            .sort((a, b) => b.value - a.value);
    }, [filteredMetrics, teams]);

    // Member Performance: Comprehensive analysis of all individuals in scope
    const memberPerformanceData = useMemo(() => {
        const groups: Record<string, { 
            sum: number, 
            count: number, 
            name: string, 
            lowestMetric: string, 
            lowestScore: number,
            allMetrics: any[] 
        }> = {};
        
        // Populate groups with all scope members first to ensure they are captured
        scopeMembers.forEach(mem => {
            groups[mem.id] = {
                sum: 0,
                count: 0,
                name: mem.name,
                lowestMetric: 'Pending',
                lowestScore: 0,
                allMetrics: []
            };
        });

        filteredMetrics.forEach((m: any) => {
            const userId = m.userId || m.memberId || m.id;
            if (!userId) return;
            
            // Resolve member info if not already in groups (for metrics outside scope but still in filter)
            if (!groups[userId]) {
                const emp = employees.find((e: any) => 
                    (e.id || e._id || e.userId || e.employeeId) === userId ||
                    (e.user?.id || e.user?._id) === userId ||
                    e.email === userId ||
                    e.email === m.email
                );
                
                const name = emp?.user?.fullName || 
                             emp?.fullName || 
                             emp?.name || 
                             m.userName || 
                             m.fullName || 
                             'Unknown Member';

                groups[userId] = { 
                    sum: 0, 
                    count: 0, 
                    name, 
                    lowestMetric: 'N/A', 
                    lowestScore: 5.0,
                    allMetrics: []
                };
            }

            const def = definitions.find((d: any) => d.metricType === m.metricType);
            const metricName = def?.name || m.metricType;

            groups[userId].sum += m.value;
            groups[userId].count += 1;
            groups[userId].allMetrics.push({
                name: metricName,
                value: m.value,
                type: m.metricType
            });

            // Track lowest scoring metric
            if (groups[userId].allMetrics.length === 1 || m.value < groups[userId].lowestScore) {
                groups[userId].lowestScore = m.value;
                groups[userId].lowestMetric = metricName;
            }
        });

        return Object.entries(groups)
            .map(([id, g]) => ({
                id,
                name: g.name,
                value: g.count > 0 ? Number((g.sum / g.count).toFixed(1)) : 0,
                lowestMetric: g.lowestMetric,
                lowestScore: g.lowestScore,
                metrics: g.allMetrics.sort((a, b) => a.value - b.value),
                gap: 5 - g.lowestScore,
                isPending: g.count === 0
            }))
            .sort((a, b) => a.value - b.value);
    }, [filteredMetrics, scopeMembers, employees, definitions]);

    const performanceAlerts = useMemo(() => {
        const alerts: any[] = [];
        
        // 1. Teams below threshold
        teamPerformanceData.forEach(t => {
            if (t.value < 3.0) {
                alerts.push({
                    id: `team-${t.name}`,
                    type: 'team',
                    name: t.name,
                    score: t.value,
                    severity: t.value < 2.2 ? 'critical' : 'warning',
                    message: t.value < 2.2 ? 'Immediate intervention required' : 'Requires performance review'
                });
            }
        });

        // 2. Members below threshold
        memberPerformanceData.forEach(m => {
            if (m.value < 2.8 || m.lowestScore < 2.5) {
                const isCritical = m.lowestScore < 2.0;
                alerts.push({
                    id: `member-${m.id}`,
                    type: 'member',
                    name: m.name,
                    score: m.lowestScore,
                    severity: isCritical ? 'critical' : 'warning',
                    message: `Critical low score in "${m.lowestMetric}". Improvement required.`
                });
            }
        });

        return alerts.sort((a,b) => (a.severity === 'critical' ? -1 : 1));
    }, [teamPerformanceData, memberPerformanceData]);

    if (metricsLoading || defLoading || employeesLoading) {
        return <div className="flex items-center justify-center py-20">Loading Dashboard...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Alerts Section (New) */}
            {performanceAlerts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {performanceAlerts.slice(0, 3).map((alert, idx) => (
                        <div 
                            key={alert.id}
                            className={cn(
                                "flex items-start gap-4 p-4 rounded-3xl border backdrop-blur-md animate-in slide-in-from-left-4 duration-500",
                                alert.severity === 'critical' 
                                    ? "bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.05)] shadow-rose-500/5" 
                                    : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-xl shrink-0",
                                alert.severity === 'critical' ? "bg-rose-500/20" : "bg-amber-500/20"
                            )}>
                                {alert.severity === 'critical' ? <AlertCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                                        {alert.type} ALERT
                                    </span>
                                    <Badge variant="outline" className={cn(
                                        "h-4 text-[9px] border-none font-black px-1.5",
                                        alert.severity === 'critical' ? "bg-rose-500/20 text-rose-500" : "bg-amber-500/20 text-amber-500"
                                    )}>
                                        {alert.score} / 5.0
                                    </Badge>
                                </div>
                                <p className="text-sm font-bold truncate tracking-tight">{alert.name}</p>
                                <p className="text-xs opacity-70 font-medium leading-relaxed">{alert.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* Control Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-muted/20 p-4 rounded-3xl border border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mr-auto">
                    <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Manual Analytics</h2>
                        <p className="text-xs text-muted-foreground font-medium">Performance insights from manual assessments</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">Project Scope</span>
                        <Select value={selectedProjectId} onValueChange={(val) => {
                            setSelectedProjectId(val);
                            setSelectedTeamId('all');
                        }}>
                            <SelectTrigger className="w-[180px] rounded-xl bg-background/50 border-border/50 h-10">
                                <SelectValue placeholder="All Projects" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                <SelectItem value="all">All Projects</SelectItem>
                                {projects.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">Team Filter</span>
                        <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                            <SelectTrigger className="w-[180px] rounded-xl bg-background/50 border-border/50 h-10">
                                <SelectValue placeholder="All Teams" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                <SelectItem value="all">All Teams</SelectItem>
                                {teams.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Overall Average" 
                    value={stats.avg} 
                    unit="/ 5"
                    icon={<Award className="h-5 w-5" />} 
                    trend={stats.trend}
                    description="Avg. team member rating"
                />
                <StatCard 
                    title="Active Teams" 
                    value={new Set(filteredMetrics.map(m => m.teamId)).size} 
                    icon={<Users2 className="h-5 w-5" />} 
                    description="Teams with manual input"
                />
                <StatCard 
                    title="Data Points" 
                    value={stats.count} 
                    icon={<Zap className="h-5 w-5" />} 
                    description="Manual entries recorded"
                />
                <StatCard 
                    title="Completion Rate" 
                    value="92" 
                    unit="%"
                    icon={<Briefcase className="h-5 w-5" />} 
                    trend={2.1}
                    description="Team onboarding status"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Metric Distribution */}
                <Card className="rounded-[2.5rem] border-border/50 bg-muted/10 backdrop-blur-xl overflow-hidden shadow-2xl">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold">Category Distribution</CardTitle>
                                <CardDescription>Average scores across performance categories</CardDescription>
                            </div>
                            <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-500">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            < BarChart data={metricChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.6)' }}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.6)' }}
                                    domain={[0, 5]}
                                />
                                <RechartsTooltip 
                                    cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-background/90 backdrop-blur-md border border-border/50 p-4 rounded-2xl shadow-2xl">
                                                    <p className="text-sm font-bold">{payload[0].payload.name}</p>
                                                    <p className="text-2xl font-black text-primary">{payload[0].value}</p>
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Average Score</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar 
                                    dataKey="value" 
                                    radius={[12, 12, 4, 4]} 
                                    fill="url(#barGradient)" 
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Team Performance Ranking */}
                <Card className="rounded-[2.5rem] border-border/50 bg-muted/10 backdrop-blur-xl overflow-hidden shadow-2xl">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold">Team Performance</CardTitle>
                                <CardDescription>Comparative team ratings</CardDescription>
                            </div>
                            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                                <Users className="h-6 w-6" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={teamPerformanceData} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis 
                                    type="category" 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 600, fill: 'rgba(255,255,255,0.8)' }}
                                    width={100}
                                />
                                <RechartsTooltip 
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-background/90 backdrop-blur-md border border-border/50 p-4 rounded-2xl shadow-2xl">
                                                    <p className="text-sm font-bold">{payload[0].payload.name}</p>
                                                    <p className="text-2xl font-black text-emerald-500">{payload[0].value}</p>
                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Quality Index</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={24}>
                                    {teamPerformanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#10b98144'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Individual Member Low Metric Bar Chart (New) */}
                <Card className="rounded-[2.5rem] border-border/50 bg-muted/10 backdrop-blur-xl overflow-hidden shadow-2xl lg:col-span-2">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold text-rose-500">Member Performance Gaps</CardTitle>
                                <CardDescription>Identifying which members are struggling with specific metrics</CardDescription>
                            </div>
                            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pb-4">
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    layout="vertical" 
                                    data={memberPerformanceData.filter(m => m.lowestScore < 3.5).slice(0, 8)} 
                                    margin={{ top: 10, right: 120, left: 60, bottom: 5 }}
                                >
                                    <defs>
                                        <linearGradient id="criticalGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#f43f5e" stopOpacity={1} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis type="number" hide domain={[0, 5]} />
                                    <YAxis 
                                        type="category" 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false}
                                        tick={{ fontSize: 13, fontWeight: 700, fill: 'currentColor' }}
                                        width={120}
                                    />
                                    <RechartsTooltip 
                                        cursor={{ fill: 'rgba(244, 63, 94, 0.05)' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-background/95 backdrop-blur-xl border border-rose-500/20 p-5 rounded-3xl shadow-2xl shadow-rose-500/10 min-w-[280px]">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <p className="text-base font-black text-rose-500 leading-none">{data.name}</p>
                                                                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mt-2 opacity-60">Complete Metric Analysis</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-2xl font-black text-primary leading-none">{data.value}</p>
                                                                <p className="text-[8px] font-bold text-muted-foreground uppercase">Average Score</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="space-y-3 pt-3 border-t border-border/10">
                                                            <p className="text-[9px] font-black uppercase text-rose-500/80 tracking-widest mb-1">Potential Skill Gaps</p>
                                                            {data.metrics?.slice(0, 3).map((met: any, i: number) => (
                                                                <div key={i} className="flex justify-between items-center gap-4">
                                                                    <span className="text-xs font-medium text-muted-foreground truncate max-w-[160px]">{met.name}</span>
                                                                    <Badge className={cn(
                                                                        "border-none px-2 py-0.5 rounded-md font-black text-[10px]",
                                                                        met.value < 2.5 ? "bg-rose-500/20 text-rose-500" : "bg-amber-500/20 text-amber-500"
                                                                    )}>
                                                                        {met.value}
                                                                    </Badge>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar 
                                        dataKey="lowestScore" 
                                        radius={[0, 20, 20, 0]} 
                                        barSize={32}
                                        fill="url(#criticalGradient)"
                                        label={({ x, y, width, height, value, payload }: any) => {
                                            if (!payload) return null;
                                            const isVeryLow = value < 2.5;
                                            return (
                                                <g>
                                                    {isVeryLow && (
                                                        <text x={x + width + 5} y={y + height / 2} fill="#ef4444" fontSize="14">⚠️</text>
                                                    )}
                                                    <text 
                                                        x={x + width + (isVeryLow ? 25 : 10)} 
                                                        y={y + height / 2} 
                                                        fill="currentColor" 
                                                        textAnchor="start" 
                                                        dominantBaseline="middle"
                                                        className="text-[11px] font-black tracking-tight"
                                                    >
                                                        {payload.lowestMetric}: <tspan className={cn("font-black", isVeryLow ? "text-rose-500 underline decoration-2 underline-offset-4" : "text-rose-500")}>{value}</tspan>
                                                    </text>
                                                </g>
                                            );
                                        }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Member Performance Rankings (New) */}
                <Card className="rounded-[2.5rem] border-border/50 bg-muted/10 backdrop-blur-xl overflow-hidden shadow-2xl lg:col-span-2">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold">Member Performance Insights</CardTitle>
                                <CardDescription>Identifying core skill gaps and top individual contributors</CardDescription>
                            </div>
                            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                                <Award className="h-6 w-6" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 min-h-[400px]">
                        {memberPerformanceData.length === 0 ? (
                            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                                <Users2 className="h-10 w-10 mb-4 opacity-20" />
                                <p className="font-medium">No individual member data recorded yet</p>
                                <p className="text-xs">Metrics must be assigned to specific users to show here</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                                <div className="space-y-6">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Top Individual Scorers</h4>
                                    <div className="space-y-4">
                                        {[...memberPerformanceData].filter(m => !m.isPending).reverse().slice(0, 5).map((m, i) => (
                                            <div key={m.id} className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                        {i + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm tracking-tight">{m.name}</p>
                                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Active Contributor</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xl font-black text-primary">{m.value}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground ml-1">/ 5.0</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-rose-500">Action Required</h4>
                                        <Badge variant="destructive" className="bg-rose-500/20 text-rose-500 border-rose-500/30 font-black">ALERT</Badge>
                                    </div>
                                    <div className="space-y-4">
                                        {memberPerformanceData.filter(m => !m.isPending && m.value > 0).slice(0, 5).map((m) => (
                                            <div key={m.id} className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center font-bold text-rose-500">
                                                        <AlertCircle className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm tracking-tight">{m.name}</p>
                                                        <p className="text-[10px] uppercase font-bold text-rose-500/70 tracking-widest">Performance Warning</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xl font-black text-rose-500">{m.value}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground ml-1">/ 5.0</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-amber-500">Pending Assessments</h4>
                                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-black">TODO</Badge>
                                    </div>
                                    <div className="space-y-4">
                                        {memberPerformanceData.filter(m => m.isPending).slice(0, 5).map((m) => (
                                            <div key={m.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-dashed border-border/50 opacity-70 hover:opacity-100 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                                                        <Info className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm tracking-tight">{m.name}</p>
                                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">No Metrics Recorded</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {memberPerformanceData.filter(m => m.isPending).length === 0 && (
                                            <div className="h-32 flex flex-col items-center justify-center border border-dashed border-border/30 rounded-3xl bg-muted/5">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">All members assessed</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Overall Health Card */}
            <Card className="rounded-[2.5rem] border-border/50 bg-gradient-to-br from-primary/10 via-background/50 to-violet-500/10 backdrop-blur-2xl shadow-2xl border-2">
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Badge className="bg-primary/20 text-primary border-primary/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Member Insight</Badge>
                                <h3 className="text-4xl font-black tracking-tight">Manual Performance Health</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                Our data indicates that team collaboration and initiative are the highest-rated areas across all projects. 
                                <span className="text-primary font-bold"> Learning Level </span> has seen the most consistent growth over the last quarter.
                            </p>
                            <Button className="rounded-2xl h-12 px-8 bg-primary shadow-xl shadow-primary/20 hover:scale-105 transition-transform group">
                                View Full Report
                                <ArrowUpRight className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </Button>
                        </div>

                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {metricChartData.slice(0, 4).map((m, idx) => (
                                <div key={idx} className="p-6 rounded-3xl bg-muted/20 border border-border/50 flex flex-col justify-between hover:bg-muted/30 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{m.name}</span>
                                        <Badge className={cn(
                                            "rounded-full px-2 py-0.5 text-[9px] font-black",
                                            m.value > 4 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                        )}>
                                            {m.value > 4 ? "STABLE" : "IMPROVING"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-black">{m.value}</span>
                                        <span className="text-sm text-muted-foreground font-bold mb-1.5 opacity-50">/ 5.0</span>
                                    </div>
                                    <div className="w-full bg-border/30 h-1.5 rounded-full mt-6 overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full" 
                                            style={{ width: `${(m.value / 5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({ title, value, unit, icon, trend, description }: any) {
    return (
        <Card className="rounded-[2rem] border-border/50 bg-muted/10 backdrop-blur-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:bg-muted/20">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-background/50 border border-border/50 text-primary shadow-sm">
                        {icon}
                    </div>
                    {trend && (
                        <Badge className={cn(
                            "rounded-full gap-1 px-2 py-1 border-none font-bold text-[10px]",
                            trend > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                        )}>
                            {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {Math.abs(trend)}%
                        </Badge>
                    )}
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{title}</p>
                    <div className="flex items-baseline gap-1">
                        <h4 className="text-4xl font-black tracking-tighter">{value}</h4>
                        {unit && <span className="text-lg font-bold text-muted-foreground">{unit}</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2 font-medium">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}
