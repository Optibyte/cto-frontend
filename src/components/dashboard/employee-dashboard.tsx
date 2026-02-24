'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LearningMetricsCards } from '@/components/dashboard/learning-metrics-cards';
import type { ChartCustomization } from '@/components/dashboard/chart-customizer';
import { mockLearningMetrics } from '@/lib/mock-data/learning-metrics';
import { Activity, BarChart3, TrendingUp, Target, User, Trophy, Award } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';

const employeeIndividualPerformanceData = [
    { name: 'Core Skills', level: 85, target: 90, progress: 94, certificates: 2 },
    { name: 'Soft Skills', level: 72, target: 80, progress: 85, certificates: 1 },
    { name: 'Technical', level: 90, target: 95, progress: 98, certificates: 4 },
    { name: 'Leadership', level: 45, target: 60, progress: 65, certificates: 0 },
    { name: 'Compliance', level: 100, target: 100, progress: 100, certificates: 1 },
];

const employeeGrowthHistory = [
    { month: 'Jan', skillPoints: 120, courses: 2, impact: 65 },
    { month: 'Feb', skillPoints: 245, courses: 4, impact: 72 },
    { month: 'Mar', skillPoints: 380, courses: 6, impact: 78 },
    { month: 'Apr', skillPoints: 510, courses: 7, impact: 82 },
    { month: 'May', skillPoints: 680, courses: 9, impact: 88 },
    { month: 'Jun', skillPoints: 840, courses: 11, impact: 92 },
    { month: 'Jul', skillPoints: 950, courses: 13, impact: 95 },
];


export function EmployeeDashboard() {
    const selectedMetricIds = mockLearningMetrics.map((m) => m.id);
    const [drillLevel, setDrillLevel] = useState(0);
    const [chartConfig, setChartConfig] = useState<ChartCustomization>({
        xAxis: 'name',
        yAxis: 'progress',
        colorScheme: 'sunset',
        showValues: true,
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
        return schemes[chartConfig.colorScheme] || '#f43f5e';
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/10 pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-500 to-rose-600 bg-clip-text text-transparent flex items-center gap-3">
                        <User className="h-8 w-8 text-orange-500" />
                        My Learning Dashboard
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Activity className="h-4 w-4 text-orange-500/70" />
                        Personalized learning path and skill progression tracking
                    </p>
                </div>
            </div>

            {/* Learning Metrics Cards */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Trophy className="h-5 w-5 text-orange-500" />
                    <h2 className="text-xl font-bold tracking-tight">Personal Achievements</h2>
                    <span className="text-xs text-muted-foreground ml-2">({visibleMetrics.length} metrics monitored)</span>
                </div>
                <LearningMetricsCards metrics={visibleMetrics} />
            </div>

            {/* Skill Distribution Chart */}
            <Card className="border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group bg-card/50 backdrop-blur-md relative">
                <div className="absolute inset-0 border border-orange-500/10 rounded-2xl pointer-events-none group-hover:border-orange-500/30 transition-colors duration-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-orange-500" />
                            Skill Proficiency Analysis {drillLevel > 0 && `(Level ${drillLevel})`}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Competency vs Target Levels</p>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 relative z-10">
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={employeeIndividualPerformanceData}>
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

            {/* Growth Curve */}
            <Card className="border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group bg-card/50 backdrop-blur-md relative">
                <div className="absolute inset-0 border border-orange-500/10 rounded-2xl pointer-events-none group-hover:border-orange-500/30 transition-colors duration-500" />
                <CardHeader className="pb-2 relative z-10">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-orange-500" />
                            Skill Acquisition Curve
                        </CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Monthly Skill Point Progression</p>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 relative z-10">
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={employeeGrowthHistory}>
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
                            <Line type="monotone" dataKey="skillPoints" stroke="#f43f5e" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} name="Skill Points" />
                            <Line type="monotone" dataKey="impact" stroke="#fbbf24" strokeWidth={2} name="Project Impact" />
                            <Line type="stepAfter" dataKey="courses" stroke="#3b82f6" strokeWidth={2} name="Courses" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Individual Badges & Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                {[
                    { label: 'Courses Completed', value: '13', sub: 'Last 6 months', icon: Award },
                    { label: 'Current Level', value: 'L4', sub: 'Senior Technical', icon: Trophy },
                    { label: 'Learning Streak', value: '12 Days', sub: 'Consistent growth', icon: Activity },
                ].map((stat, i) => (
                    <Card key={i} className="border-border/40 shadow-lg bg-card/50 backdrop-blur-md group hover:shadow-xl hover:border-orange-500/30 transition-all">
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                                    <stat.icon className="h-5 w-5 text-orange-500" />
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
