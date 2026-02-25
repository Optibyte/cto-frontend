'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '@/lib/types';

interface RoleContextType {
    role: UserRole;
    isAuthenticated: boolean;
    setRole: (role: UserRole) => void;
    setIsAuthenticated: (index: boolean) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
    const [role, setRole] = useState<UserRole>('CTO');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <RoleContext.Provider value={{ role, isAuthenticated, setRole, setIsAuthenticated }}>
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
