import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1/employees`,
    headers: { 'Content-Type': 'application/json' },
});

export const employeesAPI = {
    getAll: (params?: any) => api.get('/', { params }),
    getById: (id: string) => api.get(`/${id}`),
    getByCode: (code: string, tlId?: string) => api.get(`/code/${code}`, { params: { tlId } }),
    create: (data: any) => api.post('/', data),
    update: (id: string, data: any) => api.put(`/${id}`, data),
    delete: (id: string) => api.delete(`/${id}`),
    getHistory: (id: string) => api.get(`/${id}/history`),
};
