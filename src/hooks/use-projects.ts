'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI, CreateProjectPayload } from '@/lib/api/projects';
import { useRole } from '@/contexts/role-context';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

// Roles that should see only their own projects
const RESTRICTED_ROLES = ['PROJECT_MANAGER', 'TEAM_LEAD', 'TEAM'];

const projectsAxios = axios.create({
    baseURL: `${API_BASE_URL}/api/v1/projects`,
    headers: { 'Content-Type': 'application/json' },
});
projectsAxios.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export function useProjects() {
    const { role, user } = useRole();
    const isRestricted = RESTRICTED_ROLES.includes(role);
    const userId = isRestricted ? (user?.id || user?.user?.id || undefined) : undefined;

    return useQuery({
        queryKey: ['projects', userId ?? 'all'],
        queryFn: () => projectsAPI.getAll(userId),
    });
}

export function useProject(id: string) {
    return useQuery({
        queryKey: ['projects', id],
        queryFn: () => projectsAPI.getById(id),
        enabled: !!id,
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProjectPayload) => projectsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await projectsAxios.put(`/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}
