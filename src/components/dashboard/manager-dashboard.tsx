'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LearningMetricsCards } from '@/components/dashboard/learning-metrics-cards';
import { MetricSelector } from '@/components/dashboard/metric-selector';
import { ChartCustomizer, ChartCustomization } from '@/components/dashboard/chart-customizer';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { mockLearningMetrics } from '@/lib/mock-data/learning-metrics';
import { Users, BarChart3, Activity, TrendingUp, Target, Briefcase } from 'lucide-react';
import { DashboardFilters } from '@/components/dashboard/dashboard-filters';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import { useAppSelector } from '@/redux/store';
import { useProjects } from '@/hooks/use-projects';
import { GithubMetricsWidget } from './github-metrics-widget';

const managerPerformanceData = [
    { name: 'Team Alpha', completed: 45, certifications: 12, skillPoints: 850, attendance: 98 },
    { name: 'Team Beta', completed: 38, certifications: 8, skillPoints: 720, attendance: 95 },
    { name: 'Team Gamma', completed: 52, certifications: 15, skillPoints: 940, attendance: 99 },
    { name: 'Team Delta', completed: 25, certifications: 5, skillPoints: 480, attendance: 92 },
    { name: 'Team Epsilon', completed: 42, certifications: 10, skillPoints: 790, attendance: 96 },
];

const managerTrendData = [
    { month: 'Jan', active: 120, completed: 85, certifications: 18 },
    { month: 'Feb', active: 135, completed: 92, certifications: 22 },
    { month: 'Mar', active: 150, completed: 110, certifications: 28 },
    { month: 'Apr', active: 165, completed: 118, certifications: 30 },
    { month: 'May', active: 182, completed: 135, certifications: 35 },
    { month: 'Jun', active: 195, completed: 142, certifications: 38 },
    { month: 'Jul', active: 210, completed: 155, certifications: 42 },
];

const CHART_AXIS_OPTIONS = ['name', 'completed', 'certifications', 'skillPoints', 'attendance'];

export function ManagerDashboard() {
    const { selectedProject, selectedTeam } = useAppSelector((state) => state.dashboard);
    const { data: liveProjects = [] } = useProjects();
    const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>(
        mockLearningMetrics.map((m) => m.id)
    );
    const [drillLevel, setDrillLevel] = useState(0);
    const [chartConfig, setChartConfig] = useState<ChartCustomization>({
        xAxis: 'name',
        yAxis: 'skillPoints',
        colorScheme: 'ocean',
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
        return schemes[chartConfig.colorScheme] || '#0ea5e9';
    };

    const projectName = selectedProject === 'all'
        ? 'All Projects'
        : liveProjects.find((p: any) => p.id === selectedProject)?.name || 'Project';

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/10 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                        <Briefcase className="h-8 w-8 text-blue-500" />
                        Manager Dashboard
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500/70" />
                        Team-wise learning progress for {projectName}
                        {selectedTeam !== 'all' && ` · ${selectedTeam.toUpperCase()}`}
                    </p>
                </div>
                <div className="flex flex-col md:flex-row flex-wrap items-end md:items-center gap-3">
                    <DashboardFilters />
                    <div className="hidden md:block h-8 w-px bg-border/20 mx-1" />
                    <MetricSelector
                        metrics={mockLearningMetrics}
                        selectedIds={selectedMetricIds}
                        onSelectionChange={setSelectedMetricIds}
                    />
                    <DateRangeFilter />
                </div>
            </div>

            {/* Learning Metrics Cards */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Target className="h-5 w-5 text-blue-500" />
                    <h2 className="text-xl font-bold tracking-tight">Team Learning Overview</h2>
                    <span className="text-xs text-muted-foreground ml-2">({visibleMetrics.length} metrics)</span>
                </div>
                <LearningMetricsCards metrics={visibleMetrics} />
            </div>

            {/* Team Performance Chart */}
            <Card className="border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group bg-card/50 backdrop-blur-md relative">
                <div className="absolute inset-0 border border-blue-500/10 rounded-2xl pointer-events-none group-hover:border-blue-500/30 transition-colors duration-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-500" />
                            Team Capability Analysis {drillLevel > 0 && `(Level ${drillLevel})`}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Skills & Certifications by Team</p>
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
                        <BarChart data={managerPerformanceData}>
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

            {/* GitHub Metrics Widget */}
            {selectedProject !== 'all' && (
                <GithubMetricsWidget projectId={selectedProject} />
            )}

            {/* Trend Chart */}
            <Card className="border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group bg-card/50 backdrop-blur-md relative">
                <div className="absolute inset-0 border border-blue-500/10 rounded-2xl pointer-events-none group-hover:border-blue-500/30 transition-colors duration-500" />
                <CardHeader className="pb-2 relative z-10">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            Learning Growth Trend
                        </CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Activity & Completion Progression</p>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 relative z-10">
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={managerTrendData}>
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
                            <Area type="monotone" dataKey="active" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Active Users" />
                            <Area type="monotone" dataKey="completed" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Courses Done" />
                            <Area type="monotone" dataKey="certifications" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Certifications" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                {[
                    { label: 'Total Members', value: '42', sub: 'Across managed teams', icon: Users },
                    { label: 'Completion Rate', value: '87.2%', sub: 'Avg course progress', icon: Target },
                    { label: 'Growth Index', value: '+14%', sub: 'Month over month', icon: TrendingUp },
                ].map((stat, i) => (
                    <Card key={i} className="border-border/40 shadow-lg bg-card/50 backdrop-blur-md group hover:shadow-xl hover:border-blue-500/30 transition-all">
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                                    <stat.icon className="h-5 w-5 text-blue-500" />
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
        </div>
    );
}
