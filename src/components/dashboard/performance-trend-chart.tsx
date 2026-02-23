'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceTrendChartProps {
    data: { name: string; value: number }[];
    title?: string;
}

export function PerformanceTrendChart({ data, title = "Velocity Trend" }: PerformanceTrendChartProps) {
    return (
        <div className="w-full h-full min-h-[300px] flex flex-col">
            {title && (
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
                </div>
            )}
            <div className="flex-1 w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                                <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
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
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            cursor={{ stroke: '#8B5CF6', strokeWidth: 2, strokeDasharray: '5 5' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-[#1e1e2e]/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl ring-1 ring-white/5 animate-in fade-in zoom-in duration-200">
                                            <p className="text-sm font-bold text-white mb-2">{label}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-[#8B5CF6]" />
                                                <span className="text-xs font-medium text-gray-400">Velocity:</span>
                                                <span className="text-xs font-bold text-white">{payload[0].value}</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#8B5CF6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            filter="url(#glow)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
