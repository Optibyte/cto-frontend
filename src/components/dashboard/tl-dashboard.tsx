'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/dashboard/kpi-card';
import { Target, AlertCircle, GitPullRequest, Bug, Code, CheckCircle2, Clock } from 'lucide-react';

// Mock data for Team Lead dashboard
const tlKPIs = {
    sprintProgress: { current: 72, previous: 65, change: 10.8, trend: 'up' as const, sparkline: [55, 58, 62, 65, 68, 70, 72] },
    openIssues: { current: 14, previous: 18, change: -22.2, trend: 'down' as const, sparkline: [22, 20, 19, 18, 16, 15, 14] },
    codeReviewPending: { current: 6, previous: 9, change: -33.3, trend: 'down' as const, sparkline: [12, 10, 9, 8, 7, 6, 6] },
    bugCount: { current: 3, previous: 5, change: -40, trend: 'down' as const, sparkline: [8, 7, 6, 5, 4, 3, 3] },
};

const taskAllocation = [
    { developer: 'Alice Johnson', assigned: 5, inProgress: 2, completed: 3, blocked: 0 },
    { developer: 'Bob Williams', assigned: 4, inProgress: 1, completed: 2, blocked: 1 },
    { developer: 'David Chen', assigned: 3, inProgress: 2, completed: 1, blocked: 0 },
    { developer: 'Eva Martinez', assigned: 6, inProgress: 3, completed: 3, blocked: 0 },
];

const prQueue = [
    { id: '#342', title: 'feat: Add OAuth2 integration', author: 'Alice Johnson', status: 'needs-review', changes: '+245 / -18', time: '30m ago' },
    { id: '#339', title: 'fix: Memory leak in data processing', author: 'Bob Williams', status: 'changes-requested', changes: '+12 / -45', time: '2h ago' },
    { id: '#337', title: 'refactor: Migrate to TypeScript strict mode', author: 'Eva Martinez', status: 'approved', changes: '+890 / -650', time: '4h ago' },
    { id: '#335', title: 'docs: Update API documentation', author: 'David Chen', status: 'needs-review', changes: '+120 / -30', time: '6h ago' },
];

const codeQualityMetrics = [
    { metric: 'Test Coverage', value: 84, target: 80, status: 'good' },
    { metric: 'Code Duplication', value: 3.2, target: 5, status: 'good' },
    { metric: 'Tech Debt Ratio', value: 8.5, target: 10, status: 'warning' },
    { metric: 'Lint Errors', value: 0, target: 0, status: 'good' },
];

export function TLDashboard() {
    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Team Lead Dashboard</h1>
                <p className="text-muted-foreground">Sprint management, code quality, and task allocation</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Sprint Progress"
                    value={tlKPIs.sprintProgress.current}
                    unit="%"
                    change={tlKPIs.sprintProgress.change}
                    trend={tlKPIs.sprintProgress.trend}
                    icon={Target}
                    sparklineData={tlKPIs.sprintProgress.sparkline}
                />
                <KPICard
                    title="Open Issues"
                    value={tlKPIs.openIssues.current}
                    unit="issues"
                    change={tlKPIs.openIssues.change}
                    trend={tlKPIs.openIssues.trend}
                    icon={AlertCircle}
                    sparklineData={tlKPIs.openIssues.sparkline}
                />
                <KPICard
                    title="PR Review Pending"
                    value={tlKPIs.codeReviewPending.current}
                    unit="PRs"
                    change={tlKPIs.codeReviewPending.change}
                    trend={tlKPIs.codeReviewPending.trend}
                    icon={GitPullRequest}
                    sparklineData={tlKPIs.codeReviewPending.sparkline}
                />
                <KPICard
                    title="Bug Count"
                    value={tlKPIs.bugCount.current}
                    unit="bugs"
                    change={tlKPIs.bugCount.change}
                    trend={tlKPIs.bugCount.trend}
                    icon={Bug}
                    sparklineData={tlKPIs.bugCount.sparkline}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Task Allocation - 2 columns */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Task Allocation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {taskAllocation.map((dev, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center text-sm font-semibold text-primary-foreground">
                                            {dev.developer.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <p className="text-sm font-medium">{dev.developer}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10">
                                            <span className="text-xs font-medium text-blue-500">{dev.assigned}</span>
                                            <span className="text-xs text-blue-500/70">assigned</span>
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10">
                                            <span className="text-xs font-medium text-amber-500">{dev.inProgress}</span>
                                            <span className="text-xs text-amber-500/70">active</span>
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10">
                                            <span className="text-xs font-medium text-emerald-500">{dev.completed}</span>
                                            <span className="text-xs text-emerald-500/70">done</span>
                                        </div>
                                        {dev.blocked > 0 && (
                                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10">
                                                <span className="text-xs font-medium text-red-500">{dev.blocked}</span>
                                                <span className="text-xs text-red-500/70">blocked</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Code Quality - 1 column */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code className="h-5 w-5 text-primary" />
                            Code Quality
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {codeQualityMetrics.map((metric, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{metric.metric}</span>
                                    <span className="font-medium">
                                        {metric.value}{metric.metric === 'Test Coverage' || metric.metric === 'Code Duplication' || metric.metric === 'Tech Debt Ratio' ? '%' : ''}
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${metric.status === 'good'
                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                            : 'bg-gradient-to-r from-amber-500 to-amber-400'
                                            }`}
                                        style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* PR Review Queue */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GitPullRequest className="h-5 w-5 text-primary" />
                        Pull Request Queue
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {prQueue.map((pr) => (
                            <div
                                key={pr.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-primary">{pr.id}</span>
                                        <p className="text-sm font-medium">{pr.title}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">by {pr.author} • {pr.time}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-muted-foreground">{pr.changes}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${pr.status === 'approved'
                                        ? 'bg-emerald-500/10 text-emerald-500'
                                        : pr.status === 'needs-review'
                                            ? 'bg-blue-500/10 text-blue-500'
                                            : 'bg-amber-500/10 text-amber-500'
                                        }`}>
                                        {pr.status === 'needs-review' ? 'Needs Review' : pr.status === 'approved' ? 'Approved' : 'Changes Req.'}
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
