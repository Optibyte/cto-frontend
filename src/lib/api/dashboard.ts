import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1/dashboard`,
    headers: { 'Content-Type': 'application/json' },
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
};
