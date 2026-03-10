'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    Building2, Globe2, Briefcase, FolderKanban, Users2, UserPlus,
    Plus, Pencil, Trash2, Loader2, RefreshCw, ChevronRight, X, Search, CheckSquare, Square
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    marketsAPI, adminAccountsAPI, adminProjectsAPI, adminTeamsAPI, adminTeamMembersAPI, adminUsersAPI,
} from '@/lib/api/admin';
import { useRole } from '@/contexts/role-context';

// ═══════════════════════════ TYPES ═══════════════════════════

type TabKey = 'markets' | 'accounts' | 'projects' | 'teams' | 'members' | 'users';

interface TabConfig {
    key: TabKey;
    label: string;
    icon: any;
    color: string;
    gradient: string;
}

const TABS: TabConfig[] = [
    { key: 'markets', label: 'Markets', icon: Globe2, color: 'text-blue-500', gradient: 'from-blue-600 to-blue-400' },
    { key: 'accounts', label: 'Accounts', icon: Briefcase, color: 'text-emerald-500', gradient: 'from-emerald-600 to-emerald-400' },
    { key: 'projects', label: 'Projects', icon: FolderKanban, color: 'text-violet-500', gradient: 'from-violet-600 to-violet-400' },
    { key: 'teams', label: 'Teams', icon: Users2, color: 'text-amber-500', gradient: 'from-amber-600 to-amber-400' },
    { key: 'members', label: 'Team Members', icon: UserPlus, color: 'text-cyan-500', gradient: 'from-cyan-600 to-cyan-400' },
    { key: 'users', label: 'Users', icon: Building2, color: 'text-rose-500', gradient: 'from-rose-600 to-rose-400' },
];

// ═══════════════════════ ADMIN PAGE ═══════════════════════════

