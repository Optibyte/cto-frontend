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
        if (res.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('current_user_id');
            window.location.href = '/login';
            return;
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Request failed: ${res.status}`);
    }
    if (res.status === 204) return { success: true };
    return res.json();
}

const BASE = `${API_BASE_URL}/api/v1/dashboard/ai-integrations`;

export const aiCredentialsAPI = {
    getIntegrations: () => apiFetch(BASE),
    connect: (body: { provider: string; apiKey: string; apiEndpoint?: string }) =>
        apiFetch(`${BASE}/connect`, { method: 'POST', body: JSON.stringify(body) }),
    disconnect: (provider: string) =>
        apiFetch(`${BASE}/disconnect`, { method: 'POST', body: JSON.stringify({ provider }) }),
};
