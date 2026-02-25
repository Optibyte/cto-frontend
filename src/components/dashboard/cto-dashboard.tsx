'use client';

<<<<<<< HEAD
import { KPICard } from '@/components/dashboard/kpi-card';
import { TeamPerformanceChart } from '@/components/dashboard/team-performance-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Zap, Clock, Activity, BarChart3, Loader2, Users } from 'lucide-react';
import { PerformanceTrendChart } from '@/components/dashboard/performance-trend-chart';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { useDashboardKPIs, useTeamPerformance } from '@/hooks/use-dashboard-data';
import { useProjects } from '@/hooks/use-projects';

export function CTODashboard() {
    const { data: kpiData, isLoading: kpiLoading } = useDashboardKPIs();
    const { data: teamPerformance = [], isLoading: teamLoading } = useTeamPerformance();
    const { data: projects = [], isLoading: projectsLoading } = useProjects();

    const isLoading = kpiLoading || teamLoading || projectsLoading;

    // Prepare trend data from sparkline
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const trendData = kpiData?.velocity?.sparkline?.map((val: number, i: number) => ({
        name: months[i] || `Point ${i + 1}`,
        value: val
    })) || [];

    // Build resource allocation from real projects data
    const projectColors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];
    const resourceData = projects.map((project: any, index: number) => {
        const totalMembers =
            (project.ctos?.length || 0) +
            (project.pms?.length || 0) +
            (project.teamLeads?.length || 0) +
            (project.employees?.length || 0);
        return {
            project: project.name,
            projectId: project.id,
            allocated: totalMembers,
            total: projects.reduce((acc: number, p: any) =>
                acc + (p.ctos?.length || 0) + (p.pms?.length || 0) + (p.teamLeads?.length || 0) + (p.employees?.length || 0), 0),
            color: projectColors[index % projectColors.length],
        };
    });

    // Map team performance data for the chart (backend returns {team, score, members, velocity, quality})
    const chartData = teamPerformance.map((t: any) => ({
        name: t.team || t.name,
        score: t.score,
        members: t.members,
        velocity: t.velocity,
        quality: t.quality,
    }));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-muted-foreground font-medium">Loading dashboard...</span>
                </div>
            </div>
        );
    }

    const defaultKPI = { current: 0, previous: 0, change: 0, trend: 'neutral' as const, sparkline: [] };
=======
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LearningMetricsCards } from '@/components/dashboard/learning-metrics-cards';
import { MetricSelector } from '@/components/dashboard/metric-selector';
import { ChartCustomizer, ChartCustomization } from '@/components/dashboard/chart-customizer';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { mockLearningMetrics } from '@/lib/mock-data/learning-metrics';
import { Activity, BarChart3, TrendingUp, Users, Target, LayoutDashboard } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import { useAppSelector } from '@/redux/store';
import { PROJECTS } from '@/lib/mock-data/dashboard-filtered';

const ctoPerformanceData = [
    { name: 'Architecture', compliance: 92, coverage: 88, debt: 12, quality: 94 },
    { name: 'Infrastructure', compliance: 95, coverage: 90, debt: 8, quality: 96 },
    { name: 'Security', compliance: 98, coverage: 95, debt: 5, quality: 99 },
    { name: 'Frontend', compliance: 88, coverage: 82, debt: 15, quality: 85 },
    { name: 'Backend', compliance: 90, coverage: 85, debt: 10, quality: 88 },
];

const ctoTrendData = [
    { month: 'Jan', velocity: 180, quality: 85, efficiency: 78 },
    { month: 'Feb', velocity: 195, quality: 88, efficiency: 82 },
    { month: 'Mar', velocity: 210, quality: 90, efficiency: 85 },
    { month: 'Apr', velocity: 225, quality: 92, efficiency: 88 },
    { month: 'May', velocity: 248, quality: 94, efficiency: 91 },
    { month: 'Jun', velocity: 260, quality: 95, efficiency: 93 },
    { month: 'Jul', velocity: 275, quality: 96, efficiency: 95 },
];

const CHART_AXIS_OPTIONS = ['name', 'compliance', 'coverage', 'debt', 'quality'];

