'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { metricsAPI, sprintMetricsAPI, sprintParametersAPI } from '@/lib/api/client';

export function useMetrics(filters?: any) {
    return useQuery({
        queryKey: ['metrics', filters],
        queryFn: async () => {
            const { data } = await metricsAPI.getAll(filters);
            return data;
        },
        retry: 1,
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

export function useGlobalBaseline() {
    return useQuery({
        queryKey: ['metrics', 'baseline'],
        queryFn: async () => {
            const { data } = await metricsAPI.getBaseline();
            return data;
        },
    });
}

export function useUpdateGlobalBaseline() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (config: any) => metricsAPI.updateBaseline(config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['metrics', 'baseline'] });
        },
    });
}

export function useSprintMetrics(filters?: any) {
    return useQuery({
        queryKey: ['sprint-metrics', filters],
        queryFn: async () => {
            const { data } = await sprintMetricsAPI.getAll(filters);
            return data;
        },
        retry: 1,
    });
}

export function useSprintAnalytics(filters?: {
    org?: string; country?: string; market?: string;
    account?: string; project?: string; team?: string;
}) {
    return useQuery({
        queryKey: ['sprint-analytics', filters],
        queryFn: () => sprintMetricsAPI.getAnalytics(filters),
        retry: 1,
        staleTime: 30_000,
    });
}

export function useSprintParameters(filters?: any) {
    return useQuery({
        queryKey: ['sprint-parameters', filters],
        queryFn: async () => {
            const { data } = await sprintParametersAPI.getAll(filters);
            return data;
        },
        retry: 1,
    });
}

export function useCreateSprintParameter() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => sprintParametersAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sprint-parameters'] });
            queryClient.invalidateQueries({ queryKey: ['sprint-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['sprint-analytics'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useUpdateSprintParameter() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => sprintParametersAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sprint-parameters'] });
            queryClient.invalidateQueries({ queryKey: ['sprint-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['sprint-analytics'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

