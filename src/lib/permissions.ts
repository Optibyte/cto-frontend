import { UserRole } from './types';

export type Feature = string;

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    ORG: [
        'dashboard.view',
        'projects.view', 'projects.create', 'projects.edit', 'projects.drilldown',
        'teams.view', 'teams.create', 'teams.add_member', 'teams.manage',
        'metrics.view', 'metrics.create', 'metrics.edit', 'metrics.github',
        'reports.view', 'reports.export',
        'admin.access_control', 'admin.audit_logs', 'admin.integrations', 'admin.import', 'admin.console', 'admin.role_features'
    ],
    MARKET: ['dashboard.view', 'metrics.view'],
    ACCOUNT: ['dashboard.view', 'metrics.view'],
    PROJECT: ['dashboard.view', 'metrics.view'],
    PROJECT_MANAGER: ['dashboard.view', 'metrics.view'],
    TEAM_LEAD: ['dashboard.view', 'metrics.view'],
    TEAM: ['dashboard.view', 'metrics.view'],
    MEMBER: ['dashboard.view', 'metrics.view'],
    CTO: [
        'dashboard.view',
        'projects.view', 'projects.create', 'projects.edit', 'projects.drilldown',
        'teams.view', 'teams.create', 'teams.add_member', 'teams.manage',
        'metrics.view', 'metrics.create', 'metrics.edit', 'metrics.github',
        'reports.view', 'reports.export',
        'admin.access_control', 'admin.audit_logs', 'admin.integrations', 'admin.import', 'admin.console', 'admin.role_features'
    ],
};

// Map sidebar href to feature key
export const ROUTE_FEATURE_MAP: Record<string, string> = {
    '/': 'dashboard.view',
    '/projects': 'projects.view',
    '/drilldown': 'projects.drilldown',
    '/teams': 'teams.view',
    '/metrics': 'metrics.view',
    '/metrics-dashboard': 'metrics.view',
    '/reports': 'reports.view',
    '/integrations': 'admin.integrations',
    '/import': 'admin.import',
    '/audit': 'admin.audit_logs',
    '/admin': 'admin.console',
    '/role-features': 'admin.role_features',
    '/github-metrics': 'metrics.github',
    '/access-control': 'admin.access_control',
};

export function getRolePermissions(role: UserRole): string[] {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('role_feature_permissions');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed[role]) return parsed[role];
            } catch (e) {
                console.error('Failed to parse role permissions from localStorage', e);
            }
        }
    }
    return ROLE_PERMISSIONS[role] || [];
}

export function canAccess(role: UserRole, feature: Feature): boolean {
    const permissions = getRolePermissions(role);
    // If exact match found
    if (permissions.includes(feature as string)) return true;
    // If any sub-feature is granted (e.g., 'metrics.view' grants access to 'metrics')
    return permissions.some(p => p.startsWith(`${feature}.`));
}

export function getPermittedFeatures(role: UserRole): string[] {
    return getRolePermissions(role);
}
