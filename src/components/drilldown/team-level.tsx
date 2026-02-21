'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch } from '@/redux/store';
import { drillToManager } from '@/redux/slices/drilldownSlice';
import { mockTeams } from '@/lib/mock-data/drilldown';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FolderKanban, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function TeamLevel() {
    const dispatch = useAppDispatch();
    const teams = mockTeams;

    const totalProjects = teams.reduce((sum, t) => sum + t.totalProjects, 0);
    const activeProjects = teams.reduce((sum, t) => sum + t.activeProjects, 0);
    const delayedProjects = teams.reduce((sum, t) => sum + t.delayedProjects, 0);
    const completedProjects = teams.reduce((sum, t) => sum + t.completedProjects, 0);

    const handleTeamClick = (teamId: string, teamName: string) => {
        dispatch(drillToManager({ teamId, teamName }));
    };

    const summaryCards = [
        { title: 'Total Projects', value: totalProjects, icon: FolderKanban, color: 'from-purple-500/20 to-purple-600/10', textColor: 'text-purple-500', iconBg: 'bg-purple-500/10' },
        { title: 'Active Projects', value: activeProjects, icon: Activity, color: 'from-blue-500/20 to-blue-600/10', textColor: 'text-blue-500', iconBg: 'bg-blue-500/10' },
        { title: 'Delayed Projects', value: delayedProjects, icon: AlertTriangle, color: 'from-red-500/20 to-red-600/10', textColor: 'text-red-500', iconBg: 'bg-red-500/10' },
        { title: 'Completed', value: completedProjects, icon: CheckCircle2, color: 'from-emerald-500/20 to-emerald-600/10', textColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10' },
    ];

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Team Overview</h1>
                <p className="text-muted-foreground">Click on a team to drill down to managers</p>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summaryCards.map((card, i) => (
                    <Card key={i} className="overflow-hidden relative group rounded-2xl border border-border/40 shadow-lg shadow-black/5 dark:shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30">
                        <div className={`absolute inset-0 bg-gradient-to-br opacity-30 group-hover:opacity-50 transition-opacity duration-300 ${card.color}`} />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{card.title}</p>
                                    <h3 className="text-4xl font-bold tracking-tight">{card.value}</h3>
                                </div>
                                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <card.icon className={`h-7 w-7 ${card.textColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bar Chart */}
            <Card className="rounded-2xl border border-border/40 shadow-lg">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Projects by Team</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={teams}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e1e2e',
                                        border: '1px solid rgba(139, 92, 246, 0.3)',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                                        color: '#ededed',
                                    }}
                                />
                                <Bar
                                    dataKey="activeProjects"
                                    name="Active"
                                    radius={[6, 6, 0, 0]}
                                    cursor="pointer"
                                    onClick={(data: any) => handleTeamClick(data.id, data.name)}
                                >
                                    {teams.map((entry, index) => (
                                        <Cell key={`cell-active-${index}`} fill={entry.color} fillOpacity={0.9} />
                                    ))}
                                </Bar>
                                <Bar
                                    dataKey="delayedProjects"
                                    name="Delayed"
                                    radius={[6, 6, 0, 0]}
                                    cursor="pointer"
                                    onClick={(data: any) => handleTeamClick(data.id, data.name)}
                                >
                                    {teams.map((_, index) => (
                                        <Cell key={`cell-delayed-${index}`} fill="#ef4444" fillOpacity={0.7} />
                                    ))}
                                </Bar>
                                <Bar
                                    dataKey="completedProjects"
                                    name="Completed"
                                    radius={[6, 6, 0, 0]}
                                    cursor="pointer"
                                    onClick={(data: any) => handleTeamClick(data.id, data.name)}
                                >
                                    {teams.map((_, index) => (
                                        <Cell key={`cell-completed-${index}`} fill="#10b981" fillOpacity={0.7} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Team Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                    <Card
                        key={team.id}
                        className="overflow-hidden relative group rounded-2xl border border-border/40 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/30"
                        onClick={() => handleTeamClick(team.id, team.name)}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl" style={{ backgroundColor: team.color }} />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">{team.name}</h3>
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: team.color }} />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-2 rounded-xl bg-blue-500/10">
                                    <p className="text-lg font-bold text-blue-500">{team.activeProjects}</p>
                                    <p className="text-xs text-muted-foreground">Active</p>
                                </div>
                                <div className="text-center p-2 rounded-xl bg-red-500/10">
                                    <p className="text-lg font-bold text-red-500">{team.delayedProjects}</p>
                                    <p className="text-xs text-muted-foreground">Delayed</p>
                                </div>
                                <div className="text-center p-2 rounded-xl bg-emerald-500/10">
                                    <p className="text-lg font-bold text-emerald-500">{team.completedProjects}</p>
                                    <p className="text-xs text-muted-foreground">Done</p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{team.totalProjects} total projects</span>
                                <span className="text-xs text-primary font-medium group-hover:translate-x-1 transition-transform">
                                    View Details →
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
