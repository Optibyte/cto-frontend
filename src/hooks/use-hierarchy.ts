'use client';

import { useQuery } from '@tanstack/react-query';
import { hierarchyAPI } from '@/lib/api/hierarchy';

export function useHierarchy() {
    return useQuery({
        queryKey: ['hierarchy'],
        queryFn: () => hierarchyAPI.getFullHierarchy(),
    });
}

export function useHierarchyByUser(userId: string) {
    return useQuery({
        queryKey: ['hierarchy', userId],
        queryFn: () => hierarchyAPI.getHierarchyByUser(userId),
        enabled: !!userId,
    });
}
