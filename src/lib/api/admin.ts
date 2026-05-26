import { API_BASE_URL } from '../constants';

const getHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (typeof window !== 'undefined') {
        const userId = localStorage.getItem('current_user_id');
        const token = localStorage.getItem('access_token');
        if (userId) headers['x-user-id'] = userId;
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

async function apiFetch(url: string, options?: RequestInit) {
    const response = await fetch(url, { ...options, headers: { ...getHeaders(), ...options?.headers } });
    if (response.status === 401) {
        // Token expired or invalid — clear auth state and redirect to login
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_data');
            localStorage.removeItem('user_auth');
            localStorage.removeItem('current_user_id');
            window.location.href = '/login';
        }
        throw new Error('Session expired. Please log in again.');
    }
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Request failed: ${response.status}`);
    }
    if (response.status === 204) return { success: true };
    const data = await response.json();
    if (data && data.total !== undefined && Array.isArray(data.data)) {
        return data; // Return full pagination object
    }
    return Array.isArray(data) ? data : (data.data || data);
}

// ── Organizations ───────────────────────────────────────────
const ORGANIZATIONS_URL = `${API_BASE_URL}/api/v1/organizations`;

export const adminOrganizationsAPI = {
    getAll: (page?: number, limit?: number) => apiFetch(page && limit ? `${ORGANIZATIONS_URL}?page=${page}&limit=${limit}` : ORGANIZATIONS_URL),
    getOne: (id: string) => apiFetch(`${ORGANIZATIONS_URL}/${id}`),
    create: (data: { name: string; country?: string[] }) =>
        apiFetch(ORGANIZATIONS_URL, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { name?: string; country?: string[] }) =>
        apiFetch(`${ORGANIZATIONS_URL}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
        apiFetch(`${ORGANIZATIONS_URL}/${id}`, { method: 'DELETE' }),
};

// ── Markets ───────────────────────────────────────────────
const MARKETS_URL = `${API_BASE_URL}/api/v1/markets`;

