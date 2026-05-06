'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { teamsAPI } from '@/lib/api/teams';
import { toast } from 'sonner';
import { useState } from 'react';
import { Maximize2, X, ShieldCheck, Cpu, Briefcase, Lock, CheckCircle2, LayoutGrid, PieChart as PieIcon, Table as TableIcon, Download, Wrench, UserMinus, Trash2, Users, Zap, BarChart3, Activity, Layers, Target, TrendingUp, TrendingDown, Minus, Hash, Percent, Clock, Search, Shield, ChevronRight, Globe, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
    ScatterChart, Scatter, ZAxis, BarChart, Bar, ComposedChart, AreaChart, Area,
    PieChart, Pie, Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { useSprintAnalytics } from '@/hooks/use-metrics';
import { useDataFence } from '@/contexts/role-context';
import { Button } from '@/components/ui/button';

const COLORS = ['#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6'];

const ChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-card/95 backdrop-blur-2xl border border-border/50 p-3 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
                {label && <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{label}</p>}
                {payload.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4 mb-1.5 last:mb-0">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
                            <span className="text-[11px] font-bold text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="text-[11px] font-black text-foreground">
                            {typeof item.value === 'number' ? 
                                (item.name.toLowerCase().includes('rate') || item.name.toLowerCase().includes('quality') || item.name.toLowerCase().includes('%') ? 
                                    `${item.value.toFixed(1)}%` : 
                                    item.value.toLocaleString()) : 
                                item.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const ScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white dark:bg-card/95 backdrop-blur-2xl border border-border/50 p-4 rounded-[1.5rem] shadow-2xl animate-in fade-in zoom-in duration-300 min-w-[200px]">
                <div className="flex items-center gap-2 mb-3">
                    <div className={cn("w-3 h-3 rounded-full", data.aiEnabled ? "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]" : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]")} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Project Analytics</p>
                </div>
                <h4 className="text-sm font-black text-foreground mb-3">{data.project}</h4>
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4 py-1.5 border-b border-border/5">
                        <span className="text-[11px] font-bold text-muted-foreground">Quality Score</span>
                        <span className="text-[11px] font-black text-emerald-500">{data.avgQuality}%</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-1.5 border-b border-border/5">
                        <span className="text-[11px] font-bold text-muted-foreground">Velocity</span>
                        <span className="text-[11px] font-black text-blue-500">{data.avgVelocity} pts</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-1.5">
                        <span className="text-[11px] font-bold text-muted-foreground">Model</span>
                        <Badge className={cn("text-[9px] font-black h-4 px-1.5", data.aiEnabled ? "bg-purple-500/10 text-purple-500 border-none" : "bg-blue-500/10 text-blue-500 border-none")}>
                            {data.aiEnabled ? 'AI ENABLED' : 'TRADITIONAL'}
                        </Badge>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

// --- CHART COMPONENTS ---

const RoleProficiencyChart = ({ data }: any) => (
    <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
            <XAxis dataKey="role" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor', fontWeight: 700 }} dy={10} />
            <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} label={{ value: 'Resources', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 10, fill: '#8b5cf6' } }} />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} domain={[0, 5]} label={{ value: 'Skill Level', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fontSize: 10, fill: '#f97316' } }} />
            <RechartsTooltip content={<ChartTooltip />} />
            <Legend verticalAlign="top" align="right" height={36}/>
            <Bar yAxisId="left" dataKey="resources" name="Resources" fill="#a855f7" radius={[6, 6, 0, 0]} barSize={40} />
            <Line yAxisId="right" type="monotone" dataKey="avgSkill" name="Avg Skill" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} />
        </ComposedChart>
    </ResponsiveContainer>
);

const SkillMaturityChart = ({ data }: any) => (
    <ResponsiveContainer width="100%" height="100%">
        <PieChart>
            <Pie
                data={data || []}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={5}
                dataKey="count"
            >
                {data?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <RechartsTooltip content={<ChartTooltip />} />
            <Legend layout="vertical" align="right" verticalAlign="middle" />
        </PieChart>
    </ResponsiveContainer>
);

const PerformanceTrendsChart = ({ data }: any) => (
    <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
                <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
            <XAxis dataKey="sprintLabel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
            <RechartsTooltip content={<ChartTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="avgQuality" name="Quality %" stroke="#10b981" fillOpacity={1} fill="url(#colorQuality)" />
            <Line type="monotone" dataKey="avgVelocity" name="Velocity" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="avgTechDebt" name="Tech Debt" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 3 }} />
        </AreaChart>
    </ResponsiveContainer>
);

