import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1/dashboard`,
    headers: { 'Content-Type': 'application/json' },
});

// Add request interceptor to inject token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export interface KPIItem {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
    sparkline: number[];
}

export interface DashboardKPIs {
    velocity: KPIItem;
    quality: KPIItem;
    throughput: KPIItem;
    cycleTime: KPIItem;
}

export interface TeamPerformanceItem {
    team: string;
    score: number;
    members: number;
    velocity: number;
    quality: number;
}

export interface SLAStatusSummary {
    met: number;
    atRisk: number;
    missed: number;
}

export interface ActivityItem {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    user?: {
        id: string;
        name: string;
        email: string;
        role: string;
        avatar?: string;
    };
    severity?: string;
}

export const dashboardAPI = {
    getKPIs: async (): Promise<DashboardKPIs> => {
        const { data } = await api.get('/kpis');
        return data;
    },

    getTeamPerformance: async (): Promise<TeamPerformanceItem[]> => {
        const { data } = await api.get('/teams/comparison');
        return data;
    },

    getSLAStatus: async (): Promise<SLAStatusSummary> => {
        const { data } = await api.get('/sla/status');
        return data;
    },

    getRecentActivity: async (): Promise<ActivityItem[]> => {
        const { data } = await api.get('/activity');
        return data;
    },

    getKpiFacts: async (filters?: any): Promise<any> => {
        const { data } = await api.get('/kpi-facts', { params: filters });
        return data;
    },

    getKpiFactsTransformation: async (filters?: any): Promise<any> => {
        const { data } = await api.get('/kpi-facts/transformation', { params: filters });
        return data;
    },

    getKpiFactsProductivity: async (filters?: any): Promise<any> => {
        const { data } = await api.get('/kpi-facts/productivity', { params: filters });
        return data;
    },

    getKpiFactsAdoption: async (filters?: any): Promise<any> => {
        const { data } = await api.get('/kpi-facts/adoption', { params: filters });
        return data;
    },

    getKpiFactsAssets: async (filters?: any): Promise<any> => {
        const { data } = await api.get('/kpi-facts/assets', { params: filters });
        return data;
    },

    getKpiFactsTokens: async (filters?: any): Promise<any> => {
        const { data } = await api.get('/kpi-facts/tokens', { params: filters });
        return data;
    },

    getKpiFactsAgentic: async (filters?: any): Promise<any> => {
        const { data } = await api.get('/kpi-facts/agentic', { params: filters });
        return data;
    },

    saveManualMetrics: async (payload: any): Promise<any> => {
        const { data } = await api.post('/manual-metrics', payload);
        return data;
    },
};
