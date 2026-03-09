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
    const [jiraStatus, setJiraStatus] = useState<any>(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const [connectOpen, setConnectOpen] = useState(false);
    const [isJiraConnected, setIsJiraConnected] = useState(false);

    const fetchStatus = useCallback(async () => {
        setStatusLoading(true);
        try {
            const integr = await jiraMetricsAPI.getIntegration();
            setIsJiraConnected(!!integr?.jiraSiteUrl);
        } catch {
            setIsJiraConnected(false);
        } finally {
            setStatusLoading(false);
        }
    }, []);

    useEffect(() => { fetchStatus(); }, [fetchStatus]);

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
// Jira Connect Modal — 1-step wizard
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
            }
        }).finally(() => setLoading(false));
    }, [open]);

    const handleDisconnect = async () => {
        setSaving(true);
        try {
            const res = await jiraMetricsAPI.connect({
                jiraSiteUrl: '',
                jiraEmail: '',
                jiraApiToken: '',
                projectMappings: [],
                userMappings: []
            });
            toast.success(`✅ Jira disconnected.`);
            onSuccess();
        } catch (e: any) {
            toast.error(`Disconnect failed: ${e.message}`);
        } finally {
            setSaving(false);
        }
    };

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
            if (res.status === 'success' || res.success || res.projectsUpdated > 0 || res.usersUpdated > 0) {
                toast.success(`✅ Jira connected! ${res.message || ''}`);
                onSuccess();
            } else {
                toast.error(`Partial errors: ${res.errors?.join(', ') || res.message || 'Unknown error'}`);
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
                                API Credentials
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-2 space-y-4">
                    {/* ── Step 1: Credentials ──────────────────────── */}
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
                </div>

                <DialogFooter className="flex gap-2 pt-2 justify-between w-full">
                    <Button variant="destructive" className="rounded-xl" onClick={handleDisconnect} disabled={saving}>
                        Disconnect
                    </Button>
                    <div className="flex gap-2">
                        <Button className="rounded-xl gap-2 font-bold" onClick={handleSave} disabled={saving || (!jiraSiteUrl || !jiraEmail || !jiraApiToken)}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Save & Connect
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
