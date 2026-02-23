'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '@/lib/api/dashboard';

export function useDashboardKPIs() {
    return useQuery({
        queryKey: ['dashboard', 'kpis'],
        queryFn: () => dashboardAPI.getKPIs(),
    });
}

export function useTeamPerformance() {
    return useQuery({
        queryKey: ['dashboard', 'team-performance'],
        queryFn: () => dashboardAPI.getTeamPerformance(),
    });
}

export function useSLAStatus() {
    return useQuery({
        queryKey: ['dashboard', 'sla-status'],
        queryFn: () => dashboardAPI.getSLAStatus(),
    });
}

export function useRecentActivity() {
    return useQuery({
        queryKey: ['dashboard', 'activity'],
        queryFn: () => dashboardAPI.getRecentActivity(),
    });
}
