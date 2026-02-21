'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/dashboard/kpi-card';
import { Users, Rocket, CheckCircle, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAppSelector } from '@/redux/store';
import { PROJECTS } from '@/lib/mock-data/dashboard-filtered';
import { DateRangePicker } from '@/components/shared/date-range-picker';

// Mock data for Manager dashboard
const managerKPIs = {
    teamVelocity: { current: 186, previous: 170, change: 9.4, trend: 'up' as const, sparkline: [160, 165, 170, 175, 180, 185, 186] },
    deliveryRate: { current: 91.5, previous: 88.2, change: 3.7, trend: 'up' as const, sparkline: [85, 87, 88, 89, 90, 91, 91.5] },
    sprintCompletion: { current: 87, previous: 82, change: 6.1, trend: 'up' as const, sparkline: [78, 80, 82, 84, 86, 87, 87] },
    teamUtilization: { current: 78, previous: 81, change: -3.7, trend: 'down' as const, sparkline: [82, 81, 80, 79, 78, 77, 78] },
};

const teamMembers = [
    { name: 'Alice Johnson', role: 'Senior Dev', tasks: 12, completed: 9, status: 'active' },
    { name: 'Bob Williams', role: 'Full Stack Dev', tasks: 8, completed: 6, status: 'active' },
    { name: 'Carol Davis', role: 'QA Engineer', tasks: 15, completed: 14, status: 'active' },
    { name: 'David Chen', role: 'Frontend Dev', tasks: 10, completed: 7, status: 'on-leave' },
    { name: 'Eva Martinez', role: 'Backend Dev', tasks: 11, completed: 10, status: 'active' },
];

const pendingApprovals = [
    { id: 1, title: 'Feature: User Authentication v2', requester: 'Alice Johnson', type: 'PR Review', priority: 'High', time: '2h ago' },
    { id: 2, title: 'Budget allocation for Q3', requester: 'HR Department', type: 'Budget', priority: 'Medium', time: '5h ago' },
    { id: 3, title: 'New hiring request - Senior Dev', requester: 'Carol Davis', type: 'Hiring', priority: 'High', time: '1d ago' },
];

export function ManagerDashboard() {
    const { selectedProject, selectedTeam } = useAppSelector((s) => s.dashboard);

    const projectName = selectedProject === 'all'
        ? 'All Projects'
        : PROJECTS.find(p => p.id === selectedProject)?.name || 'Unknown';

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
                    <p className="text-muted-foreground">
                        {selectedProject === 'all'
                            ? 'Team performance overview and management tools'
                            : `Showing data for ${projectName}`}
                        {selectedTeam !== 'all' && ` · ${selectedTeam.replace('-', '/')} team`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <DateRangePicker />
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Team Velocity"
                    value={managerKPIs.teamVelocity.current}
                    unit="points"
                    change={managerKPIs.teamVelocity.change}
                    trend={managerKPIs.teamVelocity.trend}
                    icon={Rocket}
                    sparklineData={managerKPIs.teamVelocity.sparkline}
                />
                <KPICard
                    title="Delivery Rate"
                    value={managerKPIs.deliveryRate.current}
                    unit="%"
                    change={managerKPIs.deliveryRate.change}
                    trend={managerKPIs.deliveryRate.trend}
                    icon={CheckCircle}
                    sparklineData={managerKPIs.deliveryRate.sparkline}
                />
                <KPICard
                    title="Sprint Completion"
                    value={managerKPIs.sprintCompletion.current}
                    unit="%"
                    change={managerKPIs.sprintCompletion.change}
                    trend={managerKPIs.sprintCompletion.trend}
                    icon={Clock}
                    sparklineData={managerKPIs.sprintCompletion.sparkline}
                />
                <KPICard
                    title="Team Utilization"
                    value={managerKPIs.teamUtilization.current}
                    unit="%"
                    change={managerKPIs.teamUtilization.change}
                    trend={managerKPIs.teamUtilization.trend}
                    icon={Users}
                    sparklineData={managerKPIs.teamUtilization.sparkline}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Team Members - 2 columns */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Team Members
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {teamMembers.map((member, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center text-sm font-semibold text-primary-foreground">
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{member.name}</p>
                                            <p className="text-xs text-muted-foreground">{member.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{member.completed}/{member.tasks}</p>
                                            <p className="text-xs text-muted-foreground">tasks done</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.status === 'active'
                                            ? 'bg-emerald-500/10 text-emerald-500'
                                            : 'bg-amber-500/10 text-amber-500'
                                            }`}>
                                            {member.status === 'active' ? 'Active' : 'On Leave'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Sprint Status - 1 column */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Rocket className="h-5 w-5 text-primary" />
                            Sprint Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Sprint 24</span>
                                <span className="font-medium">87%</span>
                            </div>
                            <div className="h-3 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500" style={{ width: '87%' }} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 pt-2">
                            <div className="text-center p-3 rounded-xl bg-emerald-500/10">
                                <p className="text-lg font-bold text-emerald-500">28</p>
                                <p className="text-xs text-muted-foreground">Done</p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-blue-500/10">
                                <p className="text-lg font-bold text-blue-500">5</p>
                                <p className="text-xs text-muted-foreground">In Progress</p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-amber-500/10">
                                <p className="text-lg font-bold text-amber-500">3</p>
                                <p className="text-xs text-muted-foreground">To Do</p>
                            </div>
                        </div>
                        <div className="pt-2 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Days Remaining</p>
                            <p className="text-2xl font-bold">4 <span className="text-sm font-normal text-muted-foreground">of 14 days</span></p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Approvals */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        Pending Approvals
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {pendingApprovals.map((approval) => (
                            <div
                                key={approval.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors"
                            >
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{approval.title}</p>
                                    <p className="text-xs text-muted-foreground">by {approval.requester} • {approval.time}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${approval.priority === 'High'
                                        ? 'bg-red-500/10 text-red-500'
                                        : 'bg-amber-500/10 text-amber-500'
                                        }`}>
                                        {approval.priority}
                                    </span>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                        {approval.type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
