'use client';

import { useQuery } from '@tanstack/react-query';
import { hierarchyAPI } from '@/lib/api/hierarchy';

export function useHierarchy() {
    return useQuery({
        queryKey: ['hierarchy'],
        queryFn: () => hierarchyAPI.getHierarchyByUser(''), // Get user-specific hierarchy
    });
}

export function useOrgHierarchy() {
    return useQuery({
        queryKey: ['org-hierarchy'],
        queryFn: () => hierarchyAPI.getFullHierarchy(), // Get full organizational hierarchy
    });
}

export function useHierarchyByUser(userId: string) {
    return useQuery({
        queryKey: ['hierarchy', userId],
        queryFn: () => hierarchyAPI.getHierarchyByUser(userId),
        enabled: !!userId,
    });
}
