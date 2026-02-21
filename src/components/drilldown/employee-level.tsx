'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { drillToProjectDetail } from '@/redux/slices/drilldownSlice';
import { getEmployeesByTL } from '@/lib/mock-data/drilldown';
import { EmptyState } from './empty-state';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { ArrowRight, Clock, CheckCircle2, ListTodo, Timer } from 'lucide-react';

export function EmployeeLevel() {
    const dispatch = useAppDispatch();
    const { selectedTL, selectedTLName } = useAppSelector((s) => s.drilldown);

    const employees = selectedTL ? getEmployeesByTL(selectedTL) : [];

    if (employees.length === 0) {
        return <EmptyState title="No Employees Found" description={`No employees found under ${selectedTLName || 'this team lead'}.`} />;
    }

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {selectedTLName} — Team Members
                </h1>
                <p className="text-muted-foreground">Click on an employee to view their project details</p>
            </div>

            {/* Employee Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {employees.map((emp) => {
                    const progressColor =
                        emp.progressPercent >= 80
                            ? '#10b981'
                            : emp.progressPercent >= 60
                                ? '#f59e0b'
                                : '#ef4444';

                    const chartData = [
                        {
                            name: 'Progress',
                            value: emp.progressPercent,
                            fill: progressColor,
                        },
                    ];

                    return (
                        <Card
                            key={emp.id}
                            className="overflow-hidden relative group rounded-2xl border border-border/40 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/30"
                            onClick={() => dispatch(drillToProjectDetail({ employeeId: emp.id, employeeName: emp.name }))}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <CardContent className="p-6 relative z-10">
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
                                        {emp.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold">{emp.name}</h3>
                                        <p className="text-xs text-muted-foreground">{emp.role}</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>

                                {/* Circular Progress + Stats */}
                                <div className="flex items-center gap-4">
                                    {/* Radial Chart */}
                                    <div className="w-24 h-24 relative flex-shrink-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadialBarChart
                                                cx="50%"
                                                cy="50%"
                                                innerRadius="70%"
                                                outerRadius="100%"
                                                barSize={8}
                                                data={chartData}
                                                startAngle={90}
                                                endAngle={-270}
                                            >
                                                <PolarAngleAxis
                                                    type="number"
                                                    domain={[0, 100]}
                                                    angleAxisId={0}
                                                    tick={false}
                                                />
                                                <RadialBar
                                                    background={{ fill: 'rgba(255,255,255,0.06)' }}
                                                    dataKey="value"
                                                    cornerRadius={10}
                                                />
                                            </RadialBarChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-lg font-bold" style={{ color: progressColor }}>
                                                {emp.progressPercent}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <div className="p-2 rounded-lg bg-muted/40">
                                            <div className="flex items-center gap-1 mb-0.5">
                                                <ListTodo className="h-3 w-3 text-blue-500" />
                                                <span className="text-xs text-muted-foreground">Assigned</span>
                                            </div>
                                            <p className="text-sm font-bold">{emp.tasksAssigned}</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-muted/40">
                                            <div className="flex items-center gap-1 mb-0.5">
                                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                <span className="text-xs text-muted-foreground">Done</span>
                                            </div>
                                            <p className="text-sm font-bold">{emp.tasksCompleted}</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-muted/40">
                                            <div className="flex items-center gap-1 mb-0.5">
                                                <Timer className="h-3 w-3 text-amber-500" />
                                                <span className="text-xs text-muted-foreground">Pending</span>
                                            </div>
                                            <p className="text-sm font-bold">{emp.tasksPending}</p>
                                        </div>
                                        <div className="p-2 rounded-lg bg-muted/40">
                                            <div className="flex items-center gap-1 mb-0.5">
                                                <Clock className="h-3 w-3 text-primary" />
                                                <span className="text-xs text-muted-foreground">Hours</span>
                                            </div>
                                            <p className="text-sm font-bold">{emp.hoursLogged}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