const AiVsTraditionalChart = ({ data }: any) => (
    <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
            <Radar name="AI Enabled" dataKey="ai" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            <Radar name="Traditional" dataKey="nonAi" stroke="#3b82f6" fill="transparent" strokeWidth={2} />
            <Legend />
            <RechartsTooltip content={<ChartTooltip />} />
        </RadarChart>
    </ResponsiveContainer>
);

const ProjectCorrelationChart = ({ data }: any) => (
    <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis type="number" dataKey="avgVelocity" name="Velocity" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} label={{ value: 'Velocity', position: 'bottom', fontSize: 10 }} />
            <YAxis type="number" dataKey="avgQuality" name="Quality" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} label={{ value: 'Quality', angle: -90, position: 'left', fontSize: 10 }} />
            <ZAxis type="category" dataKey="project" name="Project" />
            <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<ScatterTooltip />} />
            <Scatter name="AI Projects" data={data?.filter((d: any) => d.aiEnabled) || []} fill="#8b5cf6" />
            <Scatter name="Traditional" data={data?.filter((d: any) => !d.aiEnabled) || []} fill="#3b82f6" />
        </ScatterChart>
    </ResponsiveContainer>
);

export function AnalyticsDashboard({ filters }: { filters: any }) {
    const { data: analytics, isLoading } = useSprintAnalytics(filters);
    const fence = useDataFence();
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    if (isLoading) {
        return <div className="flex justify-center py-20 animate-pulse text-muted-foreground font-black tracking-widest uppercase">Loading Analytics Dashboard...</div>;
    }

    if (!analytics) {
        return <div className="flex justify-center py-20 text-muted-foreground font-black tracking-widest uppercase">No data available</div>;
    }

    const { kpi, roleProficiency, skillMaturity, performanceTrends, aiVsNonAi, scatter } = analytics;

    const cards = [
        { id: 'role', title: 'Role AI Proficiency', description: 'Headcount vs Skill Level across roles', icon: Users, data: roleProficiency, component: RoleProficiencyChart, span: 'lg:col-span-2' },
        { id: 'maturity', title: 'AI Skill Maturity', description: 'Proficiency level distribution', icon: Target, data: skillMaturity, component: SkillMaturityChart, span: 'lg:col-span-1' },
        { id: 'trends', title: 'Performance Trends', description: 'Quality, Velocity, and Debt trends', icon: Activity, data: performanceTrends, component: PerformanceTrendsChart, span: 'lg:col-span-2' },
        { id: 'radar', title: 'AI vs Traditional', description: 'Performance comparison', icon: Zap, data: [
            { subject: 'Quality',   ai: aiVsNonAi?.ai?.quality || 0,    nonAi: aiVsNonAi?.nonAi?.quality || 0 },
            { subject: 'Velocity',  ai: aiVsNonAi?.ai?.velocity || 0,   nonAi: aiVsNonAi?.nonAi?.velocity || 0 },
            { subject: 'Throughput',ai: aiVsNonAi?.ai?.throughput || 0, nonAi: aiVsNonAi?.nonAi?.throughput || 0 },
        ], component: AiVsTraditionalChart, span: 'lg:col-span-1' },
        { id: 'scatter', title: 'Project Correlation', description: 'Quality Score vs Velocity Points', icon: BarChart3, data: scatter, component: ProjectCorrelationChart, span: 'lg:col-span-1' },
    ];

    const radarData = [
        { subject: 'Quality',   ai: aiVsNonAi?.ai?.quality || 0,    nonAi: aiVsNonAi?.nonAi?.quality || 0 },
        { subject: 'Velocity',  ai: aiVsNonAi?.ai?.velocity || 0,   nonAi: aiVsNonAi?.nonAi?.velocity || 0 },
        { subject: 'Throughput',ai: aiVsNonAi?.ai?.throughput || 0, nonAi: aiVsNonAi?.nonAi?.throughput || 0 },
    ];

    const handleExport = () => {
        if (!analytics) return;

        let csv = 'Report: Metrics Dashboard Analysis\n';
        csv += `Exported At: ${new Date().toLocaleString()}\n\n`;

        // KPIs
        csv += '--- KEY PERFORMANCE INDICATORS ---\n';
        csv += `Avg Done to Said Ratio,${kpi?.avgDoneToSaid}%\n`;
        csv += `Technical Debt Index,${kpi?.avgTechDebt}\n`;
        csv += `AI Enabled Projects,${kpi?.aiProjectCount}\n`;
        csv += `Avg Throughput,${kpi?.avgThroughput} Pts/Sprint\n\n`;

        // Role Proficiency
        if (roleProficiency?.length > 0) {
            csv += '--- ROLE AI PROFICIENCY ---\n';
            csv += 'Role,Resources,Avg Skill,Progress\n';
            roleProficiency.forEach((r: any) => {
                csv += `"${r.role}",${r.resources},${r.avgSkill},${r.progress}%\n`;
            });
            csv += '\n';
        }

        // Skill Maturity
        if (skillMaturity?.length > 0) {
            csv += '--- AI SKILL MATURITY ---\n';
            csv += 'Level,Count\n';
            skillMaturity.forEach((s: any) => {
                csv += `"${s.name}",${s.count}\n`;
            });
            csv += '\n';
        }

        // Performance Trends
        if (performanceTrends?.length > 0) {
            csv += '--- PERFORMANCE TRENDS ---\n';
            csv += 'Sprint,Quality %,Velocity,Tech Debt\n';
            performanceTrends.forEach((t: any) => {
                csv += `"${t.sprintLabel}",${t.avgQuality},${t.avgVelocity},${t.avgTechDebt}\n`;
            });
            csv += '\n';
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Metrics_Dashboard_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const selectedEmployee = filters.member 
        ? analytics.filteredEmployees?.find((e: any) => e.fullName === filters.member)
        : null;

    const handleRemoveMember = async () => {
        if (!selectedEmployee || !selectedEmployee.teamId) {
            toast.error("Team information missing for this member");
            return;
        }

        if (!confirm(`Are you sure you want to remove ${selectedEmployee.fullName} from their team?`)) {
            return;
        }

        try {
            await teamsAPI.removeSingleMember(selectedEmployee.teamId, selectedEmployee.id);
            toast.success("Member removed from team successfully");
            // Reload the page or trigger a re-fetch
            window.location.reload();
        } catch (error) {
            console.error("Error removing member:", error);
            toast.error("Failed to remove member from team");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-10">
            <div className="flex justify-end mb-2">
                <Button 
                    onClick={handleExport}
                    className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 font-bold px-6 h-11"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Download Executive Report
                </Button>
            </div>
            {/* Member Spotlight (Expanded Full Profile) */}
            {selectedEmployee && (
                <Card className="rounded-[2.5rem] border-[1.5px] border-violet-500/30 bg-violet-500/5 backdrop-blur-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-500">
                    <CardContent className="p-10">
                        <div className="flex flex-col lg:flex-row gap-10">
                            {/* Left: Avatar & Basic Info */}
                            <div className="flex flex-col items-center text-center space-y-4 lg:w-1/4">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-violet-500/40 border-4 border-background/50">
                                        {selectedEmployee.fullName?.charAt(0)}
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-emerald-500 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight text-foreground mb-1">{selectedEmployee.fullName}</h2>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-none px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                                            {selectedEmployee.jobRole || 'Engineer'}
                                        </Badge>
                                        <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                                            {selectedEmployee.aiProfile?.employmentType || 'Full-Time'}
                                        </Badge>
                                    </div>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleRemoveMember}
                                    className="mt-4 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all gap-2 font-bold text-[10px] uppercase tracking-wider h-8 px-4"
                                >
                                    <UserMinus className="h-3 w-3" />
                                    Remove From Team
                                </Button>
                            </div>

                            {/* Center: AI Skills & Proficiency */}
                            <div className="flex-1 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-amber-500" />
                                            AI Capabilities
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="bg-background/40 p-4 rounded-2xl border border-border/50">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Primary Skill</p>
                                                <div className="flex justify-between items-center">
                                                    <p className="font-bold text-foreground">{selectedEmployee.aiProfile?.primaryAiSkill || 'N/A'}</p>
                                                    <Badge className="bg-emerald-500/20 text-emerald-600 border-none">{selectedEmployee.aiProfile?.primaryAiSkillProficiency || 0}/5</Badge>
                                                </div>
                                            </div>
                                            <div className="bg-background/40 p-4 rounded-2xl border border-border/50">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Secondary Skill</p>
                                                <div className="flex justify-between items-center">
                                                    <p className="font-bold text-foreground">{selectedEmployee.aiProfile?.secondaryAiSkill || 'N/A'}</p>
                                                    <Badge className="bg-blue-500/20 text-blue-600 border-none">{selectedEmployee.aiProfile?.secondaryAiSkillProficiency || 0}/5</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Wrench className="h-4 w-4 text-violet-500" />
                                            Toolbox
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedEmployee.aiProfile?.aiToolsUsed?.length > 0 ? (
                                                selectedEmployee.aiProfile.aiToolsUsed.map((tool: string) => (
                                                    <Badge key={tool} variant="outline" className="rounded-lg px-3 py-1 bg-background/50 border-violet-500/20 text-violet-600 dark:text-violet-400 font-bold">
                                                        {tool}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic">No specific AI tools mapped</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Key Stats */}
                            <div className="flex flex-row lg:flex-col gap-4 lg:w-48">
                                <div className="flex-1 bg-violet-600 p-6 rounded-[2rem] text-center text-white shadow-xl shadow-violet-600/20">
                                    <p className="text-[10px] font-black uppercase opacity-80 mb-1">Overall AI Rank</p>
                                    <p className="text-4xl font-black">{selectedEmployee.aiProfile?.overallAiProficiency || '0'}</p>
                                    <p className="text-[10px] font-bold opacity-60">Top Performers Club</p>
                                </div>
                                <div className="flex-1 bg-background/60 backdrop-blur-md p-6 rounded-[2rem] text-center border border-border/50">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Experience</p>
                                    <p className="text-3xl font-black text-foreground">{selectedEmployee.aiProfile?.experienceYears || 0}y</p>
                                    <p className="text-[10px] font-bold text-muted-foreground">Professional Industry</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {fence.isRestricted && (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Lock className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-bold">{(fence as any).fenceLabel || '🔒 Data restricted to your scope'}</span>
                </div>
            )}

            {/* KPI Cards (Top Row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard 
                    title="Avg Done to Said Ratio" 
                    value={`${Number((kpi?.avgDoneToSaid || 0) > 1 ? kpi?.avgDoneToSaid : (kpi?.avgDoneToSaid || 0) * 100).toFixed(1)}%`} 
                    icon={<Activity className="h-6 w-6" />} 
                    description="Reliability Level"
                    color="text-emerald-500"
                />
                <StatCard 
                    title="Technical Debt Index" 
                    value={Number(kpi?.avgTechDebt || 0).toFixed(2)} 
                    icon={<Layers className="h-6 w-6" />} 
                    description="Debt Level Score"
                    color="text-amber-500"
                />
                <StatCard 
                    title="Project Landscape" 
                    value={kpi?.totalProjectCount || 0} 
                    icon={<Zap className="h-6 w-6" />} 
                    description={`${kpi?.aiProjectCount || 0} AI | ${kpi?.normalProjectCount || 0} Traditional`}
                    color="text-purple-500"
                />
                <StatCard 
                    title="Avg Throughput" 
                    value={Number(kpi?.avgThroughput || 0).toFixed(1)} 
                    unit="Pts/Sprint"
                    icon={<BarChart3 className="h-6 w-6" />} 
                    description="Delivery Performance"
                    color="text-blue-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <Card key={card.id} className={cn("rounded-[2.5rem] border-[1.5px] border-border/50 bg-background/50 backdrop-blur-2xl shadow-xl overflow-hidden group", card.span)}>
                        <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl font-black tracking-tight">{card.title}</CardTitle>
                                <CardDescription className="font-medium text-xs">{card.description}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <card.icon className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setExpandedCard(card.id)}
                                    className="h-8 w-8 rounded-xl bg-muted/50 hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 transition-all duration-300"
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 h-[400px]">
                            <card.component data={card.data} />
                        </CardContent>
                    </Card>
                ))}

                {/* Data Tables: Top Performing Roles by AI Skill */}
                <Card className="rounded-[2.5rem] border-[1.5px] border-border/50 bg-background/50 backdrop-blur-2xl shadow-xl lg:col-span-2 overflow-hidden group">
                    <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-black tracking-tight">Top Roles by AI Skill</CardTitle>
                            <CardDescription className="font-medium text-xs">Proficiency and resource distribution</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <TableIcon className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setExpandedCard('table')}
                                className="h-8 w-8 rounded-xl bg-muted/50 hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 transition-all duration-300"
                            >
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <TopRolesTable data={roleProficiency} />
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!expandedCard} onOpenChange={() => setExpandedCard(null)}>
                <DialogContent className="max-w-[98vw] sm:max-w-[95vw] w-full lg:w-[1400px] h-[90vh] rounded-[3rem] border-border/50 bg-background/95 backdrop-blur-3xl overflow-hidden p-0 shadow-2xl">
                    <div className="flex flex-col h-full">
                        <div className="p-10 pb-6 flex items-center justify-between border-b border-border/5">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                                    <Shield className="h-3 w-3" />
                                    Detailed Analysis View
                                </p>
                                <DialogTitle className="text-4xl font-black tracking-tighter">
                                    {expandedCard === 'table' ? 'Top Roles Analysis' : cards.find(c => c.id === expandedCard)?.title}
                                </DialogTitle>
                                <p className="text-muted-foreground font-medium">
                                    {expandedCard === 'table' ? 'Full distribution of AI proficiency across organization roles' : cards.find(c => c.id === expandedCard)?.description}
                                </p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setExpandedCard(null)}
                                className="h-12 w-12 rounded-2xl bg-muted/50 hover:bg-red-500/10 hover:text-red-500 transition-all"
                            >
                                <X className="h-6 w-6" />
                            </Button>
                        </div>
                        <div className="flex-1 p-10 overflow-y-auto">
                            {expandedCard === 'table' ? (
                                <TopRolesTable data={roleProficiency} fullView />
                            ) : (
                                (() => {
                                    const card = cards.find(c => c.id === expandedCard);
                                    return card ? <card.component data={card.data} /> : null;
                                })()
                            )}
                        </div>
                        <div className="p-6 px-10 border-t border-border/5 bg-muted/20 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">System Active</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Global Scope</span>
                                </div>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">CTO Platform Analytics v2.0</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// --- TABLE COMPONENT ---

const TopRolesTable = ({ data, fullView = false }: any) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead>
                <tr className="border-b border-border/50">
                    <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Role</th>
                    <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Avg Proficiency</th>
                    <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Resources</th>
                    <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Progress</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
                {(fullView ? data : data?.slice(0, 7)).map((role: any, idx: number) => (
                    <tr key={idx} className="group hover:bg-muted/50 transition-colors">
                        <td className="py-4 font-bold">{role.role}</td>
                        <td className="py-4 font-black text-primary">{role.avgSkill} / 5.0</td>
                        <td className="py-4 font-medium text-muted-foreground">{role.resources}</td>
                        <td className="py-4 min-w-[120px]">
                            <div className="flex items-center gap-3">
                                <Progress value={role.progress} className="h-2 bg-muted/50" indicatorClassName="bg-gradient-to-r from-purple-500 to-indigo-500" />
                                {fullView && <span className="text-[10px] font-black w-8 text-right">{role.progress}%</span>}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

function StatCard({ title, value, unit, icon, color, description }: any) {
    return (
        <Card className="rounded-[2.5rem] border-[1.5px] border-border/50 bg-background/50 backdrop-blur-2xl overflow-hidden shadow-lg hover:-translate-y-2 transition-all duration-500 group">
            <CardContent className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-4 md:mb-8">
                    <div className={cn("p-3 rounded-[1.25rem] bg-muted/50 border border-border/50 shadow-inner group-hover:scale-110 transition-transform duration-500", color)}>
                        {icon}
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/60 mb-2 truncate">{title}</p>
                    <div className="flex items-baseline gap-1.5">
                        <h4 className="text-3xl md:text-5xl font-black tracking-tighter truncate">{value}</h4>
                        {unit && <span className="text-lg font-bold text-muted-foreground/50">{unit}</span>}
                    </div>
                    {description && <p className="text-[10px] text-muted-foreground/70 mt-2 font-bold truncate">{description}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
