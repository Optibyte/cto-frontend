'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Bell, User, ChevronDown, Shield, Briefcase, Users, Check, Globe, Landmark,
    Lock, ShieldCheck, RefreshCw, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Activity,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useRole } from '@/contexts/role-context';
import { UserRole } from '@/lib/types';
import { toast } from 'sonner';
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
import {
    useSprintAlerts,
    useRecomputeAlerts,
    useMarkAllAlertsRead,
    type SprintAlert,
} from '@/hooks/use-metrics';

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

// ─── Alert tab config ─────────────────────────────────────────────────────────
type AlertTab = 'UCL' | 'LCL' | 'BASELINE';
const TABS: { key: AlertTab; label: string; icon: string; desc: string; color: string; borderColor: string; badgeColor: string }[] = [
    {
        key: 'UCL',
        label: 'UCL Anomaly',
        icon: '🔺',
        desc: 'Sprint value exceeded Upper Control Limit (mean + 2σ)',
        color: 'text-orange-500',
        borderColor: 'border-orange-500/30',
        badgeColor: 'bg-orange-500',
    },
    {
        key: 'LCL',
        label: 'LCL Anomaly',
        icon: '🔻',
        desc: 'Sprint value dropped below Lower Control Limit (mean − 2σ)',
        color: 'text-rose-500',
        borderColor: 'border-rose-500/30',
        badgeColor: 'bg-rose-500',
    },
    {
        key: 'BASELINE',
        label: 'Below Baseline',
        icon: '⚠️',
        desc: 'Post-transformation sprint regressed below pre-transformation baseline',
        color: 'text-amber-500',
        borderColor: 'border-amber-500/30',
        badgeColor: 'bg-amber-500',
    },
];

