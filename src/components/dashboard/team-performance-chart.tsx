'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamPerformanceData } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TeamPerformanceChartProps {
    data: TeamPerformanceData[];
}

export function TeamPerformanceChart({ data }: TeamPerformanceChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="bg-[#1e1e2e]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl ring-1 ring-white/5">
                                    <p className="text-sm font-bold text-white mb-2">{label}</p>
                                    <div className="space-y-1.5">
                                        {payload.map((entry: any, index: number) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div
                                                    className="h-2 w-2 rounded-full"
                                                    style={{ backgroundColor: entry.color || entry.fill }}
                                                />
                                                <span className="text-xs font-medium text-gray-400">
                                                    {entry.name}:
                                                </span>
                                                <span className="text-xs font-bold text-white">
                                                    {entry.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Legend />
                <Bar dataKey="score" fill="var(--chart-1)" name="Performance Score" radius={[4, 4, 0, 0]} />
                <Bar dataKey="quality" fill="var(--chart-2)" name="Quality %" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
