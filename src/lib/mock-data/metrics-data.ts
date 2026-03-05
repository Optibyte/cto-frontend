// ────────────────────────────────────────────────────────────
// Mock data for the full Metrics system
// ────────────────────────────────────────────────────────────

// ── Predefined Manual Metric Definitions ──────────────────
export interface ManualMetricDef {
    id: string;
    name: string;
    type: 'rating' | 'percentage';
    min: number;
    max: number;
    description: string;
    thresholds: { red: number; amber: number; green: number };
}

export const PREDEFINED_MANUAL_METRICS: ManualMetricDef[] = [
    {
        id: 'mm-1',
        name: 'Communication',
        type: 'rating',
        min: 1,
        max: 5,
        description: 'Quality of communication',
        thresholds: { red: 2, amber: 3, green: 4 },
    },
    {
        id: 'mm-2',
        name: 'Learning Level',
        type: 'rating',
        min: 1,
        max: 5,
        description: 'Skill improvement over time',
        thresholds: { red: 2, amber: 3, green: 4 },
    },
    {
        id: 'mm-3',
        name: 'Client Interaction',
        type: 'rating',
        min: 1,
        max: 10,
        description: 'Client-facing effectiveness',
        thresholds: { red: 4, amber: 6, green: 7 },
    },
    {
        id: 'mm-4',
        name: 'Initiative',
        type: 'rating',
        min: 1,
        max: 5,
        description: 'Proactive behavior',
        thresholds: { red: 2, amber: 3, green: 4 },
    },
    {
        id: 'mm-5',
        name: 'Documentation Quality',
        type: 'percentage',
        min: 0,
        max: 100,
        description: 'Documentation completeness',
        thresholds: { red: 40, amber: 65, green: 80 },
    },
    {
        id: 'mm-6',
        name: 'Technical Excellence',
        type: 'rating',
        min: 1,
        max: 5,
        description: 'Code quality and architecture contribution',
        thresholds: { red: 2, amber: 3, green: 4 },
    },
    {
        id: 'mm-7',
        name: 'Team Collaboration',
        type: 'rating',
        min: 1,
        max: 5,
        description: 'Effectiveness in working with team members',
        thresholds: { red: 2, amber: 3, green: 4 },
    },
    {
        id: 'mm-8',
        name: 'Delivery Reliability',
        type: 'percentage',
        min: 0,
        max: 100,
        description: 'Percentage of commitments met on time',
        thresholds: { red: 60, amber: 80, green: 90 },
    },
    {
        id: 'mm-9',
        name: 'Problem Solving',
        type: 'rating',
        min: 1,
        max: 5,
        description: 'Ability to resolve complex technical issues',
        thresholds: { red: 2, amber: 3, green: 4 },
    },
];

// ── Member Metric Values ──────────────────────────────────
export interface MemberMetricValue {
    metricId: string;
    value: number;
}

export interface MemberWithMetrics {
    id: string;
    name: string;
    role: string;
    avatar: string;
    team: string;
    metrics: MemberMetricValue[];
}

export const MEMBERS_WITH_METRICS: MemberWithMetrics[] = [
    {
        id: 'u1',
        name: 'Rahul Sharma',
        role: 'TEAM',
        avatar: 'RS',
        team: 'Backend',
        metrics: [
            { metricId: 'mm-1', value: 4 },
            { metricId: 'mm-2', value: 3 },
            { metricId: 'mm-3', value: 7 },
            { metricId: 'mm-4', value: 5 },
            { metricId: 'mm-5', value: 78 },
            { metricId: 'mm-6', value: 4 },
            { metricId: 'mm-7', value: 5 },
            { metricId: 'mm-8', value: 85 },
            { metricId: 'mm-9', value: 4 },
        ],
    },
    {
        id: 'u2',
        name: 'Priya Patel',
        role: 'TEAM',
        avatar: 'PP',
        team: 'UI/UX',
        metrics: [
            { metricId: 'mm-1', value: 5 },
            { metricId: 'mm-2', value: 4 },
            { metricId: 'mm-3', value: 9 },
            { metricId: 'mm-4', value: 4 },
            { metricId: 'mm-5', value: 92 },
            { metricId: 'mm-6', value: 5 },
            { metricId: 'mm-7', value: 4 },
            { metricId: 'mm-8', value: 95 },
            { metricId: 'mm-9', value: 5 },
        ],
    },
    {
        id: 'u3',
        name: 'Amit Kumar',
        role: 'TEAM',
        avatar: 'AK',
        team: 'Backend',
        metrics: [
            { metricId: 'mm-1', value: 3 },
            { metricId: 'mm-2', value: 2 },
            { metricId: 'mm-3', value: 5 },
            { metricId: 'mm-4', value: 3 },
            { metricId: 'mm-5', value: 55 },
            { metricId: 'mm-6', value: 3 },
            { metricId: 'mm-7', value: 3 },
            { metricId: 'mm-8', value: 70 },
            { metricId: 'mm-9', value: 3 },
        ],
    },
    {
        id: 'u4',
        name: 'Sneha Reddy',
        role: 'TEAM',
        avatar: 'SR',
        team: 'QA',
        metrics: [
            { metricId: 'mm-1', value: 4 },
            { metricId: 'mm-2', value: 5 },
            { metricId: 'mm-3', value: 8 },
            { metricId: 'mm-4', value: 4 },
            { metricId: 'mm-5', value: 85 },
            { metricId: 'mm-6', value: 4 },
            { metricId: 'mm-7', value: 5 },
            { metricId: 'mm-8', value: 92 },
            { metricId: 'mm-9', value: 4 },
        ],
    },
    {
        id: 'u5',
        name: 'Vikram Singh',
        role: 'TEAM',
        avatar: 'VS',
        team: 'DevOps',
        metrics: [
            { metricId: 'mm-1', value: 2 },
            { metricId: 'mm-2', value: 3 },
            { metricId: 'mm-3', value: 4 },
            { metricId: 'mm-4', value: 2 },
            { metricId: 'mm-5', value: 38 },
            { metricId: 'mm-6', value: 2 },
            { metricId: 'mm-7', value: 2 },
            { metricId: 'mm-8', value: 45 },
            { metricId: 'mm-9', value: 2 },
        ],
    },
];

