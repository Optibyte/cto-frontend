import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
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

export interface HierarchyUser {
    id: string;
    fullName: string;
    email: string;
    role: string;
    trackingId: string;
}

export interface HierarchyEmployee {
    id: string;
    userId: string;
    tlId: string;
    trackingId: string;
    user: HierarchyUser;
}

export interface HierarchyTL {
    id: string;
    userId: string;
    pmId: string;
    trackingId: string;
    user: HierarchyUser;
    employees: HierarchyEmployee[];
}

export interface HierarchyPM {
    id: string;
    userId: string;
    ctoId: string;
    trackingId: string;
    user: HierarchyUser;
    teamLeads: HierarchyTL[];
}

export interface HierarchyCTO {
    id: string;
    userId: string;
    trackingId: string;
    user: HierarchyUser;
    projects: HierarchyPM[];
}

// Organizational Hierarchy (Market -> Account -> Team -> Project)
export interface HierarchyMarket {
    id: string;
    name: string;
    regionCode: string;
    accounts: HierarchyAccount[];
}

export interface HierarchyAccount {
    id: string;
    name: string;
    marketId: string;
    market: any;
    teams: HierarchyTeam[];
}

export interface HierarchyTeam {
    id: string;
    name: string;
    accountId: string;
    projectId: string;
    project: HierarchyProject | null;
}

export interface HierarchyProject {
    id: string;
    name: string;
}

export interface FullHierarchy {
    organizations: any[];
    markets: HierarchyMarket[];
}

export const hierarchyAPI = {
    getFullHierarchy: async (): Promise<FullHierarchy> => {
        const { data } = await api.get('/hierarchy/full');
        return data;
    },

    getHierarchyByUser: async (userId: string): Promise<any> => {
        const { data } = await api.get(`/hierarchy`);
        return data;
    },
};