export function CTODashboard() {
    const { selectedProject } = useAppSelector((state) => state.dashboard);
    const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>(
        mockLearningMetrics.map((m) => m.id)
    );
    const [drillLevel, setDrillLevel] = useState(0);
    const [chartConfig, setChartConfig] = useState<ChartCustomization>({
        xAxis: 'name',
        yAxis: 'quality',
        colorScheme: 'default',
        showValues: false,
    });

    const visibleMetrics = mockLearningMetrics.filter((m) => selectedMetricIds.includes(m.id));

    const getBarColor = () => {
        const schemes: Record<string, string> = {
            default: '#8b5cf6',
            ocean: '#0ea5e9',
            sunset: '#f43f5e',
            forest: '#22c55e',
            neon: '#d946ef',
        };
        return schemes[chartConfig.colorScheme] || '#8b5cf6';
    };

    const projectName = selectedProject === 'all'
        ? 'Enterprise View'
        : PROJECTS.find(p => p.id === selectedProject)?.name || 'Project View';
>>>>>>> 598107a79a5abb4e5d49880e95e2b0287958d496

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/10 pb-6">
                <div className="space-y-1">
<<<<<<< HEAD
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Performance Dashboard
=======
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-3">
                        <LayoutDashboard className="h-8 w-8 text-primary" />
                        {projectName} CTO Dashboard
>>>>>>> 598107a79a5abb4e5d49880e95e2b0287958d496
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary/70" />
                        Executive learning summary and technical excellence metrics
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <MetricSelector
                        metrics={mockLearningMetrics}
                        selectedIds={selectedMetricIds}
                        onSelectionChange={setSelectedMetricIds}
                    />
                    <div className="hidden md:block h-8 w-px bg-border/20 mx-1" />
                    <DateRangeFilter />
                </div>
            </div>

<<<<<<< HEAD
            {/* Top Stats Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="System Velocity"
                    value={kpiData?.velocity?.current ?? 0}
                    unit="points"
                    change={kpiData?.velocity?.change ?? 0}
                    trend={kpiData?.velocity?.trend ?? 'neutral'}
                    icon={TrendingUp}
                    sparklineData={kpiData?.velocity?.sparkline ?? []}
                />
                <KPICard
                    title="Product Quality"
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
                    unit="tasks/wk"
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

            {/* Performance Analysis & Trend */}
            <div className="grid gap-6 lg:grid-cols-3 items-stretch">
                {/* Main Performance Chart - Spans 2 columns */}
                <Card className="lg:col-span-2 border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group bg-card/50 backdrop-blur-md relative">
=======
            {/* Learning Metrics Cards */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Target className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold tracking-tight">Organization Learning Health</h2>
                    <span className="text-xs text-muted-foreground ml-2">({visibleMetrics.length} of {mockLearningMetrics.length} metrics)</span>
                </div>
                <LearningMetricsCards
                    metrics={visibleMetrics}
                    onDrillUp={drillLevel > 0 ? () => setDrillLevel(drillLevel - 1) : undefined}
                    onDrillDown={() => setDrillLevel(drillLevel + 1)}
                />
            </div>

            {/* Performance Charts */}
            <div className="grid gap-6 lg:grid-cols-1">
                <Card className="border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group bg-card/50 backdrop-blur-md relative">
>>>>>>> 598107a79a5abb4e5d49880e95e2b0287958d496
                    <div className="absolute inset-0 border border-primary/10 rounded-2xl pointer-events-none group-hover:border-primary/30 transition-colors duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                Strategic Excellence {drillLevel > 0 && `(Level ${drillLevel})`}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Domain Performance & Compliance</p>
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
<<<<<<< HEAD
                        <TeamPerformanceChart data={chartData} />
                    </CardContent>
                </Card>

                {/* Performance Trend Area Chart */}
=======
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={ctoPerformanceData}>
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

>>>>>>> 598107a79a5abb4e5d49880e95e2b0287958d496
                <Card className="border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group bg-card/50 backdrop-blur-md relative">
                    <div className="absolute inset-0 border border-primary/10 rounded-2xl pointer-events-none group-hover:border-primary/30 transition-colors duration-500" />
                    <CardHeader className="pb-2 relative z-10">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Velocity & Quality Trend
                            </CardTitle>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Engineering Excellence Progression</p>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 relative z-10">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={ctoTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
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
                                <Area type="monotone" dataKey="velocity" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Velocity" />
                                <Area type="monotone" dataKey="quality" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Quality" />
                                <Area type="monotone" dataKey="efficiency" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Efficiency" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

<<<<<<< HEAD
            {/* Bottom Row - Resource Allocation from real projects */}
            <Card className="border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group bg-card/50 backdrop-blur-md relative">
                <div className="absolute inset-0 border border-primary/10 rounded-2xl pointer-events-none" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Resource Allocation
                        </CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Members per Project</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="font-bold text-foreground">
                            {resourceData.reduce((acc: number, r: any) => acc + r.allocated, 0)}
                        </span>
                        <span>/ {resourceData.length} projects</span>
                    </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4 pt-4">
                    {resourceData.length > 0 ? (
                        resourceData.map((item: any, index: number) => (
                            <div key={item.projectId} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="font-medium">{item.project}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <span className="font-semibold text-foreground">{item.allocated} members</span>
                                        {item.total > 0 && (
                                            <span className="font-bold">{Math.round((item.allocated / item.total) * 100)}%</span>
                                        )}
                                    </div>
                                </div>
                                <div className="h-2.5 overflow-hidden rounded-full bg-muted/50 shadow-inner">
                                    <div
                                        className="h-full rounded-full shadow-sm transition-all duration-700"
                                        style={{
                                            width: item.total > 0 ? `${(item.allocated / item.total) * 100}%` : '0%',
                                            backgroundColor: item.color,
                                        }}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No projects found. Create a project to see resource allocation.</p>
                    )}
                </CardContent>
            </Card>
=======
            {/* High-level Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                {[
                    { label: 'Technical Debt', value: '12.4%', sub: 'Target < 15%', icon: Target },
                    { label: 'Engineering Satisfaction', value: '94%', sub: 'Avg across teams', icon: Users },
                    { label: 'System Uptime', value: '99.99%', sub: 'Last 30 days', icon: Activity },
                ].map((stat, i) => (
                    <Card key={i} className="border-border/40 shadow-lg bg-card/50 backdrop-blur-md group hover:shadow-xl hover:border-primary/30 transition-all">
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                    <stat.icon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-extrabold">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground">{stat.label} · {stat.sub}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
>>>>>>> 598107a79a5abb4e5d49880e95e2b0287958d496
        </div>
    );
}
