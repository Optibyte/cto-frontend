export const METRIC_TYPES = [
    { value: 'velocity', label: 'Velocity' },
    { value: 'quality', label: 'Quality Score' },
    { value: 'throughput', label: 'Throughput' },
    { value: 'cycle_time', label: 'Cycle Time' },
    { value: 'lead_time', label: 'Lead Time' },
    { value: 'bug_rate', label: 'Bug Rate' },
    { value: 'deployment_frequency', label: 'Deployment Frequency' },
    { value: 'mttr', label: 'Mean Time to Recovery' },
    { value: 'change_failure_rate', label: 'Change Failure Rate' },
] as const;

export const SOURCE_TYPES = [
    { value: 'jira', label: 'Jira' },
    { value: 'github', label: 'GitHub' },
    { value: 'csv', label: 'CSV Import' },
    { value: 'manual', label: 'Manual Entry' },
] as const;

export const USER_ROLES = [
    { value: 'CTO', label: 'CTO' },
    { value: 'Manager', label: 'Manager' },
    { value: 'TeamLead', label: 'Team Lead' },
    { value: 'Employee', label: 'Employee' },
] as const;

export const SLA_STATUSES = [
    { value: 'met', label: 'Met', color: 'text-green-500' },
    { value: 'at_risk', label: 'At Risk', color: 'text-yellow-500' },
    { value: 'missed', label: 'Missed', color: 'text-red-500' },
] as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
