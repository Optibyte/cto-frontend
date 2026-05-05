'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    TrendingUp, 
    Award, 
    BarChart3, 
    ArrowUpRight, 
    ArrowDownRight,
    Users2,
    Zap,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    Database,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useSprintMetrics } from '@/hooks/use-metrics';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { useDataFence } from '@/contexts/role-context';
import { Lock } from 'lucide-react';
import { SprintKPIPanel } from './sprint-kpi-panel';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
const SOURCE_COLORS: Record<string, string> = { manual: '#8b5cf6', csv: '#10b981' };

export function AnalyticsDashboard({ 
    selectedProjectId = 'all', 
    setSelectedProjectId, 
    selectedTeamId = 'all', 
    setSelectedTeamId 
}: any) {
    const [projInitialized, setProjInitialized] = useState(false);
    const [teamInitialized, setTeamInitialized] = useState(false);
    
    // Fetch all sprint metrics
    const { data: metrics = [], isLoading: metricsLoading } = useSprintMetrics();
    const { data: hierarchy } = useOrgHierarchy();

    const fence = useDataFence();

    // Hierarchy & Fence Logic (moved logic here if needed, but we keep it for filtering)
    // ... (rest of memos stay the same)

    // Hierarchy & Fence Logic
    const resolvedAllowedProjectIds = useMemo(() => {
        if (!fence.isRestricted) return null;
        if (fence.allowedProjectIds && fence.allowedProjectIds.length > 0) return fence.allowedProjectIds;
        if (fence.allowedTeamIds && hierarchy) {
            const projectIds: string[] = [];
            hierarchy.markets?.forEach((m: any) => {
                m.accounts?.forEach((a: any) => {
                    a.teams?.forEach((t: any) => {
                        if (fence.allowedTeamIds!.includes(t.id) && t.projectId && !projectIds.includes(t.projectId)) {
                            projectIds.push(t.projectId);
                        }
                    });
                });
            });
            return projectIds.length > 0 ? projectIds : null;
        }
        return null;
    }, [fence, hierarchy]);

    const projects = useMemo(() => {
        if (!hierarchy) return [];
        const projs: any[] = [];
        hierarchy.markets?.forEach((m: any) => {
            m.accounts?.forEach((a: any) => {
                a.teams?.forEach((t: any) => {
                    if (t.project && !projs.find((p: any) => p.id === t.project.id)) {
                        const withinFence = !resolvedAllowedProjectIds || resolvedAllowedProjectIds.includes(t.project.id);
                        const withinTeamFence = !fence.allowedTeamIds || fence.allowedTeamIds.includes(t.id);
                        if (withinFence && withinTeamFence) projs.push(t.project);
                    }
                });
            });
        });
        return projs;
    }, [hierarchy, resolvedAllowedProjectIds, fence.allowedTeamIds]);

    const teams = useMemo(() => {
        if (!hierarchy) return [];
        let allTeams: any[] = [];
        hierarchy.markets?.forEach((m: any) => {
            m.accounts?.forEach((a: any) => {
                allTeams = [...allTeams, ...(a.teams || [])];
            });
        });
        if (selectedProjectId !== 'all') {
            allTeams = allTeams.filter((t: any) => t.projectId === selectedProjectId);
        }
        if (fence.allowedTeamIds) {
            allTeams = allTeams.filter((t: any) => fence.allowedTeamIds!.includes(t.id));
        }
        if (resolvedAllowedProjectIds) {
            allTeams = allTeams.filter((t: any) => resolvedAllowedProjectIds.includes(t.projectId));
        }
        return allTeams;
    }, [hierarchy, selectedProjectId, fence.allowedTeamIds, resolvedAllowedProjectIds]);

    useEffect(() => {
        if (!fence.isRestricted) return;
        if (projects.length > 0 && !projInitialized) {
            const isProjectValid = projects.some(p => p.id === selectedProjectId);
            if (selectedProjectId === 'all' || !isProjectValid) {
                setSelectedProjectId(projects[0].id);
                setProjInitialized(true);
            }
        }
        if (teams.length > 0 && !teamInitialized) {
            const isTeamValid = teams.some(t => t.id === selectedTeamId);
            if (selectedTeamId === 'all' || !isTeamValid) {
                setSelectedTeamId(teams[0].id);
                setTeamInitialized(true);
            }
        }
    }, [fence.isRestricted, projects, teams, selectedProjectId, selectedTeamId, projInitialized, teamInitialized]);

    // Apply the "manual" and "csv" filter precisely here
    const filteredMetrics = useMemo(() => {
        return metrics.filter((m: any) => {
            const team = teams.find(t => t.id === m.teamId);
            const matchesProject = selectedProjectId === 'all' || m.projectId === selectedProjectId || (team && team.projectId === selectedProjectId);
            const matchesTeam = selectedTeamId === 'all' || m.teamId === selectedTeamId;
            return matchesProject && matchesTeam;
        });
    }, [metrics, selectedProjectId, selectedTeamId, teams]);

    // Aggregates for Cards
    const stats = useMemo(() => {
        if (filteredMetrics.length === 0) return { avg: 0, count: 0, trend: 0 };
        
        let totalQuality = 0;
        let validCount = 0;

        filteredMetrics.forEach((m: any) => {
            if (m.qualityScore !== undefined) {
                totalQuality += Number(m.qualityScore);
                validCount++;
            }
        });

        // Compute avg out of 5 based on quality score (which is a percentage 0-100)
        const avgPercentage = validCount > 0 ? (totalQuality / validCount) / 100 : 0;
        const avgRating = Math.min(5, Math.max(0, avgPercentage * 5));
        
        return {
            avg: Number(avgRating.toFixed(1)),
            count: filteredMetrics.length,
            trend: 8.4
        };
    }, [filteredMetrics]);

    // Report Generation
    const handleExportReport = () => {
        if (filteredMetrics.length === 0) return;
        
        let csv = 'Sprint,Team ID,Project ID,Velocity,Throughput,Quality,Done To Said,Tech Debt,Stories Delivered\n';
        
        filteredMetrics.forEach((m: any) => {
            csv += `"${m.sprintName || m.sprintNumber}",${m.teamId || ''},${m.projectId || ''},${m.velocityPoints || 0},${m.throughputPoints || 0},${m.qualityScore || 0},${m.doneToSaidRatio || 0},${m.technicalDebtIndex || 0},${m.userStoriesDelivered || 0}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Analytics_Metrics_Report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Chart: Source Dist
    const sourceChartData = useMemo(() => {
        const counts = { manual: 0, csv: 0 };
        filteredMetrics.forEach((m: any) => {
            if (m.source === 'manual') counts.manual++;
            if (m.source === 'csv') counts.csv++;
        });
        return [
            { name: 'Manual', value: counts.manual, source: 'manual' },
            { name: 'CSV Upload', value: counts.csv, source: 'csv' }
        ].filter(d => d.value > 0);
    }, [filteredMetrics]);

    // Chart: Category Dist (Simulated by averaging across specific metric fields in sprints)
    const categoryChartData = useMemo(() => {
        if (filteredMetrics.length === 0) return [];
        let tp = 0, vel = 0, qa = 0, td = 0, dt = 0;
        filteredMetrics.forEach((m: any) => {
            tp += Number(m.throughputPoints || 0);
            vel += Number(m.velocityPoints || 0);
            qa += Number(m.qualityScore || 0);
            td += Number(m.technicalDebtIndex || 0);
            dt += Number(m.doneToSaidRatio || 0);
        });
        const n = filteredMetrics.length;
        return [
            { name: 'Throughput', value: Math.min(5, (tp / n) / 10) },
            { name: 'Velocity', value: Math.min(5, (vel / n) / 10) },
            { name: 'Quality', value: Math.min(5, (qa / n) / 20) },
            { name: 'Tech Debt', value: Math.max(0, 5 - (td / n) / 2) },
            { name: 'Done/Said', value: Math.min(5, (dt / n) / 20) }
        ].sort((a, b) => b.value - a.value);
    }, [filteredMetrics]);

    // Chart: Trend over time
    const trendChartData = useMemo(() => {
        const groups: Record<string, { sum: number, count: number }> = {};
        filteredMetrics.forEach((m: any) => {
            const timeField = m.calculatedAt || m.createdAt || m.updatedAt;
            if (!timeField) return;
            const dateStr = new Date(timeField).toISOString().split('T')[0];
            if (!groups[dateStr]) groups[dateStr] = { sum: 0, count: 0 };
            
            // Just average velocity for the trend line
            groups[dateStr].sum += Number(m.velocityPoints || 0);
            groups[dateStr].count += 1;
        });

        return Object.entries(groups)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, g]) => ({
                name: date,
                value: Number((g.sum / g.count).toFixed(1))
            }))
            .slice(-14);
    }, [filteredMetrics]);

    if (metricsLoading) {
        return <div className="flex justify-center py-20 animate-pulse text-muted-foreground font-black tracking-widest uppercase">Loading Analytics Dashboard...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {fence.isRestricted && (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Lock className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-bold">{(fence as any).fenceLabel || '🔒 Data restricted to your scope'}</span>
                </div>
            )}


            {/* Sprint KPI Summary Panel */}
            <div className="rounded-[2.5rem] border-[1.5px] border-border/50 bg-gradient-to-b from-background/90 to-background/50 backdrop-blur-2xl shadow-xl overflow-hidden">
                <div className="p-8 pb-4 flex items-center justify-between border-b border-border/10">
                    <div>
                        <h3 className="text-2xl font-black tracking-tight">Productivity &amp; Quality Metrics</h3>
                        <p className="text-muted-foreground text-xs font-medium mt-1">Calculated from sprint data using standard engineering formulas — averaged across all sprints</p>
                    </div>
                    <div className="flex gap-3 text-[10px] font-black uppercase tracking-widest items-center">
                        <Button 
                            onClick={handleExportReport} 
                            disabled={filteredMetrics.length === 0}
                            variant="outline"
                            className="h-8 rounded-full bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 mr-2"
                        >
                            <Download className="h-3 w-3 mr-1.5" />
                            Export CSV
                        </Button>
                        <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">● On Target</span>
                        <span className="px-3 py-1.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">● At Risk</span>
                        <span className="px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">● Off Target</span>
                    </div>
                </div>
                <div className="p-8">
                    <SprintKPIPanel metrics={filteredMetrics} />
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard 
                    title="Overall Health" 
                    value={stats.avg} 
                    unit="/ 5"
                    icon={<Award className="h-6 w-6" />} 
                    trend={stats.trend}
                    description="Performance Rating"
                />
                <StatCard 
                    title="Active Sources" 
                    value={sourceChartData.length} 
                    icon={<Users2 className="h-6 w-6" />} 
                    description="Input channels"
                />
                <StatCard 
                    title="Total Entries" 
                    value={stats.count} 
                    icon={<Zap className="h-6 w-6" />} 
                    description="Manual & CSV records"
                />
                <StatCard 
                    title="Monitored Teams" 
                    value={new Set(filteredMetrics.map((m: any) => m.teamId)).size} 
                    icon={<PieChartIcon className="h-6 w-6" />} 
                    trend={1.2}
                    description="Teams with metric data"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trend Chart */}
                <Card className="rounded-[2.5rem] border-[1.5px] border-border/50 bg-gradient-to-b from-background/90 to-background/50 backdrop-blur-2xl shadow-xl lg:col-span-2 overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-500 group">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-black tracking-tight">Performance Trend</CardTitle>
                                <CardDescription className="font-medium mt-1 text-xs">Average metric values over recent days</CardDescription>
                            </div>
                            <div className="p-4 rounded-3xl bg-primary/10 text-primary border border-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendChartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 11, fill: 'currentColor', fontWeight: 800, opacity: 0.5 }}
                                    dy={15}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 11, fill: 'currentColor', fontWeight: 800, opacity: 0.5 }}
                                />
                                <RechartsTooltip 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-background/95 backdrop-blur-2xl border border-primary/30 p-5 rounded-[1.5rem] shadow-2xl shadow-primary/20">
                                                    <p className="text-xs font-black uppercase text-muted-foreground/80 mb-2 tracking-widest">{payload[0].payload.name}</p>
                                                    <p className="text-4xl font-black text-primary drop-shadow-sm">{payload[0].value}</p>
                                                    <p className="text-[10px] uppercase font-black text-primary/60 tracking-[0.2em] mt-2 border-t border-primary/10 pt-2">Daily Average Score</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#8b5cf6" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorTrend)" 
                                    animationDuration={2000}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Source Chart */}
                <Card className="rounded-[2.5rem] border-[1.5px] border-border/50 bg-gradient-to-br from-background/90 to-background/50 backdrop-blur-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:border-emerald-500/20 transition-all duration-500 group">
                    <CardHeader className="p-8 pb-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-black tracking-tight">Data Sources</CardTitle>
                                <CardDescription className="font-medium mt-1 text-xs">Manual vs CSV inputs</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 h-[400px] flex flex-col items-center justify-center relative">
                        {sourceChartData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="80%">
                                    <PieChart>
                                        <Pie
                                            data={sourceChartData}
                                            innerRadius={80}
                                            outerRadius={105}
                                            paddingAngle={8}
                                            dataKey="value"
                                            stroke="none"
                                            animationDuration={2000}
                                            cornerRadius={8}
                                        >
                                            {sourceChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={SOURCE_COLORS[entry.source as keyof typeof SOURCE_COLORS] || COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const color = SOURCE_COLORS[payload[0].payload.source as keyof typeof SOURCE_COLORS] || COLORS[0];
                                                    return (
                                                        <div className="bg-background/95 backdrop-blur-2xl border border-border/50 p-5 rounded-[1.5rem] shadow-2xl min-w-[150px]" style={{ borderColor: `${color}60` }}>
                                                            <p className="text-xs font-black text-muted-foreground/80 uppercase tracking-widest">{payload[0].name}</p>
                                                            <p className="text-4xl font-black mt-2 drop-shadow-sm" style={{ color }}>{payload[0].value}</p>
                                                            <p className="text-[10px] uppercase font-black tracking-[0.2em] mt-2 opacity-60 border-t border-border/50 pt-2">Total Records</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
                                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/60">Total volume</span>
                                    <span className="text-5xl font-black text-gradient bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent mt-1">
                                        {sourceChartData.reduce((acc, curr) => acc + curr.value, 0)}
                                    </span>
                                </div>
                                <div className="flex gap-5 mt-8 border border-border/50 px-5 py-2.5 rounded-2xl bg-muted/20 backdrop-blur-sm">
                                    {sourceChartData.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2.5">
                                            <div className="w-3 h-3 rounded-full shadow-inner shadow-black/20" style={{ backgroundColor: SOURCE_COLORS[entry.source as keyof typeof SOURCE_COLORS] || COLORS[index % COLORS.length] }} />
                                            <span className="text-[11px] font-black uppercase tracking-widest opacity-80">{entry.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center opacity-30">
                                <Database className="h-16 w-16 mb-5" />
                                <p className="font-black text-sm uppercase tracking-widest">No Sources Active</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
                {/* Category Dist Chart */}
                <Card className="rounded-[2.5rem] border-[1.5px] border-border/50 bg-background/50 backdrop-blur-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-black tracking-tight">Top Categories</CardTitle>
                                <CardDescription className="font-medium text-xs mt-1">Highest assigned performance categories</CardDescription>
                            </div>
                            <div className="p-4 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner hover:scale-110 transition-transform duration-500">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryChartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 11, fill: 'currentColor', fontWeight: 800, opacity: 0.6 }}
                                    dy={15}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 11, fill: 'currentColor', fontWeight: 800, opacity: 0.5 }}
                                    domain={[0, 5]}
                                />
                                <RechartsTooltip 
                                    cursor={{ fill: 'rgba(245, 158, 11, 0.05)', radius: 12 }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-background/95 backdrop-blur-2xl border border-amber-500/30 p-5 rounded-[1.5rem] shadow-2xl shadow-amber-500/20">
                                                    <p className="text-xs font-black uppercase text-muted-foreground/80 mb-2 tracking-widest">{payload[0].payload.name}</p>
                                                    <p className="text-4xl font-black text-amber-500 drop-shadow-sm">{payload[0].value}</p>
                                                    <p className="text-[10px] uppercase font-black text-amber-500/60 tracking-[0.2em] mt-2 border-t border-amber-500/10 pt-2">Average Impact Score</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar 
                                    dataKey="value" 
                                    radius={[16, 16, 4, 4]} 
                                    fill="url(#barGradient2)" 
                                    barSize={72}
                                    animationDuration={2000}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}

function StatCard({ title, value, unit, icon, trend, description }: any) {
    return (
        <Card className="rounded-[2.5rem] border-[1.5px] border-border/50 bg-gradient-to-br from-background/90 to-background/40 backdrop-blur-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
            <CardContent className="p-8">
                <div className="flex items-start justify-between mb-8">
                    <div className="p-4 rounded-[1.25rem] bg-muted/50 border border-border/50 text-foreground shadow-inner group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all duration-500 group-hover:shadow-primary/10">
                        {icon}
                    </div>
                    {trend && (
                        <Badge className={cn(
                            "rounded-full gap-1.5 px-3.5 py-1.5 border-none font-black text-[11px] shadow-sm transform transition-all duration-500 group-hover:scale-110",
                            trend > 0 ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/15 text-red-500"
                        )}>
                            {trend > 0 ? <ArrowUpRight className="h-4 w-4 stroke-[3]" /> : <ArrowDownRight className="h-4 w-4 stroke-[3]" />}
                            {Math.abs(trend)}%
                        </Badge>
                    )}
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">{title}</p>
                    <div className="flex items-baseline gap-1.5">
                        <h4 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent transform transition-all duration-500 group-hover:scale-105 origin-left">{value}</h4>
                        {unit && <span className="text-xl font-bold text-muted-foreground/50 tracking-tight">{unit}</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground/70 mt-3 font-bold">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}
