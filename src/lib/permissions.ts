import { UserRole } from './types';

export type Feature = string;

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    CTO: [
        'dashboard.view',
        'projects.view', 'projects.create', 'projects.edit', 'projects.drilldown',
        'teams.view', 'teams.create', 'teams.add_member', 'teams.manage',
        'metrics.view', 'metrics.create', 'metrics.edit', 'metrics.github',
        'reports.view', 'reports.export',
        'admin.access_control', 'admin.audit_logs', 'admin.integrations', 'admin.import', 'admin.console', 'admin.role_features'
    ],
    ORG: [
        'dashboard.view',
        'projects.view', 'projects.create', 'projects.edit', 'projects.drilldown',
        'teams.view', 'teams.create', 'teams.add_member', 'teams.manage',
        'metrics.view', 'metrics.create', 'metrics.edit', 'metrics.github',
        'reports.view', 'reports.export',
        'admin.access_control', 'admin.audit_logs', 'admin.integrations', 'admin.import', 'admin.console', 'admin.role_features'
    ],
    MARKET: [
        'dashboard.view',
        'projects.view', 'projects.drilldown',
        'teams.view',
        'metrics.view', 'metrics.github',
        'reports.view', 'reports.export',
        'admin.audit_logs',
    ],
    ACCOUNT: [
        'dashboard.view',
        'projects.view', 'projects.drilldown',
        'teams.view',
        'metrics.view', 'metrics.github',
        'reports.view', 'reports.export',
        'admin.audit_logs',
    ],
    PROJECT_MANAGER: [
        'dashboard.view',
        'projects.view', 'projects.drilldown', 'projects.edit',
        'teams.view', 'teams.add_member',
        'metrics.view', 'metrics.create', 'metrics.edit', 'metrics.github',
        'reports.view', 'reports.export',
        'admin.audit_logs',
    ],
    PROJECT: [
        'dashboard.view',
        'projects.view', 'projects.drilldown',
        'teams.view',
        'metrics.view', 'metrics.github',
        'reports.view',
    ],
    TEAM_LEAD: [
        'dashboard.view',
        'projects.view', 'projects.drilldown',
        'teams.view', 'teams.add_member',
        'metrics.view', 'metrics.create', 'metrics.edit', 'metrics.github',
        'reports.view',
    ],
    TEAM: [
        'dashboard.view',
        'projects.view', 'projects.drilldown',
        'teams.view',
        'metrics.view',
    ],
    MEMBER: [
        'dashboard.view',
        'metrics.view',
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
        // 1. Check per-user overrides first (set in Role Features → Users tab)
        const userId = localStorage.getItem('current_user_id');
        if (userId) {
            try {
                const userPerms = JSON.parse(localStorage.getItem('user_feature_permissions') || '{}');
                if (userPerms[userId] && Array.isArray(userPerms[userId])) {
                    return userPerms[userId];
                }
            } catch { /* ignore */ }
        }

        // 2. Check role-level overrides (set in Role Features → Roles tab)
        try {
            const saved = localStorage.getItem('role_feature_permissions');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed[role] && Array.isArray(parsed[role])) {
                    return parsed[role];
                }
            }
        } catch { /* ignore */ }
    }
    // 3. Fall back to hardcoded defaults
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
