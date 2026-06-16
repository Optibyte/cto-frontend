'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { metricsAPI, sprintMetricsAPI, sprintParametersAPI, sprintAlertsAPI } from '@/lib/api/client';
import { dashboardAPI } from '@/lib/api/dashboard';

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

// ─── Sprint Alert Shared Type ────────────────────────────────────────────────
export interface SprintAlert {
    id: string;
    teamId: string;
    projectId: string | null;
    sprintNumber: number;
    sprintName: string | null;
    sprintDate: string | null;
    metricType: string;
    metricName: string;
    alertType: 'UCL' | 'LCL' | 'BASELINE';
    phase: 'before' | 'during' | 'after';
    value: number;
    baseline: number;
    ucl: number;
    lcl: number;
    stdDev: number;
    higherIsBetter: boolean;
    isRead: boolean;
    createdAt: string;
    team?: { id: string; name: string; transformationStartDate?: string; transformationEndDate?: string };
    project?: { id: string; name: string } | null;
}

// ─── Sprint Alerts Hooks ─────────────────────────────────────────────────────

/** Fetch all stored sprint alerts from DB, optionally filtered */
export function useSprintAlerts(filters?: {
    teamId?: string;
    projectId?: string;
    alertType?: string;
    isRead?: boolean;
}) {
    return useQuery({
        queryKey: ['sprint-alerts', filters],
        queryFn: async () => {
            const { data } = await sprintAlertsAPI.getAll(filters);
            return data as SprintAlert[];
        },
        retry: 1,
        staleTime: 60_000,
    });
}

/** Lightweight poll for unread count only */
export function useSprintAlertsUnreadCount() {
    return useQuery({
        queryKey: ['sprint-alerts-count'],
        queryFn: () => sprintAlertsAPI.getUnreadCount(),
        refetchInterval: 5 * 60 * 1000,
        retry: 1,
    });
}

/** Trigger SPC recomputation on the backend */
export function useRecomputeAlerts() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => sprintAlertsAPI.recompute(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sprint-alerts'] });
            queryClient.invalidateQueries({ queryKey: ['sprint-alerts-count'] });
        },
    });
}

/** Mark a single alert as read */
export function useMarkAlertRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => sprintAlertsAPI.markRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sprint-alerts'] });
            queryClient.invalidateQueries({ queryKey: ['sprint-alerts-count'] });
        },
    });
}

/** Mark ALL alerts as read */
export function useMarkAllAlertsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => sprintAlertsAPI.markAllRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sprint-alerts'] });
            queryClient.invalidateQueries({ queryKey: ['sprint-alerts-count'] });
        },
    });
}

export function useKpiFacts(filters?: any) {
    return useQuery({
        queryKey: ['kpi-facts', filters],
        queryFn: () => dashboardAPI.getKpiFacts(filters),
        retry: 1,
        staleTime: 30_000,
    });
}

export function useKpiFactsTransformation(filters?: any, enabled = true) {
    const { activeTab, ...apiFilters } = filters || {};
    return useQuery({
        queryKey: ['kpi-facts-transformation', filters],
        queryFn: () => dashboardAPI.getKpiFactsTransformation(apiFilters),
        retry: 1,
        staleTime: 0,
        enabled,
    });
}

export function useKpiFactsFinance(filters?: any, enabled = true) {
    const { activeTab, ...apiFilters } = filters || {};
    return useQuery({
        queryKey: ['kpi-facts-finance', filters],
        queryFn: () => dashboardAPI.getKpiFactsFinance(apiFilters),
        retry: 1,
        staleTime: 0,
        enabled,
    });
}

export function useKpiFactsProductivity(filters?: any, enabled = true) {
    const { activeTab, ...apiFilters } = filters || {};
    return useQuery({
        queryKey: ['kpi-facts-productivity', filters],
        queryFn: () => dashboardAPI.getKpiFactsProductivity(apiFilters),
        retry: 1,
        staleTime: 0,
        enabled,
    });
}

export function useKpiFactsAdoption(filters?: any, enabled = true) {
    const { activeTab, ...apiFilters } = filters || {};
    return useQuery({
        queryKey: ['kpi-facts-adoption', filters],
        queryFn: () => dashboardAPI.getKpiFactsAdoption(apiFilters),
        retry: 1,
        staleTime: 0,
        enabled,
    });
}

export function useKpiFactsAssets(filters?: any, enabled = true) {
    const { activeTab, ...apiFilters } = filters || {};
    return useQuery({
        queryKey: ['kpi-facts-assets', filters],
        queryFn: () => dashboardAPI.getKpiFactsAssets(apiFilters),
        retry: 1,
        staleTime: 0,
        enabled,
    });
}

export function useKpiFactsTokens(filters?: any, enabled = true) {
    const { activeTab, ...apiFilters } = filters || {};
    return useQuery({
        queryKey: ['kpi-facts-tokens', filters],
        queryFn: () => dashboardAPI.getKpiFactsTokens(apiFilters),
        retry: 1,
        staleTime: 0,
        enabled,
    });
}

export function useKpiFactsAgentic(filters?: any, enabled = true) {
    const { activeTab, ...apiFilters } = filters || {};
    return useQuery({
        queryKey: ['kpi-facts-agentic', filters],
        queryFn: () => dashboardAPI.getKpiFactsAgentic(apiFilters),
        retry: 1,
        staleTime: 0,
        enabled,
    });
}

export function useSaveManualMetrics() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: any) => dashboardAPI.saveManualMetrics(payload),
        onSuccess: () => {
            // Invalidate the legacy monolithic key (used by manual-metrics-tab for editing)
            queryClient.invalidateQueries({ queryKey: ['kpi-facts'] });
            // Invalidate all 6 domain-specific keys (used by dashboard cards)
            queryClient.invalidateQueries({ queryKey: ['kpi-facts-transformation'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts-productivity'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts-adoption'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts-assets'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts-tokens'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts-agentic'] });
        },
    });
}
