'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsAPI } from '@/lib/api/teams';

export function useTeams() {
    return useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const { data } = await teamsAPI.getAll();
            return data;
        },
    });
}

export function useTeam(id: string) {
    return useQuery({
        queryKey: ['teams', id],
        queryFn: async () => {
            const { data } = await teamsAPI.getById(id);
            return data;
        },
        enabled: !!id,
    });
}

export function useCreateTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => teamsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
        },
    });
}

export function useUpdateTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => teamsAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}

export function useDeleteTeam() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => teamsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
        },
    });
}

export function useAddTeamMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, userId, roleInTeam }: { teamId: string; userId: string; roleInTeam: string }) =>
            teamsAPI.addMember(teamId, userId, roleInTeam),
        onSuccess: (_, { teamId }) => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            queryClient.invalidateQueries({ queryKey: ['teams', teamId] });
        },
    });
}

export function useRemoveTeamMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ teamId, employeeIds }: { teamId: string; employeeIds: string[] }) =>
            teamsAPI.removeMember(teamId, employeeIds),
        onSuccess: (_, { teamId }) => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            queryClient.invalidateQueries({ queryKey: ['teams', teamId] });
        },
    });
}
