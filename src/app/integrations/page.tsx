'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    Puzzle, ArrowUpRight, Github, Database, CheckCircle2, XCircle,
    Loader2, RefreshCw, Link2, Users, FolderKanban, AlertCircle, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { jiraMetricsAPI } from '@/lib/api/jira-metrics';
import { adminProjectsAPI, adminUsersAPI } from '@/lib/api/admin';

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────
interface JiraStatus {
    flaskConnected: boolean;
    projectsLinked: number;
    totalProjects: number;
    usersLinked: number;
    currentScopeLabel: string;
    currentScopeType: string;
    activeProjectKeys: string[];
}

interface ProjectMapping {
    ctoProjectId: string;
    ctoProjectName: string;
    jiraProjectKey: string;
    jiraBoardId: string;
}

interface UserMapping {
    ctoUserId: string;
    ctoUserName: string;
    ctoUserEmail: string;
    jiraAccountId: string;
}

// ─────────────────────────────────────────────────────────────────────
// Main Integrations Page
// ─────────────────────────────────────────────────────────────────────
export default function IntegrationsPage() {
    const [jiraStatus, setJiraStatus] = useState<JiraStatus | null>(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const [connectOpen, setConnectOpen] = useState(false);

    const fetchStatus = useCallback(async () => {
        setStatusLoading(true);
        try {
            const s = await jiraMetricsAPI.getStatus();
            setJiraStatus(s);
        } catch {
            setJiraStatus(null);
        } finally {
            setStatusLoading(false);
        }
    }, []);

    useEffect(() => { fetchStatus(); }, [fetchStatus]);

    const isJiraConnected = jiraStatus?.flaskConnected && (jiraStatus?.projectsLinked ?? 0) > 0;

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                    <p className="text-muted-foreground mt-1">
                        Connect your tools to automate real-time data collection
                    </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={fetchStatus} disabled={statusLoading}>
                    <RefreshCw className={cn('h-4 w-4', statusLoading && 'animate-spin')} />
                    Refresh
                </Button>
            </div>

            {/* Integration Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {/* ── Jira Card ──────────────────────────────────── */}
                <Card className={cn(
                    'group hover:-translate-y-1 transition-all duration-300 border-border/50 shadow-md hover:shadow-xl',
                    isJiraConnected ? 'hover:border-blue-500/30' : 'hover:border-primary/20'
                )}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="relative">
                            <div className={cn(
                                'p-3 rounded-xl transition-all duration-300',
                                isJiraConnected ? 'text-blue-500 bg-blue-500/10' : 'text-muted-foreground bg-muted/30'
                            )}>
                                <Database className="h-6 w-6" />
                            </div>
                            {/* Live dot */}
                            {isJiraConnected && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                                </span>
                            )}
                        </div>
                        {statusLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : isJiraConnected ? (
                            <Badge variant="outline" className="rounded-full bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
                            </Badge>
                        ) : jiraStatus?.flaskConnected ? (
                            <Badge variant="outline" className="rounded-full bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1">
                                <AlertCircle className="h-3 w-3 mr-1" /> Partial
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="rounded-full px-3 py-1 bg-secondary/50">
                                Available
                            </Badge>
                        )}
                    </CardHeader>

                    <CardContent className="pt-4 space-y-3">
                        <div>
                            <CardTitle className="text-xl">Jira Software</CardTitle>
                            <CardDescription className="mt-1">
                                Sync sprints, issues, and calculate all 12 Agile metrics automatically — scoped to your role.
                            </CardDescription>
                        </div>

                        {/* Status Stats */}
                        {jiraStatus && !statusLoading && (
                            <div className="grid grid-cols-3 gap-2 pt-1">
                                <StatusStat
                                    icon={<Zap className="h-3.5 w-3.5" />}
                                    label="Backend"
                                    value={jiraStatus.flaskConnected ? 'Live' : 'Offline'}
                                    good={jiraStatus.flaskConnected}
                                />
                                <StatusStat
                                    icon={<FolderKanban className="h-3.5 w-3.5" />}
                                    label="Projects"
                                    value={`${jiraStatus.projectsLinked}/${jiraStatus.totalProjects}`}
                                    good={jiraStatus.projectsLinked > 0}
                                />
                                <StatusStat
                                    icon={<Users className="h-3.5 w-3.5" />}
                                    label="Users"
                                    value={`${jiraStatus.usersLinked} linked`}
                                    good={jiraStatus.usersLinked > 0}
                                />
                            </div>
                        )}

                        {/* Active scope */}
                        {isJiraConnected && jiraStatus?.activeProjectKeys && jiraStatus.activeProjectKeys.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                                {jiraStatus.activeProjectKeys.map(k => (
                                    <Badge key={k} variant="outline" className="text-[10px] rounded-full px-2 bg-blue-500/5 border-blue-500/20 text-blue-400">
                                        {k}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>

                    <CardFooter>
                        <Button
                            variant={isJiraConnected ? 'outline' : 'default'}
                            className="w-full rounded-xl gap-2 font-medium"
                            onClick={() => setConnectOpen(true)}
                        >
                            <Link2 className="h-4 w-4" />
                            {isJiraConnected ? 'Configure Mapping' : 'Connect Jira'}
                            <ArrowUpRight className="h-4 w-4 ml-auto" />
                        </Button>
                    </CardFooter>
                </Card>

                {/* ── GitHub Card ────────────────────────────────── */}
                <Card className="group hover:-translate-y-1 transition-all duration-300 border-border/50 shadow-md hover:shadow-xl hover:border-purple-500/20">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="p-3 rounded-xl text-purple-500 bg-purple-500/10">
                            <Github className="h-6 w-6" />
                        </div>
                        <Badge variant="outline" className="rounded-full bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
                        </Badge>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                        <CardTitle className="text-xl">GitHub</CardTitle>
                        <CardDescription className="line-clamp-2">
                            Track PR velocity, code review times, and deployment frequency.
                        </CardDescription>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full rounded-xl gap-2 font-medium">
                            Configure <ArrowUpRight className="h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>

                {/* ── More Coming Soon ────────────────────────────── */}
                <Card className="border-dashed border-2 border-border/50 bg-secondary/10 flex flex-col justify-center items-center text-center p-8 hover:bg-secondary/20 transition-colors cursor-pointer group">
                    <div className="p-4 rounded-full bg-secondary/20 mb-4 group-hover:scale-110 transition-transform">
                        <Puzzle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg">More Coming Soon</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                        Adding support for GitLab, Bitbucket, and Linear.
                    </p>
                </Card>
            </div>

            {/* Jira Connect Dialog */}
            <JiraConnectModal
                open={connectOpen}
                onOpenChange={setConnectOpen}
                onSuccess={() => { fetchStatus(); setConnectOpen(false); }}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────
// Stat mini-card
// ─────────────────────────────────────────────────────────────────────
function StatusStat({ icon, label, value, good }: { icon: React.ReactNode; label: string; value: string; good: boolean }) {
    return (
        <div className={cn(
            'flex flex-col items-center gap-1 p-2 rounded-xl border text-center',
            good ? 'border-green-500/20 bg-green-500/5' : 'border-border/30 bg-muted/20'
        )}>
            <div className={cn('flex items-center gap-1', good ? 'text-green-500' : 'text-muted-foreground')}>
                {icon}
            </div>
            <span className="text-[10px] font-bold leading-none">{value}</span>
            <span className="text-[9px] text-muted-foreground">{label}</span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────
// Jira Connect Modal — 3-step wizard
// ─────────────────────────────────────────────────────────────────────
function JiraConnectModal({ open, onOpenChange, onSuccess }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onSuccess: () => void;
}) {
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [jiraSiteUrl, setJiraSiteUrl] = useState('');
    const [jiraEmail, setJiraEmail] = useState('');
    const [jiraApiToken, setJiraApiToken] = useState('');
    const [projectMaps, setProjectMaps] = useState<ProjectMapping[]>([]);
    const [userMaps, setUserMaps] = useState<UserMapping[]>([]);

    // Load CTO projects & users for mapping
    useEffect(() => {
        if (!open) { setStep(1); return; }
        setLoading(true);
        Promise.all([
            adminProjectsAPI.getAll().catch(() => []),
            adminUsersAPI.getAll().catch(() => []),
            jiraMetricsAPI.getIntegration().catch(() => null),
        ]).then(([p, u, integr]) => {
            const pArr = Array.isArray(p) ? p : [];
            const uArr = Array.isArray(u) ? u : [];
            setProjects(pArr);
            setUsers(uArr);

            // Pre-fill credentials if they exist
            if (integr) {
                setJiraSiteUrl(integr.jiraSiteUrl || '');
                setJiraEmail(integr.jiraEmail || '');
                // We don't fill the token for security, but we can set a dummy or just leave it blank
                // setJiraApiToken('********'); 
            }

            // Pre-fill mappings with existing jiraProjectKey if any
            setProjectMaps(pArr.map((proj: any) => ({
                ctoProjectId: proj.id,
                ctoProjectName: proj.name,
                jiraProjectKey: proj.jiraProjectKey || '',
                jiraBoardId: proj.jiraBoardId || '',
            })));
            setUserMaps(uArr.map((usr: any) => ({
                ctoUserId: usr.id,
                ctoUserName: usr.fullName,
                ctoUserEmail: usr.email,
                jiraAccountId: usr.jiraAccountId || '',
            })));
        }).finally(() => setLoading(false));
    }, [open]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await jiraMetricsAPI.connect({
                jiraSiteUrl,
                jiraEmail,
                jiraApiToken,
                projectMappings: projectMaps.filter(p => p.jiraProjectKey.trim()),
                userMappings: userMaps.filter(u => u.jiraAccountId.trim()),
            });
            if (res.success || res.projectsUpdated > 0 || res.usersUpdated > 0) {
                toast.success(`✅ Jira connected! ${res.message}`);
                onSuccess();
            } else {
                toast.error(`Partial errors: ${res.errors?.join(', ')}`);
            }
        } catch (e: any) {
            toast.error(`Connection failed: ${e.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[620px] rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/10">
                            <Database className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Connect Jira Software</DialogTitle>
                            <DialogDescription>
                                Step {step} of 3 — {step === 1 ? 'API Credentials' : step === 2 ? 'Project Key Mapping' : 'User Account ID Mapping'}
                            </DialogDescription>
                        </div>
                    </div>
                    {/* Step Indicator */}
                    <div className="flex gap-2 mt-4">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={cn(
                                'h-1.5 flex-1 rounded-full transition-all duration-300',
                                s <= step ? 'bg-blue-500' : 'bg-muted'
                            )} />
                        ))}
                    </div>
                </DialogHeader>

                <div className="py-2 space-y-4">
                    {/* ── Step 1: Credentials ──────────────────────── */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 text-sm text-muted-foreground">
                                <p className="font-semibold text-blue-400 mb-1">ℹ️ Where to find these?</p>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li><b>Jira Site URL</b>: your Atlassian URL (e.g. <code>company.atlassian.net</code>)</li>
                                    <li><b>Email</b>: your Jira login email</li>
                                    <li><b>API Token</b>: from <code>id.atlassian.com → Security → API tokens</code></li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <Label>Jira Site URL *</Label>
                                <Input className="rounded-xl" placeholder="yourcompany.atlassian.net"
                                    value={jiraSiteUrl} onChange={e => setJiraSiteUrl(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Jira Email *</Label>
                                <Input type="email" className="rounded-xl" placeholder="you@company.com"
                                    value={jiraEmail} onChange={e => setJiraEmail(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Jira API Token *</Label>
                                <Input type="password" className="rounded-xl" placeholder="••••••••••••"
                                    value={jiraApiToken} onChange={e => setJiraApiToken(e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Project Key Mapping ──────────────── */}
                    {step === 2 && (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Enter the <b>Jira Project Key</b> for each CTO Platform project.
                                Find it in Jira → Project Settings → Key (e.g. <code className="bg-muted px-1 rounded">BANK</code>).
                            </p>
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            ) : projectMaps.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No projects found. Create projects in Admin Console first.
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                                    {projectMaps.map((pm, i) => (
                                        <div key={pm.ctoProjectId} className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-muted/20">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate">{pm.ctoProjectName}</p>
                                                <p className="text-[10px] text-muted-foreground">CTO ID: {pm.ctoProjectId.slice(0, 8)}…</p>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <Input
                                                    className="rounded-lg h-8 w-24 text-sm font-mono uppercase"
                                                    placeholder="KEY"
                                                    value={pm.jiraProjectKey}
                                                    onChange={e => {
                                                        const updated = [...projectMaps];
                                                        updated[i] = { ...updated[i], jiraProjectKey: e.target.value.toUpperCase() };
                                                        setProjectMaps(updated);
                                                    }}
                                                />
                                                <Input
                                                    className="rounded-lg h-8 w-24 text-sm"
                                                    placeholder="Board ID"
                                                    value={pm.jiraBoardId}
                                                    onChange={e => {
                                                        const updated = [...projectMaps];
                                                        updated[i] = { ...updated[i], jiraBoardId: e.target.value };
                                                        setProjectMaps(updated);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Step 3: User Account ID Mapping ─────────── */}
                    {step === 3 && (
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Map CTO Platform users to their <b>Jira Account ID</b>.
                                Find it in Jira → Profile → Account ID (starts with a number string like <code className="bg-muted px-1 rounded">6123abc…</code>).
                                <br /><span className="text-[11px]">Leave blank to skip a user.</span>
                            </p>
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                                    {userMaps.map((um, i) => (
                                        <div key={um.ctoUserId} className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-muted/20">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate">{um.ctoUserName}</p>
                                                <p className="text-[10px] text-muted-foreground truncate">{um.ctoUserEmail}</p>
                                            </div>
                                            <Input
                                                className="rounded-lg h-8 w-40 text-sm shrink-0"
                                                placeholder="Jira Account ID"
                                                value={um.jiraAccountId}
                                                onChange={e => {
                                                    const updated = [...userMaps];
                                                    updated[i] = { ...updated[i], jiraAccountId: e.target.value };
                                                    setUserMaps(updated);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2 pt-2">
                    {step > 1 && (
                        <Button variant="ghost" className="rounded-xl" onClick={() => setStep(s => s - 1)}>
                            ← Back
                        </Button>
                    )}
                    <div className="flex-1" />
                    {step < 3 ? (
                        <Button
                            className="rounded-xl gap-2"
                            onClick={() => setStep(s => s + 1)}
                            disabled={step === 1 && (!jiraSiteUrl || !jiraEmail || !jiraApiToken)}
                        >
                            Next →
                        </Button>
                    ) : (
                        <Button className="rounded-xl gap-2 font-bold" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Save & Connect
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
