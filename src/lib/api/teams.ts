import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1/teams`,
    headers: { 'Content-Type': 'application/json' },
});

export const teamsAPI = {
    getAll: () => api.get('/'),
    getById: (id: string) => api.get(`/${id}`),
    create: (data: any) => api.post('/', data),
    update: (id: string, data: any) => api.put('/', { ...data, id }), // Backend uses Upsert logic In PUT / with id in body
    delete: (id: string) => api.delete(`/${id}`),
    addMember: (teamId: string, userId: string, roleInTeam: string) =>
        api.post(`/${teamId}/members`, { userId, roleInTeam }),
    removeMember: (teamId: string, employeeIds: string[]) =>
        api.delete('/members', { data: { id: teamId, employeeIds } }),
};
