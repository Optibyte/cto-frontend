'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
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
    Plus, Pencil, Trash2, Loader2, RefreshCw, ChevronRight, ChevronLeft, X, Search, CheckSquare, Square,
    Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    marketsAPI, adminAccountsAPI, adminProjectsAPI, adminTeamsAPI, adminTeamMembersAPI, adminUsersAPI, adminEmployeesAPI, adminOrganizationsAPI, adminSprintMetricsAPI,
} from '@/lib/api/admin';
import { useRole } from '@/contexts/role-context';

// ═══════════════════════════ TYPES ═══════════════════════════

type TabKey = 'organizations' | 'markets' | 'accounts' | 'projects' | 'ai-projects' | 'teams' | 'members' | 'users';

interface TabConfig {
    key: TabKey;
    label: string;
    icon: any;
    color: string;
    gradient: string;
}

const TABS: TabConfig[] = [
    { key: 'organizations', label: 'Organizations', icon: Building2, color: 'text-indigo-500', gradient: 'from-indigo-600 to-indigo-400' },
    { key: 'markets', label: 'Markets', icon: Globe2, color: 'text-blue-500', gradient: 'from-blue-600 to-blue-400' },
    { key: 'accounts', label: 'Accounts', icon: Briefcase, color: 'text-emerald-500', gradient: 'from-emerald-600 to-emerald-400' },
    { key: 'projects', label: 'Projects', icon: FolderKanban, color: 'text-violet-500', gradient: 'from-violet-600 to-violet-400' },
    { key: 'ai-projects', label: 'AI Projects', icon: Zap, color: 'text-violet-600', gradient: 'from-violet-700 to-violet-500' },
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
        if (role === 'ORG' || role === 'CTO') return true;
        if (role === 'MARKET') return ['markets', 'accounts', 'ai-projects', 'teams', 'members', 'users'].includes(tab.key);
        if (role === 'ACCOUNT') return ['accounts', 'ai-projects', 'teams', 'members', 'users'].includes(tab.key);
        if (role === 'PROJECT_MANAGER' || role === 'PROJECT') return ['projects', 'ai-projects', 'teams', 'members', 'users'].includes(tab.key);
        if (role === 'TEAM_LEAD') return ['teams', 'members'].includes(tab.key);
        return ['teams', 'members'].includes(tab.key); // Default for lower roles if they can access admin at all
    });

    const [activeTab, setActiveTab] = useState<TabKey>(filteredTabs[0]?.key || 'teams');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
    const [bulkUploadType, setBulkUploadType] = useState<'employees' | 'sprints'>('employees');

    // ── Search ────────────────────────────────────────────────
    const [tableSearch, setTableSearch] = useState('');

    // ── Pagination ────────────────────────────────────────────
    const PAGE_SIZE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalServerItems, setTotalServerItems] = useState<number>(0);
    const [isServerPaginated, setIsServerPaginated] = useState<boolean>(false);

    // Linked data for dropdowns
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [markets, setMarkets] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);

    // Debounced server-side search (used for Users tab)
    const [serverSearch, setServerSearch] = useState('');

    const fetchData = useCallback(async (page: number, tab: TabKey, search?: string) => {
        setLoading(true);
        try {
            let result: any;
            if (tab === 'users') {
                result = await adminUsersAPI.getAll(page, PAGE_SIZE, search);
            } else {
                const apiMap: Record<string, (page?: number, limit?: number, aiEnabled?: boolean) => Promise<any>> = {
                    organizations: adminOrganizationsAPI.getAll,
                    markets: marketsAPI.getAll,
                    accounts: adminAccountsAPI.getAll,
                    projects: (p, l) => adminProjectsAPI.getAll(p, l, false),
                    'ai-projects': (p, l) => adminProjectsAPI.getAll(p, l, true),
                    teams: adminTeamsAPI.getAll,
                    members: adminTeamMembersAPI.getAll as any,
                };
                result = await apiMap[tab](page, PAGE_SIZE);
            }
            if (result && result.total !== undefined) {
                setData(result.data || []);
                setTotalServerItems(result.total);
                setIsServerPaginated(true);
            } else {
                const arr = Array.isArray(result) ? result : [];
                setData(arr);
                setTotalServerItems(arr.length);
                setIsServerPaginated(false);
            }
        } catch (err: any) {
            toast.error(`Failed to load ${tab}: ${err.message}`);
            setData([]);
            setTotalServerItems(0);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load linked data for dropdowns
    const fetchLinkedData = useCallback(async () => {
        try {
            const [orgs, m, a, p, u, t] = await Promise.all([
                adminOrganizationsAPI.getAll().catch(() => []),
                marketsAPI.getAll().catch(() => []),
                adminAccountsAPI.getAll().catch(() => []),
                adminProjectsAPI.getAll().catch(() => []),
                adminUsersAPI.getAll().catch(() => []),
                adminTeamsAPI.getAll().catch(() => []),
            ]);
            setOrganizations(Array.isArray(orgs) ? orgs : orgs?.data || []);
            setMarkets(Array.isArray(m) ? m : []);
            setAccounts(Array.isArray(a) ? a : []);
            setProjects(Array.isArray(p) ? p : []);
            setUsers(Array.isArray(u) ? u : []);
            setTeams(Array.isArray(t) ? t : []);
        } catch { }
    }, []);

    useEffect(() => { fetchLinkedData(); }, [fetchLinkedData]);

    useEffect(() => {
        fetchData(currentPage, activeTab);
    }, [currentPage, activeTab, fetchData]);

    // Server-side search for Users tab — debounce 300ms
    useEffect(() => {
        if (activeTab !== 'users') return;
        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchData(1, 'users', tableSearch.trim() || undefined);
        }, 300);
        return () => clearTimeout(timer);
    }, [tableSearch, activeTab]); // eslint-disable-line

    // Search filter (client-side for all tabs except 'users' which uses server-side search)
    const filteredData = useMemo(() => {
        if (activeTab === 'users') return data; // server already filtered
        const q = tableSearch.trim().toLowerCase();
        if (!q) return data;
        return data.filter(item =>
            Object.values(item).some(v =>
                v !== null && v !== undefined &&
                typeof v !== 'object' &&
                String(v).toLowerCase().includes(q)
            )
        );
    }, [data, tableSearch, activeTab]);

    // Pagination derived values (based on filtered data)
    const totalItemsToUse = isServerPaginated && !tableSearch.trim() ? totalServerItems : filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalItemsToUse / PAGE_SIZE));

    const pagedData = useMemo(() => {
        let filtered = filteredData;
        if (isServerPaginated && !tableSearch.trim()) return filtered;
        return filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    }, [filteredData, currentPage, isServerPaginated, tableSearch, activeTab]);

    // Reset to page 1 when search changes
    useEffect(() => { setCurrentPage(1); }, [tableSearch]);

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
                    organizations: adminOrganizationsAPI.delete,
                    markets: marketsAPI.delete,
                    accounts: adminAccountsAPI.delete,
                    projects: adminProjectsAPI.delete,
                    'ai-projects': adminProjectsAPI.delete,
                    teams: adminTeamsAPI.delete,
                    users: adminUsersAPI.delete,
                };
                await apiMap[activeTab](id);
            }
            toast.success(`Deleted successfully`);
            setDeleteConfirm(null);
            fetchData(currentPage, activeTab);
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
                    organizations: adminOrganizationsAPI.update,
                    markets: marketsAPI.update,
                    accounts: adminAccountsAPI.update,
                    projects: adminProjectsAPI.update,
                    'ai-projects': adminProjectsAPI.update,
                    teams: adminTeamsAPI.update,
                    users: adminUsersAPI.update,
                };
                await updateMap[activeTab](editItem.id, formData);
                toast.success(`Updated successfully`);
            } else {
                const createMap: Record<string, (data: any) => Promise<any>> = {
                    organizations: adminOrganizationsAPI.create,
                    markets: marketsAPI.create,
                    accounts: adminAccountsAPI.create,
                    projects: adminProjectsAPI.create,
                    'ai-projects': adminProjectsAPI.create,
                    teams: adminTeamsAPI.create,
                    users: adminUsersAPI.create,
                };
                await createMap[activeTab](formData);
                toast.success(`Added successfully`);
            }
            setDialogOpen(false);
            fetchData(currentPage, activeTab);
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
                    <div className="flex items-center gap-2">
                        {(activeTab === 'users') && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setBulkUploadType('employees');
                                    setBulkUploadOpen(true);
                                }}
                                className="rounded-xl gap-2 border-violet-500/40 text-violet-500 hover:bg-violet-500/10"
                            >
                                <Upload className="h-4 w-4" /> Bulk Upload Employees
                            </Button>
                        )}
                        <Button onClick={handleCreate} className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                            <Plus className="h-4 w-4" /> Add {tabConfig.label.slice(0, -1)}
                        </Button>
                    </div>
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
                            onClick={() => {
                                if (activeTab !== tab.key) {
                                    setActiveTab(tab.key);
                                    setCurrentPage(1);
                                    setTableSearch('');
                                }
                            }}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex-1 min-w-[140px] justify-center',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Data Table */}
            <Card className="rounded-2xl border-border/30 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4 flex-wrap">
                    <CardTitle className="flex items-center gap-2 text-base shrink-0">
                        {(() => { const Icon = tabConfig.icon; return <Icon className={cn('h-5 w-5', tabConfig.color)} />; })()}
                        {tabConfig.label}
                        {!loading && (
                            <span className="text-muted-foreground font-normal text-sm">
                                ({tableSearch ? `${filteredData.length} of ${totalItemsToUse}` : totalItemsToUse})
                            </span>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            <Input
                                className="pl-9 h-9 rounded-xl text-sm w-full"
                                placeholder={`Search ${tabConfig.label.toLowerCase()}...`}
                                value={tableSearch}
                                onChange={e => setTableSearch(e.target.value)}
                            />
                            {tableSearch && (
                                <button
                                    onClick={() => setTableSearch('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-xl gap-2 shrink-0" onClick={() => fetchData(currentPage, activeTab)}>
                            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} /> Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p className="font-medium">No results for &ldquo;{tableSearch}&rdquo;</p>
                            <p className="text-sm mt-1">Try a different search term or <button className="text-primary underline" onClick={() => setTableSearch('')}>clear search</button></p>
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
                        <>
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
                                        {pagedData.map(item => (
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

                            {/* Pagination Bar */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/20">
                                    <p className="text-xs text-muted-foreground">
                                        Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalItemsToUse)} of {totalItemsToUse}{tableSearch && ` (filtered)`}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 rounded-lg gap-1 text-xs"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5" /> Prev
                                        </Button>
                                        <span className="text-xs font-medium text-muted-foreground px-1">
                                            Page {currentPage} / {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 rounded-lg gap-1 text-xs"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        >
                                            Next <ChevronRight className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
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
                organizations={organizations}
                markets={markets}
                accounts={accounts}
                projects={projects}
                users={users}
                teams={teams}
                role={role}
                teamId={teamId}
            />

            {/* Bulk Upload Dialog */}
            <BulkUploadDialog
                open={bulkUploadOpen}
                onOpenChange={setBulkUploadOpen}
                type={bulkUploadType}
                onSuccess={() => fetchData(currentPage, activeTab)}
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
        case 'organizations': return ['Name', 'Country', 'Created'];
        case 'markets': return ['Name', 'Country', 'Organization', 'Accounts', 'Created'];
        case 'accounts': return ['Name', 'Market', 'Teams', 'Created'];
        case 'projects': return ['Name', 'Status', 'AI Enabled', 'Manager', 'Team Size', 'Created'];
        case 'ai-projects': return ['Name', 'Status', 'Licenses', 'AI Tools', 'Manager', 'Created'];
        case 'teams': return ['Name', 'AI Enabled', 'Project', 'Members', 'Active'];
        case 'members': return ['User', 'Email', 'Team', 'Role in Team', 'Joined'];
        case 'users': return ['Name', 'Email', 'Access Role', 'Employee ID', 'Job Role', 'Active'];
    }
}

function renderRow(tab: TabKey, item: any) {
    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '—';
    switch (tab) {
        case 'organizations':
            return (<>
                <td className="py-3 text-sm font-semibold">{item.name}</td>
                <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                        {Array.isArray(item.country) && item.country.length > 0 ? item.country.map((c: string) => (
                            <Badge key={c} variant="outline" className="rounded-full text-[10px] px-2">{c}</Badge>
                        )) : <Badge variant="outline" className="rounded-full text-[10px] px-2">Global</Badge>}
                    </div>
                </td>
                <td className="py-3 text-xs text-muted-foreground">{formatDate(item.createdAt)}</td>
            </>);
        case 'markets':
            return (<>
                <td className="py-3 text-sm font-semibold">{item.name}</td>
                <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                        {Array.isArray(item.country) && item.country.length > 0 ? item.country.map((c: string) => (
                            <Badge key={c} variant="outline" className="rounded-full text-[10px] px-2">{c}</Badge>
                        )) : <Badge variant="outline" className="rounded-full text-[10px] px-2">Global</Badge>}
                    </div>
                </td>
                <td className="py-3 text-sm text-muted-foreground">{item.org?.name || '—'}</td>
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
                    {item.aiEnabled ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-full text-[9px] px-2" variant="outline">AI ENABLED</Badge>
                    ) : (
                        <span className="text-muted-foreground text-[10px]">Standard</span>
                    )}
                </td>
                <td className="py-3 text-sm text-muted-foreground">
                    {item.users && item.users.length > 0 ? item.users.filter((u: any) => u.role === 'PROJECT_MANAGER' || u.role === 'PROJECT' || u.role === 'CTO').map((u: any) => u.fullName).join(', ') || '—' : '—'}
                </td>
                <td className="py-3 text-sm text-muted-foreground">{item.teamSize || 0}</td>
                <td className="py-3 text-xs text-muted-foreground">{formatDate(item.createdAt)}</td>
            </>);
        case 'ai-projects':
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
                    <Badge className="bg-violet-500/10 text-violet-500 border-violet-500/20 rounded-full text-[10px] font-bold px-2" variant="outline">
                        {item.aiToolLicenses || 0}
                    </Badge>
                </td>
                <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                        {item.aiToolsUsed && item.aiToolsUsed.length > 0 ? item.aiToolsUsed.map((tool: string) => (
                            <Badge key={tool} className="rounded-full text-[9px] px-1.5 py-0 bg-violet-100 text-violet-600 border-violet-200" variant="secondary">{tool}</Badge>
                        )) : <span className="text-muted-foreground text-[10px]">None</span>}
                    </div>
                </td>
                <td className="py-3 text-sm text-muted-foreground">
                    {item.users && item.users.length > 0 ? item.users.filter((u: any) => u.role === 'PROJECT_MANAGER' || u.role === 'PROJECT' || u.role === 'CTO').map((u: any) => u.fullName).join(', ') || '—' : '—'}
                </td>
                <td className="py-3 text-xs text-muted-foreground">{formatDate(item.createdAt)}</td>
            </>);
        case 'teams':
            return (<>
                <td className="py-3 text-sm font-semibold">{item.name}</td>
                <td className="py-3">
                    {item.project?.aiEnabled ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-full text-[9px] px-2" variant="outline">AI ENABLED</Badge>
                    ) : (
                        <span className="text-muted-foreground text-[10px]">Standard</span>
                    )}
                </td>
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
                    'bg-cyan-500/10 text-cyan-500 border-cyan-500/20': item.role === 'TEAM_LEAD',
                    'bg-slate-500/10 text-slate-500 border-slate-500/20': item.role === 'TEAM',
                })} variant="outline">{item.role}</Badge></td>
                <td className="py-3 text-sm text-muted-foreground">{item.employeeId || '—'}</td>
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
    organizations: any[];
    markets: any[];
    accounts: any[];
    projects: any[];
    users: any[];
    teams: any[];
    role: string | null;
    teamId: string | null;
}

function EntityDialog({ open, onOpenChange, tab, editItem, onSave, organizations, markets, accounts, projects, users, teams, role, teamId }: EntityDialogProps) {
    const [form, setForm] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    
    // Unique data lists to prevent duplicate dropdown entries
    const uniqueOrgs = useMemo(() => {
        const seen = new Set();
        return organizations
            .filter(o => {
                if (!o.id || seen.has(o.id)) return false;
                seen.add(o.id);
                return true;
            })
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [organizations]);

    const uniqueMarkets = useMemo(() => {
        const seen = new Set();
        return markets
            .filter(m => {
                if (!m.id || seen.has(m.id)) return false;
                seen.add(m.id);
                return true;
            })
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [markets]);

    const uniqueAccounts = useMemo(() => {
        const seen = new Set();
        return accounts.filter(a => {
            if (!a.id || seen.has(a.id)) return false;
            seen.add(a.id);
            return true;
        });
    }, [accounts]);

    const uniqueProjects = useMemo(() => {
        const seen = new Set();
        return projects.filter(p => {
            if (!p.id || seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
        });
    }, [projects]);

    const uniqueUsers = useMemo(() => {
        const seen = new Set();
        return users.filter(u => {
            if (!u.id || seen.has(u.id)) return false;
            seen.add(u.id);
            return true;
        });
    }, [users]);

    useEffect(() => {
        if (open) {
            setUserSearch(''); // Reset search on open
            if (editItem) {
                const initialForm = { ...editItem };

                // For projects, map existing associations to userIds array for the checklist
                if (tab === 'projects') {
                    const ids = new Set<string>();
                    if (editItem.userIds) editItem.userIds.forEach((id: string) => ids.add(id));
                    if (editItem.pms) editItem.pms.forEach((m: any) => ids.add(m.userId || m.user?.id));
                    if (editItem.teamLeads) editItem.teamLeads.forEach((m: any) => ids.add(m.userId || m.user?.id));
                    if (editItem.users) editItem.users.forEach((u: any) => ids.add(u.id));
                    initialForm.userIds = Array.from(ids).filter(Boolean);
                }

                setForm(initialForm);
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

    // Derive unique countries from existing organizations/markets (for selection)
    const existingCountries = Array.from(
        new Set([
            ...organizations.flatMap((o: any) => Array.isArray(o.country) ? o.country : [o.country]),
            ...markets.flatMap((m: any) => Array.isArray(m.country) ? m.country : [m.country])
        ].filter(Boolean))
    ).sort() as string[];

    // Filter orgs by the currently selected country (for Markets form)
    const orgsForCountry = form.country
        ? uniqueOrgs.filter((o: any) => {
            const countries = Array.isArray(o.country) ? o.country : [o.country];
            return countries.some((c: string) => (Array.isArray(form.country) ? form.country : [form.country]).includes(c));
        })
        : uniqueOrgs;

    const handleOrgChange = async (id: string) => {
        const val = id === 'none' ? '' : id;
        set('orgId', val);
        
        if (val) {
            try {
                // Fetch full org details by ID to get accurate country mapping
                const org = await adminOrganizationsAPI.getOne(val);
                const countries = Array.isArray(org.country) ? org.country : (org.country ? [org.country] : []);
                
                // If org has only one country, auto-select it for the market
                if (countries.length === 1) {
                    set('country', countries);
                } else {
                    set('country', []);
                }
            } catch (err) {
                console.error("Failed to fetch organization details:", err);
            }
        } else {
            set('country', []);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 flex flex-col max-h-[90vh]">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        {editItem?.id ? <Pencil className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                        {isEdit ? 'Edit' : 'Add'} {tabConfig.label}
                    </DialogTitle>
                    <DialogDescription>Fill in the details to {isEdit ? 'update the' : 'add a new'} entry.</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
                    <div className="space-y-4">
                        {tab === 'organizations' && (<>
                            <div className="space-y-2"><Label>Name *</Label><Input className="rounded-xl" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Acme Corp" /></div>
                            <div className="space-y-2">
                                <Label>Countries (Comma separated) *</Label>
                                <Input
                                    className="rounded-xl"
                                    value={Array.isArray(form.country) ? form.country.join(', ') : form.country || ''}
                                    onChange={e => set('country', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                    placeholder="e.g. USA, UK, India"
                                />
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {existingCountries.map((c: string) => (
                                        <Badge
                                            key={c}
                                            variant="secondary"
                                            className="cursor-pointer hover:bg-primary hover:text-white"
                                            onClick={() => {
                                                const current = Array.isArray(form.country) ? form.country : [];
                                                if (!current.includes(c)) set('country', [...current, c]);
                                            }}
                                        >
                                            + {c}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </>)}

                        {tab === 'markets' && (<>
                            <div className="space-y-2"><Label>Market Name *</Label><Input className="rounded-xl" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. North America" /></div>
                            <div className="space-y-2">
                                <Label>Organization *</Label>
                                <Select
                                    value={form.orgId || ''}
                                    onValueChange={handleOrgChange}
                                >
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="Select organization" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {uniqueOrgs.map((o: any) => (
                                            <SelectItem key={o.id} value={o.id}>
                                                {o.name} {o.country && (Array.isArray(o.country) ? o.country.length > 0 : !!o.country) ? `(${Array.isArray(o.country) ? o.country[0] : o.country})` : `[ID: ${o.id.slice(0, 4)}]`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Country *</Label>
                                <Select
                                    value={Array.isArray(form.country) ? form.country[0] : form.country || ''}
                                    onValueChange={v => set('country', [v])}
                                    disabled={!form.orgId}
                                >
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder={form.orgId ? "Select country" : "Select organization first"} /></SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {(() => {
                                            const selectedOrg = uniqueOrgs.find(o => o.id === form.orgId);
                                            const availableCountries = selectedOrg 
                                                ? (Array.isArray(selectedOrg.country) ? selectedOrg.country : [selectedOrg.country])
                                                : [];
                                            
                                            return availableCountries.length > 0
                                                ? availableCountries.map((c: string) => <SelectItem key={c} value={c}>{c}</SelectItem>)
                                                : <SelectItem value="__none__" disabled>No countries defined for this organization</SelectItem>;
                                        })()}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>)}

                        {tab === 'accounts' && (<>
                            <div className="space-y-2"><Label>Name *</Label><Input className="rounded-xl" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Global Finance" /></div>
                            <div className="space-y-2">
                                <Label>Market *</Label>
                                <Select value={form.marketId || ''} onValueChange={v => set('marketId', v)}>
                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select market" /></SelectTrigger>
                                    <SelectContent>{uniqueMarkets.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Account Manager *</Label>
                                <Select value={form.accountManagerId || ''} onValueChange={v => set('accountManagerId', v)}>
                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select managers" /></SelectTrigger>
                                    <SelectContent>
                                        {uniqueUsers.filter((u: any) => u.role === 'ACCOUNT').map((u: any) => (
                                            <SelectItem key={u.id} value={u.id}>{u.fullName} ({u.email})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>)}

                        {(tab === 'projects' || tab === 'ai-projects') && (<>
                            <div className="space-y-2"><Label>Name *</Label><Input className="rounded-xl" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Banking App" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Start Date</Label><Input type="date" className="rounded-xl" value={form.startDate ? form.startDate.split('T')[0] : ''} onChange={e => set('startDate', e.target.value)} /></div>
                                <div className="space-y-2"><Label>End Date</Label><Input type="date" className="rounded-xl" value={form.enddate ? form.enddate.split('T')[0] : ''} onChange={e => set('enddate', e.target.value)} /></div>
                            </div>


                            <div className="flex items-center space-x-2 py-2">
                                <input
                                    type="checkbox"
                                    id="ai-enabled"
                                    className="h-4 w-4 rounded border-violet-500"
                                    checked={!!form.aiEnabled}
                                    onChange={(e) => set('aiEnabled', e.target.checked)}
                                />
                                <Label htmlFor="ai-enabled" className="cursor-pointer font-bold text-violet-600">AI Enabled Project</Label>
                            </div>

                            {!!form.aiEnabled && (
                                <div className="space-y-4 p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-violet-600">AI Tooling Configuration</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>AI Licenses</Label>
                                            <Input type="number" className="rounded-xl bg-background" value={form.aiToolLicenses || 0} onChange={e => set('aiToolLicenses', Number(e.target.value))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>AI Tools (comma separated)</Label>
                                            <Input className="rounded-xl bg-background" value={form.aiToolsUsed?.join(', ') || ''} onChange={e => set('aiToolsUsed', e.target.value.split(',').map(s => s.trim()))} placeholder="Copilot, ChatGPT" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!!form.aiEnabled && (
                                <div className="space-y-4 p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <p className="text-xs font-black uppercase tracking-wider text-violet-600">AI Transformation Rollout</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label>Start Date</Label><Input type="date" className="rounded-xl bg-background" value={form.digitalTransformationStartDate ? form.digitalTransformationStartDate.split('T')[0] : ''} onChange={e => set('digitalTransformationStartDate', e.target.value)} /></div>
                                        <div className="space-y-2"><Label>End Date</Label><Input type="date" className="rounded-xl bg-background" value={form.digitalTransformationEndDate ? form.digitalTransformationEndDate.split('T')[0] : ''} onChange={e => set('digitalTransformationEndDate', e.target.value)} /></div>
                                    </div>
                                </div>
                            )}
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
                            <div className="space-y-3">
                                <Label>Select Project Manager *</Label>
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
                                    {users.filter((u: any) =>
                                        (u.role === 'PROJECT_MANAGER' || u.role === 'PROJECT') &&
                                        (u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                                    ).map((u: any) => (
                                        <div key={u.id} className="flex items-center space-x-2 p-2 hover:bg-accent/50 rounded-lg transition-colors group">
                                            <input
                                                type="checkbox"
                                                id={`pm-${u.id}`}
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
                                            <label htmlFor={`pm-${u.id}`} className="grid cursor-pointer flex-1">
                                                <span className="text-sm font-medium leading-none">{u.fullName}</span>
                                                <span className="text-[10px] text-muted-foreground line-clamp-1">{u.role} • {u.email}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
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
                            <div className="space-y-2 mt-4">
                                <Label>License</Label>
                                <Input className="rounded-xl" value={form.license || ''} onChange={e => set('license', e.target.value)} placeholder="e.g. MIT, Apache 2.0" />
                            </div>
                        </>)}

                        {tab === 'teams' && (<>
                            <div className="space-y-2"><Label>Name *</Label><Input className="rounded-xl" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Core Banking" /></div>
                            <div className="space-y-2"><Label>Description</Label><Input className="rounded-xl" value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Team description" /></div>
                            <div className="space-y-2">
                                <Label>Team Lead</Label>
                                <Select value={form.teamLeadId || 'none'} onValueChange={v => set('teamLeadId', v === 'none' ? undefined : v)}>
                                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select team lead" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {users.filter((u: any) => u.role === 'TEAM_LEAD').map((u: any) => (
                                            <SelectItem key={u.id} value={u.id}>{u.fullName} ({u.email})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Account</Label>
                                    <Select value={form.accountId || 'none'} onValueChange={v => set('accountId', v === 'none' ? undefined : v)}>
                                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select account" /></SelectTrigger>
                                        <SelectContent><SelectItem value="none">None</SelectItem>{accounts.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Project</Label>
                                    <Select value={form.projectId || 'none'} onValueChange={v => set('projectId', v === 'none' ? undefined : v)}>
                                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select project" /></SelectTrigger>
                                        <SelectContent><SelectItem value="none">None</SelectItem>{projects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
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
                                            .filter((t: any) => role === 'ORG' || role === 'ACCOUNT' || role === 'PROJECT_MANAGER' || t.id === teamId || t.teamLeadId === localStorage.getItem('current_user_id'))
                                            .map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Select Member(s) *</Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-[10px] rounded-lg"
                                        onClick={() => {
                                            const filtered = users.filter((u: any) => u.role === 'TEAM');
                                            const allSelected = filtered.every((u: any) => (form.userIds || []).includes(u.id));
                                            if (allSelected) {
                                                set('userIds', []);
                                            } else {
                                                set('userIds', filtered.map((u: any) => u.id));
                                            }
                                        }}
                                    >
                                        {(users.filter((u: any) => u.role === 'TEAM').every((u: any) => (form.userIds || []).includes(u.id))) ? 'Deselect All' : 'Select All'}
                                    </Button>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        className="pl-9 h-9 rounded-xl text-sm"
                                        placeholder="Search developers..."
                                        value={userSearch}
                                        onChange={e => setUserSearch(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-1 max-h-[220px] overflow-y-auto p-2 rounded-xl border border-border/40 bg-muted/20">
                                    {(() => {
                                        const filteredUsers = users.filter((u: any) =>
                                            u.role === 'TEAM' &&
                                            (u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
                                                u.email.toLowerCase().includes(userSearch.toLowerCase()))
                                        );

                                        if (filteredUsers.length === 0) {
                                            return <div className="py-8 text-center text-xs text-muted-foreground">No users found</div>;
                                        }

                                        return filteredUsers.map((u: any) => (
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
                                <Select value={form.role || 'TEAM'} onValueChange={v => { set('role', v); set('scopeOrgId', ''); set('scopeMarketId', ''); set('scopeAccountId', ''); set('scopeProjectId', ''); set('scopeTeamId', ''); }}>
                                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ORG">Organization</SelectItem>
                                        <SelectItem value="MARKET">Market</SelectItem>
                                        <SelectItem value="ACCOUNT">Account</SelectItem>
                                        <SelectItem value="PROJECT_MANAGER">Project Manager</SelectItem>
                                        <SelectItem value="TEAM_LEAD">Team Lead</SelectItem>
                                        <SelectItem value="CTO">CTO</SelectItem>
                                        <SelectItem value="TEAM">Team Member</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* ── DATA FENCING SCOPE SELECTOR ── */}
                            {form.role && form.role !== 'CTO' && (
                                <div className="p-4 rounded-2xl border border-violet-500/20 bg-violet-500/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                            <svg className="h-3 w-3 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </div>
                                        <p className="text-xs font-bold text-violet-700 uppercase tracking-wider">Data Fence Scope</p>
                                        <span className="text-[10px] text-violet-500 font-medium">— limits what this user can see after login</span>
                                    </div>

                                    {/* ORG role: select organization */}
                                    {form.role === 'ORG' && (
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-violet-700 font-semibold">Organization Scope *</Label>
                                            <Select value={form.scopeOrgId || ''} onValueChange={v => set('scopeOrgId', v)}>
                                                <SelectTrigger className="rounded-xl border-violet-300 bg-white">
                                                    <SelectValue placeholder="Select organization to scope to" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {uniqueOrgs.map((o: any) => (
                                                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[10px] text-violet-500">User will only see data within this organization.</p>
                                        </div>
                                    )}

                                    {/* MARKET role: select market */}
                                    {form.role === 'MARKET' && (
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-violet-700 font-semibold">Market Scope *</Label>
                                            <Select value={form.scopeMarketId || ''} onValueChange={v => set('scopeMarketId', v)}>
                                                <SelectTrigger className="rounded-xl border-violet-300 bg-white">
                                                    <SelectValue placeholder="Select market to scope to" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {uniqueMarkets.map((m: any) => (
                                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[10px] text-violet-500">User will only see accounts, projects & teams within this market.</p>
                                        </div>
                                    )}

                                    {/* ACCOUNT role: select account */}
                                    {form.role === 'ACCOUNT' && (
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-violet-700 font-semibold">Account Scope *</Label>
                                            <Select value={form.scopeAccountId || ''} onValueChange={v => set('scopeAccountId', v)}>
                                                <SelectTrigger className="rounded-xl border-violet-300 bg-white">
                                                    <SelectValue placeholder="Select account to scope to" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {uniqueAccounts.map((a: any) => (
                                                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[10px] text-violet-500">User will only see projects & teams within this account.</p>
                                        </div>
                                    )}

                                    {/* PROJECT_MANAGER / PROJECT role: select project */}
                                    {(form.role === 'PROJECT_MANAGER' || form.role === 'PROJECT') && (
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-violet-700 font-semibold">Project Scope *</Label>
                                            <Select value={form.scopeProjectId || ''} onValueChange={v => set('scopeProjectId', v)}>
                                                <SelectTrigger className="rounded-xl border-violet-300 bg-white">
                                                    <SelectValue placeholder="Select project to scope to" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60">
                                                    {uniqueProjects.map((p: any) => (
                                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[10px] text-violet-500">User will only see teams & data within this project.</p>
                                        </div>
                                    )}

                                    {/* TEAM_LEAD / TEAM role: select team */}
                                    {(form.role === 'TEAM_LEAD' || form.role === 'TEAM') && (
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-violet-700 font-semibold">Team Scope *</Label>
                                            <Select value={form.scopeTeamId || ''} onValueChange={v => set('scopeTeamId', v)}>
                                                <SelectTrigger className="rounded-xl border-violet-300 bg-white">
                                                    <SelectValue placeholder="Select team to scope to" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60">
                                                    {teams.map((t: any) => (
                                                        <SelectItem key={t.id} value={t.id}>{t.name}{t.project?.name ? ` (${t.project.name})` : ''}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-[10px] text-violet-500">User will only access data for this team.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Job Role / Designation</Label><Input className="rounded-xl" value={form.jobRole || ''} onChange={e => set('jobRole', e.target.value)} placeholder="e.g. Senior Software Engineer" /></div>
                                <div className="space-y-2"><Label>Employee ID</Label><Input className="rounded-xl" value={form.employeeId || ''} onChange={e => set('employeeId', e.target.value)} placeholder="e.g. EMP-1234" /></div>
                            </div>
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
                </div>

                <DialogFooter className="p-6 pt-4 border-t border-border/40">
                    <Button variant="ghost" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button className="rounded-xl gap-2 font-bold px-6" onClick={handleSubmit} disabled={saving}>
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
        case 'organizations': return { name: '', country: [] };
        case 'markets': return { name: '', country: [], orgId: '' };
        case 'accounts': return { name: '', marketId: '', accountManagerId: '' };
        case 'projects': return { name: '', startDate: '', enddate: '', status: 'PLANNED', teamSize: 0, progress: 0, jiraProjectKey: '', jiraBoardId: '', githubRepoId: '', githubToken: '', license: '', isDigitalTransformation: false, digitalTransformationStartDate: '', digitalTransformationEndDate: '', aiEnabled: false, aiToolLicenses: 0, aiToolsUsed: [] };
        case 'ai-projects': return { name: '', startDate: '', enddate: '', status: 'PLANNED', teamSize: 0, progress: 0, jiraProjectKey: '', jiraBoardId: '', githubRepoId: '', githubToken: '', license: '', isDigitalTransformation: false, digitalTransformationStartDate: '', digitalTransformationEndDate: '', aiEnabled: true, aiToolLicenses: 0, aiToolsUsed: [] };
        case 'teams': return { name: '', description: '', teamLeadId: '', accountId: '', projectId: '' };
        case 'members': return { teamId: '', userIds: [], roleInTeam: 'Member' };
        case 'users': return { fullName: '', email: '', role: 'TEAM', jobRole: '', employeeId: '', auth0Id: '', jiraAccountId: '', githubEmail: '', scopeOrgId: '', scopeMarketId: '', scopeAccountId: '', scopeProjectId: '', scopeTeamId: '' };
    }
}

function buildPayload(tab: TabKey, form: Record<string, any>, isEdit: boolean): any {
    switch (tab) {
        case 'organizations': return {
            name: form.name,
            country: Array.isArray(form.country) ? form.country : (form.country ? [form.country] : [])
        };
        case 'markets': return { 
            name: form.name, 
            orgId: form.orgId,
            country: Array.isArray(form.country) ? form.country : (form.country ? [form.country] : [])
        };
        case 'accounts': return { name: form.name, marketId: form.marketId, accountManagerId: form.accountManagerId };
        case 'projects':
        case 'ai-projects': {
            const p: any = { name: form.name, status: form.status, teamSize: Number(form.teamSize) };
            if (form.userIds && form.userIds.length > 0) p.userIds = form.userIds;
            if (form.startDate) p.startDate = form.startDate;
            if (form.enddate) p.enddate = form.enddate;
            if (form.jiraProjectKey) p.jiraProjectKey = form.jiraProjectKey.trim().toUpperCase();
            if (form.jiraBoardId) p.jiraBoardId = form.jiraBoardId.trim();
            if (form.githubRepoId) p.githubRepoId = form.githubRepoId.trim();
            if (form.githubToken) p.githubToken = form.githubToken.trim();
            if (form.license) p.license = form.license.trim();
            p.isDigitalTransformation = !!form.isDigitalTransformation;
            p.aiEnabled = !!form.aiEnabled;
            if (form.aiEnabled) {
                p.aiToolLicenses = Number(form.aiToolLicenses || 0);
                p.aiToolsUsed = Array.isArray(form.aiToolsUsed) ? form.aiToolsUsed : [];
            }
            if (form.digitalTransformationStartDate) p.digitalTransformationStartDate = form.digitalTransformationStartDate;
            if (form.digitalTransformationEndDate) p.digitalTransformationEndDate = form.digitalTransformationEndDate;
            return p;
        }
        case 'teams': {
            const t: any = { name: form.name };
            if (form.teamLeadId && form.teamLeadId !== 'none') t.teamLeadId = form.teamLeadId;
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
            if (form.employeeId) u.employeeId = form.employeeId.trim();
            if (form.jiraAccountId) u.jiraAccountId = form.jiraAccountId.trim();
            if (form.githubEmail) u.githubEmail = form.githubEmail.trim();

            // ── DATA FENCING: set scope IDs based on role ──────────────────
            const role = form.role || 'TEAM';
            if (role === 'ORG' && form.scopeOrgId) {
                u.orgId = form.scopeOrgId;
            } else if (role === 'MARKET' && form.scopeMarketId) {
                u.marketId = form.scopeMarketId;
            } else if (role === 'ACCOUNT' && form.scopeAccountId) {
                u.accountId = form.scopeAccountId;
            } else if ((role === 'PROJECT_MANAGER' || role === 'PROJECT') && form.scopeProjectId) {
                u.projectId = form.scopeProjectId;
            } else if ((role === 'TEAM_LEAD' || role === 'TEAM') && form.scopeTeamId) {
                u.teamId = form.scopeTeamId;
            }

            if (!isEdit) {
                u.email = form.email;
                u.auth0Id = `auth0|${form.email}`;
            }
            return u;
        }
    }
}

// ═══════════════════ BULK UPLOAD DIALOG ═══════════════════════

interface BulkUploadDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    type: 'employees' | 'sprints';
    onSuccess: () => void;
}

function BulkUploadDialog({ open, onOpenChange, type, onSuccess }: BulkUploadDialogProps) {
    const isEmployees = type === 'employees';
    const isSprints = type === 'sprints';
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [dragOver, setDragOver] = useState(false);

    const reset = () => { setFile(null); setResult(null); };

    const handleDownloadTemplate = () => {
        let headers: string[] = [];
        let sampleRow: string[] = [];
        let fileName = '';

        if (isEmployees) {
            headers = ['employee_id', 'employee_name', 'email', 'org', 'country', 'market', 'account', 'project', 'team', 'role', 'employment_type', 'experience_years', 'project_ai_enabled', 'project_ai_tools_used', 'primary_ai_skill', 'primary_ai_skill_proficiency'];
            sampleRow = ['EMP-1001', 'John Doe', 'john.doe@example.com', 'Acme Corp', 'USA', 'US-Market', 'Aetna', 'Claims Mod', 'Alpha Team', 'Dev', 'Full-Time', '5', 'Yes', 'Copilot, ChatGPT', 'Python', '4'];
            fileName = 'employee_bulk_import_template.csv';
        } else {
            headers = ['org', 'country', 'market', 'account', 'project', 'team', 'team_size', 'project_ai_enabled', 'project_ai_tool_licenses', 'project_ai_tools_used', 'sprint_number', 'sprint_name', 'throughput_points', 'quality_score', 'velocity_points', 'done_to_said_ratio', 'technical_debt_index', 'user_stories_delivered'];
            sampleRow = ['Acme Corp', 'USA', 'US-Market', 'Aetna', 'Claims Mod', 'Alpha Team', '10', 'Yes', '12', 'Copilot', '1', 'Sprint-1', '45.5', '92.0', '50.0', '0.95', '12.5', '8'];
            fileName = 'sprint_metrics_bulk_import_template.csv';
        }

        const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => { if (!open) reset(); }, [open]);

    const handleFile = (f: File) => {
        if (!f.name.match(/\.(xlsx|xls|csv)$/i)) {
            toast.error('Only .xlsx, .xls or .csv files are supported');
            return;
        }
        setFile(f);
        setResult(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const api = isEmployees ? adminEmployeesAPI : adminSprintMetricsAPI;
            const res = await api.bulkUpload(file);
            setResult(res);

            const successCount = isEmployees ? (res.created + res.updated) : res.processed;
            if (successCount > 0) {
                toast.success(`✅ Successfully processed ${successCount} items`);
                onSuccess();
            }
            if (res.errors?.length) {
                toast.warning(`⚠️ ${res.errors.length} rows had errors`);
            }
        } catch (err: any) {
            toast.error(`Upload failed: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[580px] rounded-2xl p-0 flex flex-col max-h-[90vh]">
                <DialogHeader className="p-6 pb-3">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <FileSpreadsheet className={cn("h-5 w-5", isEmployees ? "text-violet-500" : "text-amber-500")} />
                        Bulk Upload {isEmployees ? 'Employees' : 'Sprint Metrics'}
                    </DialogTitle>
                    <DialogDescription>
                        Upload an Excel (.xlsx) or CSV file to import {isEmployees ? 'employees' : 'team sprint data'} in bulk. {isEmployees ? 'All columns will be mapped automatically.' : 'Teams and projects will be auto-provisioned if missing.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-4">
                    {/* Column reference */}
                    <div className="rounded-xl bg-muted/40 border border-border/30 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Expected Columns</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[10px] rounded-lg bg-background font-bold border-violet-500/30 text-violet-600 hover:bg-violet-50"
                                onClick={handleDownloadTemplate}
                            >
                                <Download className="h-3 w-3 mr-1.5" />
                                Download Template
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {(isEmployees
                                ? ['employee_id', 'employee_name', 'org', 'project', 'team', 'role', 'project_ai_enabled']
                                : ['team', 'sprint_number', 'throughput_points', 'quality_score', 'velocity_points', 'project_ai_enabled']
                            ).map(col => (
                                <span key={col} className={cn(
                                    "font-mono text-[10px] px-2 py-0.5 rounded-full border font-bold",
                                    isEmployees
                                        ? "bg-violet-500/10 text-violet-600 border-violet-500/20"
                                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                )}>{col}</span>
                            ))}
                            <span className="text-[10px] text-muted-foreground italic px-1">+ all other metrics</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border/20 space-y-1.5">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Role Mapping Reference</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                                <div className="flex justify-between border-b border-border/10 pb-0.5"><span className="text-muted-foreground">Organization</span> <span className="font-bold text-violet-600">ORG</span></div>
                                <div className="flex justify-between border-b border-border/10 pb-0.5"><span className="text-muted-foreground">Market</span> <span className="font-bold text-violet-600">MARKET</span></div>
                                <div className="flex justify-between border-b border-border/10 pb-0.5"><span className="text-muted-foreground">Account</span> <span className="font-bold text-violet-600">ACCOUNT</span></div>
                                <div className="flex justify-between border-b border-border/10 pb-0.5"><span className="text-muted-foreground">Project Manager</span> <span className="font-bold text-violet-600">PROJECT_MANAGER</span></div>
                                <div className="flex justify-between border-b border-border/10 pb-0.5"><span className="text-muted-foreground">Team Lead</span> <span className="font-bold text-violet-600">TEAM_LEAD</span></div>
                                <div className="flex justify-between border-b border-border/10 pb-0.5"><span className="text-muted-foreground">Team Member</span> <span className="font-bold text-violet-600">TEAM</span></div>
                                <div className="flex justify-between border-b border-border/10 pb-0.5"><span className="text-muted-foreground">CTO</span> <span className="font-bold text-violet-600">CTO</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Drop zone */}
                    {!result && (
                        <div
                            className={cn(
                                'border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer',
                                dragOver
                                    ? 'border-violet-500 bg-violet-500/10'
                                    : file
                                        ? 'border-emerald-500/60 bg-emerald-500/5'
                                        : 'border-border/40 hover:border-primary/50 hover:bg-primary/5'
                            )}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('bulk-file-input')?.click()}
                        >
                            <input
                                id="bulk-file-input"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                className="hidden"
                                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                            />
                            {file ? (
                                <div className="flex flex-col items-center gap-2">
                                    <FileSpreadsheet className="h-10 w-10 text-emerald-500" />
                                    <p className="font-semibold text-sm text-emerald-500">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="h-10 w-10 text-muted-foreground/40" />
                                    <p className="font-semibold text-sm">Drop your file here or click to browse</p>
                                    <p className="text-xs text-muted-foreground">Supports .xlsx, .xls, .csv · Max 10MB</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Results */}
                    {result && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Summary cards */}
                            <div className="grid grid-cols-4 gap-2">
                                {isEmployees ? [
                                    { label: 'Total', value: result.total, color: 'text-foreground', bg: 'bg-muted/40' },
                                    { label: 'Created', value: result.created, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                    { label: 'Updated', value: result.updated, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                    { label: 'Skipped', value: result.skipped, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                ].map(s => (
                                    <div key={s.label} className={cn('rounded-xl p-3 text-center border border-border/20', s.bg)}>
                                        <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
                                    </div>
                                )) : [
                                    { label: 'Total', value: result.total, color: 'text-foreground', bg: 'bg-muted/40' },
                                    { label: 'Processed', value: result.processed, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                    { label: 'Provisioned', value: result.provisioned?.teams || 0, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                    { label: 'Errors', value: result.errors?.length || 0, color: 'text-red-500', bg: 'bg-red-500/10' },
                                ].map(s => (
                                    <div key={s.label} className={cn('rounded-xl p-3 text-center border border-border/20', s.bg)}>
                                        <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Provisioned Details (for Sprints) */}
                            {isSprints && result.provisioned && (result.provisioned.orgs + result.provisioned.projects + result.provisioned.teams > 0) && (
                                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[10px] text-blue-600 flex gap-4 justify-center">
                                    <span>Provisioned:</span>
                                    {result.provisioned.orgs > 0 && <span>{result.provisioned.orgs} Orgs</span>}
                                    {result.provisioned.markets > 0 && <span>{result.provisioned.markets} Markets</span>}
                                    {result.provisioned.projects > 0 && <span>{result.provisioned.projects} Projects</span>}
                                    {result.provisioned.teams > 0 && <span>{result.provisioned.teams} Teams</span>}
                                </div>
                            )}

                            {/* Row results */}
                            {result.rows?.length > 0 && (
                                <div className="max-h-[160px] overflow-y-auto rounded-xl border border-border/30">
                                    <table className="w-full text-xs">
                                        <thead className="bg-muted/30 sticky top-0">
                                            <tr>
                                                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Row</th>
                                                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">{isEmployees ? 'Employee ID' : 'Team'}</th>
                                                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">{isEmployees ? 'Name' : 'Project'}</th>
                                                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">{isEmployees ? 'Role' : 'Sprint'}</th>
                                                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isEmployees ? result.rows.map((r: any) => (
                                                <tr key={r.row} className="border-t border-border/20">
                                                    <td className="px-3 py-1.5 text-muted-foreground">{r.row}</td>
                                                    <td className="px-3 py-1.5 font-mono">{r.employeeId}</td>
                                                    <td className="px-3 py-1.5">{r.name}</td>
                                                    <td className="px-3 py-1.5">{r.role}</td>
                                                    <td className="px-3 py-1.5">
                                                        <span className={cn('font-semibold', r.status === 'created' ? 'text-emerald-500' : 'text-blue-500')}>
                                                            {r.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )) : result.summary?.map((s: any, idx: number) => (
                                                <tr key={idx} className="border-t border-border/20">
                                                    <td className="px-3 py-1.5 text-muted-foreground">—</td>
                                                    <td className="px-3 py-1.5 font-medium">{s.team}</td>
                                                    <td className="px-3 py-1.5 text-muted-foreground">{s.project}</td>
                                                    <td className="px-3 py-1.5">{s.sprintsImported} sprints</td>
                                                    <td className="px-3 py-1.5">
                                                        {s.aiEnabled ? <Badge className="bg-emerald-500/10 text-emerald-500 text-[9px] h-4">AI ENABLED</Badge> : <span className="text-muted-foreground text-[9px]">Standard</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Errors */}
                            {result.errors?.length > 0 && (
                                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 space-y-1">
                                    <p className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                                        <AlertCircle className="h-3.5 w-3.5" /> {result.errors.length} Errors
                                    </p>
                                    {result.errors.map((e: any, i: number) => (
                                        <p key={i} className="text-[10px] text-red-400 font-mono">
                                            Row {e.row} [{e.employeeId || e.team}]: {e.error}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 pt-4 border-t border-border/40 gap-2">
                    {result ? (
                        <>
                            <Button variant="ghost" className="rounded-xl" onClick={reset}>
                                Upload Another
                            </Button>
                            <Button className="rounded-xl gap-2" onClick={() => onOpenChange(false)}>
                                <CheckCircle2 className="h-4 w-4" /> Done
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button
                                className={cn(
                                    "rounded-xl gap-2 font-bold px-6",
                                    isEmployees ? "bg-violet-600 hover:bg-violet-700" : "bg-amber-600 hover:bg-amber-700"
                                )}
                                onClick={handleUpload}
                                disabled={!file || uploading}
                            >
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                {uploading ? 'Processing...' : 'Upload & Import'}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
