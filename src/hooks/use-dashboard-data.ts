'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardAPI } from '@/lib/api/client';
import { KPIData, TeamPerformanceData, DashboardSLAStatus, Activity } from '@/lib/types';

export function useDashboardKPIs() {
    return useQuery({
        queryKey: ['dashboard', 'kpis'],
        queryFn: async () => {
            const { data } = await dashboardAPI.getKPIs();
            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useTeamPerformance() {
    return useQuery({
        queryKey: ['dashboard', 'team-performance'],
        queryFn: async () => {
            const { data } = await dashboardAPI.getTeamPerformance();
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useSLAStatus() {
    return useQuery({
        queryKey: ['dashboard', 'sla-status'],
        queryFn: async () => {
            const { data } = await dashboardAPI.getSLAStatus();
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useRecentActivity() {
    return useQuery({
        queryKey: ['dashboard', 'activity'],
        queryFn: async () => {
            const { data } = await dashboardAPI.getActivity();
            return data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}
