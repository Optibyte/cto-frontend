'use client';

import { useState, useMemo } from 'react';
import { AnalyticsDashboard } from '@/components/metrics/analytics-dashboard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MetricsDashboardPage() {
    const [filters, setFilters] = useState({
        org: 'all',
        country: 'all',
        market: 'all',
        account: 'all',
        project: 'all',
        team: 'all',
        member: 'all',
    });

    const { data: hierarchy } = useOrgHierarchy();

    // Derive filter options based on hierarchy and current selections
    const filterOptions = useMemo(() => {
        if (!hierarchy) return { orgs: [], countries: [], markets: [], accounts: [], projects: [], teams: [], members: [] };

        const orgs = Array.from(new Set(hierarchy.organizations?.map((o: any) => o.name) || (hierarchy.name ? [hierarchy.name] : [])));
        const countries = new Set<string>();
        const markets = new Set<string>();
        const accounts = new Set<string>();
        const projects = new Set<string>();
        const teams = new Set<string>();
        const members = new Set<string>();

        hierarchy.markets?.forEach((m: any) => {
            // Filter by Organization if selected
            if (filters.org !== 'all' && m.org?.name !== filters.org) return;

            // Countries available in the selected Org/Hierarchy
            if (m.country) {
                if (Array.isArray(m.country)) {
                    m.country.forEach((c: string) => countries.add(c));
                } else {
                    countries.add(m.country);
                }
            }

            // Market options depend on Country filter
            const marketCountries = Array.isArray(m.country) ? m.country : (m.country ? [m.country] : []);
            if (filters.country !== 'all' && !marketCountries.includes(filters.country)) return;
            markets.add(m.name);

            m.accounts?.forEach((a: any) => {
                // Account options depend on Market filter
                if (filters.market !== 'all' && m.name !== filters.market) return;
                accounts.add(a.name);

                a.teams?.forEach((t: any) => {
                    // Project options depend on Account filter
                    if (filters.account !== 'all' && a.name !== filters.account) return;
                    if (t.project) {
                        projects.add(t.project.name);
                    }

                    // Team options depend on Project filter
                    if (filters.project !== 'all' && t.project?.name !== filters.project) return;
                    teams.add(t.name);

                    // Member options depend on Team filter
                    if (filters.team !== 'all' && t.name !== filters.team) return;
                    t.members?.forEach((tm: any) => {
                        if (tm.user?.fullName) {
                            members.add(tm.user.fullName);
                        }
                    });
                    t.users?.forEach((u: any) => {
                        if (u.fullName) {
                            members.add(u.fullName);
                        }
                    });
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
            org: 'all', country: 'all', market: 'all', account: 'all', project: 'all', team: 'all', member: 'all'
        });
    };

    // Clean up filters to pass to API (remove 'all' values)
    const apiFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== 'all')
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-6 pb-6 border-b border-border/10">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gradient">
                        Metrics Dashboard
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium opacity-80">
                        View and analyze project and team performance metrics across all sources
                    </p>
                </div>

                {/* Filters Region */}
                <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-card p-3 rounded-2xl border border-border/10 shadow-sm">
                    <div className="flex items-center gap-2 mr-2 opacity-50">
                        <Filter className="w-5 h-5" />
                    </div>

                    {[
                        { key: 'org', label: 'Org', options: filterOptions.orgs },
                        { key: 'country', label: 'Country', options: filterOptions.countries },
                        { key: 'market', label: 'Market', options: filterOptions.markets },
                        { key: 'account', label: 'Account', options: filterOptions.accounts },
                        { key: 'project', label: 'Project', options: filterOptions.projects },
                        { key: 'team', label: 'Team', options: filterOptions.teams },
                        { key: 'member', label: 'Member', options: filterOptions.members }
                    ].map(({ key, label, options }) => (
                        <div key={key} className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70 ml-1">{label}</span>
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
                        </div>
                    ))}

                    <Button variant="ghost" onClick={clearFilters} className="mt-5 h-10 rounded-xl text-xs font-bold hover:bg-red-500/10 hover:text-red-500 transition-colors">
                        Clear
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                <AnalyticsDashboard filters={apiFilters} />
            </div>
        </div>
    );
}
