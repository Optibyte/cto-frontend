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
 *  - PROJECT_MANAGER                → only projects where user is linked
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

        // Unwrap nested user object if backend returns { user: {...}, token: ... }
        const u = user?.user ?? user;
        const userId: string | null = u?.id || null;

        // Direct projectId on the user record
        const directProjectId: string | null = u?.projectId || null;

        // Teams the user belongs to — include members, direct teams, and teams led (for TLs)
        const rawTeams: any[] = [...(u?.teams || []), ...(u?.teamMembers || []), ...(u?.teamsLed || [])];
        const singleTeamId: string | null = u?.teamId || null;

        // Build a set of team IDs
        const linkedTeamIds: string[] = Array.from(new Set(
            rawTeams
                .map((t: any) => t.id || t.teamId || t.team?.id)
                .filter(Boolean)
        ));
        if (singleTeamId && !linkedTeamIds.includes(singleTeamId)) {
            linkedTeamIds.push(singleTeamId);
        }

        // Build a set of project IDs from:
        // 1. Direct u.projectId
        // 2. Each team's .projectId field
        const linkedProjectIds: string[] = [];
        if (directProjectId) linkedProjectIds.push(directProjectId);
        rawTeams.forEach((t: any) => {
            const pid = t.projectId || t.project?.id || t.team?.projectId;
            if (pid && !linkedProjectIds.includes(pid)) linkedProjectIds.push(pid);
        });

        if (role === 'PROJECT_MANAGER') {
            return {
                isRestricted: true,
                allowedProjectIds: linkedProjectIds.length > 0 ? linkedProjectIds : null,
                allowedTeamIds: null,   // PM can see all teams within their project(s)
                allowedUserId: userId,
                fenceLabel: `🔒 Showing only your assigned project${linkedProjectIds.length > 1 ? 's' : ''}`,
            };
        }

        if (role === 'TEAM_LEAD' || role === 'TEAM' || role === 'MEMBER') {
            return {
                isRestricted: true,
                // Fence projects to what their teams are under
                allowedProjectIds: linkedProjectIds.length > 0 ? linkedProjectIds : null,
                allowedTeamIds: linkedTeamIds.length > 0 ? linkedTeamIds : null,
                allowedUserId: userId,
                fenceLabel: role === 'TEAM_LEAD'
                    ? '🔒 Showing only your team\'s project data'
                    : '🔒 Showing only your team data',
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
