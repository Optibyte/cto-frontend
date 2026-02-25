import { UserRole } from './types';

export type Feature =
    | 'dashboard'
    | 'projects'
    | 'drilldown'
    | 'teams'
    | 'metrics'
    | 'sla'
    | 'reports'
    | 'integrations'
    | 'import'
    | 'notifications'
    | 'audit'
    | 'settings'
    | 'access-control';

export const ROLE_PERMISSIONS: Record<UserRole, Feature[]> = {
    CTO: [
        'dashboard',
        'projects',
        'drilldown',
        'teams',
        'metrics',
        'sla',
        'reports',
        'integrations',
        'import',
        'notifications',
        'audit',
        'settings',
        'access-control',
    ],
    Manager: [
        'dashboard',
        'projects',
        'drilldown',
        'teams',
        'metrics',
        'sla',
        'reports',
        'notifications',
        'settings',
    ],
    TeamLead: [
        'dashboard',
        'teams',
        'metrics',
        'sla',
        'notifications',
        'settings',
    ],
    Employee: [
        'dashboard',
        'notifications',
        'settings',
    ],
    Market: [
        'dashboard',
        'drilldown',
        'teams',
        'metrics',
        'sla',
        'reports',
        'notifications',
        'settings',
    ],
    Accounts: [
        'dashboard',
        'drilldown',
        'teams',
        'metrics',
        'sla',
        'reports',
        'notifications',
        'settings',
    ],
};

// Map sidebar href to feature key
export const ROUTE_FEATURE_MAP: Record<string, Feature> = {
    '/': 'dashboard',
    '/projects': 'projects',
    '/drilldown': 'drilldown',
    '/teams': 'teams',
    '/metrics': 'metrics',
    '/sla': 'sla',
    '/reports': 'reports',
    '/integrations': 'integrations',
    '/import': 'import',
    '/notifications': 'notifications',
    '/audit': 'audit',
    '/settings': 'settings',
    '/access-control': 'access-control',
};

export function canAccess(role: UserRole, feature: Feature): boolean {
    return ROLE_PERMISSIONS[role].includes(feature);
}

export function getPermittedFeatures(role: UserRole): Feature[] {
    return ROLE_PERMISSIONS[role];
}
