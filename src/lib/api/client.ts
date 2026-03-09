import { mockTeams, mockTeamMembers } from '../mock-data/teams';
import { mockSLADefinitions, mockSLABreaches } from '../mock-data/sla';
import { mockKPIData, mockTeamPerformance, mockSLAStatus, mockActivities } from '../mock-data/dashboard';
import { API_BASE_URL } from '../constants';

// Helper to simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

const getHeaders = () => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
        const userId = localStorage.getItem('current_user_id');
        const token = localStorage.getItem('access_token');
        if (userId) {
            headers['x-user-id'] = userId;
        }
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
};

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
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`${METRICS_API_URL}${queryParams ? `?${queryParams}` : ''}`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch metrics');
            const data = await response.json();
            return { data: Array.isArray(data) ? data : (data.data || []) };
        } catch (error) {
            console.error('Metrics API Error (getAll):', error);
            throw error;
        }
    },
    getByTeam: async (teamId: string) => {
        try {
            const response = await fetch(`${METRICS_API_URL}/team/${teamId}`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch team metrics');
            const data = await response.json();
            return { data: Array.isArray(data) ? data : (data.data || []) };
        } catch (error) {
            console.error('Metrics API Error (getByTeam):', error);
            throw error;
        }
    },
    getAggregates: async (teamId: string, metricType: string, startDate?: string, endDate?: string) => {
        try {
            const response = await fetch(`${METRICS_API_URL}/aggregates/${teamId}/${metricType}?startDate=${startDate}&endDate=${endDate}`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch aggregates');
            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Metrics API Error (getAggregates):', error);
            throw error;
        }
    },
    create: async (data: any) => {
        try {
            const response = await fetch(METRICS_API_URL, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to create metric');
            const result = await response.json();
            return { data: result };
        } catch (error) {
            console.error('Metrics API Error (create):', error);
            throw error;
        }
    },
    bulkCreate: async (data: any[]) => {
        try {
            const response = await fetch(`${METRICS_API_URL}/bulk`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to bulk create metrics');
            const result = await response.json();
            return { data: result };
        } catch (error) {
            console.error('Metrics API Error (bulkCreate):', error);
            throw error;
        }
    },
    update: async (id: string, data: any) => {
        try {
            const response = await fetch(`${METRICS_API_URL}/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to update metric');
            const result = await response.json();
            return { data: result };
        } catch (error) {
            console.error('Metrics API Error (update):', error);
            throw error;
        }
    },
    delete: async (id: string) => {
        try {
            const response = await fetch(`${METRICS_API_URL}/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to delete metric');
            return { data: { success: true } };
        } catch (error) {
            console.error('Metrics API Error (delete):', error);
            throw error;
        }
    }
};

export const metricDefinitionsAPI = {
    getAll: async () => {
        try {
            const response = await fetch(METRIC_DEFINITIONS_API_URL, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch metric definitions');
            const data = await response.json();
            return { data: Array.isArray(data) ? data : (data.data || []) };
        } catch (error) {
            console.error('Metric Definitions API Error (getAll):', error);
            throw error;
        }
    },
    create: async (data: any) => {
        try {
            const response = await fetch(METRIC_DEFINITIONS_API_URL, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to create metric definition');
            const result = await response.json();
            return { data: result };
        } catch (error) {
            console.error('Metric Definitions API Error (create):', error);
            throw error;
        }
    },
    delete: async (id: string) => {
        try {
            const response = await fetch(`${METRIC_DEFINITIONS_API_URL}/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to delete metric definition');
            return { data: { success: true } };
        } catch (error) {
            console.error('Metric Definitions API Error (delete):', error);
            throw error;
        }
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

const PROJECTS_API_URL = `${API_BASE_URL}/api/v1/projects`;
const EMPLOYEES_API_URL = `${API_BASE_URL}/api/v1/employees`;
const TEAM_LEADERS_API_URL = `${API_BASE_URL}/api/v1/team-leads`;
const MANAGERS_API_URL = `${API_BASE_URL}/api/v1/project-managers`;
const AUDIT_API_URL = `${API_BASE_URL}/api/v1/audit`;
const METRIC_DEFINITIONS_API_URL = `${API_BASE_URL}/api/v1/metric-definitions`;
const METRICS_API_URL = `${API_BASE_URL}/api/v1/metrics`;

const formatEmployeePayload = (data: any) => ({
    email: data.email,
    fullName: data.name || data.fullName,
    role: data.role,
    employeeCode: data.employeeId || data.employeeCode,
    experience: data.experience,
    joiningDate: data.joiningDate
});

const formatTeamLeadPayload = (data: any) => ({
    fullName: data.name,
    email: data.email,
    employeeCode: data.employeeCode,
    experience: data.experience
});

const formatManagerPayload = (data: any) => ({
    fullName: data.name,
    email: data.email,
    employeeCode: data.employeeCode,
    experience: data.experience
});

const formatProjectPayload = (data: any) => {
    const payload: any = { name: data.name };

    if (data.startDate && data.startDate.trim() !== '') payload.startDate = data.startDate;
    if (data.enddate && data.enddate.trim() !== '') payload.enddate = data.enddate;
    if (data.teamSize !== undefined) payload.teamSize = Number(data.teamSize);
    if (data.progress !== undefined) payload.progress = Number(data.progress);

    // Status mapping: Backend uses ALL CAPS PLANNED, ACTIVE, ON_HOLD, COMPLETED
    if (data.status) {
        const statusMap: Record<string, string> = {
            'Active': 'ACTIVE',
            'PLANNED': 'PLANNED',
            'Completed': 'COMPLETED',
            'On-Hold': 'ON_HOLD',
            'Delayed': 'ACTIVE' // Explicitly mapping Delayed to ACTIVE as per backend enum
        };
        payload.status = statusMap[data.status] || data.status.toUpperCase();
    }

    return payload;
};

export const projectsAPI = {
    getAll: async () => {
        try {
            const response = await fetch(PROJECTS_API_URL);
            if (!response.ok) throw new Error('Failed to fetch projects');
            const data = await response.json();
            return { data: Array.isArray(data) ? data : (data.data || []) };
        } catch (error) {
            console.error('Projects API Error (getAll):', error);
            throw error;
        }
    },
    create: async (projectData: any) => {
        const payload = formatProjectPayload(projectData);
        console.log('Creating project with payload:', payload);

        try {
            const response = await fetch(PROJECTS_API_URL, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Projects API Error (create):', errorData);
                throw new Error(errorData.message || (errorData.message && Array.isArray(errorData.message) ? errorData.message.join(', ') : 'Failed to create project'));
            }
            const data = await response.json();
            return { data: data.data || data };
        } catch (error) {
            console.error('Projects API Network Error (create):', error);
            throw error;
        }
    },
    update: async (id: string, projectData: any) => {
        const payload = formatProjectPayload(projectData);
        console.log(`Updating project ${id} with payload:`, payload);

        try {
            const response = await fetch(`${PROJECTS_API_URL}/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Projects API Error (update):', errorData);
                throw new Error(errorData.message || 'Failed to update project');
            }
            const data = await response.json();
            return { data: data.data || data };
        } catch (error) {
            console.error('Projects API Network Error (update):', error);
            throw error;
        }
    },
    delete: async (id: string) => {
        console.log(`Deleting project ${id}`);
        try {
            const response = await fetch(`${PROJECTS_API_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Projects API Error (delete):', errorData);
                throw new Error(errorData.message || 'Failed to delete project');
            }
            const data = await response.json();
            return { data: data.data || data };
        } catch (error) {
            console.error('Projects API Network Error (delete):', error);
            throw error;
        }
    }
};

export const employeesAPI = {
    getAll: async () => {
        try {
            const response = await fetch(EMPLOYEES_API_URL);
            if (!response.ok) throw new Error('Failed to fetch employees');
            const data = await response.json();
            // Handle both { data: [...] } and [...] formats
            return { data: Array.isArray(data) ? data : (data.data || []) };
        } catch (error) {
            console.error('Employees API Error (getAll):', error);
            throw error;
        }
    },
    create: async (employeeData: any) => {
        const payload = formatEmployeePayload(employeeData);
        try {
            const response = await fetch(EMPLOYEES_API_URL, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create employee');
            }
            const data = await response.json();
            return { data: data.data || data };
        } catch (error) {
            console.error('Employees API Error (create):', error);
            throw error;
        }
    },
    update: async (id: string, employeeData: any) => {
        const payload = formatEmployeePayload(employeeData);
        try {
            const url = `${EMPLOYEES_API_URL}/${id}`;
            console.log(`Updating employee at URL: ${url}`);
            const response = await fetch(url, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update employee');
            }
            const data = await response.json();
            return { data: data.data || data };
        } catch (error) {
            console.error('Employees API Error (update):', error);
            throw error;
        }
    },
    delete: async (id: string) => {
        try {
            const url = `${EMPLOYEES_API_URL}/${id}`;
            console.log(`Deleting employee at URL: ${url}`);
            const response = await fetch(url, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}: Failed to delete employee`);
            }

            // For 204 No Content or empty responses, don't try to parse JSON
            if (response.status === 204) {
                return { success: true };
            }

            const text = await response.text();
            const data = text ? JSON.parse(text) : { success: true };
            return { data: data.data || data, success: true };
        } catch (error: any) {
            console.error('Employees API Error (delete):', error);
            throw error;
        }
    }
};

export const teamLeadersAPI = {
    getAll: async () => {
        try {
            const response = await fetch(TEAM_LEADERS_API_URL);
            if (!response.ok) throw new Error('Failed to fetch team leaders');
            const data = await response.json();
            return { data: Array.isArray(data) ? data : (data.data || []) };
        } catch (error) {
            console.error('Team Leaders API Error (getAll):', error);
            throw error;
        }
    },
    create: async (teamLeadData: any) => {
        const payload = formatTeamLeadPayload(teamLeadData);
        try {
            const response = await fetch(TEAM_LEADERS_API_URL, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create team leader');
            }
            const data = await response.json();
            return { data: data.data || data };
        } catch (error) {
            console.error('Team Leaders API Error (create):', error);
            throw error;
        }
    },
    update: async (id: string, teamLeadData: any) => {
        const payload = formatTeamLeadPayload(teamLeadData);
        try {
            const response = await fetch(`${TEAM_LEADERS_API_URL}/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update team leader');
            }
            const data = await response.json();
            return { data: data.data || data };
        } catch (error) {
            console.error('Team Leaders API Error (update):', error);
            throw error;
        }
    },
    delete: async (id: string) => {
        try {
            const response = await fetch(`${TEAM_LEADERS_API_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to delete team leader');
            }
            return { success: true };
        } catch (error) {
            console.error('Team Leaders API Error (delete):', error);
            throw error;
        }
    }
};

export const managersAPI = {
    getAll: async () => {
        try {
            const response = await fetch(MANAGERS_API_URL);
            if (!response.ok) throw new Error('Failed to fetch managers');
            const data = await response.json();
            return { data: Array.isArray(data) ? data : (data.data || []) };
        } catch (error) {
            console.error('Managers API Error (getAll):', error);
            throw error;
        }
    },
    create: async (managerData: any) => {
        const payload = formatManagerPayload(managerData);
        try {
            const response = await fetch(MANAGERS_API_URL, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create manager');
            }
            const data = await response.json();
            return { data: data.data || data };
        } catch (error) {
            console.error('Managers API Error (create):', error);
            throw error;
        }
    },
    update: async (id: string, managerData: any) => {
        const payload = formatManagerPayload(managerData);
        try {
            const response = await fetch(`${MANAGERS_API_URL}/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update manager');
            }
            const data = await response.json();
            return { data: data.data || data };
        } catch (error) {
            console.error('Managers API Error (update):', error);
            throw error;
        }
    },
    delete: async (id: string) => {
        try {
            const response = await fetch(`${MANAGERS_API_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to delete manager');
            }
            return { success: true };
        } catch (error) {
            console.error('Managers API Error (delete):', error);
            throw error;
        }
    }
};

export const auditAPI = {
    getAll: async (limit: number = 50, offset: number = 0) => {
        try {
            const response = await fetch(`${AUDIT_API_URL}?limit=${limit}&offset=${offset}`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch audit logs');
            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Audit API Error (getAll):', error);
            throw error;
        }
    },
    getStats: async () => {
        try {
            const response = await fetch(`${AUDIT_API_URL}/stats`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch audit stats');
            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Audit API Error (getStats):', error);
            throw error;
        }
    },
    getByEntity: async (type: string, id: string) => {
        try {
            const response = await fetch(`${AUDIT_API_URL}/entity/${type}/${id}`, {
                headers: getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch entity audit logs');
            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Audit API Error (getByEntity):', error);
            throw error;
        }
    }
};



