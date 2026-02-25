'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesAPI } from '@/lib/api/employees';

export function useEmployees(tlId?: string) {
    return useQuery({
        queryKey: ['employees', { tlId }],
        queryFn: async () => {
            const { data } = await employeesAPI.getAll({ tlId });
            return data;
        },
    });
}

export function useEmployee(id: string) {
    return useQuery({
        queryKey: ['employees', id],
        queryFn: async () => {
            const { data } = await employeesAPI.getById(id);
            return data;
        },
        enabled: !!id,
    });
}

export function useEmployeeByCode(code: string, tlId?: string) {
    return useQuery({
        queryKey: ['employees', 'code', code, { tlId }],
        queryFn: async () => {
            const { data } = await employeesAPI.getByCode(code, tlId);
            return data;
        },
        enabled: !!code && code.length > 2,
        retry: false,
    });
}

export function useEmployeeHistory(id: string) {
    return useQuery({
        queryKey: ['employees', id, 'history'],
        queryFn: async () => {
            const { data } = await employeesAPI.getHistory(id);
            return data;
        },
        enabled: !!id,
    });
}

export function useCreateEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => employeesAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
    });
}

export function useUpdateEmployee() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => employeesAPI.update(id, data),
        onSuccess: (data: any, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['employees', id] });
        },
    });
}