export const marketsAPI = {
    getAll: (page?: number, limit?: number) => apiFetch(page && limit ? `${MARKETS_URL}?page=${page}&limit=${limit}` : MARKETS_URL),
    getOne: (id: string) => apiFetch(`${MARKETS_URL}/${id}`),
    create: (data: { name: string; country?: string[]; orgId?: string }) =>
        apiFetch(MARKETS_URL, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { name?: string; country?: string[]; orgId?: string }) =>
        apiFetch(`${MARKETS_URL}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
        apiFetch(`${MARKETS_URL}/${id}`, { method: 'DELETE' }),
};

// ── Accounts ──────────────────────────────────────────────
const ACCOUNTS_URL = `${API_BASE_URL}/api/v1/accounts`;

export const adminAccountsAPI = {
    getAll: (page?: number, limit?: number) => apiFetch(page && limit ? `${ACCOUNTS_URL}?page=${page}&limit=${limit}` : ACCOUNTS_URL),
    getOne: (id: string) => apiFetch(`${ACCOUNTS_URL}/${id}`),
    create: (data: { name: string; marketId: string; accountManagerId: string }) =>
        apiFetch(ACCOUNTS_URL, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { name?: string; marketId?: string; accountManagerId?: string }) =>
        apiFetch(`${ACCOUNTS_URL}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
        apiFetch(`${ACCOUNTS_URL}/${id}`, { method: 'DELETE' }),
};

// ── Projects ──────────────────────────────────────────────
const PROJECTS_URL = `${API_BASE_URL}/api/v1/projects`;

export const adminProjectsAPI = {
    getAll: (page?: number, limit?: number, aiEnabled?: boolean) => {
        const params = new URLSearchParams();
        if (page && limit) { params.set('page', String(page)); params.set('limit', String(limit)); }
        if (aiEnabled !== undefined) { params.set('aiEnabled', String(aiEnabled)); }
        const qs = params.toString();
        return apiFetch(qs ? `${PROJECTS_URL}?${qs}` : PROJECTS_URL);
    },
    getAiProjects: (page?: number, limit?: number) => {
        return apiFetch(`${PROJECTS_URL}/ai`);
    },
    getNormalProjects: (page?: number, limit?: number) => {
        return apiFetch(`${PROJECTS_URL}?aiEnabled=false`);
    },
    getOne: (id: string) => apiFetch(`${PROJECTS_URL}/${id}`),
    create: (data: any) =>
        apiFetch(PROJECTS_URL, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
        apiFetch(`${PROJECTS_URL}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
        apiFetch(`${PROJECTS_URL}/${id}`, { method: 'DELETE' }),
};

// ── Teams ─────────────────────────────────────────────────
const TEAMS_URL = `${API_BASE_URL}/api/v1/teams`;

export const adminTeamsAPI = {
    getAll: (page?: number, limit?: number) => apiFetch(page && limit ? `${TEAMS_URL}?page=${page}&limit=${limit}` : TEAMS_URL),
    getOne: (id: string) => apiFetch(`${TEAMS_URL}/${id}`),
    create: (data: any) =>
        apiFetch(TEAMS_URL, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
        apiFetch(`${TEAMS_URL}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
        apiFetch(`${TEAMS_URL}/${id}`, { method: 'DELETE' }),
};

// ── Team Members ──────────────────────────────────────────
export const adminTeamMembersAPI = {
    getAll: async (): Promise<any[]> => {
        // Fetch all teams (which include members), then flatten
        const teams: any = await apiFetch(TEAMS_URL);
        const teamsArr = Array.isArray(teams) ? teams : [];
        const allMembers: any[] = [];
        for (const team of teamsArr) {
            if (team.members && Array.isArray(team.members)) {
                for (const member of team.members) {
                    allMembers.push({
                        id: member.id,
                        teamId: team.id,
                        teamName: team.name,
                        userId: member.userId,
                        userName: member.user?.fullName || '—',
                        userEmail: member.user?.email || '—',
                        userRole: member.user?.role || '—',
                        roleInTeam: member.roleInTeam || 'Member',
                        joinedAt: member.joinedAt || member.createdAt,
                    });
                }
            }
        }
        return allMembers;
    },
    add: (teamId: string, data: { userId: string; roleInTeam?: string }) =>
        apiFetch(`${TEAMS_URL}/${teamId}/members`, { method: 'POST', body: JSON.stringify(data) }),
    addBulk: (teamId: string, data: { userIds: string[]; roleInTeam?: string }) =>
        apiFetch(`${TEAMS_URL}/${teamId}/members/bulk`, { method: 'POST', body: JSON.stringify(data) }),
    remove: (teamId: string, userId: string) =>
        apiFetch(`${TEAMS_URL}/${teamId}/members/${userId}`, { method: 'DELETE' }),
};

// ── Users ─────────────────────────────────────────────────
const USERS_URL = `${API_BASE_URL}/api/v1/users`;

export const adminUsersAPI = {
    getAll: (page?: number, limit?: number, search?: string) => {
        const params = new URLSearchParams();
        if (page && limit) { params.set('page', String(page)); params.set('limit', String(limit)); }
        if (search) params.set('search', search);
        const qs = params.toString();
        return apiFetch(qs ? `${USERS_URL}?${qs}` : USERS_URL);
    },
    getOne: (id: string) => apiFetch(`${USERS_URL}/${id}`),
    create: (data: any) =>
        apiFetch(USERS_URL, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
        apiFetch(`${USERS_URL}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
        apiFetch(`${USERS_URL}/${id}`, { method: 'DELETE' }),
};

// ── File upload helper (shared for both bulk APIs) ─────────
const fileBulkUpload = async (endpoint: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        const userId = localStorage.getItem('current_user_id');
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (userId) headers['x-user-id'] = userId;
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Bulk upload failed: ${response.status}`);
    }
    return response.json();
};

// ── Employees Bulk Upload ──────────────────────────────────
const EMPLOYEES_URL = `${API_BASE_URL}/api/v1/employees`;

export const adminEmployeesAPI = {
    bulkUpload: (file: File) => fileBulkUpload(`${EMPLOYEES_URL}/bulk-upload`, file),
};

// ── Sprint Metrics Bulk Upload ─────────────────────────────
const SPRINT_METRICS_URL = `${API_BASE_URL}/api/v1/sprint-metrics`;

export const adminSprintMetricsAPI = {
    bulkUpload: (file: File) => fileBulkUpload(`${SPRINT_METRICS_URL}/bulk-upload`, file),
};

// ── Audit Logs ─────────────────────────────────────────────
const AUDIT_LOGS_URL = `${API_BASE_URL}/api/v1/audit-logs`;

export const auditLogsAPI = {
    getAll: (page: number = 1, limit: number = 10) => {
        const offset = (page - 1) * limit;
        return apiFetch(`${AUDIT_LOGS_URL}?limit=${limit}&offset=${offset}`);
    },
    logActivity: (data: { entityType: string, entityId: string, action: string, oldValue?: any, newValue?: any }) => apiFetch(AUDIT_LOGS_URL, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};

// ── Report Schedules ───────────────────────────────────────
const REPORT_SCHEDULES_URL = `${API_BASE_URL}/api/v1/report-schedules`;

export const adminReportSchedulesAPI = {
    getAll: (page?: number, limit?: number) => apiFetch(page && limit ? `${REPORT_SCHEDULES_URL}?page=${page}&limit=${limit}` : REPORT_SCHEDULES_URL),
    getOne: (id: string) => apiFetch(`${REPORT_SCHEDULES_URL}/${id}`),
    create: (data: any) =>
        apiFetch(REPORT_SCHEDULES_URL, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
        apiFetch(`${REPORT_SCHEDULES_URL}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
        apiFetch(`${REPORT_SCHEDULES_URL}/${id}`, { method: 'DELETE' }),
    trigger: (id: string) =>
        apiFetch(`${REPORT_SCHEDULES_URL}/${id}/trigger`, { method: 'POST' }),
};



