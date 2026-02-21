import { UserRole } from './types';

export type Feature =
    | 'dashboard'
    | 'drilldown'
    | 'teams'
    | 'metrics'
    | 'sla'
    | 'reports'
    | 'integrations'
    | 'import'
    | 'notifications'
    | 'audit'
    | 'settings';

export const ROLE_PERMISSIONS: Record<UserRole, Feature[]> = {
    CTO: [
        'dashboard',
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
    ],
    Manager: [
        'dashboard',
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
};

// Map sidebar href to feature key
export const ROUTE_FEATURE_MAP: Record<string, Feature> = {
    '/': 'dashboard',
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
};

export function canAccess(role: UserRole, feature: Feature): boolean {
    return ROLE_PERMISSIONS[role].includes(feature);
}

export function getPermittedFeatures(role: UserRole): Feature[] {
    return ROLE_PERMISSIONS[role];
}
