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
                <XAxis dataKey="team" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                    }}
                />
                <Legend />
                <Bar dataKey="score" fill="var(--chart-1)" name="Performance Score" radius={[4, 4, 0, 0]} />
                <Bar dataKey="quality" fill="var(--chart-2)" name="Quality %" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
