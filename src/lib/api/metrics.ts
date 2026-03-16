import axios from './client';

export interface MetricEntry {
    time: string;
    teamId: string;
    userId?: string;
    metricType: string;
    value: number;
    unit: string;
    source: 'jira' | 'github' | 'csv' | 'manual';
    createdBy: string;
    metadata?: any;
}

export const metricsAPI = {
    create: (data: MetricEntry) => axios.post('/api/v1/metrics', data),
    bulkCreate: (data: MetricEntry[]) => axios.post('/api/v1/metrics/bulk', data),
    getByTeam: (teamId: string) => axios.get(`/api/v1/metrics/team/${teamId}`),
    getAggregates: (teamId: string, metricType: string, startDate: string, endDate: string) => 
        axios.get(`/api/v1/metrics/aggregates/${teamId}/${metricType}`, { params: { startDate, endDate } }),
};
