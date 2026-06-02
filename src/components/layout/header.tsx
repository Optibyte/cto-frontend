'use client';

import { useState, useEffect, useMemo } from 'react';
import { Bell, Search, User, ChevronDown, Shield, Briefcase, Users, Check, Globe, Landmark, Lock, ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { useRole } from '@/contexts/role-context';
import { UserRole } from '@/lib/types';
import { useTeams } from '@/hooks/use-teams';
import { useSprintMetrics } from '@/hooks/use-metrics';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const ROLES = [
    { value: 'CTO' as UserRole, label: 'Super Admin', color: 'bg-violet-600', icon: Shield, description: 'Chief Technology Officer' },
    { value: 'ORG' as UserRole, label: 'Organization', color: 'bg-purple-500', icon: Shield, description: 'Organization-wide view' },
    { value: 'MARKET' as UserRole, label: 'Market', color: 'bg-cyan-500', icon: Globe, description: 'Market analytics & oversight' },
    { value: 'ACCOUNT' as UserRole, label: 'Account', color: 'bg-rose-500', icon: Landmark, description: 'Account performance' },
    { value: 'PROJECT_MANAGER' as UserRole, label: 'Project Manager', color: 'bg-blue-600', icon: Briefcase, description: 'Project management' },
    { value: 'PROJECT' as UserRole, label: 'Project', color: 'bg-blue-500', icon: Briefcase, description: 'Project view' },
    { value: 'TEAM_LEAD' as UserRole, label: 'Team Lead', color: 'bg-orange-500', icon: Users, description: 'Team leadership' },
    { value: 'TEAM' as UserRole, label: 'Team', color: 'bg-emerald-500', icon: Users, description: 'Team performance' },
];

function getPhaseForMetric(m: any, selectedTeam: any): 'before' | 'during' | 'after' {
    const sDate = m.sprintDate ? new Date(m.sprintDate) : (m.time ? new Date(m.time) : null);
    
    const tStart = selectedTeam?.transformationStartDate ? new Date(selectedTeam.transformationStartDate) : null;
    const tEnd = selectedTeam?.transformationEndDate ? new Date(selectedTeam.transformationEndDate) : null;

    if (!sDate || !tStart) {
        const sprint = Number(m.sprintNumber || 1);
        if (sprint <= 3) return 'before';
        if (sprint <= 7) return 'during';
        return 'after';
    }

    if (sDate < tStart) return 'before';
    if (tEnd && sDate > tEnd) return 'after';
    return 'during';
}

function avg(arr: number[]): number {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function Header() {
    const { role, setRole, setIsAuthenticated, user, logout } = useRole();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const { data: allTeams = [] } = useTeams();
    const { data: sprintMetrics = [] } = useSprintMetrics();

    useEffect(() => {
        setMounted(true);
    }, []);

    const anomalies = useMemo(() => {
        if (!allTeams.length || !sprintMetrics.length) return [];

        const list: Array<{
            teamId: string;
            teamName: string;
            sprintNumber: number;
            sprintName: string;
            metricType: string;
            metricName: string;
            value: number;
            lcl: number;
            phase: 'before' | 'during' | 'after';
        }> = [];

        // Only teams with digital transformation dates configured
        const transformationTeams = (allTeams as any[]).filter(
            (t: any) => t.transformationStartDate || t.transformationEndDate
        );

        const sprintFields = [
            { key: 'velocityPoints', name: 'Sprint Velocity', higherIsBetter: true },
            { key: 'throughputPoints', name: 'Throughput Points', higherIsBetter: true },
            { key: 'qualityScore', name: 'Quality Score (%)', higherIsBetter: true },
            { key: 'doneToSaidRatio', name: 'Done to Said Ratio (%)', higherIsBetter: true },
            { key: 'technicalDebtIndex', name: 'Technical Debt Index', higherIsBetter: false },
        ];

        transformationTeams.forEach((team: any) => {
            const teamMetrics = (sprintMetrics as any[]).filter(
                (m: any) => m.teamId === team.id
            );
            if (teamMetrics.length === 0) return;

            sprintFields.forEach(field => {
                const mList = teamMetrics
                    .map((m: any) => ({
                        value: Number(m[field.key] || 0),
                        sprintNumber: Number(m.sprintNumber || 1),
                        sprintName: m.sprintName || `Sprint ${m.sprintNumber}`,
                        sprintDate: m.sprintDate || m.time || null,
                    }))
                    .sort((a, b) => a.sprintNumber - b.sprintNumber);

                const bySprint: Record<number, { values: number[]; phase: 'before' | 'during' | 'after'; sprintNumber: number; sprintName: string }> = {};
                mList.forEach((m: any) => {
                    const sprint = m.sprintNumber;
                    const phase = getPhaseForMetric(m, team);
                    if (!bySprint[sprint]) {
                        bySprint[sprint] = { values: [], phase, sprintNumber: sprint, sprintName: m.sprintName };
                    }
                    bySprint[sprint].values.push(m.value);
                });

                const phaseData = Object.values(bySprint).map(({ values, phase, sprintNumber, sprintName }) => ({
                    sprintName,
                    value: avg(values),
                    phase,
                    sprintNumber,
                })).sort((a, b) => a.sprintNumber - b.sprintNumber);

                const beforeValues = phaseData
                    .filter(p => p.phase === 'before')
                    .map(p => p.value);
                const baseline = beforeValues.length > 0 ? avg(beforeValues) : 0;

                let std = 0;
                if (beforeValues.length > 1) {
                    const variance =
                        beforeValues.reduce((sum, v) => sum + Math.pow(v - baseline, 2), 0) /
                        (beforeValues.length - 1);
                    std = Math.sqrt(variance);
                }
                const lcl = Math.max(0, baseline - 2 * std);

                if (lcl > 0) {
                    phaseData.forEach(p => {
                        if (p.value !== null && p.value < lcl) {
                            list.push({
                                teamId: team.id,
                                teamName: team.name,
                                sprintNumber: p.sprintNumber,
                                sprintName: p.sprintName,
                                metricType: field.key,
                                metricName: field.name,
                                value: p.value,
                                lcl,
                                phase: p.phase,
                            });
                        }
                    });
                }
            });
        });

        return list.sort((a, b) => {
            if (a.teamName !== b.teamName) return a.teamName.localeCompare(b.teamName);
            return b.sprintNumber - a.sprintNumber;
        });
    }, [allTeams, sprintMetrics]);

    const currentRole = ROLES.find((r) => r.value === role) || ROLES[0];

    // Get display email and ID
    const displayEmail = user?.email || user?.user?.email || 'user@skillvector.com';
    const displayId = user?.id || '';

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/30 bg-background px-6 transition-all shadow-sm shadow-black/5 dark:shadow-black/10">
            <div className="flex flex-1 items-center justify-center">
                <div className="flex items-center justify-center px-4 py-2 rounded-xl border border-primary bg-primary/10">
                    <span className="text-lg font-bold text-primary">
                        {currentRole.label}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {mounted ? (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.dispatchEvent(new Event('reset-filters'))}
                            className="h-9 rounded-xl text-xs text-muted-foreground hover:text-foreground hidden md:flex border-border/50 hover:bg-primary/5 mr-1"
                        >
                            <RefreshCw className="h-4 w-4 mr-1.5" />
                            Reset All
                        </Button>
                        <ThemeToggle />
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors rounded-xl">
                                    <Bell className="h-5 w-5" />
                                    {anomalies.length > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-background animate-pulse shadow-lg shadow-rose-500/50">
                                            {anomalies.length}
                                        </span>
                                    )}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-6 rounded-[2rem] border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                                <DialogHeader className="pb-4 border-b border-border/20">
                                    <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                                        <Bell className="h-5 w-5 text-rose-500" />
                                        Team Sprint LCL Alerts
                                    </DialogTitle>
                                    <DialogDescription className="text-xs font-medium text-muted-foreground mt-1">
                                        Active deviations where a team's sprint metric fell below the calculated Lower Control Limit (LCL) of their pre-transformation baseline.
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <div className="flex-1 overflow-y-auto py-4 pr-1 space-y-4">
                                    {anomalies.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                                            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                                                <CheckCircle2 className="h-8 w-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-sm">All Sprints Operating Within Limits</p>
                                                <p className="text-xs text-muted-foreground">No metrics are currently below their Lower Control Limit baseline.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {anomalies.map((anomaly, idx) => (
                                                <div 
                                                    key={`${anomaly.teamId}-${anomaly.sprintNumber}-${anomaly.metricType}-${idx}`}
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] hover:bg-rose-500/[0.05] transition-colors"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 mt-0.5">
                                                            <AlertTriangle className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-extrabold text-sm text-foreground">{anomaly.teamName}</span>
                                                                <span className="text-[10px] font-medium text-muted-foreground">/</span>
                                                                <span className="text-[10px] font-bold text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
                                                                    {anomaly.sprintName}
                                                                </span>
                                                                <span className={`text-[8px] font-black border px-1.5 py-0.5 rounded-md uppercase ${
                                                                    anomaly.phase === 'before' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                                    anomaly.phase === 'during' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                }`}>
                                                                    {anomaly.phase}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs font-bold text-rose-500/90 mt-1">
                                                                {anomaly.metricName}
                                                            </p>
                                                            <p className="text-[11px] text-muted-foreground/80 mt-0.5 leading-normal">
                                                                Fell below the Lower Control Limit (LCL) of {anomaly.lcl.toFixed(2)}.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6 self-end sm:self-center">
                                                        <div className="text-right">
                                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Actual</span>
                                                            <span className="text-sm font-black text-rose-500">{anomaly.value.toFixed(2)}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">LCL Limit</span>
                                                            <span className="text-sm font-bold text-muted-foreground">{anomaly.lcl.toFixed(2)}</span>
                                                        </div>
                                                        <div className="text-right min-w-[70px]">
                                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Variance</span>
                                                            <span className="text-xs font-extrabold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
                                                                {(anomaly.value - anomaly.lcl).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors rounded-xl overflow-hidden border border-border/40 p-0 h-9 w-9">
                                    <span className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                        <User className="h-5 w-5 text-primary" />
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-border/50 bg-popover/95 backdrop-blur-sm">
                                <DropdownMenuLabel className="px-3 py-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold leading-none">Logged in as</span>
                                        <span className="text-sm font-bold truncate leading-none mt-1">{displayEmail}</span>
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <span className={`h-1.5 w-1.5 rounded-full ${currentRole.color}`} />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{currentRole.label} ROLE</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="my-1 opacity-50" />
                                <DropdownMenuItem className="flex items-center gap-2 p-2.5 rounded-xl cursor-not-allowed opacity-50">
                                    <User className="h-4 w-4" />
                                    <span className="text-sm font-medium">Profile Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2 p-2.5 rounded-xl cursor-not-allowed opacity-50">
                                    <Shield className="h-4 w-4" />
                                    <span className="text-sm font-medium">Security</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1 opacity-50" />
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (mounted) {
                                            logout();
                                            router.push('/login');
                                        }
                                    }}
                                    className="flex items-center gap-2 p-2.5 rounded-xl cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        <span className="text-sm font-bold">Log out</span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <div className="h-9 w-[124px]" /> // Placeholder for ThemeToggle (36) + Bell (36) + User (36) + Gaps to avoid layout shift
                )}
            </div>
        </header>
    );
}

