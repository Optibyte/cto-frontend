export type UserRole = 'ORG' | 'MARKET' | 'ACCOUNT' | 'PROJECT_MANAGER' | 'PROJECT' | 'TEAM_LEAD' | 'TEAM' | 'MEMBER' | 'CTO';

export interface User {
    id: string;
    name?: string;           // For mock data compatibility
    fullName?: string;       // From backend API
    email: string;
    role: UserRole;
    avatar?: string;         // For mock data compatibility
    avatarUrl?: string;      // From backend API
    githubEmail?: string;
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
    name: string;
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

export interface LeadTimeTrendData {
    name: string;
    leadTime: number;
    mttr: number;
}

export interface WorkDistributionData {
    name: string;
    value: number;
    color: string;
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

// Learning Metric types
export interface LearningMetric {
    id: string;
    name: string;
    category: string;
    value: number;
    target: number;
    unit: string;
    trend: 'up' | 'down' | 'neutral';
    sparkline: number[];
}

// Metric Definition types (for creating new metrics)
export type MetricClass = 'A' | 'B' | 'C';
export type UpdateFrequency = 'daily' | 'weekly' | 'monthly';
export type MetricDataType = 'int' | 'float' | 'string' | 'boolean' | 'percentage';

export interface MetricDefinition {
    id: string;
    name: string;
    metricType: string;
    metricClass: MetricClass;
    threshold: number;
    updateFrequency: UpdateFrequency;
    rangeMin: number;
    rangeMax: number;
    account: string;
    market: string;
    project: string;
    team: string;
    createdAt: Date;
}

// Extended Team Member with full metadata
export interface TeamMemberFull {
    id: string;
    employeeId: string;
    name: string;
    employeeName?: string;
    email: string;
    role: string;
    dateOfBirth?: string;
    dob?: string;
    yearsOfExperience: number;
    experience?: number;
    skills: string[];
    technology?: string;
    currentProject?: string;
    teamName?: string;
    teamId?: string;
    productName?: string;
    productId?: string;
    onboardedDate?: string;
    teamJoinDate?: string;
    project?: string;
    status: string;
}

export interface ManagerFull {
    id: string;
    name: string;
    fullName?: string;
    email: string;
    project: string;
    employeeCode?: string;
    experience?: string;
    onboardedDate: string;
    teamSize: number;
    activeProjects: number;
    status: 'Active' | 'Inactive';
    avatar?: string;
}

export interface TeamLeadFull {
    id: string;
    name: string;
    fullName?: string;
    email: string;
    project: string;
    employeeCode?: string;
    experience?: string;
    onboardedDate: string;
    teamSize: number;
    performance: number;
    status: 'Active' | 'Inactive';
    avatar?: string;
}
export interface ProjectFull {
    id: string;
    name: string;
    startDate: string;
    enddate: string;
    teamSize: number;
    progress: number;
    status: 'Active' | 'Completed' | 'Delayed' | 'On-Hold' | 'PLANNED';
}