// ─── Single alert card ────────────────────────────────────────────────────────
function AlertCard({ alert, tab }: { alert: SprintAlert; tab: typeof TABS[0] }) {
    const deviation = alert.value - alert.baseline;
    const deviationPct = alert.baseline !== 0 ? (deviation / alert.baseline) * 100 : 0;
    const isBad =
        (tab.key === 'LCL') ||
        (tab.key === 'BASELINE' && !alert.higherIsBetter ? alert.value > alert.baseline : alert.value < alert.baseline) ||
        (tab.key === 'UCL' && !alert.higherIsBetter);

    return (
        <div className={`flex flex-col gap-4 p-6 rounded-[1.8rem] border-2 ${tab.borderColor} bg-card/60 hover:bg-card hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30 transition-all duration-300`}>
            {/* Header row */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-black text-base md:text-lg text-foreground tracking-tight">
                        {alert.team?.name ?? alert.teamId}
                    </span>
                    <span className="text-xs text-muted-foreground/60">·</span>
                    <span className="text-xs font-extrabold text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-lg">
                        {alert.sprintName ?? `Sprint-${alert.sprintNumber}`}
                    </span>
                    {/* Phase badge */}
                    <span className={`text-[10px] font-black border px-2.5 py-0.5 rounded-lg uppercase tracking-wide ${alert.phase === 'before' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                            alert.phase === 'during' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                        {alert.phase}
                    </span>
                </div>
                {/* Alert type badge */}
                <span className={`text-xs font-black px-3 py-1 rounded-full text-white shrink-0 shadow-sm ${tab.badgeColor}`}>
                    {tab.key}
                </span>
            </div>

            {/* Metric name */}
            <p className={`text-[15px] font-black tracking-wide ${tab.color}`}>{alert.metricName}</p>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 bg-secondary/20 p-3 rounded-2xl border border-border/10">
                <div className="text-center">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground/80 block mb-1">Value</span>
                    <span className={`text-base md:text-lg font-black ${isBad ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {alert.value.toFixed(2)}
                    </span>
                </div>
                <div className="text-center border-l border-border/10">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground/80 block mb-1">Baseline</span>
                    <span className="text-base md:text-lg font-bold text-muted-foreground">{alert.baseline.toFixed(2)}</span>
                </div>
                <div className="text-center border-l border-border/10">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground/80 block mb-1">UCL</span>
                    <span className="text-base md:text-lg font-bold text-orange-400">{alert.ucl.toFixed(2)}</span>
                </div>
                <div className="text-center border-l border-border/10">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground/80 block mb-1">LCL</span>
                    <span className="text-base md:text-lg font-bold text-rose-400">{alert.lcl.toFixed(2)}</span>
                </div>
            </div>

            {/* σ info + deviation */}
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground/80 pt-2 border-t border-border/20">
                <span>σ = {alert.stdDev.toFixed(2)}</span>
                <span className={`font-black flex items-center gap-1.5 ${isBad ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {deviation > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {deviation > 0 ? '+' : ''}{deviation.toFixed(2)} ({deviationPct > 0 ? '+' : ''}{deviationPct.toFixed(1)}%)
                </span>
            </div>
        </div>
    );
}

// ─── Main Header Component ────────────────────────────────────────────────────
export function Header() {
    const { role, setRole, setIsAuthenticated, user, logout } = useRole();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<AlertTab>('UCL');

    // ── API-backed alerts ──────────────────────────────────────────────────
    const { data: allAlerts = [] } = useSprintAlerts();
    const recompute = useRecomputeAlerts();
    const markAllRead = useMarkAllAlertsRead();

    useEffect(() => { setMounted(true); }, []);

    // ── Auto-recompute on mount (once per session) ─────────────────────────
    useEffect(() => {
        if (!mounted) return;
        const lastKey = 'sprint_alerts_last_recompute';
        const last = Number(localStorage.getItem(lastKey) || 0);
        const now = Date.now();
        if (now - last > 5 * 60 * 1000) {
            recompute.mutate(undefined, {
                onSuccess: (res: any) => {
                    localStorage.setItem(lastKey, String(now));
                    if (res?.created > 0) {
                        toast.info(`Sprint alerts updated: ${res.created} active alerts detected`, {
                            description: 'Click the bell icon to view UCL/LCL and baseline alerts.',
                            duration: 5000,
                        });
                    }
                },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mounted]);

    // ── Grouped alerts by tab ──────────────────────────────────────────────
    const grouped = useMemo(() => ({
        UCL: allAlerts.filter(a => a.alertType === 'UCL'),
        LCL: allAlerts.filter(a => a.alertType === 'LCL'),
        BASELINE: allAlerts.filter(a => a.alertType === 'BASELINE'),
    }), [allAlerts]);

    const unreadCount = allAlerts.filter(a => !a.isRead).length;
    const totalCount = allAlerts.length;

    const currentRole = ROLES.find(r => r.value === role) || ROLES[0];
    const displayEmail = user?.email || user?.user?.email || 'user@skillvector.com';

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

                        {/* ── Bell Notifications Dialog ─────────────────────── */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors rounded-xl">
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] px-1 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-2 ring-background animate-pulse shadow-lg shadow-rose-500/50">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="max-w-[98vw] w-[98vw] max-h-[90vh] flex flex-col p-6 rounded-[2rem] border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                                {/* Header */}
                                <DialogHeader className="pb-3 border-b border-border/20 shrink-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                                            <Bell className="h-5 w-5 text-primary" />
                                            Team Sprint Alerts
                                            {totalCount > 0 && (
                                                <span className="text-xs font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full ml-1">
                                                    {totalCount}
                                                </span>
                                            )}
                                        </DialogTitle>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => recompute.mutate(undefined, {
                                                    onSuccess: () => {
                                                        localStorage.setItem('sprint_alerts_last_recompute', String(Date.now()));
                                                        toast.success('Sprint alerts recomputed');
                                                    }
                                                })}
                                                disabled={recompute.isPending}
                                                className="h-7 text-[10px] px-2 rounded-lg"
                                            >
                                                <Activity className="h-3 w-3 mr-1" />
                                                {recompute.isPending ? 'Computing…' : 'Recompute'}
                                            </Button>
                                            {unreadCount > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => markAllRead.mutate()}
                                                    className="h-7 text-[10px] px-2 rounded-lg text-muted-foreground"
                                                >
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Mark all read
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <DialogDescription className="text-xs font-medium text-muted-foreground mt-1">
                                        SPC-based anomalies (UCL/LCL) and post-transformation baseline regressions across all teams.
                                    </DialogDescription>
                                </DialogHeader>

                                {/* Tabs */}
                                <div className="flex gap-2 mt-3 shrink-0 bg-secondary/40 p-1.5 rounded-2xl">
                                    {TABS.map(tab => {
                                        const cnt = grouped[tab.key].length;
                                        return (
                                            <button
                                                key={tab.key}
                                                onClick={() => setActiveTab(tab.key)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs md:text-sm font-black transition-all ${activeTab === tab.key
                                                        ? 'bg-background shadow-md text-foreground'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                <span>{tab.icon}</span>
                                                <span>{tab.label}</span>
                                                {cnt > 0 && (
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full text-white ${tab.badgeColor}`}>
                                                        {cnt}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Tab description */}
                                {(() => {
                                    const tab = TABS.find(t => t.key === activeTab)!;
                                    return (
                                        <p className="text-[10px] text-muted-foreground/70 mt-1 shrink-0">{tab.desc}</p>
                                    );
                                })()}

                                {/* Alert list */}
                                <div className="flex-1 overflow-y-auto py-3 pr-1 space-y-3 mt-1">
                                    {grouped[activeTab].length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                                            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                                                <CheckCircle2 className="h-8 w-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-sm">No {activeTab} Alerts</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {activeTab === 'UCL' && 'No sprint metrics have exceeded the Upper Control Limit (mean + 2σ).'}
                                                    {activeTab === 'LCL' && 'No sprint metrics have dropped below the Lower Control Limit (mean − 2σ).'}
                                                    {activeTab === 'BASELINE' && 'No post-transformation sprints have regressed below their pre-transformation baseline.'}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {grouped[activeTab].map(alert => (
                                                <AlertCard
                                                    key={alert.id}
                                                    alert={alert}
                                                    tab={TABS.find(t => t.key === activeTab)!}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* ── User Menu ─────────────────────────────────────── */}
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
