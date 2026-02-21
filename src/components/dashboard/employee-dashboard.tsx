'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/dashboard/kpi-card';
import { CheckSquare, Clock, Zap, Star, ListTodo, Calendar, Trophy, TrendingUp } from 'lucide-react';

// Mock data for Employee dashboard
const employeeKPIs = {
    tasksCompleted: { current: 18, previous: 15, change: 20, trend: 'up' as const, sparkline: [10, 12, 13, 14, 15, 17, 18] },
    hoursLogged: { current: 38, previous: 40, change: -5, trend: 'down' as const, sparkline: [40, 39, 41, 38, 40, 39, 38] },
    storyPoints: { current: 21, previous: 18, change: 16.7, trend: 'up' as const, sparkline: [14, 15, 16, 17, 18, 20, 21] },
    qualityScore: { current: 96, previous: 93, change: 3.2, trend: 'up' as const, sparkline: [90, 91, 92, 93, 94, 95, 96] },
};

const activeTasks = [
    { id: 'TASK-234', title: 'Implement user authentication flow', priority: 'High', status: 'In Progress', dueDate: '2026-02-20', sprint: 'Sprint 24' },
    { id: 'TASK-245', title: 'Write unit tests for payment module', priority: 'Medium', status: 'In Progress', dueDate: '2026-02-21', sprint: 'Sprint 24' },
    { id: 'TASK-251', title: 'Fix responsive layout issues', priority: 'Low', status: 'To Do', dueDate: '2026-02-22', sprint: 'Sprint 24' },
    { id: 'TASK-258', title: 'Update API documentation', priority: 'Medium', status: 'To Do', dueDate: '2026-02-23', sprint: 'Sprint 24' },
    { id: 'TASK-262', title: 'Code review for PR #342', priority: 'High', status: 'In Progress', dueDate: '2026-02-19', sprint: 'Sprint 24' },
];

const recentlyCompleted = [
    { id: 'TASK-220', title: 'Database migration script', completedAt: '2 hours ago', points: 5 },
    { id: 'TASK-218', title: 'Setup CI/CD pipeline', completedAt: 'Yesterday', points: 8 },
    { id: 'TASK-215', title: 'Refactor notification service', completedAt: '2 days ago', points: 3 },
];

const personalGoals = [
    { goal: 'Complete 20 story points', current: 21, target: 20, status: 'achieved' },
    { goal: 'Zero critical bugs', current: 0, target: 0, status: 'achieved' },
    { goal: 'Code review within 4h', current: 85, target: 90, status: 'in-progress' },
    { goal: '40 hours weekly', current: 38, target: 40, status: 'in-progress' },
];

const weeklyTimesheet = [
    { day: 'Mon', hours: 8.5 },
    { day: 'Tue', hours: 7.5 },
    { day: 'Wed', hours: 8.0 },
    { day: 'Thu', hours: 7.0 },
    { day: 'Fri', hours: 7.0 },
];

export function EmployeeDashboard() {
    const totalHours = weeklyTimesheet.reduce((sum, d) => sum + d.hours, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
                <p className="text-muted-foreground">Personal tasks, performance, and goals</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Tasks Completed"
                    value={employeeKPIs.tasksCompleted.current}
                    unit="tasks"
                    change={employeeKPIs.tasksCompleted.change}
                    trend={employeeKPIs.tasksCompleted.trend}
                    icon={CheckSquare}
                    sparklineData={employeeKPIs.tasksCompleted.sparkline}
                />
                <KPICard
                    title="Hours Logged"
                    value={employeeKPIs.hoursLogged.current}
                    unit="hours"
                    change={employeeKPIs.hoursLogged.change}
                    trend={employeeKPIs.hoursLogged.trend}
                    icon={Clock}
                    sparklineData={employeeKPIs.hoursLogged.sparkline}
                />
                <KPICard
                    title="Story Points"
                    value={employeeKPIs.storyPoints.current}
                    unit="points"
                    change={employeeKPIs.storyPoints.change}
                    trend={employeeKPIs.storyPoints.trend}
                    icon={Zap}
                    sparklineData={employeeKPIs.storyPoints.sparkline}
                />
                <KPICard
                    title="Quality Score"
                    value={employeeKPIs.qualityScore.current}
                    unit="%"
                    change={employeeKPIs.qualityScore.change}
                    trend={employeeKPIs.qualityScore.trend}
                    icon={Star}
                    sparklineData={employeeKPIs.qualityScore.sparkline}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Active Tasks - 2 columns */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ListTodo className="h-5 w-5 text-primary" />
                            My Active Tasks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {activeTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-primary">{task.id}</span>
                                            <p className="text-sm font-medium">{task.title}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Due: {task.dueDate} • {task.sprint}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.priority === 'High'
                                            ? 'bg-red-500/10 text-red-500'
                                            : task.priority === 'Medium'
                                                ? 'bg-amber-500/10 text-amber-500'
                                                : 'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {task.priority}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === 'In Progress'
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-muted text-muted-foreground'
                                            }`}>
                                            {task.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Timesheet - 1 column */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Weekly Timesheet
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {weeklyTimesheet.map((day, index) => (
                            <div key={index} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{day.day}</span>
                                    <span className="font-medium">{day.hours}h</span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                                        style={{ width: `${(day.hours / 10) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="pt-3 border-t border-border/30">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total</span>
                                <span className="text-lg font-bold">{totalHours}h <span className="text-sm font-normal text-muted-foreground">/ 40h</span></span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recently Completed */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-primary" />
                            Recently Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentlyCompleted.map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-emerald-500">{task.id}</span>
                                            <p className="text-sm font-medium">{task.title}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{task.completedAt}</p>
                                    </div>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                                        +{task.points} pts
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Goals */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Personal Goals
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {personalGoals.map((goal, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{goal.goal}</span>
                                        <span className={`font-medium ${goal.status === 'achieved' ? 'text-emerald-500' : 'text-amber-500'
                                            }`}>
                                            {goal.status === 'achieved' ? '✓ Achieved' : 'In Progress'}
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${goal.status === 'achieved'
                                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                                : 'bg-gradient-to-r from-amber-500 to-amber-400'
                                                }`}
                                            style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
