'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRole } from '@/contexts/role-context';
import { marketsAPI, adminAccountsAPI, adminProjectsAPI, adminTeamsAPI } from '@/lib/api/admin';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import {
    setSelectedMarket,
    setSelectedAccount,
    setSelectedProject,
    setSelectedTeam,
} from '@/redux/slices/dashboardSlice';

export function DashboardFilters() {
    const { role } = useRole();
    const dispatch = useAppDispatch();
    const { selectedMarket, selectedAccount, selectedProject, selectedTeam } = useAppSelector((s) => s.dashboard);

    const [dynamicMarkets, setDynamicMarkets] = useState<any[]>([]);
    const [dynamicAccounts, setDynamicAccounts] = useState<any[]>([]);
    const [dynamicProjects, setDynamicProjects] = useState<any[]>([]);
    const [dynamicTeams, setDynamicTeams] = useState<any[]>([]);

    useEffect(() => {
        async function fetchDropdowns() {
            try {
                const [m, a, p, t] = await Promise.all([
                    marketsAPI.getAll().catch(() => []),
                    adminAccountsAPI.getAll().catch(() => []),
                    adminProjectsAPI.getAll().catch(() => []),
                    adminTeamsAPI.getAll().catch(() => [])
                ]);
                setDynamicMarkets(m || []);
                setDynamicAccounts(a || []);
                setDynamicProjects(p || []);
                setDynamicTeams(t || []);
            } catch (e) {
                console.error("Failed to fetch dropdowns:", e);
            }
        }
        fetchDropdowns();
    }, []);

    const accounts = dynamicAccounts.filter(a => selectedMarket === 'all' || a.marketId === selectedMarket);
    const projects = selectedAccount === 'all' ? dynamicProjects : dynamicProjects.filter(p => !p.accountId || p.accountId === selectedAccount);
    const teams = selectedProject === 'all' ? dynamicTeams : dynamicTeams.filter(t => !t.projectId || t.projectId === selectedProject);

    return (
        <div className="flex flex-wrap items-center gap-2">
            {(role === 'ORG') && (
                <Select value={selectedMarket} onValueChange={(v) => dispatch(setSelectedMarket(v))}>
                    <SelectTrigger className="w-[140px] h-9 rounded-xl text-sm bg-background border-border/50">
                        <SelectValue placeholder="All Markets" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Markets</SelectItem>
                        {dynamicMarkets.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            )}

            {(role === 'ORG' || role === 'MARKET') && (
                <Select value={selectedAccount} onValueChange={(v) => dispatch(setSelectedAccount(v))}>
                    <SelectTrigger className="w-[140px] h-9 rounded-xl text-sm bg-background border-border/50">
                        <SelectValue placeholder="All Accounts" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Accounts</SelectItem>
                        {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            )}

            {(role === 'ORG' || role === 'MARKET' || role === 'ACCOUNT') && (
                <Select value={selectedProject} onValueChange={(v) => dispatch(setSelectedProject(v))}>
                    <SelectTrigger className="w-[140px] h-9 rounded-xl text-sm bg-background border-border/50">
                        <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            )}

            {role !== 'TEAM' && (
                <Select value={selectedTeam} onValueChange={(v) => dispatch(setSelectedTeam(v))}>
                    <SelectTrigger className="w-[140px] h-9 rounded-xl text-sm bg-background border-border/50">
                        <SelectValue placeholder="All Teams" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Teams</SelectItem>
                        {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
}
