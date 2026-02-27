'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI, CreateProjectPayload } from '@/lib/api/projects';

export function useProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: () => projectsAPI.getAll(),
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
