'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { WorkDistributionData } from '@/lib/types';

interface WorkDistributionChartProps {
    data: WorkDistributionData[];
}

export function WorkDistributionChart({ data }: WorkDistributionChartProps) {
    return (
        <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="45%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={8}
                        dataKey="value"
                        animationDuration={1500}
                        animationBegin={300}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload as WorkDistributionData;
                                return (
                                    <div className="bg-[#1e1e2e]/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl ring-1 ring-white/5 animate-in fade-in zoom-in duration-200">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
                                            <span className="text-sm font-bold text-white">{data.name}</span>
                                        </div>
                                        <p className="text-xs font-medium text-gray-400 mt-1">
                                            Distribution: <span className="text-white">{data.value}%</span>
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        content={({ payload }) => (
                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
                                {payload?.map((entry: any, index) => (
                                    <div key={index} className="flex items-center gap-2 group cursor-pointer">
                                        <div
                                            className="h-2.5 w-2.5 rounded-full transition-transform group-hover:scale-125"
                                            style={{ backgroundColor: entry.color }}
                                        />
                                        <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                                            {entry.value}
                                        </span>
                                        <span className="text-[10px] font-bold text-muted-foreground/50 bg-muted/30 px-1.5 py-0.5 rounded-md">
                                            {data[index].value}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
