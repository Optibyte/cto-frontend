'use client';

import { KPICard } from '@/components/dashboard/kpi-card';
import { TeamPerformanceChart } from '@/components/dashboard/team-performance-chart';
import { ResourceAllocation } from '@/components/dashboard/resource-allocation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Zap, Clock, Activity, BarChart3 } from 'lucide-react';
import { useAppSelector } from '@/redux/store';
import {
    getFilteredKPIData,
    getFilteredTeamPerformance,
    getFilteredResourceAllocation,
    PROJECTS
} from '@/lib/mock-data/dashboard-filtered';

import { PerformanceTrendChart } from '@/components/dashboard/performance-trend-chart';
import { DateRangeFilter } from '@/components/filters/date-range-filter';

export function CTODashboard() {
    const { selectedProject, selectedTeam } = useAppSelector((state) => state.dashboard);

    // Get filtered data based on project/team selection
    const kpiData = getFilteredKPIData(selectedProject, selectedTeam);
    const teamPerformance = getFilteredTeamPerformance(selectedProject, selectedTeam);
    // Prepare trend data from sparkline
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const trendData = kpiData.velocity.sparkline?.map((val, i) => ({
        name: months[i] || `Point ${i + 1}`,
        value: val
    })) || [];
    const resourceData = getFilteredResourceAllocation(selectedProject);

    const projectName = selectedProject === 'all'
        ? 'All Projects'
        : PROJECTS.find(p => p.id === selectedProject)?.name || 'Unknown Project';

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Dashboard Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/10 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {projectName}
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
                    value={kpiData.velocity.current}
                    unit="points"
                    change={kpiData.velocity.change}
                    trend={kpiData.velocity.trend}
                    icon={TrendingUp}
                    sparklineData={kpiData.velocity.sparkline}
                />
                <KPICard
                    title="Product Quality"
                    value={kpiData.quality.current}
                    unit="%"
                    change={kpiData.quality.change}
                    trend={kpiData.quality.trend}
                    icon={Target}
                    sparklineData={kpiData.quality.sparkline}
                />
                <KPICard
                    title="Throughput"
                    value={kpiData.throughput.current}
                    unit="tasks/wk"
                    change={kpiData.throughput.change}
                    trend={kpiData.throughput.trend}
                    icon={Zap}
                    sparklineData={kpiData.throughput.sparkline}
                />
                <KPICard
                    title="Cycle Time"
                    value={kpiData.cycleTime.current}
                    unit="hrs"
                    change={kpiData.cycleTime.change}
                    trend={kpiData.cycleTime.trend}
                    icon={Clock}
                    sparklineData={kpiData.cycleTime.sparkline}
                />
            </div>

            {/* Performance Analysis & Trend */}
            <div className="grid gap-6 lg:grid-cols-3 items-stretch">
                {/* Main Performance Chart - Spans 2 columns */}
                <Card className="lg:col-span-2 border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group bg-card/50 backdrop-blur-md relative">
                    {/* Gradient Border Glow */}
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
                        <TeamPerformanceChart data={teamPerformance} />
                    </CardContent>
                </Card>

                {/* Performance Trend Area Chart - Spans 1 column */}
                <Card className="border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group bg-card/50 backdrop-blur-md relative">
                    {/* Gradient Border Glow */}
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

            {/* Bottom Row - Resource Allocation */}
            <div className="grid gap-6">
                <Card className="border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group bg-card/50 backdrop-blur-md relative">
                    <div className="absolute inset-0 border border-primary/10 rounded-2xl pointer-events-none" />
                    <ResourceAllocation data={resourceData} />
                </Card>
            </div>
        </div>
    );
}
