import { KPIData, TeamPerformanceData, Activity } from '../types';

// ========== PROJECT & THEME DEFINITIONS ==========

export interface ProjectOption {
    id: string;
    name: string;
    teams: string[];
}

export interface TeamOption {
    id: string;
    name: string;
}

export const PROJECTS: ProjectOption[] = [
    { id: 'banking', name: 'Banking App', teams: ['ui-ux', 'backend', 'devops', 'qa'] },
    { id: 'ecommerce', name: 'E-Commerce Platform', teams: ['ui-ux', 'backend', 'devops', 'qa'] },
    { id: 'hrms', name: 'HRMS System', teams: ['ui-ux', 'backend', 'qa'] },
    { id: 'ai-analytics', name: 'AI Analytics', teams: ['backend', 'devops', 'qa'] },
];

export const TEAMS: TeamOption[] = [
    { id: 'ui-ux', name: 'UI/UX' },
    { id: 'backend', name: 'Backend' },
    { id: 'devops', name: 'DevOps' },
    { id: 'qa', name: 'QA' },
];

export function getTeamsForProject(projectId: string): TeamOption[] {
    if (projectId === 'all') return TEAMS;
    const project = PROJECTS.find(p => p.id === projectId);
    if (!project) return [];
    return TEAMS.filter(t => project.teams.includes(t.id));
}

// ========== PROJECT-SPECIFIC KPI DATA ==========

type KPISet = Record<string, KPIData>;

const allKPIData: KPISet = {
    velocity: { current: 245, previous: 218, change: 12.5, trend: 'up', sparkline: [220, 225, 230, 235, 240, 245, 250] },
    quality: { current: 94.2, previous: 96.3, change: -2.1, trend: 'down', sparkline: [96, 95, 94.5, 94, 94.2, 94.5, 94.2] },
    throughput: { current: 47, previous: 43, change: 8.3, trend: 'up', sparkline: [42, 43, 45, 46, 47, 48, 47] },
    cycleTime: { current: 28.5, previous: 33.5, change: -15.2, trend: 'down', sparkline: [35, 34, 32, 30, 29, 28, 28.5] },
};

const projectKPIData: Record<string, KPISet> = {
    banking: {
        velocity: { current: 78, previous: 68, change: 14.7, trend: 'up', sparkline: [65, 68, 70, 72, 75, 78, 80] },
        quality: { current: 96.5, previous: 95, change: 1.6, trend: 'up', sparkline: [94, 94.5, 95, 95.5, 96, 96.3, 96.5] },
        throughput: { current: 14, previous: 12, change: 16.7, trend: 'up', sparkline: [11, 12, 12, 13, 13, 14, 14] },
        cycleTime: { current: 22, previous: 26, change: -15.4, trend: 'down', sparkline: [28, 27, 25, 24, 23, 22, 22] },
    },
    ecommerce: {
        velocity: { current: 92, previous: 85, change: 8.2, trend: 'up', sparkline: [82, 84, 86, 88, 90, 91, 92] },
        quality: { current: 91.8, previous: 93, change: -1.3, trend: 'down', sparkline: [93, 92.5, 92, 91.5, 91.8, 92, 91.8] },
        throughput: { current: 18, previous: 16, change: 12.5, trend: 'up', sparkline: [15, 15, 16, 17, 17, 18, 18] },
        cycleTime: { current: 32, previous: 38, change: -15.8, trend: 'down', sparkline: [40, 38, 36, 35, 33, 32, 32] },
    },
    hrms: {
        velocity: { current: 42, previous: 38, change: 10.5, trend: 'up', sparkline: [35, 36, 38, 39, 40, 41, 42] },
        quality: { current: 97.1, previous: 96, change: 1.1, trend: 'up', sparkline: [95, 95.5, 96, 96.5, 96.8, 97, 97.1] },
        throughput: { current: 8, previous: 7, change: 14.3, trend: 'up', sparkline: [6, 6, 7, 7, 7, 8, 8] },
        cycleTime: { current: 18, previous: 20, change: -10, trend: 'down', sparkline: [22, 21, 20, 19, 18.5, 18, 18] },
    },
    'ai-analytics': {
        velocity: { current: 33, previous: 27, change: 22.2, trend: 'up', sparkline: [24, 26, 28, 30, 31, 32, 33] },
        quality: { current: 89.5, previous: 91, change: -1.6, trend: 'down', sparkline: [91, 90.5, 90, 89.5, 89.8, 89.5, 89.5] },
        throughput: { current: 7, previous: 8, change: -12.5, trend: 'down', sparkline: [9, 8, 8, 7, 7, 7, 7] },
        cycleTime: { current: 45, previous: 50, change: -10, trend: 'down', sparkline: [52, 50, 48, 47, 46, 45, 45] },
    },
};

