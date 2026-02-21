import { mockTeams, mockTeamMembers } from '../mock-data/teams';
import { mockSLADefinitions, mockSLABreaches } from '../mock-data/sla';
import { mockKPIData, mockTeamPerformance, mockSLAStatus, mockActivities } from '../mock-data/dashboard';

// Helper to simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const teamsAPI = {
    getAll: async () => {
        await delay();
        return { data: mockTeams };
    },
    getById: async (id: string) => {
        await delay();
        const team = mockTeams.find(t => t.id === id);
        return { data: team };
    },
    create: async (data: any) => {
        await delay();
        return { data: { id: Math.random().toString(36).substr(2, 9), ...data } };
    },
    update: async (id: string, data: any) => {
        await delay();
        return { data: { id, ...data } };
    },
    delete: async (id: string) => {
        await delay();
        return { data: { success: true } };
    }
};

export const usersAPI = {
    getAll: async () => {
        await delay();
        return { data: mockTeamMembers.map(tm => tm.user) };
    },
    getById: async (id: string) => {
        await delay();
        const member = mockTeamMembers.find(tm => tm.user.id === id);
        return { data: member?.user };
    },
    create: async (data: any) => {
        await delay();
        return { data: { id: Math.random().toString(36).substr(2, 9), ...data } };
    },
    update: async (id: string, data: any) => {
        await delay();
        return { data: { id, ...data } };
    },
    delete: async (id: string) => {
        await delay();
        return { data: { success: true } };
    }
};

export const slaAPI = {
    getAll: async () => {
        await delay();
        return { data: mockSLADefinitions };
    },
    getById: async (id: string) => {
        await delay();
        const sla = mockSLADefinitions.find(s => s.id === id);
        return { data: sla };
    },
    getBreaches: async (slaId: string) => {
        await delay();
        const breaches = mockSLABreaches.filter(b => b.slaId === slaId);
        return { data: breaches };
    },
    create: async (data: any) => {
        await delay();
        return { data: { id: Math.random().toString(36).substr(2, 9), ...data } };
    },
    update: async (id: string, data: any) => {
        await delay();
        return { data: { id, ...data } };
    },
    delete: async (id: string) => {
        await delay();
        return { data: { success: true } };
    }
};

export const metricsAPI = {
    getAll: async (filters?: any) => {
        await delay();
        // Return some dummy metrics or filter existing ones
        return { data: [] };
    },
    getByTeam: async (teamId: string) => {
        await delay();
        return { data: [] };
    },
    getAggregates: async (teamId: string, metricType: string, startDate?: string, endDate?: string) => {
        await delay();
        return { data: [] };
    },
    create: async (data: any) => {
        await delay();
        return { data };
    },
    bulkCreate: async (data: any[]) => {
        await delay();
        return { data };
    },
    update: async (id: string, data: any) => {
        await delay();
        return { data };
    },
    delete: async (id: string) => {
        await delay();
        return { data: { success: true } };
    }
};

export const dashboardAPI = {
    getKPIs: async () => {
        await delay();
        return { data: mockKPIData };
    },
    getTeamPerformance: async () => {
        await delay();
        return { data: mockTeamPerformance };
    },
    getSLAStatus: async () => {
        await delay();
        return { data: mockSLAStatus };
    },
    getActivity: async () => {
        await delay();
        return { data: mockActivities };
    }
};

export const accountsAPI = {
    getAll: async () => {
        await delay();
        return { data: [{ id: 'a1', name: 'Default Account' }] };
    }
};
