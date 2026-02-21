import { KPIData, TeamPerformanceData, Activity } from '../types';

export const mockKPIData: Record<string, KPIData> = {
    velocity: {
        current: 245,
        previous: 218,
        change: 12.5,
        trend: 'up',
        sparkline: [220, 225, 230, 235, 240, 245, 250],
    },
    quality: {
        current: 94.2,
        previous: 96.3,
        change: -2.1,
        trend: 'down',
        sparkline: [96, 95, 94.5, 94, 94.2, 94.5, 94.2],
    },
    throughput: {
        current: 47,
        previous: 43,
        change: 8.3,
        trend: 'up',
        sparkline: [42, 43, 45, 46, 47, 48, 47],
    },
    cycleTime: {
        current: 28.5,
        previous: 33.5,
        change: -15.2,
        trend: 'down',
        sparkline: [35, 34, 32, 30, 29, 28, 28.5],
    },
};

export const mockTeamPerformance: TeamPerformanceData[] = [
    { team: 'Team Alpha', score: 92, members: 8, velocity: 245, quality: 96 },
    { team: 'Team Beta', score: 78, members: 6, velocity: 180, quality: 85 },
    { team: 'Team Gamma', score: 85, members: 10, velocity: 320, quality: 88 },
    { team: 'Team Delta', score: 65, members: 5, velocity: 140, quality: 72 },
    { team: 'Team Epsilon', score: 88, members: 7, velocity: 210, quality: 92 },
];

export const mockSLAStatus = {
    met: 12,
    atRisk: 3,
    missed: 1,
};

export const mockActivities: Activity[] = [
    {
        id: '1',
        type: 'metric_update',
        title: 'Velocity updated for Team Alpha',
        description: 'Sprint velocity increased to 245 points',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        user: { id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'Manager', avatar: '/avatars/john.jpg' },
    },
    {
        id: '2',
        type: 'sla_breach',
        title: 'SLA breach: Response Time exceeded',
        description: 'Average response time is 3.2 hours (target: 2 hours)',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        severity: 'warning',
    },
    {
        id: '3',
        type: 'integration_sync',
        title: 'Jira sync completed',
        description: 'Successfully synced 150 issues from Jira',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        user: { id: 'system', name: 'System', email: 'system@example.com', role: 'CTO' },
    },
    {
        id: '4',
        type: 'metric_update',
        title: 'Quality score updated for Team Gamma',
        description: 'Code quality improved to 88%',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        user: { id: 'u2', name: 'Jane Smith', email: 'jane@example.com', role: 'TeamLead', avatar: '/avatars/jane.jpg' },
    },
];
