// ────────────────────────────────────────────────────────────
// Mock data for the full Metrics system
// ────────────────────────────────────────────────────────────

// ── Predefined Manual Metric Definitions ──────────────────
export interface ManualMetricDef {
    id: string;
    name: string;
    type: 'rating' | 'percentage' | 'integer';
    min: number;
    max: number;
    description: string;
    thresholds: { red: number; amber: number; green: number };
    dbId?: string;
    projectId?: string;
    teamId?: string;
    memberId?: string;
    metricClass?: string;
    updateFrequency?: string;
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
        metricClass: 'B',
        updateFrequency: 'weekly',
    },
    {
        id: 'mm-2',
        name: 'Learning Level',
        type: 'rating',
        min: 1,
        max: 5,
        description: 'Skill improvement over time',
        thresholds: { red: 2, amber: 3, green: 4 },
        metricClass: 'B',
        updateFrequency: 'weekly',
    },
    {
        id: 'mm-3',
        name: 'Client Interaction',
        type: 'rating',
        min: 1,
        max: 10,
        description: 'Client-facing effectiveness',
        thresholds: { red: 4, amber: 6, green: 7 },
        metricClass: 'A',
        updateFrequency: 'monthly',
    },
    {
        id: 'mm-4',
        name: 'Initiative',
        type: 'rating',
        min: 1,
        max: 5,
        description: 'Proactive behavior',
        thresholds: { red: 2, amber: 3, green: 4 },
        metricClass: 'C',
        updateFrequency: 'weekly',
    },
    {
        id: 'mm-5',
        name: 'Documentation Quality',
        type: 'percentage',
        min: 0,
        max: 100,
        description: 'Standard of technical documentation',
        thresholds: { red: 60, amber: 75, green: 85 },
        metricClass: 'B',
        updateFrequency: 'monthly',
    },
];

export const MEMBERS_WITH_METRICS = [
    {
        id: 'emp-1',
        name: 'Sagar M',
        role: 'Fullstack Developer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sagar',
        metrics: [
            { metricId: 'mm-1', value: 4, id: 'rec-1' },
            { metricId: 'mm-2', value: 3, id: 'rec-2' },
            { metricId: 'mm-5', value: 82, id: 'rec-3' },
        ]
    },
    {
        id: 'emp-2',
        name: 'Priya Sharma',
        role: 'Frontend Lead',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        metrics: [
            { metricId: 'mm-1', value: 5, id: 'rec-4' },
            { metricId: 'mm-3', value: 8, id: 'rec-5' },
            { metricId: 'mm-4', value: 4, id: 'rec-6' },
        ]
    }
];

export interface MemberMetricValue {
    metricId: string;
    value: number;
    id?: string;
}

export interface MemberWithMetrics {
    id: string;
    name: string;
    role: string;
    avatar: string;
    team?: string;
    teamId?: string;
    metrics: MemberMetricValue[];
}

export const CALCULATED_METRICS = [
    {
        id: 'cm-1',
        name: 'Sprint Efficiency',
        formula: '(Completed SP / Planned SP) * 100',
        description: 'Percentage of story points completed vs planned for the last 3 sprints',
        value: 94.2,
        unit: '%',
        breakdown: {
            'Sprint 12': '92%',
            'Sprint 13': '96%',
            'Sprint 14': '94.6%'
        }
    },
    {
        id: 'cm-2',
        name: 'Defect Rejection Rate',
        formula: '(Closed Bugs / Total Bugs) * 100',
        description: 'Rate at which reported defects are successfully resolved',
        value: 8.4,
        unit: '%',
        breakdown: {
            'P0 Bugs': 0,
            'P1 Bugs': 2,
            'P2 Bugs': 12
        }
    },
    {
        id: 'cm-3',
        name: 'Resource Utilization',
        formula: '(Billable Hours / Total Hours) * 100',
        description: 'Time spent on project-facing tasks vs total capacity',
        value: 78.5,
        unit: '%',
        breakdown: {
            'Product Dev': '62%',
            'Support': '16.5%',
            'Internal': '21.5%'
        }
    }
];

export const TIME_PER_PRODUCT = [
    {
        memberId: 'emp-1',
        memberName: 'Sagar M',
        products: [
            { name: 'Dashboard UI', hours: 24 },
            { name: 'API Services', hours: 12 },
            { name: 'Reporting', hours: 4 }
        ]
    },
    {
        memberId: 'emp-2',
        memberName: 'Priya Sharma',
        products: [
            { name: 'Dashboard UI', hours: 32 },
            { name: 'API Services', hours: 2 },
            { name: 'Documentation', hours: 6 }
        ]
    }
];

export interface CustomMetricDef {
    id: string;
    name: string;
    valueType: 'rating' | 'percentage' | 'integer' | 'boolean' | 'text';
    min: number;
    max: number;
    category: string;
    editableBy: string[];
    visibleTo: string[];
    thresholds: {
        red: number;
        amber: number;
        green: number;
    };
    createdAt: string;
}

export const CUSTOM_METRIC_DEFINITIONS: CustomMetricDef[] = [];
