'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LearningMetricsCards } from '@/components/dashboard/learning-metrics-cards';
import { MetricSelector } from '@/components/dashboard/metric-selector';
import { ChartCustomizer, ChartCustomization } from '@/components/dashboard/chart-customizer';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { mockLearningMetrics } from '@/lib/mock-data/learning-metrics';
import { Globe, BarChart3, Activity, TrendingUp, Users, Target } from 'lucide-react';
import { DashboardFilters } from '@/components/dashboard/dashboard-filters';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';

const marketPerformanceData = [
    { name: 'North America', revenue: 2400, growth: 24, teams: 12, satisfaction: 92 },
    { name: 'Europe', revenue: 1800, growth: 18, teams: 8, satisfaction: 88 },
    { name: 'Asia Pacific', revenue: 2200, growth: 32, teams: 10, satisfaction: 90 },
    { name: 'Latin America', revenue: 900, growth: 15, teams: 5, satisfaction: 85 },
    { name: 'Middle East', revenue: 600, growth: 28, teams: 3, satisfaction: 87 },
];

const marketTrendData = [
    { month: 'Jan', namer: 180, europe: 140, apac: 160 },
    { month: 'Feb', namer: 195, europe: 148, apac: 172 },
    { month: 'Mar', namer: 210, europe: 155, apac: 188 },
    { month: 'Apr', namer: 225, europe: 162, apac: 196 },
    { month: 'May', namer: 248, europe: 170, apac: 210 },
    { month: 'Jun', namer: 260, europe: 178, apac: 225 },
    { month: 'Jul', namer: 275, europe: 185, apac: 240 },
];

const CHART_AXIS_OPTIONS = ['name', 'revenue', 'growth', 'teams', 'satisfaction'];

export function MarketDashboard() {
    const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>(
        mockLearningMetrics.map((m) => m.id)
    );
    const [drillLevel, setDrillLevel] = useState(0);
    const [chartConfig, setChartConfig] = useState<ChartCustomization>({
        xAxis: 'name',
        yAxis: 'revenue',
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

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/10 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                        <Globe className="h-8 w-8 text-cyan-500" />
                        Market Dashboard
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Activity className="h-4 w-4 text-cyan-500/70" />
                        Market-level learning analytics and performance metrics
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
                    <Target className="h-5 w-5 text-cyan-500" />
                    <h2 className="text-xl font-bold tracking-tight">Learning Metrics</h2>
                    <span className="text-xs text-muted-foreground ml-2">({visibleMetrics.length} of {mockLearningMetrics.length} visible)</span>
                </div>
                <LearningMetricsCards metrics={visibleMetrics} />
            </div>

            {/* Market Performance Chart */}
            <Card className="border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group bg-card/50 backdrop-blur-md relative">
                <div className="absolute inset-0 border border-cyan-500/10 rounded-2xl pointer-events-none group-hover:border-cyan-500/30 transition-colors duration-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-cyan-500" />
                            Market Performance {drillLevel > 0 && `(Level ${drillLevel})`}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Revenue & Growth by Region</p>
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
                        <BarChart data={marketPerformanceData}>
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

            {/* Market Trend Chart */}
            <Card className="border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group bg-card/50 backdrop-blur-md relative">
                <div className="absolute inset-0 border border-cyan-500/10 rounded-2xl pointer-events-none group-hover:border-cyan-500/30 transition-colors duration-500" />
                <CardHeader className="pb-2 relative z-10">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-cyan-500" />
                            Market Growth Trend
                        </CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Regional Performance Over Time</p>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 relative z-10">
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={marketTrendData}>
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
                            <Area type="monotone" dataKey="namer" stackId="1" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} name="North America" />
                            <Area type="monotone" dataKey="europe" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="Europe" />
                            <Area type="monotone" dataKey="apac" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Asia Pacific" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                {[
                    { label: 'Total Markets', value: '5', sub: 'Active regions', icon: Globe },
                    { label: 'Avg Satisfaction', value: '88.4%', sub: 'Across all markets', icon: Target },
                    { label: 'Total Teams', value: '38', sub: 'Globally distributed', icon: Users },
                ].map((stat, i) => (
                    <Card key={i} className="border-border/40 shadow-lg bg-card/50 backdrop-blur-md group hover:shadow-xl hover:border-cyan-500/30 transition-all">
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                                    <stat.icon className="h-5 w-5 text-cyan-500" />
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