export default function AdminPage() {
    const { role, user } = useRole();
    const teamId = user?.teamId || null;

    // Filter tabs based on role
    const filteredTabs = TABS.filter(tab => {
        if (role === 'ORG') return true;
        if (role === 'MARKET') return ['markets', 'accounts', 'teams', 'members', 'users'].includes(tab.key);
        if (role === 'ACCOUNT') return ['accounts', 'teams', 'members', 'users'].includes(tab.key);
        if (role === 'PROJECT_MANAGER' || role === 'PROJECT') return ['projects', 'teams', 'members', 'users'].includes(tab.key);
        if (role === 'TEAM_LEAD') return ['teams', 'members'].includes(tab.key);
        return ['teams', 'members'].includes(tab.key); // Default for lower roles if they can access admin at all
    });

    const [activeTab, setActiveTab] = useState<TabKey>(filteredTabs[0]?.key || 'teams');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Linked data for dropdowns
    const [markets, setMarkets] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const apiMap: Record<TabKey, () => Promise<any>> = {
                markets: marketsAPI.getAll,
                accounts: adminAccountsAPI.getAll,
                projects: adminProjectsAPI.getAll,
                teams: adminTeamsAPI.getAll,
                members: adminTeamMembersAPI.getAll,
                users: adminUsersAPI.getAll,
            };
            const result = await apiMap[activeTab]();
            setData(Array.isArray(result) ? result : []);
        } catch (err: any) {
            toast.error(`Failed to load ${activeTab}: ${err.message}`);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    // Load linked data for dropdowns
    const fetchLinkedData = useCallback(async () => {
        try {
            const [m, a, p, u, t] = await Promise.all([
                marketsAPI.getAll().catch(() => []),
                adminAccountsAPI.getAll().catch(() => []),
                adminProjectsAPI.getAll().catch(() => []),
                adminUsersAPI.getAll().catch(() => []),
                adminTeamsAPI.getAll().catch(() => []),
            ]);
            setMarkets(Array.isArray(m) ? m : []);
            setAccounts(Array.isArray(a) ? a : []);
            setProjects(Array.isArray(p) ? p : []);
            setUsers(Array.isArray(u) ? u : []);
            setTeams(Array.isArray(t) ? t : []);
        } catch { }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { fetchLinkedData(); }, [fetchLinkedData]);

    const handleCreate = (initialData: any = null) => { setEditItem(initialData); setDialogOpen(true); };
    const handleEdit = (item: any) => { setEditItem(item); setDialogOpen(true); };

    const handleDelete = async (id: string) => {
        try {
            if (activeTab === 'members') {
                // For members, find the member to get teamId and userId
                const member = data.find((m: any) => m.id === id);
                if (member) {
                    await adminTeamMembersAPI.remove(member.teamId, member.userId);
                }
            } else {
                const apiMap: Record<string, (id: string) => Promise<any>> = {
                    markets: marketsAPI.delete,
                    accounts: adminAccountsAPI.delete,
                    projects: adminProjectsAPI.delete,
                    teams: adminTeamsAPI.delete,
                    users: adminUsersAPI.delete,
                };
                await apiMap[activeTab](id);
            }
            toast.success(`Deleted successfully`);
            setDeleteConfirm(null);
            fetchData();
            fetchLinkedData();
        } catch (err: any) {
            toast.error(`Delete failed: ${err.message}`);
        }
    };

    const handleSave = async (formData: any) => {
        try {
            if (activeTab === 'members') {
                // Bulk add members
                await adminTeamMembersAPI.addBulk(formData.teamId, {
                    userIds: formData.userIds,
                    roleInTeam: formData.roleInTeam
                });
                toast.success(`${formData.userIds.length} members added to team`);
            } else if (editItem && editItem.id) {
                const updateMap: Record<string, (id: string, data: any) => Promise<any>> = {
                    markets: marketsAPI.update,
                    accounts: adminAccountsAPI.update,
                    projects: adminProjectsAPI.update,
                    teams: adminTeamsAPI.update,
                    users: adminUsersAPI.update,
                };
                await updateMap[activeTab](editItem.id, formData);
                toast.success(`Updated successfully`);
            } else {
                const createMap: Record<string, (data: any) => Promise<any>> = {
                    markets: marketsAPI.create,
                    accounts: adminAccountsAPI.create,
                    projects: adminProjectsAPI.create,
                    teams: adminTeamsAPI.create,
                    users: adminUsersAPI.create,
                };
                await createMap[activeTab](formData);
                toast.success(`Added successfully`);
            }
            setDialogOpen(false);
            fetchData();
            fetchLinkedData();
        } catch (err: any) {
            toast.error(`Save failed: ${err.message}`);
        }
    };

    const tabConfig = TABS.find(t => t.key === activeTab)!;

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                        <Building2 className="inline h-8 w-8 mr-2 text-primary" />
                        Admin Console
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage your organization hierarchy — Markets, Accounts, Projects, Teams, Members & Users</p>
                </div>
                {!(role === 'TEAM_LEAD' && activeTab !== 'members') && (
                    <Button onClick={handleCreate} className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                        <Plus className="h-4 w-4" /> Add {tabConfig.label.slice(0, -1)}
                    </Button>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 p-1 bg-card/50 rounded-2xl border border-border/30 shadow-sm overflow-x-auto">
                {filteredTabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex-1 min-w-[140px] justify-center',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                            <Badge variant="outline" className={cn('ml-1 text-[10px] px-1.5 rounded-full', isActive && 'border-primary-foreground/30 text-primary-foreground')}>
                                {activeTab === tab.key ? data.length : '—'}
                            </Badge>
                        </button>
                    );
                })}
            </div>

            {/* Data Table */}
            <Card className="rounded-2xl border-border/30 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                        {(() => { const Icon = tabConfig.icon; return <Icon className={cn('h-5 w-5', tabConfig.color)} />; })()}
                        {tabConfig.label} ({data.length})
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="rounded-xl gap-2" onClick={fetchData}>
                        <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <div className={cn('h-12 w-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br flex items-center justify-center', tabConfig.gradient)}>
                                {(() => { const Icon = tabConfig.icon; return <Icon className="h-6 w-6 text-white" />; })()}
                            </div>
                            <p className="font-medium">No {tabConfig.label.toLowerCase()} found</p>
                            <p className="text-sm mt-1">Click &quot;Add&quot; to add your first {tabConfig.label.slice(0, -1).toLowerCase()}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/30">
                                        {getColumns(activeTab).map(col => (
                                            <th key={col} className="pb-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{col}</th>
                                        ))}
                                        <th className="pb-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider pr-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map(item => (
                                        <tr key={item.id} className="border-b border-border/20 last:border-0 hover:bg-accent/30 group transition-colors">
                                            {renderRow(activeTab, item)}
                                            <td className="py-3 text-right pr-2">
                                                <div className="flex gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-all">
                                                    {!(role === 'TEAM_LEAD' && activeTab !== 'members') && (
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-primary/10 text-primary hover:bg-primary/20" onClick={() => handleEdit(item)}>
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                    {(activeTab === 'teams') && (
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                                                            onClick={() => {
                                                                setActiveTab('members');
                                                                handleCreate({ teamId: item.id });
                                                            }}>
                                                            <UserPlus className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                    {!(role === 'TEAM_LEAD' && (activeTab === 'teams' || activeTab === 'users')) && (
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20" onClick={() => setDeleteConfirm(item.id)}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <EntityDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                tab={activeTab}
                editItem={editItem}
                onSave={handleSave}
                markets={markets}
                accounts={accounts}
                projects={projects}
                users={users}
                teams={teams}
                role={role}
                teamId={teamId}
            />

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-red-500">Confirm Delete</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. Are you sure you want to permanently delete this {activeTab.slice(0, -1)}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-4 gap-2">
                        <Button variant="ghost" className="rounded-xl" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                        <Button variant="destructive" className="rounded-xl gap-2" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
                            <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ═══════════════════ COLUMN/ROW HELPERS ══════════════════════

function getColumns(tab: TabKey): string[] {
    switch (tab) {
        case 'markets': return ['Name', 'Region Code', 'Accounts', 'Created'];
        case 'accounts': return ['Name', 'Market', 'Teams', 'Created'];
        case 'projects': return ['Name', 'Status', 'Progress', 'Team Size', 'Created'];
        case 'teams': return ['Name', 'Description', 'Project', 'Members', 'Active'];
        case 'members': return ['User', 'Email', 'Team', 'Role in Team', 'Joined'];
        case 'users': return ['Name', 'Email', 'Access Role', 'Job Role', 'Active'];
    }
}

function renderRow(tab: TabKey, item: any) {
    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '—';
    switch (tab) {
        case 'markets':
            return (<>
                <td className="py-3 text-sm font-semibold">{item.name}</td>
                <td className="py-3"><Badge variant="outline" className="rounded-full text-[10px] px-2">{item.regionCode}</Badge></td>
                <td className="py-3 text-sm text-muted-foreground">{item._count?.accounts ?? item.accounts?.length ?? 0}</td>
                <td className="py-3 text-xs text-muted-foreground">{formatDate(item.createdAt)}</td>
            </>);
        case 'accounts':
            return (<>
                <td className="py-3 text-sm font-semibold">{item.name}</td>
                <td className="py-3 text-sm text-muted-foreground">{item.market?.name || '—'}</td>
                <td className="py-3 text-sm text-muted-foreground">{item._count?.teams ?? item.teams?.length ?? 0}</td>
                <td className="py-3 text-xs text-muted-foreground">{formatDate(item.createdAt)}</td>
            </>);
        case 'projects':
            return (<>
                <td className="py-3 text-sm font-semibold">{item.name}</td>
                <td className="py-3">
                    <Badge className={cn('rounded-full text-[10px] px-2', {
                        'bg-emerald-500/10 text-emerald-500 border-emerald-500/20': item.status === 'ACTIVE',
                        'bg-amber-500/10 text-amber-500 border-amber-500/20': item.status === 'ON_HOLD',
                        'bg-blue-500/10 text-blue-500 border-blue-500/20': item.status === 'PLANNED',
                        'bg-gray-500/10 text-gray-500 border-gray-500/20': item.status === 'COMPLETED',
                    })} variant="outline">{item.status}</Badge>
                </td>
                <td className="py-3">
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${item.progress || 0}%` }} /></div>
                        <span className="text-xs text-muted-foreground">{item.progress || 0}%</span>
                    </div>
                </td>
                <td className="py-3 text-sm text-muted-foreground">{item.teamSize || 0}</td>
                <td className="py-3 text-xs text-muted-foreground">{formatDate(item.createdAt)}</td>
            </>);
        case 'teams':
            return (<>
                <td className="py-3 text-sm font-semibold">{item.name}</td>
                <td className="py-3 text-sm text-muted-foreground truncate max-w-[200px]">{item.description || '—'}</td>
                <td className="py-3 text-sm text-muted-foreground">{item.project?.name || '—'}</td>
                <td className="py-3 text-sm text-muted-foreground">{item.members?.length ?? 0}</td>
                <td className="py-3">{item.isActive ? <Badge className="bg-emerald-500/10 text-emerald-500 rounded-full text-[10px]" variant="outline">Active</Badge> : <Badge variant="outline" className="rounded-full text-[10px]">Inactive</Badge>}</td>
            </>);
        case 'members':
            return (<>
                <td className="py-3 text-sm font-semibold">{item.userName}</td>
                <td className="py-3 text-sm text-muted-foreground">{item.userEmail}</td>
                <td className="py-3"><Badge variant="secondary" className="rounded-full text-[10px] px-2">{item.teamName}</Badge></td>
                <td className="py-3 text-sm text-muted-foreground">{item.roleInTeam}</td>
                <td className="py-3 text-xs text-muted-foreground">{formatDate(item.joinedAt)}</td>
            </>);
        case 'users':
            return (<>
                <td className="py-3 text-sm font-semibold">{item.fullName}</td>
                <td className="py-3 text-sm text-muted-foreground">{item.email}</td>
                <td className="py-3"><Badge className={cn('rounded-full text-[10px] px-2', {
                    'bg-violet-500/10 text-violet-500 border-violet-500/20': item.role === 'ORG',
                    'bg-blue-500/10 text-blue-500 border-blue-500/20': item.role === 'MARKET',
                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20': item.role === 'ACCOUNT',
                    'bg-amber-500/10 text-amber-500 border-amber-500/20': item.role === 'PROJECT_MANAGER',
                    'bg-indigo-500/10 text-indigo-500 border-indigo-500/20': item.role === 'PROJECT',
                    'bg-orange-500/10 text-orange-500 border-orange-500/20': item.role === 'TEAM_LEAD',
                    'bg-pink-500/10 text-pink-500 border-pink-500/20': item.role === 'CTO',
                    'bg-rose-500/10 text-rose-500 border-rose-500/20': item.role === 'TEAM',
                })} variant="outline">
                    {item.role === 'PROJECT_MANAGER' ? 'PROJECT MANAGER' :
                        item.role === 'TEAM_LEAD' ? 'TEAM LEAD' :
                            item.role === 'TEAM' ? 'TEAM MEMBER' :
                                item.role === 'CTO' ? 'CTO' : item.role}
                </Badge></td>
                <td className="py-3 text-sm text-muted-foreground">{item.jobRole || '—'}</td>
                <td className="py-3">{item.isActive ? <Badge className="bg-emerald-500/10 text-emerald-500 rounded-full text-[10px]" variant="outline">Active</Badge> : <Badge variant="outline" className="rounded-full text-[10px]">Inactive</Badge>}</td>
            </>);
    }
}

// ═══════════════════ ENTITY DIALOG ════════════════════════════

interface EntityDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    tab: TabKey;
    editItem: any;
    onSave: (data: any) => Promise<void>;
    markets: any[];
    accounts: any[];
    projects: any[];
    users: any[];
    teams: any[];
    role: string | null;
    teamId: string | null;
}

function EntityDialog({ open, onOpenChange, tab, editItem, onSave, markets, accounts, projects, users, teams, role, teamId }: EntityDialogProps) {
    const [form, setForm] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);
    const [userSearch, setUserSearch] = useState('');

    useEffect(() => {
        if (open) {
            setUserSearch(''); // Reset search on open
            if (editItem) {
                setForm({ ...editItem });
            } else {
                setForm(getDefaultForm(tab));
            }
        }
    }, [open, editItem, tab]);

    const isEdit = !!editItem && !!editItem.id;

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const payload = buildPayload(tab, form, isEdit);
            await onSave(payload);
        } finally {
            setSaving(false);
        }
    };

    const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));
    const tabConfig = TABS.find(t => t.key === tab)!;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        {isEdit ? <Pencil className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                        {isEdit ? 'Edit' : 'Add'} {tabConfig.label.slice(0, -1)}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update the details below.' : 'Fill in the details to add a new entry.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    {tab === 'markets' && (<>
                        <div className="space-y-2"><Label>Name *</Label><Input className="rounded-xl" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. North America" /></div>
                        <div className="space-y-2"><Label>Region Code *</Label><Input className="rounded-xl" value={form.regionCode || ''} onChange={e => set('regionCode', e.target.value)} placeholder="e.g. NA" /></div>
                    </>)}

                    {tab === 'accounts' && (<>
                        <div className="space-y-2"><Label>Name *</Label><Input className="rounded-xl" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Global Finance" /></div>
                        <div className="space-y-2">
                            <Label>Market *</Label>
                            <Select value={form.marketId || ''} onValueChange={v => set('marketId', v)}>
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select market" /></SelectTrigger>
                                <SelectContent>{markets.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Account Manager *</Label>
                            <Select value={form.accountManagerId || ''} onValueChange={v => set('accountManagerId', v)}>
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select user" /></SelectTrigger>
                                <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.fullName} ({u.email})</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </>)}

                    {tab === 'projects' && (<>
                        <div className="space-y-2"><Label>Name *</Label><Input className="rounded-xl" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Banking App" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Start Date</Label><Input type="date" className="rounded-xl" value={form.startDate ? form.startDate.split('T')[0] : ''} onChange={e => set('startDate', e.target.value)} /></div>
                            <div className="space-y-2"><Label>End Date</Label><Input type="date" className="rounded-xl" value={form.enddate ? form.enddate.split('T')[0] : ''} onChange={e => set('enddate', e.target.value)} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={form.status || 'PLANNED'} onValueChange={v => set('status', v)}>
                                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PLANNED">Planned</SelectItem>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Team Size</Label><Input type="number" className="rounded-xl" value={form.teamSize || 0} onChange={e => set('teamSize', Number(e.target.value))} /></div>
                        </div>
                        <div className="space-y-2"><Label>Progress %</Label><Input type="number" min="0" max="100" className="rounded-xl" value={form.progress || 0} onChange={e => set('progress', Number(e.target.value))} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5">Jira Project Key <span className="text-[10px] text-blue-400 font-normal">(e.g. BANK)</span></Label>
                                <Input className="rounded-xl font-mono uppercase" value={form.jiraProjectKey || ''} onChange={e => set('jiraProjectKey', e.target.value.toUpperCase())} placeholder="e.g. BANK" />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5">Jira Board ID <span className="text-[10px] text-muted-foreground font-normal">(optional)</span></Label>
                                <Input className="rounded-xl" value={form.jiraBoardId || ''} onChange={e => set('jiraBoardId', e.target.value)} placeholder="e.g. 12345" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5">GitHub Repo <span className="text-[10px] text-blue-400 font-normal">(e.g. owner/repo)</span></Label>
                                <Input className="rounded-xl font-mono" value={form.githubRepoId || ''} onChange={e => set('githubRepoId', e.target.value)} placeholder="e.g. facebook/react" />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5">GitHub Token <span className="text-[10px] text-muted-foreground font-normal">(optional)</span></Label>
                                <Input type="password" className="rounded-xl font-mono" value={form.githubToken || ''} onChange={e => set('githubToken', e.target.value)} placeholder="ghp_..." />
                            </div>
                        </div>
                    </>)}

                    {tab === 'teams' && (<>
                        <div className="space-y-2"><Label>Name *</Label><Input className="rounded-xl" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Core Banking" /></div>
                        <div className="space-y-2"><Label>Description</Label><Input className="rounded-xl" value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Team description" /></div>
                        <div className="space-y-2">
                            <Label>Team Lead *</Label>
                            <Select value={form.teamLeadId || ''} onValueChange={v => set('teamLeadId', v)}>
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select team lead" /></SelectTrigger>
                                <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.fullName} ({u.role})</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Account</Label>
                                <Select value={form.accountId || 'none'} onValueChange={v => set('accountId', v === 'none' ? undefined : v)}>
                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select account" /></SelectTrigger>
                                    <SelectContent><SelectItem value="none">None</SelectItem>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Project</Label>
                                <Select value={form.projectId || 'none'} onValueChange={v => set('projectId', v === 'none' ? undefined : v)}>
                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select project" /></SelectTrigger>
                                    <SelectContent><SelectItem value="none">None</SelectItem>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                    </>)}

                    {tab === 'members' && (<>
                        <div className="space-y-2">
                            <Label>Team *</Label>
                            <Select value={form.teamId || ''} onValueChange={v => set('teamId', v)}>
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select team" /></SelectTrigger>
                                <SelectContent>
                                    {teams
                                        .filter(t => role === 'ORG' || role === 'ACCOUNT' || role === 'PROJECT_MANAGER' || t.id === teamId || t.teamLeadId === localStorage.getItem('current_user_id'))
                                        .map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Select User(s) *</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] rounded-lg"
                                    onClick={() => {
                                        const filtered = users.filter(u => ['TEAM', 'TEAM_LEAD', 'PROJECT_MANAGER', 'PROJECT'].includes(u.role));
                                        const allSelected = filtered.every(u => (form.userIds || []).includes(u.id));
                                        if (allSelected) {
                                            set('userIds', []);
                                        } else {
                                            set('userIds', filtered.map(u => u.id));
                                        }
                                    }}
                                >
                                    {(users.filter(u => ['TEAM', 'TEAM_LEAD', 'PROJECT_MANAGER', 'PROJECT'].includes(u.role)).every(u => (form.userIds || []).includes(u.id))) ? 'Deselect All' : 'Select All'}
                                </Button>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    className="pl-9 h-9 rounded-xl text-sm"
                                    placeholder="Search by name or email..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-1 max-h-[220px] overflow-y-auto p-2 rounded-xl border border-border/40 bg-muted/20">
                                {(() => {
                                    const filteredUsers = users.filter(u =>
                                        ['TEAM', 'TEAM_LEAD', 'PROJECT_MANAGER', 'PROJECT'].includes(u.role) &&
                                        (u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
                                            u.email.toLowerCase().includes(userSearch.toLowerCase()))
                                    );

                                    if (filteredUsers.length === 0) {
                                        return <div className="py-8 text-center text-xs text-muted-foreground">No users found</div>;
                                    }

                                    return filteredUsers.map(u => (
                                        <div key={u.id} className="flex items-center space-x-2 p-2 hover:bg-accent/50 rounded-lg transition-colors group">
                                            <input
                                                type="checkbox"
                                                id={`user-${u.id}`}
                                                className="h-4 w-4 rounded border-primary"
                                                checked={(form.userIds || []).includes(u.id)}
                                                onChange={(e) => {
                                                    const currentIds = form.userIds || [];
                                                    if (e.target.checked) {
                                                        set('userIds', [...currentIds, u.id]);
                                                    } else {
                                                        set('userIds', currentIds.filter((id: string) => id !== u.id));
                                                    }
                                                }}
                                            />
                                            <label htmlFor={`user-${u.id}`} className="grid cursor-pointer flex-1">
                                                <span className="text-sm font-medium leading-none">{u.fullName}</span>
                                                <span className="text-[10px] text-muted-foreground line-clamp-1">{u.jobRole || u.role} • {u.email}</span>
                                            </label>
                                        </div>
                                    ));
                                })()}
                            </div>
                            <p className="text-[10px] text-muted-foreground line-clamp-1 italic">
                                {(form.userIds || []).length} users selected
                            </p>
                        </div>
                    </>)}

                    {tab === 'users' && (<>
                        <div className="space-y-2"><Label>Full Name *</Label><Input className="rounded-xl" value={form.fullName || ''} onChange={e => set('fullName', e.target.value)} placeholder="e.g. John Doe" /></div>
                        <div className="space-y-2"><Label>Email *</Label><Input type="email" className="rounded-xl" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="john@example.com" /></div>
                        <div className="space-y-2">
                            <Label>Access Role *</Label>
                            <Select value={form.role || 'TEAM'} onValueChange={v => set('role', v)}>
                                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ORG">Organization</SelectItem>
                                    <SelectItem value="MARKET">Market</SelectItem>
                                    <SelectItem value="ACCOUNT">Account</SelectItem>
                                    <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                                    <SelectItem value="PROJECT">Project Access</SelectItem>
                                    <SelectItem value="TEAM_LEAD">Team Lead</SelectItem>
                                    <SelectItem value="CTO">CTO</SelectItem>
                                    <SelectItem value="TEAM">Team Member</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Job Role / Designation</Label><Input className="rounded-xl" value={form.jobRole || ''} onChange={e => set('jobRole', e.target.value)} placeholder="e.g. Senior Software Engineer" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5">Jira Account ID <span className="text-[10px] text-blue-400 font-normal">(links to Jira user)</span></Label>
                                <Input className="rounded-xl font-mono" value={form.jiraAccountId || ''} onChange={e => set('jiraAccountId', e.target.value)} placeholder="e.g. 6123abc..." />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1.5">GitHub Mail ID <span className="text-[10px] text-orange-400 font-normal">(for metrics)</span></Label>
                                <Input className="rounded-xl font-mono" value={form.githubEmail || ''} onChange={e => set('githubEmail', e.target.value)} placeholder="e.g. user@github.com" />
                            </div>
                        </div>
                    </>)}
                </div>

                <DialogFooter className="pt-4">
                    <Button variant="ghost" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button className="rounded-xl gap-2 font-bold" onClick={handleSubmit} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        {isEdit ? 'Update' : 'Add'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function getDefaultForm(tab: TabKey): Record<string, any> {
    switch (tab) {
        case 'markets': return { name: '', regionCode: '' };
        case 'accounts': return { name: '', marketId: '', accountManagerId: '' };
        case 'projects': return { name: '', startDate: '', enddate: '', status: 'PLANNED', teamSize: 0, progress: 0, jiraProjectKey: '', jiraBoardId: '', githubRepoId: '', githubToken: '' };
        case 'teams': return { name: '', description: '', teamLeadId: '', accountId: '', projectId: '' };
        case 'members': return { teamId: '', userIds: [], roleInTeam: 'Member' };
        case 'users': return { fullName: '', email: '', role: 'TEAM', jobRole: '', auth0Id: '', jiraAccountId: '', githubEmail: '' };
    }
}

function buildPayload(tab: TabKey, form: Record<string, any>, isEdit: boolean): any {
    switch (tab) {
        case 'markets': return { name: form.name, regionCode: form.regionCode };
        case 'accounts': return { name: form.name, marketId: form.marketId, accountManagerId: form.accountManagerId };
        case 'projects': {
            const p: any = { name: form.name, status: form.status, teamSize: Number(form.teamSize), progress: Number(form.progress) };
            if (form.startDate) p.startDate = form.startDate;
            if (form.enddate) p.enddate = form.enddate;
            if (form.jiraProjectKey) p.jiraProjectKey = form.jiraProjectKey.trim().toUpperCase();
            if (form.jiraBoardId) p.jiraBoardId = form.jiraBoardId.trim();
            if (form.githubRepoId) p.githubRepoId = form.githubRepoId.trim();
            if (form.githubToken) p.githubToken = form.githubToken.trim();
            return p;
        }
        case 'teams': {
            const t: any = { name: form.name, teamLeadId: form.teamLeadId };
            if (form.description) t.description = form.description;
            if (form.accountId) t.accountId = form.accountId;
            if (form.projectId) t.projectId = form.projectId;
            return t;
        }
        case 'members': return { teamId: form.teamId, userIds: form.userIds || [], roleInTeam: form.roleInTeam || 'Member' };
        case 'users': {
            const u: any = {
                fullName: form.fullName,
                role: form.role || 'TEAM',
                jobRole: form.jobRole || ''
            };
            if (form.jiraAccountId) u.jiraAccountId = form.jiraAccountId.trim();
            if (form.githubEmail) u.githubEmail = form.githubEmail.trim();
            if (!isEdit) {
                u.email = form.email;
                u.auth0Id = `auth0|${form.email}`;
            }
            return u;
        }
    }
}
