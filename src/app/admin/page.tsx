'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, Plus, Pencil, Trash2, Loader2, RefreshCw, ChevronRight, ChevronLeft, X, Search, Upload, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { marketsAPI, adminAccountsAPI, adminProjectsAPI, adminTeamsAPI, adminTeamMembersAPI, adminUsersAPI, adminEmployeesAPI, adminOrganizationsAPI, adminReportSchedulesAPI } from '@/lib/api/admin';
import { useRole } from '@/contexts/role-context';
import { EntityDialog, BulkUploadDialog } from '@/components/admin-console/admin-dialogs';
import { TABS } from '@/components/admin-console/constants';
import type { TabKey } from '@/components/admin-console/types';
import { getColumns, renderRow } from '@/components/admin-console/tabs/admin-tab-renderer';

// ═══════════════════════ ADMIN PAGE ═══════════════════════════



export default function AdminPage() {

    const { role, user } = useRole();

    const teamId = user?.teamId || null;



    // Filter tabs based on role

    const filteredTabs = TABS.filter(tab => {

        if (role === 'ORG' || role === 'CTO') return true;

        if (role === 'MARKET') return ['markets', 'accounts', 'teams', 'members', 'users', 'onboard-employee', 'report-schedules'].includes(tab.key);

        if (role === 'ACCOUNT') return ['accounts', 'teams', 'members', 'users', 'onboard-employee', 'report-schedules'].includes(tab.key);

        if (role === 'PROJECT_MANAGER' || role === 'PROJECT') return ['projects', 'teams', 'members', 'users', 'onboard-employee', 'report-schedules'].includes(tab.key);

        if (role === 'TEAM_LEAD') return ['teams', 'members', 'users', 'onboard-employee'].includes(tab.key);

        return ['teams', 'members'].includes(tab.key); // Default for lower roles if they can access admin at all

    });



    const [activeTab, setActiveTab] = useState<TabKey>(filteredTabs[0]?.key || 'teams');

    const [data, setData] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);

    const [dialogOpen, setDialogOpen] = useState(false);

    const [editItem, setEditItem] = useState<any>(null);

    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

    const [bulkUploadType, setBulkUploadType] = useState<'employees' | 'sprints' | 'onboard-employee'>('employees');



    // ── Search ────────────────────────────────────────────────

    const [tableSearch, setTableSearch] = useState('');

    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [teamFilter, setTeamFilter] = useState<'all' | 'normal' | 'transformation'>('all');



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



    // Debounced server-side search (used for Users & Teams tabs)

    useEffect(() => {

        const timer = setTimeout(() => {

            setDebouncedSearch(tableSearch);

        }, 300);

        return () => clearTimeout(timer);

    }, [tableSearch]);



    const fetchData = useCallback(async (page: number, tab: TabKey, search?: string, transformationFilter?: string) => {

        setLoading(true);

        try {

            let result: any;

            if (tab === 'users') {

                result = await adminUsersAPI.getAll(page, PAGE_SIZE, search);

            } else if (tab === 'teams') {

                result = await adminTeamsAPI.getAll(page, PAGE_SIZE, search, transformationFilter);

            } else if (tab === 'onboard-employee') {

                result = search ? await adminEmployeesAPI.getAll() : await adminEmployeesAPI.getAll(page, PAGE_SIZE);

            } else {

                const apiMap: Record<string, (page?: number, limit?: number, aiEnabled?: boolean) => Promise<any>> = {

                    organizations: adminOrganizationsAPI.getAll,

                    markets: marketsAPI.getAll,

                    accounts: adminAccountsAPI.getAll,

                    projects: (p, l) => adminProjectsAPI.getAll(p, l, false),

                    'ai-projects': (p, l) => adminProjectsAPI.getAll(p, l, true),

                    teams: adminTeamsAPI.getAll as any,

                    members: adminTeamMembersAPI.getAll as any,

                    'report-schedules': adminReportSchedulesAPI.getAll,

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

        const searchParam = (activeTab === 'users' || activeTab === 'teams' || activeTab === 'onboard-employee') ? debouncedSearch.trim() || undefined : undefined;

        const transfParam = activeTab === 'teams' ? (teamFilter === 'normal' ? 'false' : teamFilter === 'transformation' ? 'true' : undefined) : undefined;

        fetchData(currentPage, activeTab, searchParam, transfParam);

    }, [currentPage, activeTab, fetchData, debouncedSearch, teamFilter]);



    const getSearchText = useCallback((item: any) => {

        const projectName = item.project?.name || projects.find((p: any) => p.id === item.projectId)?.name || '';

        const teamName = item.team?.name || teams.find((t: any) => t.id === item.teamId)?.name || '';

        return [

            item.employeeId,

            item.employeeCode,

            item.fullName,

            item.name,

            item.email,

            item.jobRole,

            item.role,

            projectName,

            teamName,

        ].filter(Boolean).join(' ').toLowerCase();

    }, [projects, teams]);



    // Search filter (client-side for all tabs except 'users' / 'teams' which use server-side search)

    const filteredData = useMemo(() => {

        if (activeTab === 'users' || activeTab === 'teams') return data; // server already filtered

        const q = tableSearch.trim().toLowerCase();

        if (!q) return data;

        return data.filter(item => getSearchText(item).includes(q));

    }, [data, tableSearch, activeTab, getSearchText]);



    // Pagination derived values (based on filtered data)

    const isServerSearchTab = activeTab === 'users' || activeTab === 'teams';

    const totalItemsToUse = isServerPaginated && (!tableSearch || isServerSearchTab) ? totalServerItems : filteredData.length;

    const totalPages = Math.max(1, Math.ceil(totalItemsToUse / PAGE_SIZE));



    const pagedData = useMemo(() => {

        const filtered = filteredData;

        if (isServerPaginated && (!tableSearch || isServerSearchTab)) return filtered;

        return filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    }, [filteredData, currentPage, isServerPaginated, isServerSearchTab, tableSearch]);



    // Reset to page 1 when search or filter changes

    useEffect(() => { setCurrentPage(1); }, [tableSearch, teamFilter]);



    const handleCreate = (initialData: any = null) => {

        const isEvent = initialData && (initialData.nativeEvent instanceof Event || initialData.target);

        setEditItem(isEvent ? null : initialData);

        setDialogOpen(true);

    };

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

                    'onboard-employee': adminEmployeesAPI.delete,

                    'report-schedules': adminReportSchedulesAPI.delete,

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

                    'onboard-employee': adminEmployeesAPI.update,

                    'report-schedules': adminReportSchedulesAPI.update,

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

                    'onboard-employee': adminEmployeesAPI.create,

                    'report-schedules': adminReportSchedulesAPI.create,

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

    const primaryActionLabel: Record<TabKey, string> = {
        organizations: 'Add Organization',
        markets: 'Add Market',
        accounts: 'Add Account',
        projects: 'Add Project',
        'ai-projects': 'Add AI Project',
        teams: 'Add Team',
        members: 'Add Team Members',
        users: 'Add User',
        'onboard-employee': 'Add Employee',
        'report-schedules': 'Schedule Report',
    };

    const bulkUploadLabel = activeTab === 'onboard-employee' ? 'Upload Employees' : 'Upload Users';



    return (

        <div className="space-y-6 fade-in">

            {/* Header */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div>

                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">

                        <Building2 className="inline h-7 w-7 md:h-8 md:w-8 mr-2 text-primary" />

                        Admin Console

                    </h1>

                    <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage your organization hierarchy — Markets, Accounts, Projects, Teams, Members &amp; Users</p>

                </div>

                {!(role === 'TEAM_LEAD' && activeTab !== 'members' && activeTab !== 'users' && activeTab !== 'onboard-employee') && (

                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">

                        {(activeTab === 'users' || activeTab === 'onboard-employee') && (

                            <Button

                                variant="outline"

                                onClick={() => {

                                    setBulkUploadType(activeTab === 'users' ? 'employees' : 'onboard-employee');

                                    setBulkUploadOpen(true);

                                }}

                                className="w-full justify-center rounded-xl gap-2 border-violet-500/40 text-violet-500 hover:bg-violet-500/10 sm:w-auto whitespace-nowrap"

                            >

                                <Upload className="h-4 w-4" /> {bulkUploadLabel}

                            </Button>

                        )}

                        <Button onClick={() => handleCreate()} className="w-full justify-center rounded-xl gap-2 shadow-lg shadow-primary/20 sm:w-auto whitespace-nowrap">

                            <Plus className="h-4 w-4" /> {primaryActionLabel[activeTab]}

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

                        {activeTab === 'teams' && (

                            <Select value={teamFilter} onValueChange={(v: any) => setTeamFilter(v)}>

                                <SelectTrigger className="w-[180px] h-9 rounded-xl text-xs font-semibold shrink-0 bg-background border-border">

                                    <SelectValue placeholder="All Teams" />

                                </SelectTrigger>

                                <SelectContent className="rounded-xl">

                                    <SelectItem value="all">All Teams</SelectItem>

                                    <SelectItem value="normal">Normal Teams</SelectItem>

                                    <SelectItem value="transformation">Transformation Monitor Teams</SelectItem>

                                </SelectContent>

                            </Select>

                        )}

                        <Button variant="ghost" size="sm" className="rounded-xl gap-2 shrink-0" onClick={() => {

                            const searchParam = (activeTab === 'users' || activeTab === 'teams' || activeTab === 'onboard-employee') ? debouncedSearch.trim() || undefined : undefined;

                            const transfParam = activeTab === 'teams' ? (teamFilter === 'normal' ? 'false' : teamFilter === 'transformation' ? 'true' : undefined) : undefined;

                            fetchData(currentPage, activeTab, searchParam, transfParam);

                        }}>

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

                                                {renderRow(activeTab, {
                                                    item,
                                                    projects,
                                                    teams,
                                                    onBadgeAssign: async (userId: string, badgeName: string) => {
                                                        await adminUsersAPI.update(userId, { badge: badgeName === 'none' ? null : badgeName });
                                                        fetchData(currentPage, activeTab);
                                                    },
                                                    onTriggerReport: async (scheduleId: string) => {
                                                        await adminReportSchedulesAPI.trigger(scheduleId);
                                                        toast.success('Report dispatched successfully by email');
                                                        fetchData(currentPage, activeTab);
                                                    },
                                                })}

                                                <td className="py-3 text-right pr-2">

                                                    <div className="flex gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-all">

                                                        {!(role === 'TEAM_LEAD' && activeTab !== 'members' && activeTab !== 'users' && activeTab !== 'onboard-employee') && (

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

                currentUserId={user?.id || null}

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



