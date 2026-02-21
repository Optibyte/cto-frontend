// User types
export type UserRole = 'CTO' | 'Manager' | 'TeamLead' | 'Employee';

export interface User {
    id: string;
    name?: string;           // For mock data compatibility
    fullName?: string;       // From backend API
    email: string;
    role: UserRole;
    avatar?: string;         // For mock data compatibility
    avatarUrl?: string;      // From backend API
}

// Team types
export interface Team {
    id: string;
    name: string;
    description?: string;
    teamLead: User;
    memberCount: number;
    performance: number;
    isActive: boolean;
    parentTeamId?: string | null;
    accountId: string;
    createdAt: Date;
}

export interface TeamMember {
    id: string;
    teamId: string;
    user: User;
    roleInTeam: string;
    joinedAt: Date;
}

// Metric types
export type MetricType =
    | 'velocity'
    | 'quality'
    | 'throughput'
    | 'cycle_time'
    | 'lead_time'
    | 'bug_rate'
    | 'deployment_frequency'
    | 'mttr'
    | 'change_failure_rate';

export type SourceType = 'jira' | 'github' | 'csv' | 'manual';

export interface Metric {
    id: string;
    time: string;
    teamId: string;
    teamName: string;
    metricType: MetricType;
    value: number;
    unit: string;
    source: SourceType;
}

// SLA types
export type SLAStatus = 'met' | 'at_risk' | 'missed';
export type BreachSeverity = 'warning' | 'critical';

export interface SLADefinition {
    id: string;
    name: string;
    description?: string;
    teamId: string;
    teamName: string;
    metricType: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    thresholdWarning: number;
    thresholdCritical: number;
    status: SLAStatus;
    breachCount: number;
    isActive: boolean;
}

export interface SLABreach {
    id: string;
    slaId: string;
    slaName: string;
    teamId: string;
    breachStart: Date;
    breachEnd: Date | null;
    severity: BreachSeverity;
    actualValue: number;
    targetValue: number;
    variance: number;
    isResolved: boolean;
}

// Dashboard types
export interface KPIData {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
    sparkline: number[];
}

export interface TeamPerformanceData {
    team: string;
    score: number;
    members: number;
    velocity: number;
    quality: number;
}

export interface DashboardSLAStatus {
    met: number;
    atRisk: number;
    missed: number;
}

export interface Activity {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: Date;
    user?: User;
    severity?: 'info' | 'warning' | 'error';
}
