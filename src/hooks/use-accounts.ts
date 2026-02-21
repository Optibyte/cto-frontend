import { useQuery } from '@tanstack/react-query';
import { accountsAPI } from '@/lib/api/client';

export function useAccounts() {
    return useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            const response = await accountsAPI.getAll();
            return response.data;
        },
    });
}
