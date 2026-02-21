'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { slaAPI } from '@/lib/api/client';

export function useSLAs() {
    return useQuery({
        queryKey: ['sla'],
        queryFn: async () => {
            const { data } = await slaAPI.getAll();
            return data;
        },
    });
}

export function useSLA(id: string) {
    return useQuery({
        queryKey: ['sla', id],
        queryFn: async () => {
            const { data } = await slaAPI.getById(id);
            return data;
        },
        enabled: !!id,
    });
}

export function useSLABreaches(slaId?: string) {
    return useQuery({
        queryKey: ['sla', 'breaches', slaId],
        queryFn: async () => {
            const { data } = await slaAPI.getBreaches(slaId);
            return data;
        },
    });
}

export function useCreateSLA() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => slaAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sla'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useUpdateSLA() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => slaAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sla'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useDeleteSLA() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => slaAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sla'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}
