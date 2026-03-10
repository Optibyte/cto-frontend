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
    { value: 'performance_analysis', label: 'Performance Analysis' },
    { value: 'git_activity', label: 'Git Activity' },
    { value: 'jira_activity', label: 'Jira Activity' },
] as const;

export const SOURCE_TYPES = [
    { value: 'jira', label: 'Jira' },
    { value: 'github', label: 'GitHub' },
    { value: 'csv', label: 'CSV Import' },
    { value: 'manual', label: 'Manual Entry' },
] as const;

export const METRIC_VALUE_TYPES = [
    { value: 'integer', label: 'Integer' },
    { value: 'decimal', label: 'Decimal' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'rating', label: 'Rating' },
    { value: 'boolean', label: 'Boolean' },
] as const;

export const METRIC_CATEGORIES = [
    { value: 'performance', label: 'Performance' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'operations', label: 'Operations' },
    { value: 'collaboration', label: 'Collaboration' },
    { value: 'quality', label: 'Quality' },
] as const;

export const USER_ROLES = [
    { value: 'ORG', label: 'Organization' },
    { value: 'MARKET', label: 'Market' },
    { value: 'ACCOUNT', label: 'Account' },
    { value: 'PROJECT', label: 'Project' },
    { value: 'TEAM', label: 'Team' },
] as const;

export const METRIC_CLASSES = [
    { value: 'A', label: 'Class A – Critical' },
    { value: 'B', label: 'Class B – Important' },
    { value: 'C', label: 'Class C – Standard' },
] as const;

export const UPDATE_FREQUENCIES = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
] as const;

export const METRIC_DATA_TYPES = [
    { value: 'int', label: 'Integer' },
    { value: 'float', label: 'Float' },
    { value: 'string', label: 'String' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'percentage', label: 'Percentage' },
] as const;

export const MOCK_ACCOUNTS = [
    { id: 'acc-1', name: 'Optibyte Solutions' },
    { id: 'acc-2', name: 'TechCorp Inc.' },
    { id: 'acc-3', name: 'DataFlow Systems' },
] as const;

export const MOCK_MARKETS = [
    { id: 'mkt-1', name: 'North America' },
    { id: 'mkt-2', name: 'Europe' },
    { id: 'mkt-3', name: 'Asia Pacific' },
] as const;

export const MOCK_PRODUCTS = [
    { id: 'prod-1', name: 'Platform Core' },
    { id: 'prod-2', name: 'Analytics Suite' },
    { id: 'prod-3', name: 'Mobile App' },
] as const;

export const MOCK_MANAGERS = [
    { id: 'mgr-1', name: 'Alice Thompson' },
    { id: 'mgr-2', name: 'Robert Wilson' },
    { id: 'mgr-3', name: 'Sarah Parker' },
] as const;

export const MOCK_TEAM_LEADS = [
    { id: 'tl-1', name: 'James Cook' },
    { id: 'tl-2', name: 'Elena Rodriguez' },
    { id: 'tl-3', name: 'Michael Chen' },
] as const;

export const TEAM_NAMES = [
    { value: 'Frontend', label: 'Frontend' },
    { value: 'Backend', label: 'Backend' },
    { value: 'Fullstack', label: 'Fullstack' },
    { value: 'DevOps', label: 'DevOps' },
    { value: 'QA / Testing', label: 'QA / Testing' },
    { value: 'Mobile (iOS / Android / Flutter / React Native)', label: 'Mobile (iOS / Android / Flutter / React Native)' },
    { value: 'UI/UX Design', label: 'UI/UX Design' },
    { value: 'Data Engineering', label: 'Data Engineering' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'Machine Learning / AI', label: 'Machine Learning / AI' },
    { value: 'Cloud Engineering', label: 'Cloud Engineering' },
    { value: 'Platform Engineering', label: 'Platform Engineering' },
    { value: 'SRE (Site Reliability Engineering)', label: 'SRE (Site Reliability Engineering)' },
    { value: 'Security Engineering', label: 'Security Engineering' },
    { value: 'Network Engineering', label: 'Network Engineering' },
] as const;

export const SLA_STATUSES = [
    { value: 'met', label: 'Met', color: 'text-green-500' },
    { value: 'at_risk', label: 'At Risk', color: 'text-yellow-500' },
    { value: 'missed', label: 'Missed', color: 'text-red-500' },
] as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
if (!process.env.NEXT_PUBLIC_API_URL) {
    console.warn('Warning: NEXT_PUBLIC_API_URL is not defined. Falling back to http://localhost:4000');
}
