'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '@/lib/api/client';

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await usersAPI.getAll();
            return data;
        },
    });
}

export function useUser(id: string) {
    return useQuery({
        queryKey: ['users', id],
        queryFn: async () => {
            const { data } = await usersAPI.getById(id);
            return data;
        },
        enabled: !!id,
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => usersAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => usersAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => usersAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}
