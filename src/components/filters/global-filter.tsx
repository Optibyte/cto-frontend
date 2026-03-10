'use client';

import { useState } from 'react';
import { Filter, X, Check, ChevronDown, Landmark, Globe, Briefcase, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import {
    setSelectedMarket,
    setSelectedAccount,
    setSelectedProject,
    setSelectedTeam,
    setSelectedMember,
    setIsFiltering,
} from '@/redux/slices/dashboardSlice';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { useProjects } from '@/hooks/use-projects';
import { useRole } from '@/contexts/role-context';

export function GlobalFilter() {
    const dispatch = useAppDispatch();
    const { role } = useRole();
    const {
        selectedMarket,
        selectedAccount,
        selectedProject,
        selectedTeam,
        selectedMember,
    } = useAppSelector((s) => s.dashboard);

    const [open, setOpen] = useState(false);

    const { data: hierarchy } = useOrgHierarchy();
    const { data: allProjects = [] } = useProjects();

    const markets = hierarchy?.markets || [];
    const currentMarket = markets.find(m => m.id === selectedMarket);
    const accounts = currentMarket?.accounts || [];
    const currentAccount = accounts.find(a => a.id === selectedAccount);

    // For projects: if an account is selected, show its projects. Otherwise show all projects.
    let projects: any[] = [];
    if (selectedAccount !== 'all') {
        const accountTeams = currentAccount?.teams || [];
        const projectMap = new Map();
        accountTeams.forEach((t: any) => {
            if (t.project) projectMap.set(t.project.id, t.project);
        });
        projects = Array.from(projectMap.values());
    } else {
        projects = allProjects;
    }

    const currentProject = projects.find(p => p.id === selectedProject);
    const teams = selectedAccount !== 'all'
        ? (currentAccount?.teams || [])
        : (selectedProject !== 'all' ? (allProjects.find((p: any) => p.id === selectedProject)?.teams || []) : []);

    // Member logic (still mock for now or link to team members)
    const members: any[] = [];


    const handleApply = () => {
        dispatch(setIsFiltering(true));
        setOpen(false);
        setTimeout(() => dispatch(setIsFiltering(false)), 600);
    };

    const handleReset = () => {
        dispatch(setSelectedMarket('all'));
        // Cascading resets are handled in the slice
    };

    // Role-based visibility logic (hierarchical)
    const showMarket = role === 'ORG';
    const showAccount = role === 'ORG' || role === 'MARKET';
    const showProject = role === 'ORG' || role === 'MARKET' || role === 'ACCOUNT';
    const showTeam = role === 'ORG' || role === 'MARKET' || role === 'ACCOUNT' || role === 'PROJECT';
    const showMember = true; // Everyone can filter members in their scope

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 rounded-xl border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all px-4 py-2 h-10 shadow-sm"
                >
                    <Filter className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Filter</span>
                    {(selectedMarket !== 'all' || selectedProject !== 'all' || selectedTeam !== 'all') && (
                        <span className="ml-1 flex h-2 w-2 rounded-full bg-primary" />
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-border/50 shadow-2xl">
                <div className="bg-primary/5 px-6 py-4 border-b border-border/30">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Filter className="h-5 w-5 text-primary" />
                            </div>
                            Dashboard Filters
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6">
                    {/* Market Filter */}
                    {showMarket && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Globe className="h-3 w-3" /> Select Market
                            </label>
                            <Select
                                value={selectedMarket}
                                onValueChange={(v) => dispatch(setSelectedMarket(v))}
                            >
                                <SelectTrigger className="rounded-xl border-border/50 bg-card/50 focus:ring-primary/20">
                                    <SelectValue placeholder="All Markets" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50 shadow-xl">
                                    <SelectItem value="all">All Markets</SelectItem>
                                    {markets.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Account Filter */}
                    {showAccount && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Landmark className="h-3 w-3" /> Select Account
                            </label>
                            <Select
                                value={selectedAccount}
                                onValueChange={(v) => dispatch(setSelectedAccount(v))}
                            >
                                <SelectTrigger className="rounded-xl border-border/50 bg-card/50 focus:ring-primary/20">
                                    <SelectValue placeholder="All Accounts" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50 shadow-xl">
                                    <SelectItem value="all">All Accounts</SelectItem>
                                    {accounts.map((a) => (
                                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Project Filter */}
                    {showProject && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Briefcase className="h-3 w-3" /> Select Project
                            </label>
                            <Select
                                value={selectedProject}
                                onValueChange={(v) => dispatch(setSelectedProject(v))}
                            >
                                <SelectTrigger className="rounded-xl border-border/50 bg-card/50 focus:ring-primary/20">
                                    <SelectValue placeholder="All Projects" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50 shadow-xl">
                                    <SelectItem value="all">All Projects</SelectItem>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Team Filter */}
                    {showTeam && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Users className="h-3 w-3" /> Select Team
                            </label>
                            <Select
                                value={selectedTeam}
                                onValueChange={(v) => dispatch(setSelectedTeam(v))}
                            >
                                <SelectTrigger className="rounded-xl border-border/50 bg-card/50 focus:ring-primary/20">
                                    <SelectValue placeholder="All Teams" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50 shadow-xl">
                                    <SelectItem value="all">All Teams</SelectItem>
                                    {teams.map((t) => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Member Filter */}
                    {showMember && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <User className="h-3 w-3" /> Select Member
                            </label>
                            <Select
                                value={selectedMember}
                                onValueChange={(v) => dispatch(setSelectedMember(v))}
                            >
                                <SelectTrigger className="rounded-xl border-border/50 bg-card/50 focus:ring-primary/20">
                                    <SelectValue placeholder="All Members" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50 shadow-xl">
                                    <SelectItem value="all">All Members</SelectItem>
                                    {members.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <div className="bg-muted/30 px-6 py-4 border-t border-border/30 flex items-center justify-between gap-3">
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        className="rounded-xl text-muted-foreground hover:text-foreground"
                    >
                        Reset All
                    </Button>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="rounded-xl border-border/50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApply}
                            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-6 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
