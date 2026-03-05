'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserRole } from '@/lib/types';

interface RoleContextType {
    role: UserRole;
    isAuthenticated: boolean;
    user: any | null;
    token: string | null;
    setRole: (role: UserRole) => void;
    setIsAuthenticated: (index: boolean) => void;
    setUser: (user: any | null) => void;
    setToken: (token: string | null) => void;
    logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
    const [role, setRoleState] = useState<UserRole>('ORG');
    const [isAuthenticated, setIsAuthenticatedState] = useState(false);
    const [user, setUserState] = useState<any | null>(null);
    const [token, setTokenState] = useState<string | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const savedRole = localStorage.getItem('user_role');
        const savedUser = localStorage.getItem('user_data');
        const savedAuth = localStorage.getItem('user_auth');
        const savedToken = localStorage.getItem('access_token');

        if (savedRole) setRoleState(savedRole as UserRole);
        if (savedUser) setUserState(JSON.parse(savedUser));
        if (savedAuth === 'true') setIsAuthenticatedState(true);
        if (savedToken) setTokenState(savedToken);
    }, []);

    const setRole = (newRole: UserRole) => {
        setRoleState(newRole);
        localStorage.setItem('user_role', newRole);
    };

    const setToken = (newToken: string | null) => {
        setTokenState(newToken);
        if (newToken) {
            localStorage.setItem('access_token', newToken);
        } else {
            localStorage.removeItem('access_token');
        }
    };

    const setIsAuthenticated = (auth: boolean) => {
        setIsAuthenticatedState(auth);
        localStorage.setItem('user_auth', auth.toString());
        if (!auth) {
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_data');
            localStorage.removeItem('access_token');
        }
    };

    const setUser = (userData: any | null) => {
        setUserState(userData);
        if (userData) {
            localStorage.setItem('user_data', JSON.stringify(userData));
            const userId = userData.id || userData.user?.id;
            if (userId) localStorage.setItem('current_user_id', userId);
        } else {
            localStorage.removeItem('user_data');
            localStorage.removeItem('current_user_id');
        }
    };

    const logout = () => {
        setRoleState('ORG');
        setIsAuthenticatedState(false);
        setUserState(null);
        setTokenState(null);
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_auth');
        localStorage.removeItem('access_token');
        localStorage.removeItem('current_user_id');
    };

    return (
        <RoleContext.Provider value={{ role, isAuthenticated, user, token, setRole, setIsAuthenticated, setUser, setToken, logout }}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRole() {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
}
