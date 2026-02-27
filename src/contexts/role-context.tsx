'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserRole } from '@/lib/types';

interface RoleContextType {
    role: UserRole;
    isAuthenticated: boolean;
    user: any | null;
    setRole: (role: UserRole) => void;
    setIsAuthenticated: (index: boolean) => void;
    setUser: (user: any | null) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
    const [role, setRoleState] = useState<UserRole>('CTO');
    const [isAuthenticated, setIsAuthenticatedState] = useState(false);
    const [user, setUserState] = useState<any | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const savedRole = localStorage.getItem('user_role');
        const savedUser = localStorage.getItem('user_data');
        const savedAuth = localStorage.getItem('user_auth');

        if (savedRole) setRoleState(savedRole as UserRole);
        if (savedUser) setUserState(JSON.parse(savedUser));
        if (savedAuth === 'true') setIsAuthenticatedState(true);
    }, []);

    const setRole = (newRole: UserRole) => {
        setRoleState(newRole);
        localStorage.setItem('user_role', newRole);
    };

    const setIsAuthenticated = (auth: boolean) => {
        setIsAuthenticatedState(auth);
        localStorage.setItem('user_auth', auth.toString());
        if (!auth) {
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_data');
        }
    };

    const setUser = (userData: any | null) => {
        setUserState(userData);
        if (userData) {
            localStorage.setItem('user_data', JSON.stringify(userData));
            // Also store the User ID specifically for the API client to use easily
            const userId = userData.user?.id || userData.userId || userData.id;
            if (userId) localStorage.setItem('current_user_id', userId);
        } else {
            localStorage.removeItem('user_data');
            localStorage.removeItem('current_user_id');
        }
    };

    return (
        <RoleContext.Provider value={{ role, isAuthenticated, user, setRole, setIsAuthenticated, setUser }}>
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
