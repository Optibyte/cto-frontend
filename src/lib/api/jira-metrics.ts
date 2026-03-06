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
    const res = await fetch(url, { ...options, headers: { ...getHeaders(), ...options?.headers } });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Request failed: ${res.status}`);
    }
    if (res.status === 204) return { success: true };
    return res.json();
}

const BASE = `${API_BASE_URL}/api/v1/jira-metrics`;

// ── Jira Metrics API ──────────────────────────────────────────
export const jiraMetricsAPI = {
    /** Role-scoped KPI metrics from Flask via NestJS proxy */
    getMetrics: (params?: { start?: string; end?: string; days?: number }) => {
        const qs = new URLSearchParams();
        if (params?.start) qs.set('start', params.start);
        if (params?.end) qs.set('end', params.end);
        if (params?.days) qs.set('days', String(params.days));
        return apiFetch(`${BASE}?${qs.toString()}`);
    },

    /** Role-scoped daily chart data */
    getChartData: (params?: { start?: string; end?: string; days?: number }) => {
        const qs = new URLSearchParams();
        if (params?.start) qs.set('start', params.start);
        if (params?.end) qs.set('end', params.end);
        if (params?.days) qs.set('days', String(params.days));
        return apiFetch(`${BASE}/chart?${qs.toString()}`);
    },

    /** Role-scoped issues list */
    getIssues: () => apiFetch(`${BASE}/issues`),

    /** Integration status — how many projects/users are linked */
    getStatus: () => apiFetch(`${BASE}/status`),

    /** Connect Jira: save project key mappings and user account ID mappings */
    connect: (body: {
        jiraSiteUrl: string;
        jiraEmail: string;
        jiraApiToken: string;
        projectMappings: { ctoProjectId: string; jiraProjectKey: string; jiraBoardId?: string }[];
        userMappings: { ctoUserId: string; jiraAccountId: string }[];
    }) => apiFetch(`${BASE}/connect`, { method: 'POST', body: JSON.stringify(body) }),

    /** Get existing credentials mapping */
    getIntegration: () => apiFetch(`${BASE}/integration`),
};
