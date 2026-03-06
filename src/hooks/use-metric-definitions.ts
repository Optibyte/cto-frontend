'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { metricDefinitionsAPI } from '@/lib/api/client';

export function useMetricDefinitions() {
    return useQuery({
        queryKey: ['metric-definitions'],
        queryFn: async () => {
            const { data } = await metricDefinitionsAPI.getAll();
            return data;
        },
    });
}

export function useCreateMetricDefinition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => metricDefinitionsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['metric-definitions'] });
        },
    });
}

export function useDeleteMetricDefinition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => metricDefinitionsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['metric-definitions'] });
        },
    });
}