// Team-specific multipliers to vary data by team
const teamMultipliers: Record<string, Record<string, number>> = {
    'ui-ux': { velocity: 0.6, quality: 1.02, throughput: 0.5, cycleTime: 0.8 },
    backend: { velocity: 1.3, quality: 0.98, throughput: 1.4, cycleTime: 1.2 },
    devops: { velocity: 0.8, quality: 1.05, throughput: 0.7, cycleTime: 0.6 },
    qa: { velocity: 0.4, quality: 1.08, throughput: 0.9, cycleTime: 0.7 },
};

function applyTeamMultiplier(kpi: KPISet, teamId: string): KPISet {
    const m = teamMultipliers[teamId];
    if (!m) return kpi;
    const result: KPISet = {};
    for (const [key, val] of Object.entries(kpi)) {
        const mult = m[key] || 1;
        result[key] = {
            ...val,
            current: Math.round(val.current * mult * 10) / 10,
            previous: Math.round(val.previous * mult * 10) / 10,
            sparkline: val.sparkline?.map(v => Math.round(v * mult * 10) / 10),
        };
    }
    return result;
}

// ========== PROJECT-SPECIFIC TEAM PERFORMANCE ==========

const allTeamPerformance: TeamPerformanceData[] = [
    { team: 'Team Alpha', score: 92, members: 8, velocity: 245, quality: 96 },
    { team: 'Team Beta', score: 78, members: 6, velocity: 180, quality: 85 },
    { team: 'Team Gamma', score: 85, members: 10, velocity: 320, quality: 88 },
    { team: 'Team Delta', score: 65, members: 5, velocity: 140, quality: 72 },
    { team: 'Team Epsilon', score: 88, members: 7, velocity: 210, quality: 92 },
];

const projectTeamPerformance: Record<string, TeamPerformanceData[]> = {
    banking: [
        { team: 'Core Banking', score: 94, members: 6, velocity: 78, quality: 96 },
        { team: 'Payments', score: 88, members: 5, velocity: 65, quality: 91 },
        { team: 'Compliance', score: 82, members: 4, velocity: 42, quality: 97 },
    ],
    ecommerce: [
        { team: 'Storefront', score: 90, members: 8, velocity: 92, quality: 89 },
        { team: 'Checkout', score: 85, members: 5, velocity: 58, quality: 93 },
        { team: 'Inventory', score: 76, members: 6, velocity: 70, quality: 82 },
        { team: 'Analytics', score: 81, members: 4, velocity: 45, quality: 88 },
    ],
    hrms: [
        { team: 'Employee Mgmt', score: 91, members: 5, velocity: 42, quality: 95 },
        { team: 'Payroll', score: 87, members: 4, velocity: 35, quality: 97 },
    ],
    'ai-analytics': [
        { team: 'ML Pipeline', score: 83, members: 6, velocity: 33, quality: 86 },
        { team: 'Data Platform', score: 79, members: 5, velocity: 28, quality: 91 },
        { team: 'Visualization', score: 88, members: 3, velocity: 22, quality: 94 },
    ],
};

// ========== PROJECT-SPECIFIC SLA ==========

const allSLAStatus = { met: 12, atRisk: 3, missed: 1 };

const projectSLAStatus: Record<string, { met: number; atRisk: number; missed: number }> = {
    banking: { met: 5, atRisk: 1, missed: 0 },
    ecommerce: { met: 3, atRisk: 1, missed: 1 },
    hrms: { met: 2, atRisk: 1, missed: 0 },
    'ai-analytics': { met: 2, atRisk: 0, missed: 0 },
};

