'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LearningMetricsCards } from '@/components/dashboard/learning-metrics-cards';
import { MetricSelector } from '@/components/dashboard/metric-selector';
import { ChartCustomizer, ChartCustomization } from '@/components/dashboard/chart-customizer';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { mockLearningMetrics } from '@/lib/mock-data/learning-metrics';
import { DashboardFilters } from '@/components/dashboard/dashboard-filters';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import { useAppSelector } from '@/redux/store';
import { useDashboardKPIs, useTeamPerformance, useRecentActivity } from '@/hooks/use-dashboard-data';
import { useRole } from '@/contexts/role-context';
import { KPICard } from '@/components/dashboard/kpi-card';
import { TrendingUp, Target, Users2, ShieldCheck, Activity, Download, Loader2, Zap, Clock, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

const tlTeamPerformanceData = [
    { name: 'Alice Johnson', completed: 15, certifications: 4, skillPoints: 350, speed: 92 },
    { name: 'Bob Williams', completed: 12, certifications: 2, skillPoints: 280, speed: 85 },
    { name: 'Carol Davis', completed: 18, certifications: 5, skillPoints: 420, speed: 94 },
    { name: 'David Chen', completed: 8, certifications: 1, skillPoints: 190, speed: 78 },
    { name: 'Eva Martinez', completed: 14, certifications: 3, skillPoints: 310, speed: 88 },
];

const tlTeamTrendData = [
    { week: 'W1', avgScore: 72, activeUsers: 4, completions: 3 },
    { week: 'W2', avgScore: 75, activeUsers: 5, completions: 5 },
    { week: 'W3', avgScore: 78, activeUsers: 4, completions: 4 },
    { week: 'W4', avgScore: 82, activeUsers: 5, completions: 6 },
    { week: 'W5', avgScore: 85, activeUsers: 5, completions: 8 },
];

const CHART_AXIS_OPTIONS = ['name', 'completed', 'certifications', 'skillPoints', 'speed'];

export function TLDashboard() {
    const { user } = useRole();
    const { data: kpiData, isLoading: kpiLoading } = useDashboardKPIs();
    const { data: teamPerformance = [], isLoading: teamLoading } = useTeamPerformance();
    const { data: activity = [], isLoading: activityLoading } = useRecentActivity();

    const { selectedTeam } = useAppSelector((state) => state.dashboard);
    const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>(
        mockLearningMetrics.map((m) => m.id)
    );
    const [drillLevel, setDrillLevel] = useState(0);
    const [chartConfig, setChartConfig] = useState<ChartCustomization>({
        xAxis: 'name',
        yAxis: 'completed',
        colorScheme: 'forest',
        showValues: true,
    });

    const isLoading = kpiLoading || teamLoading || activityLoading;

    const visibleMetrics = mockLearningMetrics.filter((m) => selectedMetricIds.includes(m.id));

    const handleDownload = () => {
        toast.success('Downloading team report...');
        // In a real app, this would call an API or generate a CSV
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Name,Completed,Certifications,SkillPoints,Speed\n"
            + tlTeamPerformanceData.map(e => `${e.name},${e.completed},${e.certifications},${e.skillPoints},${e.speed}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${user?.fullName || 'Team'}_Report.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const getBarColor = () => {
        const schemes: Record<string, string> = {
            default: '#8b5cf6',
            ocean: '#0ea5e9',
            sunset: '#f43f5e',
            forest: '#22c55e',
            neon: '#d946ef',
        };
        return schemes[chartConfig.colorScheme] || '#22c55e';
    };

    const teamDisplayName = user?.teamName || (selectedTeam === 'all' ? 'Your Team' : selectedTeam.toUpperCase());

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    <span className="text-muted-foreground font-medium">Loading team data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/10 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                        <Users2 className="h-8 w-8 text-emerald-500" />
                        {teamDisplayName} Lead Dashboard
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-500/70" />
                        Team-level learning tracking and skill development
                    </p>
                </div>
                <div className="flex flex-col md:flex-row flex-wrap items-end md:items-center gap-3">
                    <DashboardFilters />
                    <div className="hidden md:block h-8 w-px bg-border/20 mx-1" />
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/20 text-sm font-medium"
                    >
                        <Download className="h-4 w-4" />
                        Download Report
                    </button>
                    <DateRangeFilter />
                </div>
            </div>

            {/* Top Stats Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Velocity"
                    value={kpiData?.velocity?.current ?? 0}
                    unit="pts"
                    change={kpiData?.velocity?.change ?? 0}
                    trend={kpiData?.velocity?.trend ?? 'neutral'}
                    icon={TrendingUp}
                    sparklineData={kpiData?.velocity?.sparkline ?? []}
                />
                <KPICard
                    title="Quality"
                    value={kpiData?.quality?.current ?? 0}
                    unit="%"
                    change={kpiData?.quality?.change ?? 0}
                    trend={kpiData?.quality?.trend ?? 'neutral'}
                    icon={Target}
                    sparklineData={kpiData?.quality?.sparkline ?? []}
                />
                <KPICard
                    title="Throughput"
                    value={kpiData?.throughput?.current ?? 0}
                    unit="tasks"
                    change={kpiData?.throughput?.change ?? 0}
                    trend={kpiData?.throughput?.trend ?? 'neutral'}
                    icon={Zap}
                    sparklineData={kpiData?.throughput?.sparkline ?? []}
                />
                <KPICard
                    title="Cycle Time"
                    value={kpiData?.cycleTime?.current ?? 0}
                    unit="hrs"
                    change={kpiData?.cycleTime?.change ?? 0}
                    trend={kpiData?.cycleTime?.trend ?? 'neutral'}
                    icon={Clock}
                    sparklineData={kpiData?.cycleTime?.sparkline ?? []}
                />
            </div>

            {/* Learning Metrics Cards */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <h2 className="text-xl font-bold tracking-tight">Team Learning Progress</h2>
                    <span className="text-xs text-muted-foreground ml-2">({visibleMetrics.length} tracking)</span>
                </div>
                <LearningMetricsCards metrics={visibleMetrics} />
            </div>

            {/* Member Performance Chart */}
            <Card className="border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group bg-card/50 backdrop-blur-md relative">
                <div className="absolute inset-0 border border-emerald-500/10 rounded-2xl pointer-events-none group-hover:border-emerald-500/30 transition-colors duration-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-emerald-500" />
                            Member Learning Distribution {drillLevel > 0 && `(Level ${drillLevel})`}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Individual Contributions & Growth</p>
                    </div>
                    <ChartCustomizer
                        axisOptions={CHART_AXIS_OPTIONS}
                        customization={chartConfig}
                        onCustomizationChange={setChartConfig}
                        onDrillUp={drillLevel > 0 ? () => setDrillLevel(drillLevel - 1) : undefined}
                        onDrillDown={() => setDrillLevel(drillLevel + 1)}
                    />
                </CardHeader>
                <CardContent className="pt-4 relative z-10">
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={tlTeamPerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis dataKey={chartConfig.xAxis} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--popover))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                }}
                            />
                            <Legend />
                            <Bar
                                dataKey={chartConfig.yAxis}
                                fill={getBarColor()}
                                radius={[6, 6, 0, 0]}
                                label={chartConfig.showValues ? { position: 'top', fontSize: 11 } : false}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Team Week-over-Week Trend */}
            <Card className="border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group bg-card/50 backdrop-blur-md relative">
                <div className="absolute inset-0 border border-emerald-500/10 rounded-2xl pointer-events-none group-hover:border-emerald-500/30 transition-colors duration-500" />
                <CardHeader className="pb-2 relative z-10">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            Sprint-wise Learning Velocity
                        </CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Team Performance Progression</p>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 relative z-10">
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={tlTeamTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--popover))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="avgScore" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} name="Avg Score" />
                            <Line type="monotone" dataKey="completions" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="Completions" />
                            <Line type="monotone" dataKey="activeUsers" stroke="#3b82f6" strokeWidth={2} name="Active Members" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                {[
                    { label: 'Active Learners', value: '5/5', sub: 'Entire team', icon: Users2 },
                    { label: 'Avg Skill Score', value: '82', sub: '+5 from last week', icon: Target },
                    { label: 'Certifications', value: '15', sub: 'Total achieved', icon: ShieldCheck },
                    { label: 'Weekly Active', value: '100%', sub: 'Participation rate', icon: Activity },
                ].map((stat, i) => (
                    <Card key={i} className="border-border/40 shadow-lg bg-card/50 backdrop-blur-md group hover:shadow-xl hover:border-emerald-500/30 transition-all">
                        <CardContent className="pt-5 pb-4">
                            <div className="flex flex-col gap-2">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                    <stat.icon className="h-4 w-4 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-xl font-extrabold">{stat.value}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                                    <p className="text-[9px] text-muted-foreground/70">{stat.sub}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
