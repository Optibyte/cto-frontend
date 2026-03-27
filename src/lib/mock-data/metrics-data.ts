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
        id: 'stories_planned',
        name: 'Stories Planned',
        type: 'integer',
        min: 0,
        max: 500,
        description: 'Total number of stories planned for the sprint',
        thresholds: { red: 5, amber: 10, green: 15 },
    },
    {
        id: 'stories_delivered',
        name: 'Stories Delivered',
        type: 'integer',
        min: 0,
        max: 500,
        description: 'Total number of stories delivered in the sprint',
        thresholds: { red: 5, amber: 10, green: 15 },
    },
    {
        id: 'stories_added',
        name: 'Stories Added',
        type: 'integer',
        min: 0,
        max: 100,
        description: 'Stories added to the sprint after it started',
        thresholds: { red: 10, amber: 5, green: 2 }, // Lower is better
    },
    {
        id: 'stories_removed',
        name: 'Stories Removed',
        type: 'integer',
        min: 0,
        max: 100,
        description: 'Stories removed from the sprint after it started',
        thresholds: { red: 10, amber: 5, green: 2 }, // Lower is better
    },
    {
        id: 'stories_changed',
        name: 'Stories Changed',
        type: 'integer',
        min: 0,
        max: 100,
        description: 'Stories whose scope changed during the sprint',
        thresholds: { red: 10, amber: 5, green: 2 }, // Lower is better
    },
    {
        id: 'stories_accepted_by_po',
        name: 'Stories Accepted by PO',
        type: 'integer',
        min: 0,
        max: 500,
        description: 'Stories formally accepted by the Product Owner',
        thresholds: { red: 5, amber: 10, green: 15 },
    },
    {
        id: 'employee_capacity_hours',
        name: 'Employee Capacity Hours',
        type: 'integer',
        min: 0,
        max: 2000,
        description: 'Total available capacity in hours for the team member',
        thresholds: { red: 100, amber: 140, green: 160 },
    },
    {
        id: 'effort_spent_hours',
        name: 'Effort Spent Hours',
        type: 'integer',
        min: 0,
        max: 2000,
        description: 'Total effort spent in hours by the team member',
        thresholds: { red: 100, amber: 140, green: 160 },
    },
    {
        id: 'qa_defects',
        name: 'QA Defects',
        type: 'integer',
        min: 0,
        max: 200,
        description: 'Defects found during QA phase',
        thresholds: { red: 10, amber: 5, green: 1 }, // Lower is better
    },
    {
        id: 'client_defects',
        name: 'Client Defects',
        type: 'integer',
        min: 0,
        max: 100,
        description: 'Defects reported by the client (UAT/Prod)',
        thresholds: { red: 5, amber: 2, green: 0 }, // Lower is better
    },
    {
        id: 'defects_rejected',
        name: 'Defects Rejected',
        type: 'integer',
        min: 0,
        max: 100,
        description: 'Number of reported defects that were rejected as "Not a Bug"',
        thresholds: { red: 10, amber: 5, green: 2 }, // Lower is better
    },
    {
        id: 'defects_reopened',
        name: 'Defects Reopened',
        type: 'integer',
        min: 0,
        max: 100,
        description: 'Number of defects that were reopened after being marked fixed',
        thresholds: { red: 5, amber: 2, green: 0 }, // Lower is better
    },
    {
        id: 'review_comments',
        name: 'Review Comments',
        type: 'integer',
        min: 0,
        max: 500,
        description: 'Total number of comments received during code reviews',
        thresholds: { red: 30, amber: 20, green: 10 }, // Lower is better
    },
    {
        id: 'test_cases_created',
        name: 'Test Cases Created',
        type: 'integer',
        min: 0,
        max: 500,
        description: 'New test cases created during the cycle',
        thresholds: { red: 5, amber: 10, green: 20 },
    },
    {
        id: 'automation_test_cases_created',
        name: 'Automation Test Cases Created',
        type: 'integer',
        min: 0,
        max: 200,
        description: 'New automation test cases created',
        thresholds: { red: 2, amber: 5, green: 10 },
    },
    {
        id: 'test_cases_planned',
        name: 'Test Cases Planned',
        type: 'integer',
        min: 0,
        max: 500,
        description: 'Total test cases planned for execution',
        thresholds: { red: 5, amber: 10, green: 20 },
    },
    {
        id: 'test_cases_executed',
        name: 'Test Cases Executed',
        type: 'integer',
        min: 0,
        max: 500,
        description: 'Total test cases executed',
        thresholds: { red: 5, amber: 10, green: 20 },
    },
    {
        id: 'static_code_violations',
        name: 'Static Code Violations',
        type: 'integer',
        min: 0,
        max: 1000,
        description: 'Issues found by static code analysis tools',
        thresholds: { red: 50, amber: 20, green: 0 }, // Lower is better
    },
    {
        id: 'unit_test_coverage',
        name: 'Unit Test Coverage',
        type: 'percentage',
        min: 0,
        max: 100,
        description: 'Percentage of code covered by unit tests',
        thresholds: { red: 60, amber: 75, green: 85 },
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

// ── Calculated Metric Formulas ───────────────────────
export interface CalculatedMetricFormula {
    id: string;
    name: string;
    category: string;
    uom: string;
    formula: string;
    indicator: 'Higher is better' | 'Lower is better';
    calculate: (values: Record<string, number>, teamSize: number) => number;
}

export const CALCULATED_METRIC_FORMULAS: CalculatedMetricFormula[] = [
    {
        id: 'productivity',
        name: 'Productivity',
        category: 'Productivity',
        uom: 'Productivity',
        formula: 'stories_accepted_by_po / employee_capacity_hours',
        indicator: 'Higher is better',
        calculate: (v) => (v.stories_accepted_by_po || 0) / (v.employee_capacity_hours || 1),
    },
    {
        id: 'done_to_said',
        name: 'Done to Said Ratio',
        category: 'Project Management',
        uom: 'Ratio',
        formula: 'stories_delivered / stories_planned',
        indicator: 'Higher is better',
        calculate: (v) => (v.stories_delivered || 0) / (v.stories_planned || 1),
    },
    {
        id: 'sprint_velocity',
        name: 'Sprint Velocity',
        category: 'Productivity',
        uom: 'Story Points',
        formula: 'stories_delivered',
        indicator: 'Higher is better',
        calculate: (v) => v.stories_delivered || 0,
    },
    {
        id: 'velocity_per_person',
        name: 'Sprint Velocity per Person',
        category: 'Productivity',
        uom: 'Story Points per Person',
        formula: 'stories_delivered / team_size',
        indicator: 'Higher is better',
        calculate: (v, size) => (v.stories_delivered || 0) / (size || 1),
    },
    {
        id: 'defect_density',
        name: 'Defect Density (Story Point)',
        category: 'Quality',
        uom: 'Defects per Story Point',
        formula: '(review_comments + qa_defects) / stories_delivered',
        indicator: 'Lower is better',
        calculate: (v) => ((v.review_comments || 0) + (v.qa_defects || 0)) / (v.stories_delivered || 1),
    },
    {
        id: 'defect_leakage',
        name: 'Defect Leakage to Client',
        category: 'Quality',
        uom: 'Percentage',
        formula: 'client_defects / (qa_defects + client_defects) * 100',
        indicator: 'Lower is better',
        calculate: (v) => ((v.client_defects || 0) / ((v.qa_defects || 0) + (v.client_defects || 0) || 1)) * 100,
    },
    {
        id: 'resource_utilization',
        name: 'Resource Utilization',
        category: 'Project Management',
        uom: 'Percentage',
        formula: 'effort_spent_hours / employee_capacity_hours * 100',
        indicator: 'Higher is better',
        calculate: (v) => ((v.effort_spent_hours || 0) / (v.employee_capacity_hours || 1)) * 100,
    },
    {
        id: 'requirement_stability',
        name: 'Requirement Stability Index',
        category: 'Project Management',
        uom: 'Percentage',
        formula: '(stories_added + stories_removed + stories_changed) / stories_planned * 100',
        indicator: 'Lower is better',
        calculate: (v) => (((v.stories_added || 0) + (v.stories_removed || 0) + (v.stories_changed || 0)) / (v.stories_planned || 1)) * 100,
    },
];

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