// ========== PROJECT-SPECIFIC ACTIVITIES ==========

const projectActivities: Record<string, Activity[]> = {
    banking: [
        { id: 'b1', type: 'metric_update', title: 'Core Banking velocity up to 78 pts', description: 'Sprint velocity increased for Core Banking team', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), user: { id: 'u1', name: 'Ravi Kumar', email: 'ravi@cto.io', role: 'Manager' } },
        { id: 'b2', type: 'sla_breach', title: 'Compliance SLA at risk', description: 'Response time nearing SLA threshold', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), severity: 'warning' },
    ],
    ecommerce: [
        { id: 'e1', type: 'metric_update', title: 'Storefront team score at 90', description: 'Quality improvements across sprint', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), user: { id: 'u2', name: 'Vikram Singh', email: 'vikram@cto.io', role: 'Manager' } },
        { id: 'e2', type: 'integration_sync', title: 'Shopify sync completed', description: 'Synced 200 product entries', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), user: { id: 'system', name: 'System', email: 'system@cto.io', role: 'CTO' } },
    ],
    hrms: [
        { id: 'h1', type: 'metric_update', title: 'Payroll quality at 97%', description: 'Outstanding quality metrics this sprint', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), user: { id: 'u3', name: 'Sneha Reddy', email: 'sneha@cto.io', role: 'TeamLead' } },
    ],
    'ai-analytics': [
        { id: 'a1', type: 'metric_update', title: 'ML Pipeline velocity surge', description: 'Velocity increased by 22% this sprint', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), user: { id: 'u4', name: 'Arjun Nair', email: 'arjun@cto.io', role: 'Manager' } },
        { id: 'a2', type: 'sla_breach', title: 'Data Pipeline latency warning', description: 'Processing time above threshold', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), severity: 'warning' },
    ],
};

const allActivities: Activity[] = [
    { id: '1', type: 'metric_update', title: 'Velocity updated for Team Alpha', description: 'Sprint velocity increased to 245 points', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), user: { id: 'u1', name: 'John Doe', email: 'john@cto.io', role: 'Manager', avatar: '/avatars/john.jpg' } },
    { id: '2', type: 'sla_breach', title: 'SLA breach: Response Time exceeded', description: 'Average response time is 3.2 hours (target: 2 hours)', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), severity: 'warning' },
    { id: '3', type: 'integration_sync', title: 'Jira sync completed', description: 'Successfully synced 150 issues from Jira', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), user: { id: 'system', name: 'System', email: 'system@cto.io', role: 'CTO' } },
    { id: '4', type: 'metric_update', title: 'Quality score updated for Team Gamma', description: 'Code quality improved to 88%', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), user: { id: 'u2', name: 'Jane Smith', email: 'jane@cto.io', role: 'TeamLead', avatar: '/avatars/jane.jpg' } },
];

// ========== MAIN GETTER FUNCTIONS ==========

export function getFilteredKPIData(projectId: string, teamId: string): KPISet {
    let kpi = projectId === 'all' ? allKPIData : (projectKPIData[projectId] || allKPIData);
    if (teamId !== 'all') {
        kpi = applyTeamMultiplier(kpi, teamId);
    }
    return kpi;
}

export function getFilteredTeamPerformance(projectId: string, _teamId: string): TeamPerformanceData[] {
    return projectId === 'all' ? allTeamPerformance : (projectTeamPerformance[projectId] || []);
}

export function getFilteredSLAStatus(projectId: string, _teamId: string): { met: number; atRisk: number; missed: number } {
    return projectId === 'all' ? allSLAStatus : (projectSLAStatus[projectId] || { met: 0, atRisk: 0, missed: 0 });
}

export function getFilteredActivities(projectId: string, _teamId: string): Activity[] {
    return projectId === 'all' ? allActivities : (projectActivities[projectId] || []);
}

// ========== PROJECT HEALTH ==========

export interface ProjectHealth {
    id: string;
    name: string;
    status: 'healthy' | 'at-risk' | 'critical';
    completion: number;
    teams: number;
    openIssues: number;
    sprint: string;
}

