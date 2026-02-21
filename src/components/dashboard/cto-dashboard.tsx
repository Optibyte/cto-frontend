'use client';

import { KPICard } from '@/components/dashboard/kpi-card';
import { TeamPerformanceChart } from '@/components/dashboard/team-performance-chart';
import { SLAStatusWidget } from '@/components/dashboard/sla-status-widget';
import { DORAMetrics } from '@/components/dashboard/dora-metrics';
import { ProjectHealthCard } from '@/components/dashboard/project-health-card';
import { ResourceAllocation } from '@/components/dashboard/resource-allocation';
import { RiskAlertsPanel } from '@/components/dashboard/risk-alerts-panel';
import { DeploymentPipeline } from '@/components/dashboard/deployment-pipeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Zap, Clock, Activity, BarChart3, ShieldAlert, Rocket } from 'lucide-react';
import { useAppSelector } from '@/redux/store';
import {
    getFilteredKPIData,
    getFilteredTeamPerformance,
    getFilteredSLAStatus,
    getFilteredDORAMetrics,
    getFilteredProjectHealth,
    getFilteredResourceAllocation,
    getFilteredRiskAlerts,
    getFilteredDeployments,
    PROJECTS
} from '@/lib/mock-data/dashboard-filtered';

export function CTODashboard() {
    const { selectedProject, selectedTeam } = useAppSelector((state) => state.dashboard);

    // Get filtered data based on project/team selection
    const kpiData = getFilteredKPIData(selectedProject, selectedTeam);
    const teamPerformance = getFilteredTeamPerformance(selectedProject, selectedTeam);
    const slaStatus = getFilteredSLAStatus(selectedProject, selectedTeam);
    const doraData = getFilteredDORAMetrics(selectedProject);
    const projectHealth = getFilteredProjectHealth(selectedProject);
    const resourceData = getFilteredResourceAllocation(selectedProject);
    const riskAlerts = getFilteredRiskAlerts(selectedProject);
    const deployments = getFilteredDeployments(selectedProject);

    const projectName = selectedProject === 'all'
        ? 'All Projects'
        : PROJECTS.find(p => p.id === selectedProject)?.name || 'Unknown Project';

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Top Stats Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="System Velocity"
                    value={kpiData.velocity.current}
                    unit="points"
                    change={kpiData.velocity.change}
                    trend={kpiData.velocity.trend}
                    icon={TrendingUp}
                    sparklineData={kpiData.velocity.sparkline}
                />
                <KPICard
                    title="Product Quality"
                    value={kpiData.quality.current}
                    unit="%"
                    change={kpiData.quality.change}
                    trend={kpiData.quality.trend}
                    icon={Target}
                    sparklineData={kpiData.quality.sparkline}
                />
                <KPICard
                    title="Throughput"
                    value={kpiData.throughput.current}
                    unit="tasks/wk"
                    change={kpiData.throughput.change}
                    trend={kpiData.throughput.trend}
                    icon={Zap}
                    sparklineData={kpiData.throughput.sparkline}
                />
                <KPICard
                    title="Cycle Time"
                    value={kpiData.cycleTime.current}
                    unit="hrs"
                    change={kpiData.cycleTime.change}
                    trend={kpiData.cycleTime.trend}
                    icon={Clock}
                    sparklineData={kpiData.cycleTime.sparkline}
                />
            </div>

            {/* DORA Metrics - Full Width */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Rocket className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold tracking-tight">DORA Metrics</h2>
                </div>
                <DORAMetrics data={doraData} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Performance Chart */}
                <Card className="lg:col-span-2 border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                Team Performance Analysis
                            </CardTitle>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Efficiency & Output by Team</p>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <TeamPerformanceChart data={teamPerformance} />
                    </CardContent>
                </Card>

                {/* SLA Status Widget */}
                <Card className="border-border/40 shadow-xl shadow-black/5 dark:shadow-black/20 group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            SLA Compliance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SLAStatusWidget data={slaStatus} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Project Health Overview */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Activity className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-bold tracking-tight">Project Health Overview</h2>
                    </div>
                    <ProjectHealthCard data={projectHealth} />
                </div>

                {/* Resource Allocation & Risks */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold tracking-tight">Resource Allocation</h2>
                        </div>
                        <ResourceAllocation data={resourceData} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <ShieldAlert className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold tracking-tight">Risk & Alerts Panel</h2>
                        </div>
                        <RiskAlertsPanel data={riskAlerts} />
                    </div>
                </div>
            </div>

            {/* Deployment Pipeline */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <Rocket className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold tracking-tight">Deployment Pipeline Status</h2>
                </div>
                <DeploymentPipeline data={deployments} />
            </div>

        </div>
    );
}
