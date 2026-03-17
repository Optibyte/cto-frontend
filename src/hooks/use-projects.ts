'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI, CreateProjectPayload } from '@/lib/api/projects';
import { useRole } from '@/contexts/role-context';

// Roles that should see only their own projects
const RESTRICTED_ROLES = ['PROJECT_MANAGER', 'TEAM_LEAD', 'TEAM'];

export function useProjects() {
    const { role, user } = useRole();
    const isRestricted = RESTRICTED_ROLES.includes(role);
    // Unwrap userId from user object (backend may nest it)
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
