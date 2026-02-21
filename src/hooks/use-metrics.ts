'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { metricsAPI } from '@/lib/api/client';

export function useMetrics(filters?: any) {
    return useQuery({
        queryKey: ['metrics', filters],
        queryFn: async () => {
            const { data } = await metricsAPI.getAll(filters);
            return data;
        },
    });
}

export function useTeamMetrics(teamId: string) {
    return useQuery({
        queryKey: ['metrics', 'team', teamId],
        queryFn: async () => {
            const { data } = await metricsAPI.getByTeam(teamId);
            return data;
        },
        enabled: !!teamId,
    });
}

export function useMetricAggregates(
    teamId: string,
    metricType: string,
    startDate: string,
    endDate: string
) {
    return useQuery({
        queryKey: ['metrics', 'aggregates', teamId, metricType, startDate, endDate],
        queryFn: async () => {
            const { data } = await metricsAPI.getAggregates(teamId, metricType, startDate, endDate);
            return data;
        },
        enabled: !!teamId && !!metricType && !!startDate && !!endDate,
    });
}

export function useCreateMetric() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => metricsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['metrics'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useBulkCreateMetrics() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any[]) => metricsAPI.bulkCreate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['metrics'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useUpdateMetric() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => metricsAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['metrics'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useDeleteMetric() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => metricsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['metrics'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}
