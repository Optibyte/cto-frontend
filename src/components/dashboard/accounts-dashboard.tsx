'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LearningMetricsCards } from '@/components/dashboard/learning-metrics-cards';
import { MetricSelector } from '@/components/dashboard/metric-selector';
import { ChartCustomizer, ChartCustomization } from '@/components/dashboard/chart-customizer';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { mockLearningMetrics } from '@/lib/mock-data/learning-metrics';
import { Landmark, BarChart3, Activity, TrendingUp, DollarSign, Target, Users } from 'lucide-react';
import { DashboardFilters } from '@/components/dashboard/dashboard-filters';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';

const accountPerformanceData = [
    { name: 'Optibyte Solutions', score: 92, projects: 8, budget: 450, utilization: 87 },
    { name: 'TechCorp Inc.', score: 78, projects: 5, budget: 320, utilization: 74 },
    { name: 'DataFlow Systems', score: 85, projects: 6, budget: 380, utilization: 81 },
    { name: 'CloudNine Labs', score: 88, projects: 4, budget: 280, utilization: 90 },
    { name: 'InnovateTech', score: 71, projects: 3, budget: 200, utilization: 68 },
];

const accountTrendData = [
    { month: 'Jan', optibyte: 85, techcorp: 70, dataflow: 78 },
    { month: 'Feb', optibyte: 87, techcorp: 72, dataflow: 80 },
    { month: 'Mar', optibyte: 88, techcorp: 74, dataflow: 81 },
    { month: 'Apr', optibyte: 89, techcorp: 75, dataflow: 83 },
    { month: 'May', optibyte: 90, techcorp: 76, dataflow: 84 },
    { month: 'Jun', optibyte: 91, techcorp: 77, dataflow: 84 },
    { month: 'Jul', optibyte: 92, techcorp: 78, dataflow: 85 },
];

const CHART_AXIS_OPTIONS = ['name', 'score', 'projects', 'budget', 'utilization'];

export function AccountsDashboard() {
    const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>(
        mockLearningMetrics.map((m) => m.id)
    );
    const [drillLevel, setDrillLevel] = useState(0);
    const [chartConfig, setChartConfig] = useState<ChartCustomization>({
        xAxis: 'name',
        yAxis: 'score',
        colorScheme: 'default',
        showValues: false,
    });

    const visibleMetrics = mockLearningMetrics.filter((m) => selectedMetricIds.includes(m.id));

    const getBarColor = () => {
        const schemes: Record<string, string> = {
            default: '#f43f5e',
            ocean: '#0ea5e9',
            sunset: '#fb923c',
            forest: '#22c55e',
            neon: '#a855f7',
        };
        return schemes[chartConfig.colorScheme] || '#f43f5e';
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/10 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                        <Landmark className="h-8 w-8 text-rose-500" />
                        Accounts Dashboard
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Activity className="h-4 w-4 text-rose-500/70" />
                        Account-level learning analytics and performance tracking
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
                    <Target className="h-5 w-5 text-rose-500" />
                    <h2 className="text-xl font-bold tracking-tight">Learning Metrics</h2>
                    <span className="text-xs text-muted-foreground ml-2">({visibleMetrics.length} of {mockLearningMetrics.length} visible)</span>
                </div>
                <LearningMetricsCards metrics={visibleMetrics} />
            </div>

            {/* Account Performance Chart */}
            <Card className="border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group bg-card/50 backdrop-blur-md relative">
                <div className="absolute inset-0 border border-rose-500/10 rounded-2xl pointer-events-none group-hover:border-rose-500/30 transition-colors duration-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-rose-500" />
                            Account Performance {drillLevel > 0 && `(Level ${drillLevel})`}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Score & Utilization by Account</p>
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
                        <BarChart data={accountPerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis dataKey={chartConfig.xAxis} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
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

            {/* Account Trend Chart */}
            <Card className="border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group bg-card/50 backdrop-blur-md relative">
                <div className="absolute inset-0 border border-rose-500/10 rounded-2xl pointer-events-none group-hover:border-rose-500/30 transition-colors duration-500" />
                <CardHeader className="pb-2 relative z-10">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-rose-500" />
                            Account Score Trend
                        </CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Performance Over Time</p>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 relative z-10">
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={accountTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={[60, 100]} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--popover))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="optibyte" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4 }} name="Optibyte" />
                            <Line type="monotone" dataKey="techcorp" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} name="TechCorp" />
                            <Line type="monotone" dataKey="dataflow" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="DataFlow" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                {[
                    { label: 'Total Accounts', value: '5', sub: 'Active clients', icon: Landmark },
                    { label: 'Total Budget', value: '$1.63M', sub: 'Combined allocation', icon: DollarSign },
                    { label: 'Avg Utilization', value: '80%', sub: 'Resource efficiency', icon: Users },
                ].map((stat, i) => (
                    <Card key={i} className="border-border/40 shadow-lg bg-card/50 backdrop-blur-md group hover:shadow-xl hover:border-rose-500/30 transition-all">
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
                                    <stat.icon className="h-5 w-5 text-rose-500" />
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
