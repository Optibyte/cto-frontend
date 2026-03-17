import { useQuery } from '@tanstack/react-query';
import { auditAPI } from '@/lib/api/client';

export function useAuditLogs(limit: number = 50, offset: number = 0) {
    return useQuery({
        queryKey: ['audit-logs', limit, offset],
        queryFn: async () => {
            const { data } = await auditAPI.getAll(limit, offset);
            return data;
        },
    });
}

export function useAuditStats() {
    return useQuery({
        queryKey: ['audit-stats'],
        queryFn: async () => {
            const { data } = await auditAPI.getStats();
            return data;
        },
    });
}

export function useEntityAuditLogs(type: string, id: string) {
    return useQuery({
        queryKey: ['audit-logs', type, id],
        queryFn: async () => {
            const { data } = await auditAPI.getByEntity(type, id);
            return data;
        },
        enabled: !!type && !!id,
    });
}
