'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppDispatch } from '@/redux/store';
import { drillToPM } from '@/redux/slices/drilldownSlice';
import { useHierarchy } from '@/hooks/use-hierarchy';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FolderKanban, Activity, Users, Loader2, Shield, Plus } from 'lucide-react';
import { MOCK_ACCOUNTS, MOCK_MARKETS } from '@/lib/constants';

const COLORS = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#84CC16'];

export function TeamLevel() {
    const dispatch = useAppDispatch();
    const { data: hierarchy = [], isLoading } = useHierarchy();

    const [showNewProject, setShowNewProject] = useState(false);
    const [newProject, setNewProject] = useState({
        name: '',
        account: '',
        market: '',
        manager: '',
        startDate: '',
        endDate: '',
        priority: '',
        description: '',
    });

    // Each CTO entry acts as a "team" in the drilldown
    const teams = hierarchy.map((cto: any, index: number) => {
        const pms = cto.projects || [];
        const totalTLs = pms.reduce((acc: number, pm: any) => acc + (pm.teamLeads?.length || 0), 0);
        const totalEmployees = pms.reduce((acc: number, pm: any) =>
            acc + (pm.teamLeads?.reduce((a: number, tl: any) => a + (tl.employees?.length || 0), 0) || 0), 0);

        return {
            id: cto.id,
            name: cto.user?.fullName || 'Unknown CTO',
            totalPMs: pms.length,
            totalTLs,
            totalEmployees,
            totalMembers: pms.length + totalTLs + totalEmployees,
            color: COLORS[index % COLORS.length],
        };
    });

    const handleTeamClick = (teamId: string, teamName: string) => {
        dispatch(drillToPM({ ctoId: teamId, ctoName: teamName }));
    };

    const handleCreateProject = () => {
        console.log('Creating project:', newProject);
        setNewProject({ name: '', account: '', market: '', manager: '', startDate: '', endDate: '', priority: '', description: '' });
        setShowNewProject(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-muted-foreground font-medium">Loading hierarchy...</span>
                </div>
            </div>
        );
    }

    const summaryCards = [
        { title: 'CTOs', value: teams.length, icon: Shield, color: 'from-purple-500/20 to-purple-600/10', textColor: 'text-purple-500', iconBg: 'bg-purple-500/10' },
        { title: 'Total PMs', value: teams.reduce((s: number, t: any) => s + t.totalPMs, 0), icon: FolderKanban, color: 'from-blue-500/20 to-blue-600/10', textColor: 'text-blue-500', iconBg: 'bg-blue-500/10' },
        { title: 'Total TLs', value: teams.reduce((s: number, t: any) => s + t.totalTLs, 0), icon: Activity, color: 'from-cyan-500/20 to-cyan-600/10', textColor: 'text-cyan-500', iconBg: 'bg-cyan-500/10' },
        { title: 'Total Employees', value: teams.reduce((s: number, t: any) => s + t.totalEmployees, 0), icon: Users, color: 'from-emerald-500/20 to-emerald-600/10', textColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10' },
    ];

    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Organizational Overview</h1>
                    <p className="text-muted-foreground">Click on a CTO to drill down to their Project Managers</p>
                </div>

            </div>

            {/* Create New Project Dialog */}
            <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Create New Project</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="project-name">Project Name</Label>
                            <Input
                                id="project-name"
                                placeholder="Enter project name"
                                value={newProject.name}
                                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="project-account">Account</Label>
                                <Select value={newProject.account} onValueChange={(val) => setNewProject({ ...newProject, account: val })}>
                                    <SelectTrigger id="project-account">
                                        <SelectValue placeholder="Select account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MOCK_ACCOUNTS.map((acc) => (
                                            <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="project-market">Market</Label>
                                <Select value={newProject.market} onValueChange={(val) => setNewProject({ ...newProject, market: val })}>
                                    <SelectTrigger id="project-market">
                                        <SelectValue placeholder="Select market" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MOCK_MARKETS.map((m) => (
                                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="project-manager">Manager</Label>
                            <Input
                                id="project-manager"
                                placeholder="Manager name"
                                value={newProject.manager}
                                onChange={(e) => setNewProject({ ...newProject, manager: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="project-start">Start Date</Label>
                            <Input
                                id="project-start"
                                type="date"
                                value={newProject.startDate}
                                onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="project-end">End Date</Label>
                            <Input
                                id="project-end"
                                type="date"
                                value={newProject.endDate}
                                onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="project-priority">Priority</Label>
                        <Select value={newProject.priority} onValueChange={(val) => setNewProject({ ...newProject, priority: val })}>
                            <SelectTrigger id="project-priority">
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="project-description">Description</Label>
                        <Textarea
                            id="project-description"
                            placeholder="Enter project description..."
                            rows={3}
                            value={newProject.description}
                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewProject(false)}>Cancel</Button>
                        <Button onClick={handleCreateProject} disabled={!newProject.name || !newProject.account || !newProject.market}>
                            Create Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
            {teams.length > 0 && (
                <Card className="rounded-2xl border border-border/40 shadow-lg">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-6">Team Size by CTO</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={teams} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
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
                                                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                                                                    <span className="text-xs font-medium text-gray-400">{entry.name}:</span>
                                                                    <span className="text-xs font-bold text-white">{entry.value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="totalPMs" name="PMs" radius={[6, 6, 0, 0]} cursor="pointer">
                                        {teams.map((entry: any, index: number) => (
                                            <Cell key={`cell-pm-${index}`} fill={entry.color} fillOpacity={0.9} />
                                        ))}
                                    </Bar>
                                    <Bar dataKey="totalTLs" name="TLs" radius={[6, 6, 0, 0]} cursor="pointer">
                                        {teams.map((_: any, index: number) => (
                                            <Cell key={`cell-tl-${index}`} fill="#06B6D4" fillOpacity={0.7} />
                                        ))}
                                    </Bar>
                                    <Bar dataKey="totalEmployees" name="Employees" radius={[6, 6, 0, 0]} cursor="pointer">
                                        {teams.map((_: any, index: number) => (
                                            <Cell key={`cell-emp-${index}`} fill="#10b981" fillOpacity={0.7} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Team Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teams.map((team: any) => (
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
                                    <p className="text-lg font-bold text-blue-500">{team.totalPMs}</p>
                                    <p className="text-xs text-muted-foreground">PMs</p>
                                </div>
                                <div className="text-center p-2 rounded-xl bg-cyan-500/10">
                                    <p className="text-lg font-bold text-cyan-500">{team.totalTLs}</p>
                                    <p className="text-xs text-muted-foreground">TLs</p>
                                </div>
                                <div className="text-center p-2 rounded-xl bg-emerald-500/10">
                                    <p className="text-lg font-bold text-emerald-500">{team.totalEmployees}</p>
                                    <p className="text-xs text-muted-foreground">Devs</p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{team.totalMembers} total members</span>
                                <span className="text-xs text-primary font-medium group-hover:translate-x-1 transition-transform">
                                    View PMs →
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {teams.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-border/50 bg-card/50">
                    <Shield className="h-10 w-10 text-muted-foreground" />
                    <h3 className="text-xl font-bold">No Hierarchy Data</h3>
                    <p className="text-muted-foreground">Create CTOs via the hierarchy API to see the organizational structure.</p>
                </div>
            )}
        </div>
    );
}
