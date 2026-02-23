'use client';

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

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Dashboard Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/10 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Performance Dashboard
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary/70" />
                        Real-time performance overview and health metrics
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:block h-8 w-px bg-border/20 mx-2" />
                    <DateRangeFilter />
                </div>
            </div>

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
                    <div className="absolute inset-0 border border-primary/10 rounded-2xl pointer-events-none group-hover:border-primary/30 transition-colors duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                Team Performance Analysis
                            </CardTitle>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Efficiency & Output by Team</p>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 relative z-10">
                        <TeamPerformanceChart data={chartData} />
                    </CardContent>
                </Card>

                {/* Performance Trend Area Chart */}
                <Card className="border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group bg-card/50 backdrop-blur-md relative">
                    <div className="absolute inset-0 border border-primary/10 rounded-2xl pointer-events-none group-hover:border-primary/30 transition-colors duration-500" />
                    <CardHeader className="pb-2 relative z-10">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Velocity Trend
                            </CardTitle>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Performance Over Time</p>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 relative z-10">
                        <PerformanceTrendChart data={trendData} />
                    </CardContent>
                </Card>
            </div>

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
        </div>
    );
}
