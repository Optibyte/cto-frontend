import { Metric } from '../types';

export const mockMetrics: Metric[] = Array.from({ length: 100 }, (_, i) => ({
    id: `m${i + 1}`,
    time: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    teamId: ['1', '2', '3'][i % 3],
    teamName: ['Team Alpha', 'Team Beta', 'Team Gamma'][i % 3],
    metricType: ['velocity', 'quality', 'throughput', 'cycle_time'][i % 4] as any,
    value: Math.random() * 100,
    unit: ['points', '%', 'count', 'hours'][i % 4],
    source: ['jira', 'github', 'csv', 'manual'][i % 4] as any,
}));