const allProjectHealth: ProjectHealth[] = [
    { id: 'banking', name: 'Banking App', status: 'healthy', completion: 87, teams: 3, openIssues: 5, sprint: 'Sprint 24' },
    { id: 'ecommerce', name: 'E-Commerce Platform', status: 'at-risk', completion: 64, teams: 4, openIssues: 12, sprint: 'Sprint 18' },
    { id: 'hrms', name: 'HRMS System', status: 'healthy', completion: 92, teams: 2, openIssues: 2, sprint: 'Sprint 31' },
    { id: 'ai-analytics', name: 'AI Analytics', status: 'critical', completion: 41, teams: 3, openIssues: 18, sprint: 'Sprint 8' },
];

export function getFilteredProjectHealth(projectId: string): ProjectHealth[] {
    if (projectId === 'all') return allProjectHealth;
    return allProjectHealth.filter(p => p.id === projectId);
}

// ========== RESOURCE ALLOCATION ==========

export interface ResourceAllocation {
    project: string;
    projectId: string;
    allocated: number;
    total: number;
    color: string;
}

const allResourceAllocation: ResourceAllocation[] = [
    { project: 'Banking App', projectId: 'banking', allocated: 15, total: 50, color: '#8B5CF6' },
    { project: 'E-Commerce', projectId: 'ecommerce', allocated: 18, total: 50, color: '#3B82F6' },
    { project: 'HRMS System', projectId: 'hrms', allocated: 9, total: 50, color: '#10B981' },
    { project: 'AI Analytics', projectId: 'ai-analytics', allocated: 8, total: 50, color: '#F59E0B' },
];

export function getFilteredResourceAllocation(projectId: string): ResourceAllocation[] {
    if (projectId === 'all') return allResourceAllocation;
    return allResourceAllocation.filter(r => r.projectId === projectId);
}

// ========== DORA METRICS ==========

export interface DORAMetrics {
    deploymentFrequency: { value: number; unit: string; trend: 'up' | 'down' | 'neutral'; change: number };
    leadTime: { value: number; unit: string; trend: 'up' | 'down' | 'neutral'; change: number };
    mttr: { value: number; unit: string; trend: 'up' | 'down' | 'neutral'; change: number };
    changeFailureRate: { value: number; unit: string; trend: 'up' | 'down' | 'neutral'; change: number };
}

const allDORAMetrics: DORAMetrics = {
    deploymentFrequency: { value: 4.2, unit: '/day', trend: 'up', change: 15.3 },
    leadTime: { value: 3.8, unit: 'hours', trend: 'down', change: -22.1 },
    mttr: { value: 1.2, unit: 'hours', trend: 'down', change: -18.5 },
    changeFailureRate: { value: 4.5, unit: '%', trend: 'down', change: -8.2 },
};

const projectDORAMetrics: Record<string, DORAMetrics> = {
    banking: {
        deploymentFrequency: { value: 2.1, unit: '/day', trend: 'up', change: 10.5 },
        leadTime: { value: 2.4, unit: 'hours', trend: 'down', change: -30.2 },
        mttr: { value: 0.8, unit: 'hours', trend: 'down', change: -25.0 },
        changeFailureRate: { value: 2.1, unit: '%', trend: 'down', change: -12.5 },
    },
    ecommerce: {
        deploymentFrequency: { value: 5.6, unit: '/day', trend: 'up', change: 22.0 },
        leadTime: { value: 4.5, unit: 'hours', trend: 'up', change: 8.3 },
        mttr: { value: 1.8, unit: 'hours', trend: 'up', change: 12.5 },
        changeFailureRate: { value: 6.8, unit: '%', trend: 'up', change: 15.2 },
    },
    hrms: {
        deploymentFrequency: { value: 1.5, unit: '/day', trend: 'neutral', change: 0.5 },
        leadTime: { value: 2.0, unit: 'hours', trend: 'down', change: -15.0 },
        mttr: { value: 0.5, unit: 'hours', trend: 'down', change: -33.3 },
        changeFailureRate: { value: 1.2, unit: '%', trend: 'down', change: -20.0 },
    },
    'ai-analytics': {
        deploymentFrequency: { value: 0.8, unit: '/day', trend: 'down', change: -10.0 },
        leadTime: { value: 8.2, unit: 'hours', trend: 'up', change: 25.0 },
        mttr: { value: 3.5, unit: 'hours', trend: 'up', change: 40.0 },
        changeFailureRate: { value: 9.1, unit: '%', trend: 'up', change: 30.0 },
    },
};

