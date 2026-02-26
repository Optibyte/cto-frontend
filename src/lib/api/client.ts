import { mockTeams, mockTeamMembers } from '../mock-data/teams';
import { mockSLADefinitions, mockSLABreaches } from '../mock-data/sla';
import { mockKPIData, mockTeamPerformance, mockSLAStatus, mockActivities } from '../mock-data/dashboard';
import { API_BASE_URL } from '../constants';

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

const PROJECTS_API_URL = 'http://localhost:4000/api/v1/projects';

export const projectsAPI = {
    getAll: async () => {
        const response = await fetch(PROJECTS_API_URL);
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        return { data: data.data || data };
    },
    create: async (projectData: any) => {
        // Only send name if other fields are "unexpected" by the backend
        const payload = {
            name: projectData.name,
            // Add other fields only if they are not empty/zero to minimize 400 risks
            ...(projectData.startDate && { startDate: projectData.startDate }),
            ...(projectData.enddate && { enddate: projectData.enddate }),
            ...(projectData.status && { status: projectData.status }),
            ...(projectData.teamSize > 0 && { teamSize: projectData.teamSize }),
            ...(projectData.progress > 0 && { progress: projectData.progress }),
        };

        const response = await fetch(PROJECTS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to create project');
        }
        const data = await response.json();
        return { data: data.data || data };
    },
    update: async (id: string, projectData: any) => {
        const response = await fetch(`${PROJECTS_API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(projectData),
        });
        if (!response.ok) throw new Error('Failed to update project');
        const data = await response.json();
        return { data: data.data || data };
    },
    delete: async (id: string) => {
        const response = await fetch(`${PROJECTS_API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete project');
        const data = await response.json();
        return { data: data.data || data };
    }
};
