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
    | 'access-control'
    | 'admin';

export const ROLE_PERMISSIONS: Record<UserRole, Feature[]> = {
    ORG: [
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
        'admin',
    ],
    MARKET: [
        'dashboard',
        'drilldown',
        'teams',
        'metrics',
        'sla',
        'reports',
        'notifications',
        'settings',
    ],
    ACCOUNT: [
        'dashboard',
        'drilldown',
        'teams',
        'metrics',
        'sla',
        'reports',
        'notifications',
        'settings',
    ],
    PROJECT: [
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
    PROJECT_MANAGER: [
        'dashboard',
        'projects',
        'drilldown',
        'teams',
        'metrics',
        'sla',
        'reports',
        'notifications',
        'settings',
        'admin',
    ],
    TEAM_LEAD: [
        'dashboard',
        'teams',
        'metrics',
        'notifications',
        'settings',
        'admin',
    ],
    TEAM: [
        'dashboard',
        'teams',
        'metrics',
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
    '/onboard/manager': 'teams',
    '/onboard/team-lead': 'teams',
    '/onboard/employee': 'teams',
    '/admin': 'admin',
};

export function canAccess(role: UserRole, feature: Feature): boolean {
    return ROLE_PERMISSIONS[role].includes(feature);
}

export function getPermittedFeatures(role: UserRole): Feature[] {
    return ROLE_PERMISSIONS[role];
}
