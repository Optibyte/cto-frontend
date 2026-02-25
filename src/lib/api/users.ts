import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1/users`,
    headers: { 'Content-Type': 'application/json' },
});

export const usersAPI = {
    getAll: () => api.get('/'),
    getById: (id: string) => api.get(`/${id}`),
    create: (data: any) => api.post('/', data),
    update: (id: string, data: any) => api.put(`/${id}`, data),
    delete: (id: string) => api.delete(`/${id}`),
};
