import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

const authClient = axios.create({
    baseURL: `${API_BASE_URL}/api/v1/auth`,
    headers: { 'Content-Type': 'application/json' },
});

export interface LoginRequest {
    email: string;
    password?: string;
}

export interface SignupRequest {
    email: string;
    fullName: string;
    role?: string;
    avatarUrl?: string;
    timezone?: string;
    orgId?: string;
    marketId?: string;
    accountId?: string;
    projectId?: string;
    teamId?: string;
    password?: string;
}

export interface AuthResponse {
    access_token: string;
    user: {
        id: string;
        email: string;
        fullName: string;
        role: string;
        avatarUrl: string | null;
        orgId: string | null;
        marketId: string | null;
        accountId: string | null;
        projectId: string | null;
        teamId: string | null;
    };
}

export const authAPI = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await authClient.post('/login', data);
        return response.data;
    },

    signup: async (data: SignupRequest): Promise<AuthResponse> => {
        const response = await authClient.post('/signup', data);
        return response.data;
    },

    forgotPassword: async (email: string): Promise<{ message: string }> => {
        const response = await authClient.post('/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (email: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
        const response = await authClient.post('/reset-password', { email, newPassword });
        return response.data;
    },
};
