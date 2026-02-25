'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LeadTimeTrendData } from '@/lib/types';

interface LeadTimeTrendChartProps {
    data: LeadTimeTrendData[];
}

export function LeadTimeTrendChart({ data }: LeadTimeTrendChartProps) {
    return (
        <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                        <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
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
                        tickFormatter={(value) => `${value}h`}
                    />
                    <Tooltip
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-[#1e1e2e]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl ring-1 ring-white/5 animate-in fade-in zoom-in duration-200">
                                        <p className="text-sm font-bold text-white mb-2">{label}</p>
                                        <div className="space-y-1.5">
                                            {payload.map((entry, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <div
                                                        className="h-2 w-2 rounded-full"
                                                        style={{ backgroundColor: entry.color }}
                                                    />
                                                    <span className="text-xs font-medium text-gray-400">{entry.name}:</span>
                                                    <span className="text-xs font-bold text-white">{entry.value}h</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        content={({ payload }) => (
                            <div className="flex justify-end gap-4 mb-4">
                                {payload?.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                        <span className="text-xs font-medium text-muted-foreground">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    />
                    <Line
                        type="monotone"
                        dataKey="leadTime"
                        name="Lead Time"
                        stroke="#8B5CF6"
                        strokeWidth={4}
                        dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        filter="url(#lineGlow)"
                        animationDuration={1500}
                    />
                    <Line
                        type="monotone"
                        dataKey="mttr"
                        name="MTTR"
                        stroke="#10B981"
                        strokeWidth={4}
                        dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        filter="url(#lineGlow)"
                        animationDuration={2000}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
