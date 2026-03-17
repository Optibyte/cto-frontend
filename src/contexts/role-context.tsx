'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
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

/**
 * Data Fencing Hook — Derives which projects and teams the current user
 * is allowed to see, based on their role and user record.
 *
 * Rules:
 *  - CTO / ORG / MARKET / ACCOUNT  → no fence, see everything
 *  - PROJECT_MANAGER                → only projects where user.projectId matches OR
 *                                     user is linked to that project
 *  - TEAM_LEAD / TEAM / MEMBER      → only the team(s) the user belongs to,
 *                                     and the projects those teams are under
 */
export function useDataFence() {
    const { role, user } = useRole();

    return useMemo(() => {
        const isAdmin = ['CTO', 'ORG', 'MARKET', 'ACCOUNT'].includes(role);

        if (isAdmin) {
            return {
                isRestricted: false,
                allowedProjectIds: null,   // null = all
                allowedTeamIds: null,      // null = all
                allowedUserId: null,
            };
        }

        // Derive allowed IDs from user object
        const userId = user?.id || user?.user?.id || null;

        // Projects directly linked to this user
        const linkedProjectId: string | null = user?.projectId || user?.user?.projectId || null;

        // Teams directly linked to this user
        const linkedTeamId: string | null = user?.teamId || user?.user?.teamId || null;
        const teams: any[] = user?.teams || user?.user?.teams || [];
        const linkedTeamIds: string[] = teams.map((t: any) => t.id || t.teamId).filter(Boolean);
        if (linkedTeamId && !linkedTeamIds.includes(linkedTeamId)) linkedTeamIds.push(linkedTeamId);

        if (role === 'PROJECT_MANAGER') {
            const projectIds = linkedProjectId ? [linkedProjectId] : [];
            return {
                isRestricted: true,
                allowedProjectIds: projectIds.length > 0 ? projectIds : null,
                allowedTeamIds: null,   // PM can see all teams within their project
                allowedUserId: userId,
                fenceLabel: '🔒 Showing only your assigned project data',
            };
        }

        if (role === 'TEAM_LEAD' || role === 'TEAM' || role === 'MEMBER') {
            return {
                isRestricted: true,
                allowedProjectIds: linkedProjectId ? [linkedProjectId] : null,
                allowedTeamIds: linkedTeamIds.length > 0 ? linkedTeamIds : null,
                allowedUserId: userId,
                fenceLabel: '🔒 Showing only your team data',
            };
        }

        return {
            isRestricted: false,
            allowedProjectIds: null,
            allowedTeamIds: null,
            allowedUserId: null,
        };
    }, [role, user]);
}
