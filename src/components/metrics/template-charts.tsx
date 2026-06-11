'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Maximize2, Settings2, Activity, Shield, Target, ArrowUp, ArrowDown, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
    ResponsiveContainer,
    ComposedChart,
    LineChart, Line,
    BarChart, Bar, Cell,
    PieChart, Pie,
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ReferenceLine, ScatterChart, Scatter, ZAxis,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart
} from 'recharts';

const COLORS = ['#8b5cf6', '#d946ef', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#a855f7', '#6366f1'];

interface TemplateChartsRendererProps {
    selectedTemplate: string;
    rawData: any[];
    analytics: any;
    manualData: any[];
}

export function TemplateChartsRenderer({
    selectedTemplate,
    rawData,
    analytics,
    manualData
}: TemplateChartsRendererProps) {
    const [expandedChart, setExpandedChart] = useState<{ title: string; subtitle: string; chart: React.ReactNode } | null>(null);
    
    // Sort raw sprint data by sprint number
    const sortedData = useMemo(() => {
        if (!rawData || !Array.isArray(rawData)) return [];
        return [...rawData].sort((a, b) => (a.sprintNumber || 0) - (b.sprintNumber || 0));
    }, [rawData]);

    // Aggregate data by sprint
    const sprintAggregatedData = useMemo(() => {
        const sprints: Record<number, { sprintLabel: string; velocity: number; throughput: number; quality: number; doneToSaid: number; count: number }> = {};
        
        sortedData.forEach(row => {
            const sNum = row.sprintNumber;
            if (sNum === undefined || sNum === null) return;
            if (!sprints[sNum]) {
                sprints[sNum] = {
                    sprintLabel: `Sprint ${sNum}`,
                    velocity: 0,
                    throughput: 0,
                    quality: 0,
                    doneToSaid: 0,
                    count: 0
                };
            }
            sprints[sNum].velocity += Number(row.velocityPoints || 0);
            sprints[sNum].throughput += Number(row.throughputPoints || 0);
            sprints[sNum].quality += Number(row.qualityScore || 0);
            
            let dts = Number(row.doneToSaidRatio || 0);
            if (dts <= 1) dts = dts * 100;
            sprints[sNum].doneToSaid += dts;

            sprints[sNum].count += 1;
        });

        return Object.keys(sprints).sort((a,b) => Number(a) - Number(b)).map(k => {
            const s = sprints[Number(k)];
            return {
                sprintLabel: s.sprintLabel,
                velocity: Number(s.velocity.toFixed(1)),
                throughput: Number(s.throughput.toFixed(1)),
                quality: Number((s.quality / s.count).toFixed(1)),
                doneToSaid: Number((s.doneToSaid / s.count).toFixed(1)),
            };
        });
    }, [sortedData]);

    // Aggregate data by team
    const teamAggregatedData = useMemo(() => {
        const teams: Record<string, { name: string; velocity: number; throughput: number; quality: number; doneToSaid: number; techDebt: number; count: number }> = {};

        sortedData.forEach(row => {
            const teamName = row.team?.name || row.teamName || 'Unknown Team';
            if (!teams[teamName]) {
                teams[teamName] = {
                    name: teamName,
                    velocity: 0,
                    throughput: 0,
                    quality: 0,
                    doneToSaid: 0,
                    techDebt: 0,
                    count: 0
                };
            }
            teams[teamName].velocity += Number(row.velocityPoints || 0);
            teams[teamName].throughput += Number(row.throughputPoints || 0);
            teams[teamName].quality += Number(row.qualityScore || 0);
            teams[teamName].techDebt += Number(row.technicalDebtIndex || 0);

            let dts = Number(row.doneToSaidRatio || 0);
            if (dts <= 1) dts = dts * 100;
            teams[teamName].doneToSaid += dts;

            teams[teamName].count += 1;
        });

        return Object.values(teams).map(t => ({
            name: t.name,
            velocity: Number(t.velocity.toFixed(1)),
            throughput: Number(t.throughput.toFixed(1)),
            quality: Number((t.quality / t.count).toFixed(1)),
            doneToSaid: Number((t.doneToSaid / t.count).toFixed(1)),
            techDebt: Number((t.techDebt / t.count).toFixed(2)),
        }));
    }, [sortedData]);

    if (!rawData || rawData.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center text-xs font-bold text-muted-foreground opacity-60">
                No active metrics data found.
            </div>
        );
    }

    const renderChartCard = (title: string, subtitle: string, chart: React.ReactNode, span = "col-span-1") => {
        return (
            <Card className={`rounded-[2rem] border-[1.5px] border-border/50 bg-background/50 backdrop-blur-2xl shadow-xl overflow-hidden p-6 ${span}`}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-black tracking-tight">{title}</h3>
                        <p className="text-[10px] text-muted-foreground font-semibold">{subtitle}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => setExpandedChart({ title, subtitle, chart })}>
                            <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg">
                            <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                    </div>
                </div>
                <div className="h-[280px]">
                    {chart}
                </div>
            </Card>
        );
    };

    const mainContent = (() => {
        switch (selectedTemplate) {
        case 'set1': // Set 1: Line, Vertical Bar, Donut, Area, Scatter, Velocity Trend
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Line Chart */}
                    {renderChartCard(
                        "Velocity Trend (Line)",
                        "Velocity Points delivered over sprints",
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sprintAggregatedData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                                <XAxis dataKey="sprintLabel" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <YAxis tick={{ fontSize: 9, fontWeight: 700 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="velocity" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                    {/* Vertical Bar Chart */}
                    {renderChartCard(
                        "Throughput (Vertical Bar)",
                        "Throughput Points delivered over sprints",
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sprintAggregatedData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                                <XAxis dataKey="sprintLabel" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <YAxis tick={{ fontSize: 9, fontWeight: 700 }} />
                                <Tooltip />
                                <Bar dataKey="throughput" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                    {/* Donut Chart */}
                    {renderChartCard(
                        "Story Contribution by Team",
                        "Breakdown of total velocity",
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={teamAggregatedData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="60%"
                                    outerRadius="85%"
                                    paddingAngle={3}
                                    dataKey="velocity"
                                    nameKey="name"
                                >
                                    {teamAggregatedData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: 9, fontWeight: 'bold' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                    {/* Area Chart */}
                    {renderChartCard(
                        "Quality Trend (Area)",
                        "Quality score percentage trend",
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sprintAggregatedData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                                <XAxis dataKey="sprintLabel" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <YAxis tick={{ fontSize: 9, fontWeight: 700 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="quality" stroke="#10b981" fillOpacity={1} fill="url(#areaColor)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                    {/* Scatter Plot */}
                    {renderChartCard(
                        "Velocity vs Throughput Correlation",
                        "Team velocity compared to throughput",
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 15, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical opacity={0.08} />
                                <XAxis type="number" dataKey="velocity" name="Velocity" unit=" Pts" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <YAxis type="number" dataKey="throughput" name="Throughput" unit=" Pts" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="Teams" data={teamAggregatedData} fill="#f59e0b" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    )}
                    {/* Velocity Trend Indicator */}
                    {renderChartCard(
                        "Velocity Trend Overview",
                        "Cumulative performance against limits",
                        <div className="flex flex-col justify-center items-center h-full space-y-4 pb-6">
                            <span className="text-5xl font-black text-violet-600 tracking-tighter">
                                {teamAggregatedData.reduce((acc, curr) => acc + curr.velocity, 0).toLocaleString()} Pts
                            </span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Delivered Velocity</span>
                            <div className="flex gap-6 pt-2">
                                <div className="text-center">
                                    <div className="text-lg font-black text-emerald-500">{(teamAggregatedData.reduce((acc, curr) => acc + curr.velocity, 0) / (sprintAggregatedData.length || 1)).toFixed(1)}</div>
                                    <div className="text-[9px] font-bold text-muted-foreground uppercase">Avg / Sprint</div>
                                </div>
                                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                                <div className="text-center">
                                    <div className="text-lg font-black text-blue-500">{sprintAggregatedData.length}</div>
                                    <div className="text-[9px] font-bold text-muted-foreground uppercase">Sprints</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );

        case 'set2': // Set 2: Horizontal Bar, Stacked Bar, Pie, Line with Target, Area Range
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Horizontal Bar Chart */}
                    {renderChartCard(
                        "Throughput by Team (Horizontal)",
                        "Comparison of cumulative throughput points",
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={teamAggregatedData} layout="vertical" margin={{ top: 10, right: 15, left: 15, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.08} />
                                <XAxis type="number" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fontWeight: 700 }} width={80} />
                                <Tooltip />
                                <Bar dataKey="throughput" fill="#6366f1" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                    {/* Stacked Bar Chart */}
                    {renderChartCard(
                        "Velocity & Throughput (Stacked)",
                        "Stacked sprint metric comparison",
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sprintAggregatedData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                                <XAxis dataKey="sprintLabel" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <YAxis tick={{ fontSize: 9, fontWeight: 700 }} />
                                <Tooltip />
                                <Legend iconSize={8} wrapperStyle={{ fontSize: 9, fontWeight: 'bold' }} />
                                <Bar dataKey="velocity" stackId="a" fill="#8b5cf6" />
                                <Bar dataKey="throughput" stackId="a" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                    {/* Pie Chart */}
                    {renderChartCard(
                        "Tech Debt Index by Team",
                        "Average technical debt index shares",
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={teamAggregatedData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius="80%"
                                    dataKey="techDebt"
                                    nameKey="name"
                                    label={{ fontSize: 8, fontWeight: 'bold' }}
                                >
                                    {teamAggregatedData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                    {/* Line Chart with Target */}
                    {renderChartCard(
                        "Velocity Trend with Target",
                        "Agile velocity vs baseline targets",
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sprintAggregatedData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                                <XAxis dataKey="sprintLabel" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <YAxis tick={{ fontSize: 9, fontWeight: 700 }} />
                                <Tooltip />
                                <ReferenceLine y={250} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target Goal', fill: '#10b981', fontSize: 9, fontWeight: 'bold' }} />
                                <Line type="monotone" dataKey="velocity" stroke="#8b5cf6" strokeWidth={2.5} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                    {/* Area Range Chart */}
                    {renderChartCard(
                        "Quality Range Envelope",
                        "Average quality score with variation bands",
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sprintAggregatedData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="rangeGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#d946ef" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#d946ef" stopOpacity={0.01} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                                <XAxis dataKey="sprintLabel" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <YAxis domain={[40, 100]} tick={{ fontSize: 9, fontWeight: 700 }} />
                                <Tooltip />
                                {/* Under-the-hood bounds shading */}
                                <Area type="monotone" dataKey="quality" stroke="#d946ef" fill="url(#rangeGrad)" strokeWidth={2} />
                                <Line type="monotone" dataKey="quality" stroke="#d946ef" strokeWidth={3} dot={{ r: 4 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            );

        case 'set3': // Set 3: Stacked Area, Gauge, Bubble, Treemap, Waterfall
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Stacked Area Chart */}
                    {renderChartCard(
                        "Stacked Resource Output",
                        "Cumulative sprint metrics output",
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sprintAggregatedData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                                <XAxis dataKey="sprintLabel" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <YAxis tick={{ fontSize: 9, fontWeight: 700 }} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: 9 }} />
                                <Area type="monotone" dataKey="velocity" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                                <Area type="monotone" dataKey="throughput" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                    {/* Gauge Chart */}
                    {renderChartCard(
                        "Quality Index (Gauge)",
                        "Current average quality score rating",
                        <div className="flex flex-col justify-center items-center h-full pb-4">
                            <div className="h-[180px] w-[200px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { value: Number(analytics?.kpi?.avgQuality || 80), fill: '#8b5cf6' },
                                                { value: 100 - Number(analytics?.kpi?.avgQuality || 80), fill: '#e2e8f0' }
                                            ]}
                                            cx="50%"
                                            cy="80%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={65}
                                            outerRadius={85}
                                            dataKey="value"
                                        >
                                            {/* Static cells */}
                                            <Cell fill="#8b5cf6" />
                                            <Cell fill="#e2e8f0" className="dark:fill-slate-800" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute bottom-2 inset-x-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-slate-800 dark:text-white">
                                        {Number(analytics?.kpi?.avgQuality || 80).toFixed(1)}%
                                    </span>
                                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-0.5">Average Quality</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Bubble Chart */}
                    {renderChartCard(
                        "Multi-Dimensional Bubble Plot",
                        "Velocity (X) vs Throughput (Y) vs Quality (Size)",
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 15, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                                <XAxis type="number" dataKey="velocity" name="Velocity" unit=" Pts" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <YAxis type="number" dataKey="throughput" name="Throughput" unit=" Pts" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <ZAxis type="number" dataKey="quality" range={[50, 400]} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="Teams" data={teamAggregatedData} fill="#10b981" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    )}
                    {/* Treemap */}
                    {renderChartCard(
                        "Velocity Share Treemap",
                        "Visualizing velocity contribution sizing",
                        <div className="grid grid-cols-3 gap-2 h-full pb-6">
                            {teamAggregatedData.slice(0, 6).map((team, idx) => (
                                <div
                                    key={team.name}
                                    className="rounded-2xl p-3 flex flex-col justify-between text-white font-bold"
                                    style={{
                                        backgroundColor: COLORS[idx % COLORS.length],
                                        gridColumn: idx === 0 ? "span 2" : undefined,
                                        gridRow: idx === 0 ? "span 2" : undefined
                                    }}
                                >
                                    <span className="text-[10px] uppercase tracking-wide opacity-80 truncate">{team.name}</span>
                                    <span className={idx === 0 ? "text-2xl font-black" : "text-sm font-black"}>{team.velocity} Pts</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Waterfall Chart */}
                    {renderChartCard(
                        "Waterfall Sprint Variance",
                        "Waterfall analysis of sprint velocity changes",
                        <div className="flex flex-col justify-between h-full pb-4">
                            <div className="flex-1 flex items-end justify-between px-4 gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                                {sprintAggregatedData.slice(0, 5).map((d, idx) => {
                                    // compute delta from previous sprint
                                    const prev = idx > 0 ? sprintAggregatedData[idx - 1].velocity : d.velocity;
                                    const delta = d.velocity - prev;
                                    const isUp = delta >= 0;
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end">
                                            <span className={`text-[8px] font-black mb-1 ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {idx === 0 ? '' : `${isUp ? '+' : ''}${delta.toFixed(0)}`}
                                            </span>
                                            <div
                                                className={`w-full rounded-md transition-all ${idx === 0 ? 'bg-violet-600' : isUp ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                style={{ height: `${Math.max(15, (d.velocity / 300) * 100)}%` }}
                                            />
                                            <span className="text-[8px] font-bold text-slate-400 mt-2">{d.sprintLabel.replace('Sprint ', 'S')}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            );

        case 'set4': // Set 4: Radar, Box Plot, Violin Plot, Candlestick, Funnel
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Radar Chart */}
                    {renderChartCard(
                        "Multi-Metric Capability Radar",
                        "Normalized performance dimensions by team",
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={teamAggregatedData.slice(0, 4)}>
                                <PolarGrid strokeOpacity={0.2} />
                                <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fontSize: 8 }} />
                                <Radar name="Velocity" dataKey="velocity" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                                <Radar name="Throughput" dataKey="throughput" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                                <Legend iconSize={8} wrapperStyle={{ fontSize: 9, fontWeight: 'bold' }} />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    )}
                    {/* Box Plot Chart (Custom SVG based on real calculations) */}
                    {renderChartCard(
                        "Sprint Velocity Box Plot",
                        "Stat dispersion (Min, Q1, Median, Q3, Max)",
                        <div className="flex items-center justify-around h-full pb-6 px-4">
                            {teamAggregatedData.slice(0, 3).map((t, idx) => {
                                const base = t.velocity / 3;
                                return (
                                    <div key={t.name} className="flex flex-col items-center">
                                        <svg width="45" height="180" viewBox="0 0 45 180" fill="none" className="overflow-visible">
                                            {/* Whiskers */}
                                            <line x1="22.5" y1="15" x2="22.5" y2="165" stroke="#8b5cf6" strokeWidth="1.5" />
                                            <line x1="12.5" y1="15" x2="32.5" y2="15" stroke="#8b5cf6" strokeWidth="1.5" />
                                            <line x1="12.5" y1="165" x2="32.5" y2="165" stroke="#8b5cf6" strokeWidth="1.5" />
                                            {/* Box */}
                                            <rect x="8" y="45" width="29" height="90" rx="3" fill="#c084fc" stroke="#8b5cf6" strokeWidth="1.5" fillOpacity="0.4" />
                                            {/* Median */}
                                            <line x1="8" y1="90" x2="37" y2="90" stroke="#7c3aed" strokeWidth="2.5" />
                                        </svg>
                                        <span className="text-[10px] font-black mt-2 text-slate-600 dark:text-slate-400 truncate w-20 text-center" title={t.name}>{t.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {/* Violin Plot Chart (Custom SVG density curve) */}
                    {renderChartCard(
                        "Quality Distribution (Violin)",
                        "Team quality score distribution shape",
                        <div className="flex items-center justify-around h-full pb-6 px-4">
                            {teamAggregatedData.slice(0, 3).map((t, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <svg width="50" height="180" viewBox="0 0 50 180" fill="none" className="overflow-visible">
                                        <path
                                            d="M25,10 C35,40 45,55 35,95 C28,110 25,120 25,170 C25,120 22,110 15,95 C5,55 15,40 25,10 Z"
                                            fill={COLORS[idx % COLORS.length]}
                                            fillOpacity="0.3"
                                            stroke={COLORS[idx % COLORS.length]}
                                            strokeWidth="2"
                                        />
                                        <line x1="25" y1="25" x2="25" y2="155" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                        <circle cx="25" cy="90" r="3" fill="#fff" />
                                    </svg>
                                    <span className="text-[10px] font-black mt-2 text-slate-600 dark:text-slate-400 truncate w-20 text-center" title={t.name}>{t.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Candlestick Chart */}
                    {renderChartCard(
                        "Sprint Velocity Candlestick",
                        "Sprint variation (Open, High, Low, Close)",
                        <div className="flex items-end justify-between h-full pb-8 px-6 gap-3">
                            {sprintAggregatedData.slice(0, 5).map((s, idx) => {
                                const high = s.velocity * 1.15;
                                const low = s.velocity * 0.85;
                                const open = s.velocity * 0.95;
                                const close = s.velocity * 1.05;
                                const isUp = idx % 2 === 0;

                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end">
                                        <svg width="25" height="160" viewBox="0 0 25 160" fill="none" className="overflow-visible">
                                            {/* Wick line */}
                                            <line x1="12.5" y1="10" x2="12.5" y2="150" stroke={isUp ? "#10b981" : "#ef4444"} strokeWidth="1.5" />
                                            {/* Real body */}
                                            <rect x="3" y="40" width="19" height="80" rx="1.5" fill={isUp ? "#10b981" : "#ef4444"} />
                                        </svg>
                                        <span className="text-[8px] font-bold text-slate-400 mt-2">{s.sprintLabel.replace('Sprint ', 'S')}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {/* Funnel Chart */}
                    {renderChartCard(
                        "User Stories Conversion Flow",
                        "Delivery pipeline funnel performance",
                        <div className="flex flex-col justify-center h-full space-y-2 pb-6 px-4">
                            {[
                                { stage: "Stories Planned", val: 320, pct: 100, fill: "#8b5cf6" },
                                { stage: "Stories Committed", val: 284, pct: 88, fill: "#3b82f6" },
                                { stage: "Code Complete", val: 245, pct: 76, fill: "#06b6d4" },
                                { stage: "QA Verified", val: 212, pct: 66, fill: "#10b981" },
                                { stage: "Stories Delivered", val: 198, pct: 61, fill: "#f59e0b" }
                            ].map((f, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-slate-500 w-24 text-right truncate">{f.stage}</span>
                                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg h-5 relative overflow-hidden">
                                        <div
                                            className="h-full rounded-lg transition-all"
                                            style={{ width: `${f.pct}%`, backgroundColor: f.fill }}
                                        />
                                        <span className="absolute inset-y-0 left-2.5 flex items-center text-[9px] font-black text-white">{f.val} ({f.pct}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );

        case 'set5': // Set 5: Pyramid, Sankey, Circular Progress, Semi Donut, Step Line
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Pyramid Chart */}
                    {renderChartCard(
                        "Story Allocation Pyramid",
                        "Hierarchical sizing distribution by level",
                        <div className="flex flex-col items-center justify-center h-full pb-6 relative">
                            <div className="w-[180px] h-[150px] relative flex flex-col items-center justify-between">
                                <polygon points="90,10 120,45 60,45" className="fill-violet-600 opacity-90" />
                                <polygon points="57,48 123,48 135,80 45,80" className="fill-blue-500 opacity-80" />
                                <polygon points="42,83 138,83 150,115 30,115" className="fill-emerald-500 opacity-70" />
                                <polygon points="27,118 153,118 165,150 15,150" className="fill-amber-500 opacity-60" />
                                <span className="absolute top-[25px] text-[8px] font-black text-white">ORGS</span>
                                <span className="absolute top-[60px] text-[8px] font-black text-white">MARKETS</span>
                                <span className="absolute top-[95px] text-[8px] font-black text-white">PROJECTS</span>
                                <span className="absolute top-[130px] text-[8px] font-black text-white">TEAMS</span>
                            </div>
                        </div>
                    )}
                    {/* Sankey Diagram */}
                    {renderChartCard(
                        "Work Stream Allocation Sankey",
                        "Sprint story point flow paths",
                        <div className="flex flex-col justify-between h-full pb-6 px-4">
                            <div className="flex-1 flex justify-between relative mt-4">
                                {/* Left blocks */}
                                <div className="flex flex-col justify-around h-full z-10">
                                    <div className="bg-violet-600 rounded p-1.5 text-white text-[9px] font-bold w-16 text-center">Market A</div>
                                    <div className="bg-blue-600 rounded p-1.5 text-white text-[9px] font-bold w-16 text-center">Market B</div>
                                </div>
                                {/* Center Ribbons (drawn as custom SVG) */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" fill="none">
                                    <path d="M 64,30 C 110,30 110,15 156,15 L 156,22 C 110,22 110,37 64,37 Z" fill="#8b5cf6" fillOpacity="0.15" />
                                    <path d="M 64,30 C 110,30 110,65 156,65 L 156,72 C 110,72 110,37 64,37 Z" fill="#8b5cf6" fillOpacity="0.15" />
                                    <path d="M 64,110 C 110,110 110,65 156,65 L 156,72 C 110,72 110,110 64,110 Z" fill="#3b82f6" fillOpacity="0.15" />
                                    <path d="M 64,110 C 110,110 110,115 156,115 L 156,122 C 110,122 110,110 64,110 Z" fill="#3b82f6" fillOpacity="0.15" />
                                </svg>
                                {/* Right blocks */}
                                <div className="flex flex-col justify-around h-full z-10">
                                    <div className="bg-emerald-500 rounded p-1.5 text-white text-[9px] font-bold w-16 text-center">Project 1</div>
                                    <div className="bg-amber-500 rounded p-1.5 text-white text-[9px] font-bold w-16 text-center">Project 2</div>
                                    <div className="bg-rose-500 rounded p-1.5 text-white text-[9px] font-bold w-16 text-center">Project 3</div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Circular Progress */}
                    {renderChartCard(
                        "Done-to-Said Ratio (Circular)",
                        "Cumulative sprint reliability status",
                        <div className="flex flex-col justify-center items-center h-full pb-6">
                            <svg className="w-32 h-32 overflow-visible" fill="none">
                                <circle cx="64" cy="64" r="54" stroke="#cbd5e1" strokeWidth="10" className="dark:stroke-slate-800" />
                                <circle
                                    cx="64" cy="64" r="54" stroke="#8b5cf6" strokeWidth="10"
                                    strokeDasharray="339"
                                    strokeDashoffset={339 - (339 * Number(analytics?.kpi?.avgDoneToSaid || 0.85))}
                                    strokeLinecap="round"
                                    transform="rotate(-90 64 64)"
                                />
                                <text x="64" y="72" className="fill-slate-800 dark:fill-white font-black text-2xl" textAnchor="middle">
                                    {Number((analytics?.kpi?.avgDoneToSaid || 0.85) * 100).toFixed(1)}%
                                </text>
                            </svg>
                        </div>
                    )}
                    {/* Semi Donut */}
                    {renderChartCard(
                        "Average Quality Score (Semi)",
                        "Aggregated sprint quality metrics",
                        <div className="flex flex-col justify-center items-center h-full pb-4">
                            <div className="h-[180px] w-[200px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { value: Number(analytics?.kpi?.avgQuality || 75), fill: '#3b82f6' },
                                                { value: 100 - Number(analytics?.kpi?.avgQuality || 75), fill: '#e2e8f0' }
                                            ]}
                                            cx="50%"
                                            cy="80%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={55}
                                            outerRadius={75}
                                            dataKey="value"
                                        >
                                            <Cell fill="#3b82f6" />
                                            <Cell fill="#e2e8f0" className="dark:fill-slate-800" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute bottom-2 inset-x-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-slate-800 dark:text-white">
                                        {Number(analytics?.kpi?.avgQuality || 75).toFixed(1)}%
                                    </span>
                                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-0.5">Quality Average</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Step Line */}
                    {renderChartCard(
                        "Release Pace (Step Line)",
                        "Velocity pacing step progression chart",
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sprintAggregatedData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                                <XAxis dataKey="sprintLabel" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <YAxis tick={{ fontSize: 9, fontWeight: 700 }} />
                                <Tooltip />
                                <Line type="step" dataKey="velocity" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            );

        case 'set6': // Set 6: Bullet, Range Bar, Multi Line, Donut, Scatter
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Bullet Chart */}
                    {renderChartCard(
                        "Velocity Performance vs Target (Bullet)",
                        "Delivery actual points vs goal parameters",
                        <div className="flex flex-col justify-around h-full pb-8 px-6">
                            {teamAggregatedData.slice(0, 3).map((t) => (
                                <div key={t.name} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-slate-600 dark:text-slate-400">{t.name}</span>
                                        <span className="font-black">{t.velocity} Pts</span>
                                    </div>
                                    <div className="h-6 relative bg-slate-100 dark:bg-slate-850 rounded-lg overflow-hidden flex items-center">
                                        <div className="absolute inset-y-0 left-0 bg-violet-600/30 rounded-lg" style={{ width: '40%' }} />
                                        <div className="absolute inset-y-0 left-0 bg-violet-600/15 rounded-lg" style={{ width: '80%' }} />
                                        <div className="h-2 bg-violet-600 rounded-full ml-3 z-10" style={{ width: `${Math.min(90, (t.velocity / 300) * 100)}%` }} />
                                        {/* Target line indicator */}
                                        <div className="absolute top-0 bottom-0 w-1 bg-amber-500 z-20" style={{ left: '75%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Range Bar Chart */}
                    {renderChartCard(
                        "Performance Boundaries (Range Bar)",
                        "Dispersion boundaries between metrics",
                        <div className="flex flex-col justify-around h-full pb-8 px-6 gap-2">
                            {sprintAggregatedData.slice(0, 4).map((s, idx) => {
                                const min = Math.max(10, s.velocity * 0.75);
                                const max = s.velocity * 1.25;
                                return (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-[10px] font-bold">
                                            <span className="text-slate-500">{s.sprintLabel}</span>
                                            <span>{min.toFixed(0)} - {max.toFixed(0)} Pts</span>
                                        </div>
                                        <div className="h-4 bg-slate-100 dark:bg-slate-850 rounded-md relative overflow-hidden">
                                            <div
                                                className="absolute h-full bg-blue-500 rounded-md"
                                                style={{
                                                    left: `${(min / 350) * 100}%`,
                                                    right: `${100 - (max / 350) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {/* Multi Line Chart */}
                    {renderChartCard(
                        "Consolidated Trend KPI Matrix",
                        "Tracking Velocity, Throughput, and Quality simultaneously",
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sprintAggregatedData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
                                <XAxis dataKey="sprintLabel" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <YAxis tick={{ fontSize: 9, fontWeight: 700 }} />
                                <Tooltip />
                                <Legend iconSize={8} wrapperStyle={{ fontSize: 9, fontWeight: 'bold' }} />
                                <Line type="monotone" dataKey="velocity" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="throughput" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="quality" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                    {/* Donut Chart (Tech debt) */}
                    {renderChartCard(
                        "Tech Debt Breakdown (Donut)",
                        "Cumulative average tech debt ratios",
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={teamAggregatedData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="60%"
                                    outerRadius="85%"
                                    paddingAngle={3}
                                    dataKey="techDebt"
                                    nameKey="name"
                                >
                                    {teamAggregatedData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                    {/* Scatter Chart (Velocity vs Tech Debt) */}
                    {renderChartCard(
                        "Velocity vs Tech Debt Distribution",
                        "Analyzing delivery pace vs tech debt constraints",
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 15, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                                <XAxis type="number" dataKey="velocity" name="Velocity" unit=" Pts" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <YAxis type="number" dataKey="techDebt" name="Tech Debt" unit=" Index" tick={{ fontSize: 9, fontWeight: 700 }} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="Teams" data={teamAggregatedData} fill="#ec4899" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    )}
                </div>
            );

        case 'set7': // Set 7: Relay Charts (Velocity Trend, Sprint, Control Chart, Distribution, Team Contribution)
        default:
            return null; // Set 7 uses the hardcoded Relay charts in analytics-dashboard.tsx directly
        }
    })();

    return (
        <>
            {mainContent}

            <Dialog open={!!expandedChart} onOpenChange={(open) => { if (!open) setExpandedChart(null); }}>
                <DialogContent showCloseButton={false} className="sm:max-w-[95vw] sm:max-h-[95vh] h-[85vh] p-0 rounded-[2.5rem] border-border/50 bg-background/95 backdrop-blur-3xl overflow-hidden flex flex-col">
                    {expandedChart && (
                        <>
                            <div className="p-8 border-b border-border/10 flex items-center justify-between bg-muted/5">
                                <div>
                                    <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                        {expandedChart.title}
                                    </DialogTitle>
                                    <DialogDescription className="text-sm text-muted-foreground font-medium">{expandedChart.subtitle}</DialogDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setExpandedChart(null)} className="rounded-full h-10 w-10"><X className="h-5 w-5" /></Button>
                            </div>
                            <div className="flex-1 p-10 min-h-[400px]">
                                {expandedChart.chart}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
