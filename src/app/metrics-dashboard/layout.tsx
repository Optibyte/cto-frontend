'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useRole, useDataFence } from '@/contexts/role-context';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { adminProjectsAPI, adminTeamsAPI } from '@/lib/api/admin';

interface MetricsDashboardContextType {
    filters: {
        org: string;
        country: string;
        market: string;
        account: string;
        project: string;
        team: string;
        member: string;
        dateRange: string;
        startDate: string;
        endDate: string;
    };
    updateFilter: (key: string, value: string) => void;
    setFilters: React.Dispatch<React.SetStateAction<any>>;
    clearFilters: () => void;
    apiFilters: Record<string, string>;
    scopeLabel: string | null;
    visibleFilters: Array<{
        key: string;
        label: string;
        options: string[];
        locked: boolean;
        lockedValue?: string;
    }>;
    role: string;
}

const MetricsDashboardContext = createContext<MetricsDashboardContextType | null>(null);

export function useMetricsDashboard() {
    const context = useContext(MetricsDashboardContext);
    if (!context) {
        throw new Error('useMetricsDashboard must be used within a MetricsDashboardProvider');
    }
    return context;
}

export default function MetricsDashboardLayout({ children }: { children: React.ReactNode }) {
    const { role, user } = useRole();
    const dataFence = useDataFence();

    // Determine if this role is "scoped" (PM/Project/Team-level)
    const isProjectScoped = ['PROJECT_MANAGER', 'PROJECT'].includes(role);
    const isTeamScoped = ['TEAM_LEAD', 'TEAM', 'MEMBER'].includes(role);
    const isAccountScoped = role === 'ACCOUNT';
    const isMarketScoped = role === 'MARKET';
    const isOrgScoped = role === 'ORG';
    const isHighLevel = role === 'CTO';

    // Unwrap nested user object
    const u = user?.user ?? user;

    // For scoped users: get their fixed scope from the user record
    const fixedProjectId: string = u?.projectId || '';
    const fixedTeamId: string = u?.teamId || '';
    const fixedAccountId: string = u?.accountId || '';
    const fixedMarketId: string = u?.marketId || '';
    const fixedOrgId: string = u?.orgId || u?.organizationId || '';

    const { data: hierarchy } = useOrgHierarchy();

    // For high-level roles: fetch full project/team lists from hierarchy
    // For scoped roles: fetch only their allowed projects/teams
    const [scopedProjects, setScopedProjects] = useState<any[]>([]);
    const [scopedTeams, setScopedTeams] = useState<any[]>([]);

    // Extract names for the locked scopes since backend expects names
    const fixedProjectName = useMemo(() => {
        if (!fixedProjectId) return '';
        if (scopedProjects.length > 0) {
            return scopedProjects.find((p: any) => p.id === fixedProjectId)?.name || fixedProjectId;
        }
        return u?.project?.name || fixedProjectId;
    }, [fixedProjectId, scopedProjects, u]);

    const fixedTeamName = useMemo(() => {
        if (!fixedTeamId) return '';
        if (scopedTeams.length > 0) {
            return scopedTeams.find((t: any) => t.id === fixedTeamId)?.name || fixedTeamId;
        }
        return u?.team?.name || fixedTeamId;
    }, [fixedTeamId, scopedTeams, u]);

    const fixedAccountName = useMemo(() => {
        if (!fixedAccountId) return '';
        let match = hierarchy?.markets?.flatMap((m: any) => m.accounts)?.find((a: any) => a.id === fixedAccountId)?.name;
        return match || u?.account?.name || fixedAccountId;
    }, [fixedAccountId, hierarchy, u]);

    const fixedMarketName = useMemo(() => {
        if (!fixedMarketId) return '';
        let match = hierarchy?.markets?.find((m: any) => m.id === fixedMarketId)?.name;
        return match || u?.market?.name || fixedMarketId;
    }, [fixedMarketId, hierarchy, u]);

    const fixedOrgName = useMemo(() => {
        if (!fixedOrgId) return '';
        let match = hierarchy?.organizations?.find((o: any) => o.id === fixedOrgId)?.name;
        return match || u?.organization?.name || fixedOrgId;
    }, [fixedOrgId, hierarchy, u]);

    const [filters, setFilters] = useState({
        org: isOrgScoped && fixedOrgName ? fixedOrgName : 'all',
        country: 'all',
        market: isMarketScoped && fixedMarketName ? fixedMarketName : 'all',
        account: isAccountScoped && fixedAccountName ? fixedAccountName : 'all',
        project: isProjectScoped && fixedProjectName ? fixedProjectName : 'all',
        team: isTeamScoped && fixedTeamName ? fixedTeamName : 'all',
        member: 'all',
        dateRange: 'all',
        startDate: '',
        endDate: '',
    });

    // Re-apply scope lock when user data loads
    useEffect(() => {
        if (isOrgScoped && fixedOrgName) setFilters(prev => ({ ...prev, org: fixedOrgName }));
        if (isMarketScoped && fixedMarketName) setFilters(prev => ({ ...prev, market: fixedMarketName }));
        if (isAccountScoped && fixedAccountName) setFilters(prev => ({ ...prev, account: fixedAccountName }));
        if (isProjectScoped && fixedProjectName) setFilters(prev => ({ ...prev, project: fixedProjectName }));
        if (isTeamScoped && fixedTeamName) setFilters(prev => ({ ...prev, team: fixedTeamName }));
    }, [fixedProjectName, fixedTeamName, fixedAccountName, fixedMarketName, fixedOrgName, isProjectScoped, isTeamScoped, isAccountScoped, isMarketScoped, isOrgScoped]);

    useEffect(() => {
        if (!isHighLevel) {
            adminProjectsAPI.getAll().then((result: any) => {
                const arr = Array.isArray(result) ? result : (result?.data || []);
                setScopedProjects(arr);
                if (arr.length === 1 && !fixedProjectName) {
                    setFilters(prev => ({ ...prev, project: arr[0].name }));
                }
            }).catch(() => setScopedProjects([]));

            adminTeamsAPI.getAll().then((result: any) => {
                const arr = Array.isArray(result) ? result : (result?.data || []);
                const filtered = fixedProjectId
                    ? arr.filter((t: any) => t.projectId === fixedProjectId || !t.projectId)
                    : arr;
                setScopedTeams(filtered);
            }).catch(() => setScopedTeams([]));
        }
    }, [isHighLevel, fixedProjectId]);

    // Derive full hierarchy filter options for high-level and middle-level roles
    const hierarchyFilterOptions = useMemo(() => {
        if (!hierarchy) return { orgs: [], countries: [], markets: [], accounts: [], projects: [], teams: [], members: [] };

        const orgs = Array.from(new Set(hierarchy.organizations?.map((o: any) => o.name) || (hierarchy.name ? [hierarchy.name] : [])));
        const countries = new Set<string>();
        const markets = new Set<string>();
        const accounts = new Set<string>();
        const projects = new Set<string>();
        const teams = new Set<string>();
        const members = new Set<string>();

        hierarchy.markets?.forEach((m: any) => {
            if (filters.org !== 'all' && m.org?.name !== filters.org) return;
            if (m.country) {
                (Array.isArray(m.country) ? m.country : [m.country]).forEach((c: string) => countries.add(c));
            }
            const mc = Array.isArray(m.country) ? m.country : (m.country ? [m.country] : []);
            if (filters.country !== 'all' && !mc.includes(filters.country)) return;
            markets.add(m.name);
            m.accounts?.forEach((a: any) => {
                if (filters.market !== 'all' && m.name !== filters.market) return;
                accounts.add(a.name);
                a.teams?.forEach((t: any) => {
                    if (filters.account !== 'all' && a.name !== filters.account) return;
                    if (t.project) projects.add(t.project.name);
                    if (filters.project !== 'all' && t.project?.name !== filters.project) return;
                    teams.add(t.name);
                    if (filters.team !== 'all' && t.name !== filters.team) return;
                    t.members?.forEach((tm: any) => { if (tm.user?.fullName) members.add(tm.user.fullName); });
                    t.users?.forEach((u: any) => { if (u.fullName) members.add(u.fullName); });
                });
            });
        });

        return {
            orgs,
            countries: Array.from(countries),
            markets: Array.from(markets),
            accounts: Array.from(accounts),
            projects: Array.from(projects),
            teams: Array.from(teams),
            members: Array.from(members),
        };
    }, [hierarchy, filters]);

    const updateFilter = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            org: 'all',
            country: 'all',
            market: isMarketScoped && fixedMarketName ? fixedMarketName : 'all',
            account: isAccountScoped && fixedAccountName ? fixedAccountName : 'all',
            project: isProjectScoped && fixedProjectName ? fixedProjectName : 'all',
            team: isTeamScoped && fixedTeamName ? fixedTeamName : 'all',
            member: 'all',
            dateRange: 'all',
            startDate: '',
            endDate: '',
        });
    };

    // Build API filters: for scoped roles, always inject their scope IDs
    const apiFilters = useMemo(() => {
        const f: Record<string, string> = {};
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== 'all' && k !== 'dateRange' && k !== 'startDate' && k !== 'endDate') {
                f[k] = v;
            }
        });

        if (filters.dateRange === '30d') {
            const date = new Date();
            date.setDate(date.getDate() - 30);
            f.startDate = date.toISOString().split('T')[0];
            f.endDate = new Date().toISOString().split('T')[0];
        } else if (filters.dateRange === '90d') {
            const date = new Date();
            date.setDate(date.getDate() - 90);
            f.startDate = date.toISOString().split('T')[0];
            f.endDate = new Date().toISOString().split('T')[0];
        } else if (filters.dateRange === 'custom') {
            if (filters.startDate) f.startDate = filters.startDate;
            if (filters.endDate) f.endDate = filters.endDate;
        }

        if (isMarketScoped && fixedMarketName && !f.market) f.market = fixedMarketName;
        if (isAccountScoped && fixedAccountName && !f.account) f.account = fixedAccountName;
        if (isProjectScoped && fixedProjectName && !f.project) f.project = fixedProjectName;
        if (isTeamScoped && fixedTeamName && !f.team) f.team = fixedTeamName;

        return f;
    }, [filters, isOrgScoped, isMarketScoped, isAccountScoped, isProjectScoped, isTeamScoped, fixedOrgName, fixedMarketName, fixedAccountName, fixedProjectName, fixedTeamName]);

    // Build the locked scope label
    const scopeLabel = useMemo(() => {
        if (!dataFence.isRestricted) return null;
        return dataFence.fenceLabel as string;
    }, [dataFence]);

    // Which filter rows to show based on role
    const visibleFilters = useMemo(() => {
        if (isHighLevel) {
            return [
                { key: 'org', label: 'Org', options: hierarchyFilterOptions.orgs, locked: false },
                { key: 'country', label: 'Country', options: hierarchyFilterOptions.countries, locked: false },
                { key: 'market', label: 'Market', options: hierarchyFilterOptions.markets, locked: false },
                { key: 'account', label: 'Account', options: hierarchyFilterOptions.accounts, locked: false },
                { key: 'project', label: 'Project', options: hierarchyFilterOptions.projects, locked: false },
                { key: 'team', label: 'Team', options: hierarchyFilterOptions.teams, locked: false },
                { key: 'member', label: 'Member', options: hierarchyFilterOptions.members, locked: false },
            ];
        }

        if (isOrgScoped) {
            return [
                { key: 'org', label: 'Org', options: hierarchyFilterOptions.orgs, locked: false },
                { key: 'country', label: 'Country', options: hierarchyFilterOptions.countries, locked: false },
                { key: 'market', label: 'Market', options: hierarchyFilterOptions.markets, locked: false },
                { key: 'account', label: 'Account', options: hierarchyFilterOptions.accounts, locked: false },
                { key: 'project', label: 'Project', options: hierarchyFilterOptions.projects, locked: false },
                { key: 'team', label: 'Team', options: hierarchyFilterOptions.teams, locked: false },
                { key: 'member', label: 'Member', options: hierarchyFilterOptions.members, locked: false },
            ];
        }

        if (isMarketScoped) {
            return [
                { key: 'market', label: 'Market', options: [], locked: true, lockedValue: fixedMarketName },
                { key: 'account', label: 'Account', options: hierarchyFilterOptions.accounts, locked: false },
                { key: 'project', label: 'Project', options: hierarchyFilterOptions.projects, locked: false },
                { key: 'team', label: 'Team', options: hierarchyFilterOptions.teams, locked: false },
                { key: 'member', label: 'Member', options: hierarchyFilterOptions.members, locked: false },
            ];
        }

        if (isAccountScoped) {
            return [
                { key: 'account', label: 'Account', options: [], locked: true, lockedValue: fixedAccountName },
                { key: 'project', label: 'Project', options: hierarchyFilterOptions.projects, locked: false },
                { key: 'team', label: 'Team', options: hierarchyFilterOptions.teams, locked: false },
                { key: 'member', label: 'Member', options: hierarchyFilterOptions.members, locked: false },
            ];
        }

        if (isProjectScoped) {
            const teamsInProject = scopedTeams.map((t: any) => t.name);
            const scopedMembers = new Set<string>();
            scopedTeams.forEach((t: any) => {
                if (filters.team !== 'all' && t.name !== filters.team) return;
                t.members?.forEach((tm: any) => { if (tm.user?.fullName) scopedMembers.add(tm.user.fullName); });
                t.users?.forEach((u: any) => { if (u.fullName) scopedMembers.add(u.fullName); });
            });

            return [
                { key: 'project', label: 'Project', options: [], locked: true, lockedValue: fixedProjectName },
                { key: 'team', label: 'Team', options: teamsInProject, locked: false },
                { key: 'member', label: 'Member', options: Array.from(scopedMembers), locked: false },
            ];
        }

        if (isTeamScoped) {
            const scopedMembers = new Set<string>();
            scopedTeams.forEach((t: any) => {
                if (t.id !== fixedTeamId) return;
                t.members?.forEach((tm: any) => { if (tm.user?.fullName) scopedMembers.add(tm.user.fullName); });
                t.users?.forEach((u: any) => { if (u.fullName) scopedMembers.add(u.fullName); });
            });

            return [
                { key: 'team', label: 'Team', options: [], locked: true, lockedValue: fixedTeamName },
                { key: 'member', label: 'Member', options: Array.from(scopedMembers), locked: false },
            ];
        }

        // Fallback
        return [
            { key: 'project', label: 'Project', options: scopedProjects.map((p: any) => p.name), locked: false },
            { key: 'team', label: 'Team', options: scopedTeams.map((t: any) => t.name), locked: false },
        ];
    }, [isHighLevel, isOrgScoped, isMarketScoped, isAccountScoped, isProjectScoped, isTeamScoped, hierarchyFilterOptions, scopedProjects, scopedTeams, fixedProjectName, fixedTeamName, fixedAccountName, fixedMarketName, fixedOrgName, filters.team]);

    const contextValue = useMemo(() => ({
        filters,
        updateFilter,
        setFilters,
        clearFilters,
        apiFilters,
        scopeLabel,
        visibleFilters,
        role
    }), [filters, apiFilters, scopeLabel, visibleFilters, role]);

    return (
        <MetricsDashboardContext.Provider value={contextValue}>
            {children}
        </MetricsDashboardContext.Provider>
    );
}
