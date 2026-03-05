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
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Request failed: ${response.status}`);
    }
    if (response.status === 204) return { success: true };
    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || data);
}

// ── Markets ───────────────────────────────────────────────
const MARKETS_URL = `${API_BASE_URL}/api/v1/markets`;

export const marketsAPI = {
    getAll: () => apiFetch(MARKETS_URL),
    getOne: (id: string) => apiFetch(`${MARKETS_URL}/${id}`),
    create: (data: { name: string; regionCode: string }) =>
        apiFetch(MARKETS_URL, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { name?: string; regionCode?: string }) =>
        apiFetch(`${MARKETS_URL}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
        apiFetch(`${MARKETS_URL}/${id}`, { method: 'DELETE' }),
};

// ── Accounts ──────────────────────────────────────────────
const ACCOUNTS_URL = `${API_BASE_URL}/api/v1/accounts`;

export const adminAccountsAPI = {
    getAll: () => apiFetch(ACCOUNTS_URL),
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
    getAll: () => apiFetch(PROJECTS_URL),
    getOne: (id: string) => apiFetch(`${PROJECTS_URL}/${id}`),
    create: (data: { name: string; startDate?: string; enddate?: string; status?: string }) =>
        apiFetch(PROJECTS_URL, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
        apiFetch(`${PROJECTS_URL}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
        apiFetch(`${PROJECTS_URL}/${id}`, { method: 'DELETE' }),
};

// ── Teams ─────────────────────────────────────────────────
const TEAMS_URL = `${API_BASE_URL}/api/v1/teams`;

export const adminTeamsAPI = {
    getAll: () => apiFetch(TEAMS_URL),
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
    getAll: () => apiFetch(USERS_URL),
    getOne: (id: string) => apiFetch(`${USERS_URL}/${id}`),
    create: (data: any) =>
        apiFetch(USERS_URL, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
        apiFetch(`${USERS_URL}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
        apiFetch(`${USERS_URL}/${id}`, { method: 'DELETE' }),
};
