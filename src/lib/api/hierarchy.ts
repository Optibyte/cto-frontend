import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: { 'Content-Type': 'application/json' },
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
    projects: HierarchyPM[];  // "projects" is the Prisma relation name for PMs under CTO
}

export const hierarchyAPI = {
    getFullHierarchy: async (): Promise<HierarchyCTO[]> => {
        const { data } = await api.get('/hierarchy');
        return data;
    },

    getHierarchyByUser: async (userId: string): Promise<any> => {
        const { data } = await api.get(`/hierarchy/${userId}`);
        return data;
    },
};