// ── Dynamic / Custom Metric Definitions (Story 3) ────────
export interface CustomMetricDef {
    id: string;
    name: string;
    valueType: 'integer' | 'decimal' | 'percentage' | 'rating' | 'boolean';
    min: number;
    max: number;
    category: string;
    editableBy: string[];
    visibleTo: string[];
    thresholds: { red: number; amber: number; green: number };
    createdAt: string;
}

export const CUSTOM_METRIC_DEFINITIONS: CustomMetricDef[] = [
    {
        id: 'cm-1',
        name: 'Innovation Contribution',
        valueType: 'rating',
        min: 1,
        max: 5,
        category: 'Performance',
        editableBy: ['PROJECT', 'ORG'],
        visibleTo: ['All'],
        thresholds: { red: 2, amber: 3.5, green: 3.5 },
        createdAt: '2026-01-15T10:00:00Z',
    },
    {
        id: 'cm-2',
        name: 'Code Review Thoroughness',
        valueType: 'percentage',
        min: 0,
        max: 100,
        category: 'Engineering',
        editableBy: ['PROJECT', 'ORG'],
        visibleTo: ['All'],
        thresholds: { red: 40, amber: 60, green: 80 },
        createdAt: '2026-01-20T14:30:00Z',
    },
    {
        id: 'cm-3',
        name: 'On-Call Responsiveness',
        valueType: 'decimal',
        min: 0,
        max: 60,
        category: 'Operations',
        editableBy: ['ORG'],
        visibleTo: ['PROJECT', 'ORG'],
        thresholds: { red: 30, amber: 15, green: 10 },
        createdAt: '2026-02-01T09:00:00Z',
    },
];

// ── Calculated Metrics (Story 4) ──────────────────────────
export interface CalculatedMetricData {
    id: string;
    name: string;
    formula: string;
    value: number;
    unit: string;
    description: string;
    breakdown?: Record<string, number | string>;
}

export const CALCULATED_METRICS: CalculatedMetricData[] = [
    {
        id: 'calc-1',
        name: 'Absenteeism %',
        formula: '(Days Absent / Total Working Days) × 100',
        value: 10,
        unit: '%',
        description: 'Percentage of working days absent',
        breakdown: { 'Days Absent': 2, 'Total Working Days': 20 },
    },
    {
        id: 'calc-2',
        name: 'Delivery Velocity',
        formula: 'Story Points Delivered / Sprint Duration (weeks)',
        value: 24,
        unit: 'pts/sprint',
        description: 'Story points delivered per sprint',
        breakdown: { 'Story Points': 24, 'Sprint Duration': '2 weeks' },
    },
    {
        id: 'calc-3',
        name: 'Bug Fix Rate',
        formula: '(Bugs Fixed / Bugs Reported) × 100',
        value: 87,
        unit: '%',
        description: 'Percentage of reported bugs that were fixed',
        breakdown: { 'Bugs Fixed': 26, 'Bugs Reported': 30 },
    },
];

export interface TimePerProduct {
    memberId: string;
    memberName: string;
    products: { name: string; hours: number }[];
}

export const TIME_PER_PRODUCT: TimePerProduct[] = [
    {
        memberId: 'u1',
        memberName: 'Rahul Sharma',
        products: [
            { name: 'Product A', hours: 42 },
            { name: 'Product B', hours: 18 },
        ],
    },
    {
        memberId: 'u2',
        memberName: 'Priya Patel',
        products: [
            { name: 'Product A', hours: 30 },
            { name: 'Product B', hours: 28 },
            { name: 'Product C', hours: 2 },
        ],
    },
    {
        memberId: 'u3',
        memberName: 'Amit Kumar',
        products: [
            { name: 'Product B', hours: 50 },
            { name: 'Product C', hours: 10 },
        ],
    },
];

