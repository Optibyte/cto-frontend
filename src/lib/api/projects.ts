import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1/projects`,
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

export interface CreateProjectPayload {
    name: string;
    ctoIds?: string[];
    pmIds?: string[];
    tlIds?: string[];
    employeeIds?: string[];
}

export interface ProjectUser {
    id: string;
    fullName: string;
    email: string;
    role: string;
}

export interface ProjectMember {
    id: string;
    user: ProjectUser;
    projectId: string;
}

export interface Project {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    ctos: ProjectMember[];
    pms: ProjectMember[];
    teamLeads: ProjectMember[];
    employees: ProjectMember[];
    teams?: any[];
}

export const projectsAPI = {
    getAll: async (): Promise<Project[]> => {
        const { data } = await api.get('/');
        return data;
    },

    getById: async (id: string): Promise<Project> => {
        const { data } = await api.get(`/${id}`);
        return data;
    },

    create: async (payload: CreateProjectPayload): Promise<Project> => {
        const { data } = await api.post('/', payload);
        return data;
    },
};
