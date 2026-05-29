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
    Loader2, RefreshCw, Link2, Users, FolderKanban, AlertCircle, Zap, Fingerprint, KeyRound, Shield, Settings
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

    const [ssoOpen, setSsoOpen] = useState(false);
    const [ssoConfig, setSsoConfig] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem('cto_sso_config');
        if (stored) {
            try {
                setSsoConfig(JSON.parse(stored));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const handleSsoSuccess = () => {
        const stored = localStorage.getItem('cto_sso_config');
        if (stored) {
            setSsoConfig(JSON.parse(stored));
        } else {
            setSsoConfig(null);
        }
        setSsoOpen(false);
    };

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

                {/* ── SSO & AD Card ───────────────────────────────── */}
                <Card className={cn(
                    'group hover:-translate-y-1 transition-all duration-300 border-border/50 shadow-md hover:shadow-xl',
                    ssoConfig?.enabled ? 'hover:border-violet-500/30' : 'hover:border-primary/20'
                )}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="relative">
                            <div className={cn(
                                'p-3 rounded-xl transition-all duration-300',
                                ssoConfig?.enabled ? 'text-violet-500 bg-violet-500/10' : 'text-muted-foreground bg-muted/30'
                            )}>
                                <Fingerprint className="h-6 w-6" />
                            </div>
                            {ssoConfig?.enabled && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500" />
                                </span>
                            )}
                        </div>
                        {ssoConfig?.enabled ? (
                            <Badge variant="outline" className="rounded-full bg-violet-500/10 text-violet-500 border-violet-500/20 px-3 py-1">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Active (SSO)
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="rounded-full px-3 py-1 bg-secondary/50">
                                Available
                            </Badge>
                        )}
                    </CardHeader>

                    <CardContent className="pt-4 space-y-3">
                        <div>
                            <CardTitle className="text-xl">Single Sign-On & AD</CardTitle>
                            <CardDescription className="mt-1">
                                Secure access using Okta, Microsoft Entra ID (Active Directory), or SAML 2.0 / OIDC. Auto-provisions and syncs RBAC roles.
                            </CardDescription>
                        </div>
                    </CardContent>

                    <CardFooter>
                        <Button
                            variant={ssoConfig?.enabled ? 'outline' : 'default'}
                            className="w-full rounded-xl gap-2 font-medium"
                            onClick={() => setSsoOpen(true)}
                        >
                            <KeyRound className="h-4 w-4" />
                            {ssoConfig?.enabled ? 'Configure SSO' : 'Enable SSO'}
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

            {/* SSO Connect Dialog */}
            <SsoConnectModal
                open={ssoOpen}
                onOpenChange={setSsoOpen}
                onSuccess={handleSsoSuccess}
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

// ─────────────────────────────────────────────────────────────────────
// SSO & AD Connect Modal
// ─────────────────────────────────────────────────────────────────────
function SsoConnectModal({ open, onOpenChange, onSuccess }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onSuccess: () => void;
}) {
    const [provider, setProvider] = useState('Okta');
    const [protocol, setProtocol] = useState('SAML');
    const [domain, setDomain] = useState('');
    const [ssoUrl, setSsoUrl] = useState('');
    const [entityId, setEntityId] = useState('');
    const [certificate, setCertificate] = useState('');
    const [autoSync, setAutoSync] = useState(true);
    const [jitProvision, setJitProvision] = useState(true);
    const [groupMappings, setGroupMappings] = useState<Array<{ adGroup: string; role: string }>>([
        { adGroup: 'Enterprise-Admins', role: 'CTO' },
        { adGroup: 'Engineering-Leads', role: 'PROJECT_MANAGER' },
        { adGroup: 'Scrum-Masters', role: 'TEAM_LEAD' },
        { adGroup: 'Developers', role: 'TEAM' }
    ]);
    const [newAdGroup, setNewAdGroup] = useState('');
    const [newRole, setNewRole] = useState('TEAM');

    useEffect(() => {
        if (open) {
            const stored = localStorage.getItem('cto_sso_config');
            if (stored) {
                try {
                    const cfg = JSON.parse(stored);
                    setProvider(cfg.provider || 'Okta');
                    setProtocol(cfg.protocol || 'SAML');
                    setDomain(cfg.domain || '');
                    setSsoUrl(cfg.ssoUrl || '');
                    setEntityId(cfg.entityId || '');
                    setCertificate(cfg.certificate || '');
                    setAutoSync(cfg.autoSync !== false);
                    setJitProvision(cfg.jitProvision !== false);
                    setGroupMappings(cfg.groupMappings || []);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }, [open]);

    const handleSave = () => {
        if (!domain) {
            toast.error('SSO Domain is required.');
            return;
        }
        const config = {
            enabled: true,
            provider,
            protocol,
            domain,
            ssoUrl,
            entityId,
            certificate,
            autoSync,
            jitProvision,
            groupMappings
        };
        localStorage.setItem('cto_sso_config', JSON.stringify(config));
        toast.success(`✅ SSO Configuration for ${domain} saved successfully.`);
        onSuccess();
    };

    const handleDisconnect = () => {
        localStorage.removeItem('cto_sso_config');
        toast.success('SSO configuration removed.');
        onSuccess();
    };

    const addMapping = () => {
        if (!newAdGroup.trim()) return;
        setGroupMappings([...groupMappings, { adGroup: newAdGroup.trim(), role: newRole }]);
        setNewAdGroup('');
    };

    const removeMapping = (idx: number) => {
        setGroupMappings(groupMappings.filter((_, i) => i !== idx));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[620px] rounded-2xl max-h-[90vh] overflow-y-auto bg-card text-card-foreground border border-border/80">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-violet-500/10">
                            <Fingerprint className="h-5 w-5 text-violet-500" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">SSO & Active Directory Config</DialogTitle>
                            <DialogDescription>
                                Secure your organization with Enterprise Identity Providers and automated role mapping.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-2 space-y-4 text-xs">
                    {/* Provider Select */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 col-span-1">
                            <Label className="text-xs">Identity Provider</Label>
                            <select value={provider} onChange={e => setProvider(e.target.value)} className="w-full h-9 px-2 rounded-lg bg-background border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary">
                                <option value="Okta">Okta</option>
                                <option value="Microsoft Entra ID">Microsoft Entra ID (Azure AD)</option>
                                <option value="OneLogin">OneLogin</option>
                                <option value="Google Workspace">Google Workspace</option>
                                <option value="Custom SAML">Custom SAML Provider</option>
                            </select>
                        </div>
                        <div className="space-y-1.5 col-span-1">
                            <Label className="text-xs">Protocol</Label>
                            <select value={protocol} onChange={e => setProtocol(e.target.value)} className="w-full h-9 px-2 rounded-lg bg-background border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary">
                                <option value="SAML">SAML 2.0</option>
                                <option value="OIDC">OpenID Connect (OIDC)</option>
                            </select>
                        </div>
                    </div>

                    {/* Domain & Endpoint */}
                    <div className="space-y-1.5">
                        <Label className="text-xs">SSO Domain (Auto-matches user email at login) *</Label>
                        <Input className="rounded-lg h-9 bg-background" placeholder="e.g. skillvector.com or company.com" value={domain} onChange={e => setDomain(e.target.value)} />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs">SSO Sign-In URL (Identity Provider Endpoint)</Label>
                        <Input className="rounded-lg h-9 bg-background" placeholder="https://identity.yourcompany.com/sso/login" value={ssoUrl} onChange={e => setSsoUrl(e.target.value)} />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs">Issuer / Audience URI (Entity ID)</Label>
                        <Input className="rounded-lg h-9 bg-background" placeholder="https://identity.yourcompany.com/sso/metadata" value={entityId} onChange={e => setEntityId(e.target.value)} />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs">X.509 Certificate (SAML Signature Verification)</Label>
                        <textarea className="w-full h-20 p-2 text-[10px] font-mono rounded-lg bg-background border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none" placeholder="-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----" value={certificate} onChange={e => setCertificate(e.target.value)} />
                    </div>

                    <hr className="border-border/30 my-4" />

                    {/* Active Directory Sync */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="font-semibold text-sm">Active Directory (AD) Role Mapping</p>
                                <p className="text-muted-foreground text-[10px]">Automatically assign platform roles based on user group memberships.</p>
                            </div>
                            <input type="checkbox" checked={autoSync} onChange={e => setAutoSync(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                        </div>

                        {autoSync && (
                            <div className="space-y-3 bg-muted/10 border border-border/30 p-3 rounded-xl">
                                {/* Table for Group Mapping */}
                                <div className="space-y-2">
                                    <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                                        <div className="col-span-6">AD Security Group</div>
                                        <div className="col-span-5">SkillVector Role</div>
                                        <div className="col-span-1 text-center">Del</div>
                                    </div>
                                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                                        {groupMappings.map((mapping, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                                <div className="col-span-6 bg-background/50 border border-border/40 px-2 py-1 rounded text-[11px] font-mono">{mapping.adGroup}</div>
                                                <div className="col-span-5 bg-background/50 border border-border/40 px-2 py-1 rounded text-[11px] font-semibold">{mapping.role}</div>
                                                <button type="button" onClick={() => removeMapping(idx)} className="col-span-1 text-center text-rose-500 hover:text-rose-700 transition-colors">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Add Mapping Form */}
                                <div className="flex gap-2 items-end pt-2 border-t border-border/20">
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-[10px]">AD Group Name</Label>
                                        <Input className="h-8 rounded-lg text-xs" placeholder="e.g. Sales-Admins" value={newAdGroup} onChange={e => setNewAdGroup(e.target.value)} />
                                    </div>
                                    <div className="w-[140px] space-y-1">
                                        <Label className="text-[10px]">Assigned Role</Label>
                                        <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
                                            <option value="CTO">CTO / Admin</option>
                                            <option value="PROJECT_MANAGER">Project Manager</option>
                                            <option value="TEAM_LEAD">Team Lead</option>
                                            <option value="TEAM">Team Member</option>
                                        </select>
                                    </div>
                                    <Button size="sm" type="button" className="h-8 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold" onClick={addMapping}>Add</Button>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <p className="font-semibold text-sm">Just-In-Time (JIT) Provisioning</p>
                                <p className="text-muted-foreground text-[10px]">Automatically create new user profiles in SkillVector on their first successful SSO login.</p>
                            </div>
                            <input type="checkbox" checked={jitProvision} onChange={e => setJitProvision(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2 pt-2 justify-between w-full">
                    <Button variant="destructive" className="rounded-xl" onClick={handleDisconnect}>
                        Disconnect SSO
                    </Button>
                    <div className="flex gap-2">
                        <Button className="rounded-xl gap-2 font-bold bg-violet-600 hover:bg-violet-700 text-white" onClick={handleSave}>
                            Save Configuration
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