// ── Integrated Metrics — GitHub (Story 5) ─────────────────
export interface IntegrationMetricData {
    id: string;
    name: string;
    value: number;
    unit: string;
    source: 'github' | 'jira';
    lastSynced: string;
    syncError?: string;
}

export const GITHUB_METRICS: IntegrationMetricData[] = [
    { id: 'gh-1', name: 'PR Merge Time', value: 2.4, unit: 'days', source: 'github', lastSynced: '2026-02-21T09:15:00Z' },
    { id: 'gh-2', name: 'Code Review Delay', value: 8, unit: 'hrs', source: 'github', lastSynced: '2026-02-21T09:15:00Z' },
    { id: 'gh-3', name: 'Commit Frequency', value: 12, unit: 'commits/week', source: 'github', lastSynced: '2026-02-21T09:15:00Z' },
    { id: 'gh-4', name: 'PR Rejection Rate', value: 15, unit: '%', source: 'github', lastSynced: '2026-02-21T09:15:00Z' },
];

export const JIRA_METRICS: IntegrationMetricData[] = [
    { id: 'jr-1', name: 'SLA Adherence', value: 87, unit: '%', source: 'jira', lastSynced: '2026-02-21T08:45:00Z' },
    { id: 'jr-2', name: 'Story Completion', value: 92, unit: '%', source: 'jira', lastSynced: '2026-02-21T08:45:00Z' },
    { id: 'jr-3', name: 'Reopen Rate', value: 6, unit: '%', source: 'jira', lastSynced: '2026-02-21T08:45:00Z' },
    { id: 'jr-4', name: 'Escalation Count', value: 3, unit: '', source: 'jira', lastSynced: '2026-02-21T08:45:00Z' },
];

// ── Audit / Data Logging (Story 6) ───────────────────────
export interface MetricAuditEntry {
    id: string;
    entity: string;
    metric: string;
    oldValue: string;
    newValue: string;
    updatedBy: string;
    timestamp: string;
    source: 'Manual' | 'Jira Sync' | 'GitHub Sync';
    syncBatchId?: string;
}

export const METRIC_AUDIT_LOG: MetricAuditEntry[] = [
    {
        id: 'log-1',
        entity: 'Rahul Sharma',
        metric: 'Communication',
        oldValue: '3',
        newValue: '4',
        updatedBy: 'TL — Ankit Verma',
        timestamp: '2026-02-21T10:30:00Z',
        source: 'Manual',
    },
    {
        id: 'log-2',
        entity: 'Rahul Sharma',
        metric: 'Initiative',
        oldValue: '4',
        newValue: '5',
        updatedBy: 'Manager — Deepa Nair',
        timestamp: '2026-02-20T14:10:00Z',
        source: 'Manual',
    },
    {
        id: 'log-3',
        entity: 'System',
        metric: 'SLA Adherence',
        oldValue: '90%',
        newValue: '87%',
        updatedBy: 'System',
        timestamp: '2026-02-21T08:45:00Z',
        source: 'Jira Sync',
        syncBatchId: 'jira-sync-2026-02-21-001',
    },
    {
        id: 'log-4',
        entity: 'System',
        metric: 'PR Merge Time',
        oldValue: '2.8 days',
        newValue: '2.4 days',
        updatedBy: 'System',
        timestamp: '2026-02-21T09:15:00Z',
        source: 'GitHub Sync',
        syncBatchId: 'gh-sync-2026-02-21-002',
    },
    {
        id: 'log-5',
        entity: 'Priya Patel',
        metric: 'Documentation Quality',
        oldValue: '88%',
        newValue: '92%',
        updatedBy: 'TL — Ankit Verma',
        timestamp: '2026-02-19T16:00:00Z',
        source: 'Manual',
    },
    {
        id: 'log-6',
        entity: 'System',
        metric: 'Story Completion',
        oldValue: '89%',
        newValue: '92%',
        updatedBy: 'System',
        timestamp: '2026-02-21T08:45:00Z',
        source: 'Jira Sync',
        syncBatchId: 'jira-sync-2026-02-21-001',
    },
    {
        id: 'log-7',
        entity: 'Amit Kumar',
        metric: 'Learning Level',
        oldValue: '3',
        newValue: '2',
        updatedBy: 'Manager — Deepa Nair',
        timestamp: '2026-02-18T11:25:00Z',
        source: 'Manual',
    },
    {
        id: 'log-8',
        entity: 'System',
        metric: 'Commit Frequency',
        oldValue: '10 commits/week',
        newValue: '12 commits/week',
        updatedBy: 'System',
        timestamp: '2026-02-21T09:15:00Z',
        source: 'GitHub Sync',
        syncBatchId: 'gh-sync-2026-02-21-002',
    },
];
