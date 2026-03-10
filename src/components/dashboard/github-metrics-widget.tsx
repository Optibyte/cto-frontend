'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Activity, GitMerge, AlertCircle, Users, Bug,
    GitCommit, Target, Zap, ShieldCheck, Clock,
    Rocket, CheckCircle2, XCircle, AlertTriangle, FlaskConical,
    RefreshCw
} from 'lucide-react';
import { useAppSelector } from '@/redux/store';
import { API_BASE_URL } from '@/lib/constants';

export function GithubMetricsWidget({ projectId }: { projectId: string }) {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { dateRange } = useAppSelector((s) => s.dashboard);
    const syncingRef = useRef(false);

    // ── READ from DB ──────────────────────────────────────────────────
    const fetchMetrics = useCallback(async (isBackground = false) => {
        if (!projectId || projectId === 'all') return;
        if (!isBackground) setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const apiBase = API_BASE_URL || 'http://localhost:4000';
            let url = `${apiBase}/api/v1/projects/${projectId}/github-metrics?_t=${Date.now()}&`;
            if (dateRange?.from) url += `start=${encodeURIComponent(dateRange.from)}&`;
            if (dateRange?.to) url += `end=${encodeURIComponent(dateRange.to)}&`;
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) return;
            const data = await res.json();
            setMetrics(data);
            setError(null);
        } catch {
            // silent background failure
        } finally {
            setLoading(false);
        }
    }, [projectId, dateRange?.from, dateRange?.to]);

    // ── Background SYNC (runs Python engine silently) ──────────────────
    const backgroundSync = useCallback(async () => {
        if (!projectId || projectId === 'all') return;
        if (syncingRef.current) return; // prevent overlap
        syncingRef.current = true;
        setSyncing(true);
        try {
            const token = localStorage.getItem('access_token');
            const apiBase = API_BASE_URL || 'http://localhost:4000';
            await fetch(`${apiBase}/api/v1/projects/${projectId}/sync-github`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setLastSync(new Date());
            // After sync completes, fetch the latest values
            setTimeout(() => fetchMetrics(true), 1500);
        } catch {
            // silent
        } finally {
            syncingRef.current = false;
            setSyncing(false);
        }
    }, [projectId, fetchMetrics]);

    useEffect(() => {
        if (!projectId || projectId === 'all') {
            setMetrics(null);
            setLoading(false);
            return;
        }

        // 1. Initial load from DB immediately
        fetchMetrics();

        // 2. Poll DB every 5s to show updated values
        const poll = setInterval(() => fetchMetrics(true), 5000);

        // 3. Auto background-sync every 30s (formula runs in backend)
        backgroundSync(); // first sync on mount
        const sync = setInterval(() => backgroundSync(), 30000);

        return () => {
            clearInterval(poll);
            clearInterval(sync);
        };
    }, [fetchMetrics, backgroundSync, projectId]);

    if (!projectId || projectId === 'all') return null;

    // ── Derived values from stored metrics ────────────────────────────
    const deployFailPct = metrics ? Number((metrics.deploymentFailureRate * 100).toFixed(1)) : 0;
    const defectDensityVal = metrics ? Number((metrics.defectDensity).toFixed(2)) : 0;
    const buildSuccessPct = metrics ? Number(((metrics.buildSuccessRate ?? 0) * 100).toFixed(1)) : 0;

    const totalDeploys = metrics?.totalDeployments > 0 ? metrics.totalDeployments : (metrics?.totalActionsRuns ?? 0);
    const failedDeploys = metrics?.totalDeployments > 0 ? metrics.failedDeployments : (metrics?.failedActionsRuns ?? 0);
    const reviewComments = metrics?.reviewCommentsCount ?? 0;
    const qaDefects = metrics?.qaDefects ?? 0;
    const storyPoints = metrics?.totalStoryPoints ?? 0;
    const totalBuilds = metrics?.totalBuilds ?? 0;
    const successBuilds = metrics?.successfulBuilds ?? 0;

    const deployStatus: 'good' | 'warn' | 'critical' =
        deployFailPct === 0 ? 'good' : deployFailPct < 20 ? 'warn' : 'critical';
    const defectStatus: 'good' | 'warn' | 'critical' =
        defectDensityVal === 0 ? 'good' : defectDensityVal < 1 ? 'warn' : 'critical';
    const buildStatus: 'good' | 'warn' | 'critical' =
        buildSuccessPct >= 90 ? 'good' : buildSuccessPct >= 70 ? 'warn' : 'critical';

    return (
        <div className="space-y-4 mt-8">

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
                        <Activity className="h-5 w-5 text-violet-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">GitHub Repository Intelligence</h3>
                        <p className="text-xs text-muted-foreground">
                            {metrics ? `📦 ${metrics.repoName}` : 'Loading live data...'}
                        </p>
                    </div>
                </div>

                {/* Live indicator — auto syncing, no manual button */}
                <div className="flex items-center gap-2">
                    {syncing ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
                            <RefreshCw className="h-3 w-3 text-violet-400 animate-spin" />
                            <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">Syncing…</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Live</span>
                        </div>
                    )}
                    {lastSync && (
                        <span className="text-[10px] text-muted-foreground hidden sm:block">
                            Last: {lastSync.toLocaleTimeString()}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Loading skeleton ────────────────────────────────────── */}
            {loading && !metrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="h-44 rounded-2xl bg-white/5 border border-white/8 animate-pulse" />
                    ))}
                </div>
            )}

            {metrics && (
                <>
                    {/* ══════════════════════════════════════════════════
                        THREE PRIMARY METRIC CARDS (values only, no formula UI)
                    ══════════════════════════════════════════════════ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* ─── METRIC 1: DEPLOYMENT FAILURE RATE ─── */}
                        <div className={`relative rounded-2xl border overflow-hidden ${deployStatus === 'critical' ? 'border-red-500/30 bg-gradient-to-br from-red-500/8 to-transparent'
                            : deployStatus === 'warn' ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/8 to-transparent'
                                : 'border-emerald-500/25 bg-gradient-to-br from-emerald-500/8 to-transparent'
                            }`}>
                            {/* Glow */}
                            <div className={`absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-15 ${deployStatus === 'critical' ? 'bg-red-500'
                                : deployStatus === 'warn' ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`} />

                            <div className="relative p-6">
                                {/* Label */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${deployStatus === 'critical' ? 'bg-red-500/15 text-red-400'
                                            : deployStatus === 'warn' ? 'bg-amber-500/15 text-amber-400'
                                                : 'bg-emerald-500/15 text-emerald-400'
                                            }`}>
                                            <Rocket className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Metric 1</p>
                                            <p className="text-sm font-bold text-foreground leading-tight">Deploy Failure Rate</p>
                                        </div>
                                    </div>
                                    {deployStatus === 'good'
                                        ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                        : deployStatus === 'warn'
                                            ? <AlertTriangle className="h-5 w-5 text-amber-400" />
                                            : <XCircle className="h-5 w-5 text-red-400" />}
                                </div>

                                {/* Big value */}
                                <p className={`text-6xl font-black tabular-nums mb-1 ${deployStatus === 'critical' ? 'text-red-400'
                                    : deployStatus === 'warn' ? 'text-amber-400'
                                        : 'text-emerald-400'
                                    }`}>
                                    {deployFailPct.toFixed(1)}<span className="text-3xl">%</span>
                                </p>

                                {/* Sub-stats */}
                                <p className="text-xs text-muted-foreground">
                                    {failedDeploys} failed · {totalDeploys} total deployments
                                </p>

                                {/* Thin progress bar */}
                                <div className="mt-4 h-1.5 rounded-full bg-white/8 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${deployStatus === 'critical' ? 'bg-red-400'
                                            : deployStatus === 'warn' ? 'bg-amber-400'
                                                : 'bg-emerald-400'
                                            }`}
                                        style={{ width: `${Math.min(deployFailPct, 100)}%` }}
                                    />
                                </div>

                                {/* Recent deployment status dots */}
                                {metrics.deploymentLogs?.length > 0 && (
                                    <div className="flex items-center gap-1.5 mt-3">
                                        <span className="text-[10px] text-muted-foreground mr-1">Recent:</span>
                                        {metrics.deploymentLogs.slice(0, 10).map((log: any, i: number) => (
                                            <div
                                                key={i}
                                                title={`${log.deploymentStatus} — ${log.workflowName}`}
                                                className={`w-2 h-2 rounded-full ${log.deploymentStatus === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>



                        {/* ─── METRIC 3: BUILD SUCCESS RATE ─── */}
                        <div className={`relative rounded-2xl border overflow-hidden ${buildStatus === 'critical' ? 'border-red-500/30 bg-gradient-to-br from-red-500/8 to-transparent'
                            : buildStatus === 'warn' ? 'border-yellow-500/30 bg-gradient-to-br from-yellow-500/8 to-transparent'
                                : 'border-teal-500/25 bg-gradient-to-br from-teal-500/8 to-transparent'
                            }`}>
                            <div className={`absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-15 ${buildStatus === 'critical' ? 'bg-red-500'
                                : buildStatus === 'warn' ? 'bg-yellow-500'
                                    : 'bg-teal-500'
                                }`} />
                            <div className="relative p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${buildStatus === 'critical' ? 'bg-red-500/15 text-red-400'
                                            : buildStatus === 'warn' ? 'bg-yellow-500/15 text-yellow-400'
                                                : 'bg-teal-500/15 text-teal-400'
                                            }`}>
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Metric 3</p>
                                            <p className="text-sm font-bold text-foreground leading-tight">Build Success Rate</p>
                                        </div>
                                    </div>
                                    {buildStatus === 'good'
                                        ? <CheckCircle2 className="h-5 w-5 text-teal-400" />
                                        : buildStatus === 'warn'
                                            ? <AlertTriangle className="h-5 w-5 text-yellow-400" />
                                            : <XCircle className="h-5 w-5 text-red-400" />}
                                </div>

                                {/* Big value */}
                                <p className={`text-6xl font-black tabular-nums mb-1 ${buildStatus === 'critical' ? 'text-red-400'
                                    : buildStatus === 'warn' ? 'text-yellow-400'
                                        : 'text-teal-400'
                                    }`}>
                                    {buildSuccessPct.toFixed(1)}<span className="text-3xl">%</span>
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    {successBuilds} passed · {totalBuilds} total builds
                                </p>

                                {/* Progress bar */}
                                <div className="mt-4 h-1.5 rounded-full bg-white/8 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${buildStatus === 'critical' ? 'bg-red-400'
                                            : buildStatus === 'warn' ? 'bg-yellow-400'
                                                : 'bg-teal-400'
                                            }`}
                                        style={{ width: `${Math.min(buildSuccessPct, 100)}%` }}
                                    />
                                </div>

                                {/* Recent action run dots */}
                                {metrics.recentActions?.length > 0 && (
                                    <div className="flex items-center gap-1.5 mt-3">
                                        <span className="text-[10px] text-muted-foreground mr-1">Runs:</span>
                                        {metrics.recentActions.slice(0, 10).map((run: any, i: number) => (
                                            <div
                                                key={i}
                                                title={`${run.name}: ${run.conclusion || run.status}`}
                                                className={`w-2 h-2 rounded-full ${run.conclusion === 'success' ? 'bg-teal-400'
                                                    : run.conclusion === 'failure' ? 'bg-red-400'
                                                        : 'bg-amber-400'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════════════
                        SECONDARY METRICS ROW
                    ══════════════════════════════════════════════════ */}
                    <div className="grid grid-cols-2 gap-3">
                        <MiniCard label="Merged PRs" value={metrics.mergedPRsCount}
                            sub="pull requests" icon={GitMerge} color="cyan" />
                        <MiniCard label="Open Issues" value={metrics.openIssues}
                            sub="active" icon={AlertCircle} color="amber" />
                    </div>

                    {/* ── Stats strip ─────────────────────────────────── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatChip icon={Users} label="Contributors" value={metrics.contributorsCount} />
                        <StatChip icon={GitCommit} label="Commit Rate" value={`${metrics.commitRate}/dev`} />
                        <StatChip icon={Bug} label="Bug Count" value={metrics.bugCount} />
                        <StatChip icon={AlertTriangle} label="Defect Leakage" value={`${(metrics.defectLeakage * 100).toFixed(1)}%`} />
                    </div>

                    {/* ── Recent Actions ──────────────────────────────── */}
                    {metrics.recentActions?.length > 0 && (
                        <div className="rounded-xl border border-border/40 bg-card/30 p-4">
                            <h4 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-1.5">
                                <Activity className="h-3.5 w-3.5" /> Recent GitHub Actions
                            </h4>
                            <div className="space-y-1.5">
                                {metrics.recentActions.map((run: any) => (
                                    <div key={run.id}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                                        onClick={() => window.open(run.html_url, '_blank')}>
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${run.conclusion === 'success' ? 'bg-emerald-400' : run.conclusion === 'failure' ? 'bg-red-400' : 'bg-amber-400'} animate-pulse`} />
                                        <span className="text-xs text-foreground/80 truncate flex-1">{run.name}</span>
                                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${run.conclusion === 'success' ? 'bg-emerald-500/10 text-emerald-400' : run.conclusion === 'failure' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                            {run.conclusion || run.status}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground shrink-0">{new Date(run.created_at).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Recent Commits ───────────────────────────────── */}
                    {metrics.recentCommits?.length > 0 && (
                        <div className="rounded-xl border border-border/40 bg-card/30 p-4">
                            <h4 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-1.5">
                                <GitCommit className="h-3.5 w-3.5" /> Recent Commits
                            </h4>
                            <div className="space-y-1.5">
                                {metrics.recentCommits.map((c: any) => (
                                    <div key={c.sha} className="flex items-center gap-3 px-3 py-2">
                                        <span className="font-mono text-xs text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded shrink-0">{c.sha}</span>
                                        <span className="text-xs text-foreground/70 truncate flex-1">{c.message}</span>
                                        <span className="text-[10px] text-muted-foreground shrink-0">{c.author}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Contributors ─────────────────────────────────── */}
                    {metrics.contributors?.length > 0 && (
                        <div className="rounded-xl border border-border/40 bg-card/30 p-4">
                            <h4 className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" /> Top Contributors
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                {metrics.contributors.map((c: any) => {
                                    const isInternal = !!c.internalUserId;
                                    const displayRole = c.internalRole || c.role || 'dev';
                                    const isLead = displayRole.toLowerCase().includes('lead') || displayRole.toLowerCase().includes('cto') || displayRole.toLowerCase().includes('manager');

                                    return (
                                        <div key={c.login} className="flex flex-col items-center bg-white/5 p-3 rounded-xl border border-white/5 hover:border-violet-500/30 transition-all w-[110px] relative overflow-hidden group/card shadow-sm hover:shadow-violet-500/10">
                                            {/* Role Badge - Always Visible if identified, or visible on hover */}
                                            <Badge className={cn(
                                                "absolute top-1 right-1 px-1.5 py-0 text-[7px] rounded font-black uppercase border-none tracking-tighter shadow-sm transition-all",
                                                isInternal
                                                    ? (isLead ? "bg-primary text-primary-foreground opacity-100" : "bg-primary/40 text-primary-foreground opacity-100")
                                                    : "bg-violet-500/20 text-violet-300 opacity-0 group-hover/card:opacity-100"
                                            )}>
                                                {displayRole.replace('_', ' ')}
                                            </Badge>

                                            <div className="relative mb-2">
                                                <img src={c.avatar_url} alt={c.login} className={cn(
                                                    "w-10 h-10 rounded-full ring-2 transition-all shadow-lg",
                                                    isInternal ? "ring-primary/50" : "ring-violet-500/30 group-hover/card:ring-primary/40"
                                                )} />
                                                {isInternal && (
                                                    <div className="absolute -bottom-1 -right-1 bg-primary text-white p-0.5 rounded-full border-2 border-[#09090b]">
                                                        <CheckCircle2 className="h-2.5 w-2.5" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-center w-full px-1 text-center">
                                                <span className="text-[10px] font-bold truncate w-full group-hover/card:text-primary transition-colors leading-tight">
                                                    {c.internalName || c.login}
                                                </span>
                                                <span className="text-[8px] text-muted-foreground truncate w-full opacity-60 group-hover/card:opacity-100 transition-opacity">
                                                    {c.internalEmail ? c.internalEmail.split('@')[0] : `@${c.login}`}
                                                </span>
                                            </div>

                                            <div className="mt-1.5 flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-full">
                                                <GitCommit className="h-2.5 w-2.5 text-violet-400" />
                                                <span className="text-[9px] font-bold text-foreground/80">{c.contributions}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Footer ──────────────────────────────────────── */}
                    {metrics.capturedAt && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            Snapshot: {new Date(metrics.capturedAt).toLocaleString()}
                            {lastSync && <span className="ml-2">· Auto-synced: {lastSync.toLocaleTimeString()}</span>}
                        </p>
                    )}
                </>
            )
            }
        </div >
    );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { text: string; bg: string }> = {
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    blue: { text: 'text-blue-400', bg: 'bg-blue-500/10' },
    violet: { text: 'text-violet-400', bg: 'bg-violet-500/10' },
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/10' },
    rose: { text: 'text-rose-400', bg: 'bg-rose-500/10' },
};

function MiniCard({ label, value, sub, icon: Icon, color }: any) {
    const cls = COLOR_MAP[color] || COLOR_MAP.violet;
    return (
        <div className={`${cls.bg} border border-white/5 p-4 rounded-xl hover:scale-[1.02] transition-transform`}>
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-tight">{label}</p>
                <Icon className={`h-4 w-4 shrink-0 ${cls.text}`} />
            </div>
            <p className={`text-2xl font-black leading-tight ${cls.text}`}>{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground mt-1 truncate">{sub}</p>}
        </div>
    );
}

function StatChip({ icon: Icon, label, value }: any) {
    return (
        <div className="flex items-center gap-2 bg-white/3 border border-white/5 px-3 py-2.5 rounded-xl">
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
                <p className="text-sm font-bold truncate">{value}</p>
            </div>
        </div>
    );
}