export function getFilteredDORAMetrics(projectId: string): DORAMetrics {
    return projectId === 'all' ? allDORAMetrics : (projectDORAMetrics[projectId] || allDORAMetrics);
}

// ========== RISK & ALERTS ==========

export interface RiskAlert {
    id: string;
    type: 'sla-breach' | 'blocker' | 'warning' | 'dependency';
    title: string;
    project: string;
    severity: 'high' | 'medium' | 'low';
    time: string;
}

const allRiskAlerts: RiskAlert[] = [
    { id: 'r1', type: 'sla-breach', title: 'Response time SLA exceeded', project: 'E-Commerce', severity: 'high', time: '25m ago' },
    { id: 'r2', type: 'blocker', title: 'CI pipeline blocked on auth service', project: 'Banking App', severity: 'high', time: '1h ago' },
    { id: 'r3', type: 'warning', title: 'Memory usage at 89% on staging', project: 'AI Analytics', severity: 'medium', time: '2h ago' },
    { id: 'r4', type: 'dependency', title: 'External API rate limit approaching', project: 'E-Commerce', severity: 'medium', time: '3h ago' },
    { id: 'r5', type: 'warning', title: 'Test coverage dropped below 80%', project: 'HRMS System', severity: 'low', time: '5h ago' },
];

const projectRiskAlerts: Record<string, RiskAlert[]> = {
    banking: [allRiskAlerts[1]],
    ecommerce: [allRiskAlerts[0], allRiskAlerts[3]],
    hrms: [allRiskAlerts[4]],
    'ai-analytics': [allRiskAlerts[2]],
};

export function getFilteredRiskAlerts(projectId: string): RiskAlert[] {
    return projectId === 'all' ? allRiskAlerts : (projectRiskAlerts[projectId] || []);
}

// ========== DEPLOYMENT PIPELINE ==========

export interface Deployment {
    id: string;
    service: string;
    project: string;
    projectId: string;
    environment: 'production' | 'staging' | 'development';
    status: 'success' | 'failed' | 'in-progress' | 'rolled-back';
    version: string;
    time: string;
    author: string;
}

const allDeployments: Deployment[] = [
    { id: 'd1', service: 'auth-service', project: 'Banking App', projectId: 'banking', environment: 'production', status: 'success', version: 'v2.4.1', time: '12m ago', author: 'Ravi Kumar' },
    { id: 'd2', service: 'payment-gateway', project: 'E-Commerce', projectId: 'ecommerce', environment: 'staging', status: 'in-progress', version: 'v3.1.0-rc1', time: '28m ago', author: 'Vikram Singh' },
    { id: 'd3', service: 'ml-pipeline', project: 'AI Analytics', projectId: 'ai-analytics', environment: 'production', status: 'failed', version: 'v1.8.0', time: '1h ago', author: 'Arjun Nair' },
    { id: 'd4', service: 'employee-portal', project: 'HRMS System', projectId: 'hrms', environment: 'production', status: 'success', version: 'v4.0.2', time: '2h ago', author: 'Sneha Reddy' },
    { id: 'd5', service: 'cart-service', project: 'E-Commerce', projectId: 'ecommerce', environment: 'production', status: 'rolled-back', version: 'v3.0.8', time: '4h ago', author: 'Vikram Singh' },
    { id: 'd6', service: 'fraud-detection', project: 'Banking App', projectId: 'banking', environment: 'staging', status: 'success', version: 'v1.2.5', time: '5h ago', author: 'Ravi Kumar' },
];

export function getFilteredDeployments(projectId: string): Deployment[] {
    return projectId === 'all' ? allDeployments : allDeployments.filter(d => d.projectId === projectId);
}
