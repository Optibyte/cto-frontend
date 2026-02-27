import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1/ctos`,
    headers: { 'Content-Type': 'application/json' },
});

export const ctosAPI = {
    getAll: async (): Promise<any[]> => {
        const { data } = await api.get('/');
        return data;
    },

    getByEmail: async (email: string): Promise<any> => {
        const { data } = await api.get(`/email/${email}`);
        return data;
    },

    getById: async (id: string): Promise<any> => {
        const { data } = await api.get(`/${id}`);
        return data;
    },

    create: async (data: any): Promise<any> => {
        const { data: response } = await api.post('/', data);
        return response;
    },

    update: async (id: string, data: any): Promise<any> => {
        const { data: response } = await api.put(`/${id}`, data);
        return response;
    },
};
