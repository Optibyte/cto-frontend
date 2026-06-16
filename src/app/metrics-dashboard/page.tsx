'use client';

import { useState, useMemo, useEffect } from 'react';
import { AnalyticsDashboard } from '@/components/metrics/analytics-dashboard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { Filter, Lock, ChevronDown, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRole, useDataFence } from '@/contexts/role-context';
import { Badge } from '@/components/ui/badge';
import { adminProjectsAPI, adminTeamsAPI } from '@/lib/api/admin';
import Link from 'next/link';

export default function MetricsDashboardPage() {
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
        // If we have scopedProjects loaded, find it
        if (scopedProjects.length > 0) {
            return scopedProjects.find((p: any) => p.id === fixedProjectId)?.name || fixedProjectId;
        }
        // Fallback to user object if it has project populated
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
        let match = hierarchy?.markets?.flatMap((m:any) => m.accounts)?.find((a:any) => a.id === fixedAccountId)?.name;
        return match || u?.account?.name || fixedAccountId;
    }, [fixedAccountId, hierarchy, u]);

    const fixedMarketName = useMemo(() => {
        if (!fixedMarketId) return '';
        let match = hierarchy?.markets?.find((m:any) => m.id === fixedMarketId)?.name;
        return match || u?.market?.name || fixedMarketId;
    }, [fixedMarketId, hierarchy, u]);

    const fixedOrgName = useMemo(() => {
        if (!fixedOrgId) return '';
        let match = hierarchy?.organizations?.find((o:any) => o.id === fixedOrgId)?.name;
        return match || u?.organization?.name || fixedOrgId;
    }, [fixedOrgId, hierarchy, u]);

    const [activeTab, setActiveTab] = useState('ai-governance');

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
                // For project-scoped users, filter teams to their project
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

    const updateFilter = (key: keyof typeof filters, value: string) => {
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

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-6 pb-6 border-b border-border/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gradient">
                            Dashboard
                        </h1>
                        <p className="text-muted-foreground text-base md:text-lg font-medium opacity-80">
                            {activeTab === 'ai-governance'
                                ? 'Access dedicated telemetry, AI-assisted operations, and organizational efficiency indices. Select a specialized intelligence vertical below.'
                                : 'View and analyze project and team performance metrics across all sources'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <Link href="/templates" className="no-underline">
                            <Button className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold px-4 py-2.5 text-xs flex items-center gap-2 shadow-md shadow-violet-500/10 cursor-pointer transition-all">
                                <LayoutTemplate className="h-4 w-4" />
                                Templates
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Scope badge for restricted users */}
                {scopeLabel && (
                    <div className="flex items-center gap-2">
                        <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20 gap-1.5 px-3 py-1 text-sm font-semibold">
                            <Lock className="h-3.5 w-3.5" />
                            {scopeLabel}
                        </Badge>
                    </div>
                )}

                {/* Filters Region */}
                {activeTab !== 'ai-governance' && (
                    <div className="flex flex-wrap items-center gap-4 p-3 rounded-2xl border border-border/10 shadow-sm filters-card">
                        <div className="flex items-center gap-2 mr-2 opacity-50">
                            <Filter className="w-5 h-5" />
                        </div>

                        {visibleFilters.map(({ key, label, options, locked, lockedValue }) => (
                            <div key={key} className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70 ml-1 flex items-center gap-1">
                                    {label}
                                    {locked && <Lock className="h-2.5 w-2.5 text-violet-400" />}
                                </span>
                                {locked ? (
                                    <div className="w-full rounded-xl bg-background/50 border border-border/50 h-10 px-3 flex items-center justify-between text-xs font-bold text-foreground opacity-75 cursor-not-allowed select-none">
                                        <span className="truncate">{lockedValue || 'Locked'}</span>
                                        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                    </div>
                                ) : (
                                    <Select value={filters[key as keyof typeof filters]} onValueChange={(val) => updateFilter(key as keyof typeof filters, val)}>
                                        <SelectTrigger className="w-full rounded-xl bg-background/50 border-border/50 h-10 font-bold shadow-sm text-xs">
                                            <SelectValue placeholder={`All ${label}s`} />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-border/50 shadow-2xl max-h-[300px]">
                                            <SelectItem value="all" className="font-bold text-xs">All {label}s</SelectItem>
                                            {(options as string[]).map((opt: string) => (
                                                <SelectItem key={opt} value={opt} className="font-bold text-xs">{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        ))}

                        {/* Date Range Selector */}
                        <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70 ml-1">
                                Date Range
                            </span>
                            <Select value={filters.dateRange} onValueChange={(val) => updateFilter('dateRange', val)}>
                                <SelectTrigger className="w-full rounded-xl bg-background/50 border-border/50 h-10 font-bold shadow-sm text-xs">
                                    <SelectValue placeholder="All Dates" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                                    <SelectItem value="all" className="font-bold text-xs">All Dates</SelectItem>
                                    <SelectItem value="30d" className="font-bold text-xs">Last 30 Days</SelectItem>
                                    <SelectItem value="90d" className="font-bold text-xs">Last 90 Days</SelectItem>
                                    <SelectItem value="custom" className="font-bold text-xs">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Custom Date Picker Inputs */}
                        {filters.dateRange === 'custom' && (
                            <>
                                <div className="flex flex-col gap-1.5 flex-1 min-w-[130px] animate-in fade-in slide-in-from-top-1 duration-200">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70 ml-1">
                                        Start Date
                                    </span>
                                    <input
                                        type="date"
                                        className="w-full rounded-xl bg-background border border-border/50 h-10 px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                        value={filters.startDate}
                                        onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 flex-1 min-w-[130px] animate-in fade-in slide-in-from-top-1 duration-200">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70 ml-1">
                                        End Date
                                    </span>
                                    <input
                                        type="date"
                                        className="w-full rounded-xl bg-background border border-border/50 h-10 px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                        value={filters.endDate}
                                        onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                    />
                                </div>
                            </>
                        )}

                        <Button variant="ghost" onClick={clearFilters} className="mt-5 h-10 rounded-xl text-xs font-bold hover:bg-red-500/10 hover:text-red-500 transition-colors">
                            Clear
                        </Button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                <AnalyticsDashboard 
                    filters={apiFilters} 
                    activeTab={activeTab} 
                    onActiveTabChange={setActiveTab} 
                />
            </div>
        </div>
    );
}
