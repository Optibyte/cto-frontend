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

    Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, Zap, Award, Mail, Clock, Calendar,

    Eye, EyeOff

} from 'lucide-react';

import { toast } from 'sonner';

import { cn } from '@/lib/utils';

import {

    marketsAPI, adminAccountsAPI, adminProjectsAPI, adminTeamsAPI, adminTeamMembersAPI, adminUsersAPI, adminEmployeesAPI, adminOrganizationsAPI, adminSprintMetricsAPI, adminReportSchedulesAPI,

} from '@/lib/api/admin';
import { employeesAPI } from '@/lib/api/employees';

import { useRole } from '@/contexts/role-context';

import ExcelJS from 'exceljs';

import { saveAs } from 'file-saver';

import { getBadgeStyles } from '@/lib/badges';



// ═══════════════════════════ TYPES ═══════════════════════════



type TabKey = 'organizations' | 'markets' | 'accounts' | 'projects' | 'ai-projects' | 'teams' | 'members' | 'users' | 'onboard-employee' | 'report-schedules';



interface TabConfig {

    key: TabKey;

    label: string;

    icon: any;

    color: string;

    gradient: string;

}



const AVAILABLE_BADGES = [

    { name: 'none', label: 'None' },

    { name: 'Microsoft Azure AI Engineer', label: 'Azure AI' },

    { name: 'Amazon Web Services DevOps Engineer', label: 'AWS DevOps' },

    { name: 'Cloud Native Computing Foundation Kubernetes Administrator', label: 'CNCF CKA' },

    { name: 'ISC2 CISSP', label: 'ISC2 CISSP' },

    { name: 'Google Professional Data Engineer', label: 'Google Data' },

    { name: 'DevOps Guru', label: 'DevOps Guru' },

    { name: 'AI Pioneer', label: 'AI Pioneer' },

    { name: 'Cloud Architect', label: 'Cloud Architect' },

    { name: 'Security Champion', label: 'Security' },

    { name: 'Agile Master', label: 'Agile' },

    { name: 'Code Ninja', label: 'Ninja' },

    { name: 'Bug Hunter', label: 'Hunter' },

    { name: 'UI Wizard', label: 'UI Wizard' }

];



const TABS: TabConfig[] = [

    { key: 'organizations', label: 'Organizations', icon: Building2, color: 'text-indigo-500', gradient: 'from-indigo-600 to-indigo-400' },

    { key: 'markets', label: 'Markets', icon: Globe2, color: 'text-blue-500', gradient: 'from-blue-600 to-blue-400' },

    { key: 'accounts', label: 'Accounts', icon: Briefcase, color: 'text-emerald-500', gradient: 'from-emerald-600 to-emerald-400' },

    { key: 'projects', label: 'Projects', icon: FolderKanban, color: 'text-violet-500', gradient: 'from-violet-600 to-violet-400' },

    { key: 'teams', label: 'Teams', icon: Users2, color: 'text-amber-500', gradient: 'from-amber-600 to-amber-400' },

    { key: 'members', label: 'Team Members', icon: UserPlus, color: 'text-cyan-500', gradient: 'from-cyan-600 to-cyan-400' },

    { key: 'users', label: 'Users', icon: Building2, color: 'text-rose-500', gradient: 'from-rose-600 to-rose-400' },

    { key: 'onboard-employee', label: 'Onboard Employees', icon: UserPlus, color: 'text-emerald-500', gradient: 'from-emerald-600 to-emerald-400' },

    { key: 'report-schedules', label: 'Schedule Reports', icon: Mail, color: 'text-violet-500', gradient: 'from-violet-600 to-violet-400' },

];



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

        let filtered = filteredData;

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

                                                {renderRow(

                                                    activeTab,

                                                    item,

                                                    async (userId, badgeName) => {

                                                        await adminUsersAPI.update(userId, { badge: badgeName === 'none' ? null : badgeName });

                                                        fetchData(currentPage, activeTab);

                                                    },

                                                    projects,

                                                    async (id) => {

                                                        await adminReportSchedulesAPI.trigger(id);

                                                        toast.success('Report dispatched successfully by email');

                                                        fetchData(currentPage, activeTab);

                                                    },

                                                    teams

                                                )}

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



function getColumns(tab: TabKey): string[] {

    switch (tab) {

        case 'organizations': return ['Name', 'Country', 'Created'];

        case 'markets': return ['Name', 'Country', 'Organization', 'Accounts', 'Created'];

        case 'accounts': return ['Name', 'Market', 'Teams', 'Created'];

        case 'projects': return ['Name', 'Status', 'AI Enabled', 'Manager', 'Team Size', 'Created'];

        case 'ai-projects': return ['Name', 'Status', 'Licenses', 'AI Tools', 'Manager', 'Created'];

        case 'teams': return ['Name', 'AI Enabled', 'Project', 'Members', 'Active'];

        case 'members': return ['User', 'Email', 'Team', 'Role in Team', 'Joined'];

        case 'users': return ['Name', 'Email', 'Access Role', 'Employee ID', 'Active'];

        case 'onboard-employee': return ['Employee ID', 'Name', 'Email', 'Onboarding Date', 'Role', 'Project', 'Team'];

        case 'report-schedules': return ['Name', 'Recipients', 'Frequency', 'Time', 'Report Type', 'Fenced Projects', 'Last Sent', 'Status', 'Dispatch'];

    }

}



function renderRow(tab: TabKey, item: any, onBadgeAssign?: (userId: string, badgeName: string) => Promise<void>, projects?: any[], onTriggerReport?: (id: string) => Promise<void>, teams?: any[]) {

    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '—';

    switch (tab) {

        case 'onboard-employee':

            return (<>

                <td className="py-3 text-sm font-semibold">{item.employeeId || '—'}</td>

                <td className="py-3 text-sm font-semibold">{item.fullName}</td>

                <td className="py-3 text-sm text-muted-foreground">{item.email}</td>

                <td className="py-3 text-xs text-muted-foreground">{formatDate(item.createdAt)}</td>

                <td className="py-3">

                    <Badge variant="secondary" className="rounded-full text-[10px] px-2">{item.jobRole || '—'}</Badge>

                </td>

                <td className="py-3 text-sm text-muted-foreground">

                    {projects?.find((p: any) => p.id === item.projectId)?.name || '—'}

                </td>

                <td className="py-3 text-sm text-muted-foreground">

                    {teams?.find((t: any) => t.id === item.teamId)?.name || '—'}

                </td>

            </>);

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

                <td className="py-3 text-sm font-semibold">

                    <div className="flex flex-col gap-0.5">

                        <span className="font-semibold text-foreground">{item.fullName}</span>

                        {item.badge && item.badge !== 'none' && (

                            <div className="flex flex-wrap gap-1 mt-0.5">

                                {item.badge.split(',').map((badgeName: string) => {

                                    const trimmed = badgeName.trim();

                                    if (!trimmed || trimmed === 'none') return null;

                                    const badgeStyle = getBadgeStyles(trimmed);

                                    return (

                                        <span key={trimmed} className={cn(

                                            "inline-flex items-center gap-1 border px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-sm w-fit",

                                            badgeStyle.bg,

                                            badgeStyle.glow

                                        )}>

                                            <badgeStyle.icon className="h-2 w-2 animate-pulse" />

                                            {badgeStyle.label}

                                        </span>

                                    );

                                })}

                            </div>

                        )}

                    </div>

                </td>

                <td className="py-3 text-sm text-muted-foreground">{item.email}</td>

                <td className="py-3"><Badge className={cn('rounded-full text-[10px] px-2', {

                    'bg-purple-500/10 text-purple-500 border-purple-500/20': item.role === 'CTO',

                    'bg-violet-500/10 text-violet-500 border-violet-500/20': item.role === 'ORG',

                    'bg-blue-500/10 text-blue-500 border-blue-500/20': item.role === 'MARKET',

                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20': item.role === 'ACCOUNT',

                    'bg-amber-500/10 text-amber-500 border-amber-500/20': item.role === 'PROJECT_MANAGER',

                    'bg-indigo-500/10 text-indigo-500 border-indigo-500/20': item.role === 'PROJECT',

                    'bg-cyan-500/10 text-cyan-500 border-cyan-500/20': item.role === 'TEAM_LEAD',

                    'bg-slate-500/10 text-slate-500 border-slate-500/20': item.role === 'TEAM',

                })} variant="outline">{item.role === 'CTO' ? 'Super Admin' : item.role}</Badge></td>

                <td className="py-3 text-sm text-muted-foreground">{item.employeeId || '—'}</td>

                <td className="py-3">{item.isActive ? <Badge className="bg-emerald-500/10 text-emerald-500 rounded-full text-[10px]" variant="outline">Active</Badge> : <Badge variant="outline" className="rounded-full text-[10px]">Inactive</Badge>}</td>

            </>);



        case 'report-schedules':

            return (<>

                <td className="py-3 text-sm font-semibold">{item.name || 'Unnamed Schedule'}</td>

                <td className="py-3 text-sm text-muted-foreground max-w-[200px] truncate" title={item.recipients || ''}>{item.recipients || ''}</td>

                <td className="py-3 text-xs"><Badge variant="outline" className="rounded-full text-[10px] bg-slate-50">{item.frequency || 'WEEKLY'}</Badge></td>

                <td className="py-3 text-sm font-mono text-muted-foreground">{item.scheduleTime || '09:00'}</td>

                <td className="py-3 text-xs"><Badge variant="secondary" className="rounded-full text-[10px]">{(item.reportType || 'PERFORMANCE').replace(/_/g, ' ')}</Badge></td>

                <td className="py-3 text-xs">

                    <div className="flex flex-wrap gap-1 max-w-[150px]">

                        {item.projectIds && item.projectIds.length > 0 ? (

                            item.projectIds.map((pid: string) => {

                                const proj = projects?.find((p: any) => p.id === pid);

                                return (

                                    <Badge key={pid} variant="outline" className="rounded-full text-[9px] px-1.5 py-0">

                                        {proj ? proj.name : pid.slice(0, 4)}

                                    </Badge>

                                );

                            })

                        ) : (

                            <span className="text-muted-foreground italic text-[10px]">None</span>

                        )}

                    </div>

                </td>

                <td className="py-3 text-xs text-muted-foreground">{item.lastSentAt ? new Date(item.lastSentAt).toLocaleString() : 'Never'}</td>

                <td className="py-3">

                    {item.isActive ? (

                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-full text-[10px]" variant="outline">Active</Badge>

                    ) : (

                        <Badge variant="outline" className="rounded-full text-[10px]">Inactive</Badge>

                    )}

                </td>

                <td className="py-3">

                    <Button

                        variant="outline"

                        size="sm"

                        onClick={(e) => {

                            e.stopPropagation();

                            if (onTriggerReport) onTriggerReport(item.id);

                        }}

                        className="h-7 text-[10px] rounded-lg gap-1 border-violet-500/30 text-violet-600 hover:bg-violet-50"

                    >

                        <RefreshCw className="h-3 w-3 animate-none" /> Send Now

                    </Button>

                </td>

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

    currentUserId: string | null;

}



function EntityDialog({ open, onOpenChange, tab, editItem, onSave, organizations, markets, accounts, projects, users, teams, role, teamId, currentUserId }: EntityDialogProps) {

    const [form, setForm] = useState<Record<string, any>>({});

    const [saving, setSaving] = useState(false);

    const [userSearch, setUserSearch] = useState('');

    const [showPassword, setShowPassword] = useState(false);

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [employeeLookupLoading, setEmployeeLookupLoading] = useState(false);

    const [employeeLookupMessage, setEmployeeLookupMessage] = useState('');



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

    const teamsForSelectedProject = useMemo(() => {
        if (tab !== 'onboard-employee' || !form.projectId) return teams;
        return teams.filter((t: any) => {
            const teamProjectId = t.projectId || t.project?.id;
            return teamProjectId === form.projectId;
        });
    }, [form.projectId, tab, teams]);



    const uniqueUsers = useMemo(() => {

        const seen = new Set();

        return users.filter(u => {

            if (!u.id || seen.has(u.id)) return false;

            seen.add(u.id);

            return true;

        });

    }, [users]);

    const findUserByEmployeeId = useCallback((employeeId: string) => {
        const normalized = employeeId.trim().toLowerCase();
        if (!normalized) return null;
        return uniqueUsers.find((u: any) =>
            String(u.employeeId || u.employeeCode || u.employee_code || '').trim().toLowerCase() === normalized
        ) || null;
    }, [uniqueUsers]);

    const applyEmployeeData = useCallback((employee: any) => {
        if (!employee) return;
        const next: Record<string, any> = {};
        const fullName = employee.fullName || employee.name || employee.employeeName || employee.employee_name;
        const employeeId = employee.employeeId || employee.employeeCode || employee.employee_code;
        const jobRole = employee.jobRole || employee.roleName || employee.designation || employee.role;

        if (fullName) next.fullName = fullName;
        if (employee.email) next.email = employee.email;
        if (employeeId) next.employeeId = employeeId;
        if (jobRole) next.jobRole = jobRole;
        if (employee.jiraAccountId) next.jiraAccountId = employee.jiraAccountId;
        if (employee.githubEmail) next.githubEmail = employee.githubEmail;
        if (employee.orgId) next.scopeOrgId = employee.orgId;
        if (employee.marketId) next.scopeMarketId = employee.marketId;
        if (employee.accountId) next.scopeAccountId = employee.accountId;
        if (employee.projectId) next.scopeProjectId = employee.projectId;
        if (employee.teamId) next.scopeTeamId = employee.teamId;

        setForm(prev => ({ ...prev, ...next }));
    }, []);

    const handleEmployeeIdChange = useCallback(async (value: string) => {
        setForm(prev => ({ ...prev, employeeId: value }));
        setEmployeeLookupMessage('');

        const trimmed = value.trim();
        if (trimmed.length < 3) return;

        const localMatch = findUserByEmployeeId(trimmed);
        if (localMatch) {
            applyEmployeeData(localMatch);
            setEmployeeLookupMessage('Employee data filled from existing records.');
            return;
        }

        setEmployeeLookupLoading(true);
        try {
            const { data } = await employeesAPI.getByCode(trimmed, teamId || undefined);
            const employee = data?.data || data;
            if (employee) {
                applyEmployeeData(employee);
                setEmployeeLookupMessage('Employee data filled from employee ID.');
            } else {
                setEmployeeLookupMessage('No employee found for this ID yet.');
            }
        } catch {
            setEmployeeLookupMessage('No employee found for this ID yet.');
        } finally {
            setEmployeeLookupLoading(false);
        }
    }, [applyEmployeeData, findUserByEmployeeId, teamId]);

    const handleOnboardProjectChange = useCallback((value: string) => {
        const projectId = value === 'none' ? undefined : value;
        setForm(prev => {
            const currentTeam = teams.find((t: any) => t.id === prev.teamId);
            const currentTeamProjectId = currentTeam?.projectId || currentTeam?.project?.id;
            return {
                ...prev,
                projectId,
                teamId: projectId && currentTeamProjectId !== projectId ? undefined : prev.teamId
            };
        });
    }, [teams]);

    const handleOnboardTeamChange = useCallback((value: string) => {
        const teamIdValue = value === 'none' ? undefined : value;
        const selectedTeam = teams.find((t: any) => t.id === teamIdValue);
        const selectedTeamProjectId = selectedTeam?.projectId || selectedTeam?.project?.id;
        setForm(prev => ({
            ...prev,
            teamId: teamIdValue,
            projectId: selectedTeamProjectId || prev.projectId
        }));
    }, [teams]);



    useEffect(() => {

        if (open) {

            setUserSearch('');

            setShowPassword(false);

            setShowConfirmPassword(false);

            setEmployeeLookupMessage('');

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



                if (tab === 'teams') {

                    initialForm.isTransformationMonitor = !!(editItem.transformationStartDate || editItem.transformationEndDate);

                }



                setForm(initialForm);

            } else {

                setForm(getDefaultForm(tab));

            }

        }

    }, [open, editItem, tab]);



    const isEdit = !!editItem && !!editItem.id;



    const handleSubmit = async () => {

        if (tab === 'teams') {

            if (!form.teamId || !form.teamId.trim()) {

                toast.error('Team ID is required');

                return;

            }

            if (!form.name || !form.name.trim()) {

                toast.error('Team Name is required');

                return;

            }

        }

        if (tab === 'onboard-employee') {

            if (!form.employeeId || !form.employeeId.trim()) {

                toast.error('Employee ID is required');

                return;

            }

            if (!form.fullName || !form.fullName.trim()) {

                toast.error('Full Name is required');

                return;

            }

            if (!form.email || !form.email.trim()) {

                toast.error('Email is required');

                return;

            }

            if (!form.createdAt) {

                toast.error('Onboarding Date is required');

                return;

            }

            if (!form.jobRole) {

                toast.error('Role is required');

                return;

            }

        }

        if (tab === 'users') {

            if (!form.employeeId || !form.employeeId.trim()) {

                toast.error('Employee ID is required');

                return;

            }

            if (!form.fullName || !form.fullName.trim()) {

                toast.error('Full Name is required');

                return;

            }

            if (!form.email || !form.email.trim()) {

                toast.error('Email is required');

                return;

            }

            if (!isEdit && (!form.password || !form.password.trim())) {

                toast.error('Password is required');

                return;

            }

            if (form.password && form.password.trim()) {

                if (form.password !== form.passwordConfirmation) {

                    toast.error('Passwords do not match');

                    return;

                }

            }

        }

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

                                        (u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||

                                            u.email.toLowerCase().includes(userSearch.toLowerCase()))

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

                                                <span className="text-[10px] text-muted-foreground line-clamp-1">{(u.role === 'CTO' ? 'Super Admin' : u.role)} • {u.email}</span>

                                            </label>

                                        </div>

                                    ))}

                                </div>

                                <p className="text-[10px] text-muted-foreground line-clamp-1 italic">

                                    {(form.userIds || []).length} users selected

                                </p>

                            </div>

                        </>)}



                        {tab === 'teams' && (<>

                            <div className="grid grid-cols-2 gap-4">

                                <div className="space-y-2"><Label>Team ID *</Label><Input className="rounded-xl" value={form.teamId || ''} onChange={e => set('teamId', e.target.value)} placeholder="e.g. T-CORE-BANK" /></div>

                                <div className="space-y-2"><Label>Name *</Label><Input className="rounded-xl" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Core Banking" /></div>

                            </div>

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



                            <div className="space-y-2">

                                <Label>Onboard Date</Label>

                                <Input type="date" className="rounded-xl" value={form.onboardDate ? form.onboardDate.split('T')[0] : ''} onChange={e => set('onboardDate', e.target.value)} />

                            </div>



                            <div className="flex items-center space-x-2 py-2">

                                <input

                                    type="checkbox"

                                    id="transformation-monitor"

                                    className="h-4 w-4 rounded border-violet-500"

                                    checked={!!form.isTransformationMonitor}

                                    onChange={(e) => {

                                        set('isTransformationMonitor', e.target.checked);

                                        if (!e.target.checked) {

                                            set('transformationStartDate', '');

                                            set('transformationEndDate', '');

                                        }

                                    }}

                                />

                                <Label htmlFor="transformation-monitor" className="cursor-pointer font-bold text-violet-600">Transformation Monitor</Label>

                            </div>



                            {!!form.isTransformationMonitor && (

                                <div className="space-y-4 p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10 animate-in fade-in slide-in-from-top-2 duration-300">

                                    <p className="text-xs font-black uppercase tracking-wider text-violet-600">Transformation Dates</p>

                                    <div className="grid grid-cols-2 gap-4">

                                        <div className="space-y-2">

                                            <Label>Start Date</Label>

                                            <Input type="date" className="rounded-xl bg-background" value={form.transformationStartDate ? form.transformationStartDate.split('T')[0] : ''} onChange={e => set('transformationStartDate', e.target.value)} />

                                        </div>

                                        <div className="space-y-2">

                                            <Label>End Date</Label>

                                            <Input type="date" className="rounded-xl bg-background" value={form.transformationEndDate ? form.transformationEndDate.split('T')[0] : ''} onChange={e => set('transformationEndDate', e.target.value)} />

                                        </div>

                                    </div>

                                </div>

                            )}

                        </>)}



                        {tab === 'members' && (<>

                            <div className="space-y-2">

                                <Label>Team *</Label>

                                <Select value={form.teamId || ''} onValueChange={v => set('teamId', v)}>

                                    <SelectTrigger className="w-full rounded-xl"><SelectValue placeholder="Select team" /></SelectTrigger>

                                    <SelectContent className="z-[60]">

                                        {teams

                                            .filter((t: any) => ['CTO', 'ORG', 'MARKET', 'ACCOUNT', 'PROJECT_MANAGER', 'PROJECT'].includes(role || '') || t.id === teamId || t.teamLeadId === currentUserId)

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

                                                    <span className="text-[10px] text-muted-foreground line-clamp-1">{u.jobRole || (u.role === 'CTO' ? 'Super Admin' : u.role)} • {u.email}</span>

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

                            {/* Self-edit: only allow name change */}

                            {(isEdit && editItem?.id && currentUserId && editItem.id === currentUserId) ? (<>

                                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-2">

                                    <svg className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>

                                    <p className="text-xs text-amber-700 font-medium leading-relaxed">You are editing your own account. Only your <strong>display name</strong> can be changed here.</p>

                                </div>

                                <div className="space-y-2"><Label>Full Name *</Label><Input className="rounded-xl" value={form.fullName || ''} onChange={e => set('fullName', e.target.value)} placeholder="e.g. John Doe" /></div>

                            </>) : (<>

                                <div className="space-y-2">
                                    <Label>Employee ID *</Label>
                                    <Input
                                        className="rounded-xl"
                                        value={form.employeeId || ''}
                                        onChange={e => handleEmployeeIdChange(e.target.value)}
                                        placeholder="e.g. EMP-1234"
                                    />
                                    {employeeLookupLoading ? (
                                        <p className="text-[10px] text-muted-foreground">Finding employee details...</p>
                                    ) : employeeLookupMessage ? (
                                        <p className="text-[10px] text-muted-foreground">{employeeLookupMessage}</p>
                                    ) : null}
                                </div>

                                <div className="space-y-2"><Label>Full Name *</Label><Input className="rounded-xl" value={form.fullName || ''} onChange={e => set('fullName', e.target.value)} placeholder="Auto-filled from Employee ID" /></div>

                                <div className="space-y-2"><Label>Email *</Label><Input type="email" className="rounded-xl" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="Auto-filled from Employee ID" /></div>

                                <div className="space-y-2">

                                    <Label>{isEdit ? 'Reset Password' : 'Password *'}</Label>

                                    <div className="relative">

                                        <Input

                                            type={showPassword ? 'text' : 'password'}

                                            className="rounded-xl pr-10"

                                            value={form.password || ''}

                                            onChange={e => set('password', e.target.value)}

                                            placeholder={isEdit ? 'Leave blank to keep current' : '••••••••'}

                                        />

                                        <button

                                            type="button"

                                            onClick={() => setShowPassword(v => !v)}

                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"

                                            tabIndex={-1}

                                        >

                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}

                                        </button>

                                    </div>

                                    {isEdit && (

                                        <p className="text-[10px] text-muted-foreground">Leave blank to keep current password.</p>

                                    )}

                                </div>

                                <div className="space-y-2">

                                    <Label>{isEdit ? 'Confirm New Password' : 'Confirm Password *'}</Label>

                                    <div className="relative">

                                        <Input

                                            type={showConfirmPassword ? 'text' : 'password'}

                                            className={`rounded-xl pr-10 ${form.password && form.passwordConfirmation && form.password !== form.passwordConfirmation ? 'border-red-400 focus-visible:ring-red-400' : ''}`}

                                            value={form.passwordConfirmation || ''}

                                            onChange={e => set('passwordConfirmation', e.target.value)}

                                            placeholder={isEdit ? 'Confirm new password' : '••••••••'}

                                            disabled={!form.password}

                                        />

                                        <button

                                            type="button"

                                            onClick={() => setShowConfirmPassword(v => !v)}

                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"

                                            tabIndex={-1}

                                            disabled={!form.password}

                                        >

                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}

                                        </button>

                                    </div>

                                    {form.password && form.passwordConfirmation && form.password !== form.passwordConfirmation && (

                                        <p className="text-[10px] text-red-500 font-medium">Passwords do not match.</p>

                                    )}

                                    {form.password && form.passwordConfirmation && form.password === form.passwordConfirmation && (

                                        <p className="text-[10px] text-emerald-500 font-medium">✓ Passwords match.</p>

                                    )}

                                </div>

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

                                            <SelectItem value="CTO">Super Admin</SelectItem>

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

                            </>)}

                        </>)}



                        {tab === 'onboard-employee' && (<>

                            <div className="grid grid-cols-2 gap-4">

                                <div className="space-y-2"><Label>Employee ID *</Label><Input className="rounded-xl" value={form.employeeId || ''} onChange={e => set('employeeId', e.target.value)} placeholder="e.g. EMP-1001" /></div>

                                <div className="space-y-2"><Label>Full Name *</Label><Input className="rounded-xl" value={form.fullName || ''} onChange={e => set('fullName', e.target.value)} placeholder="e.g. Jane Smith" /></div>

                            </div>

                            <div className="space-y-2"><Label>Email *</Label><Input type="email" className="rounded-xl" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="jane.smith@company.com" /></div>

                            <div className="grid grid-cols-2 gap-4">

                                <div className="space-y-2">

                                    <Label>Onboarding Date *</Label>

                                    <Input type="date" className="rounded-xl" value={form.createdAt ? form.createdAt.split('T')[0] : ''} onChange={e => set('createdAt', e.target.value)} />

                                </div>

                                <div className="space-y-2">

                                    <Label>Job Role / Designation *</Label>

                                    <Input className="rounded-xl" value={form.jobRole || ''} onChange={e => set('jobRole', e.target.value)} placeholder="e.g. Software Engineer" />

                                </div>

                            </div>

                            <div className="grid grid-cols-2 gap-4">

                                <div className="space-y-2">

                                    <Label>Project</Label>

                                    <Select value={form.projectId || 'none'} onValueChange={handleOnboardProjectChange}>

                                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select project" /></SelectTrigger>

                                        <SelectContent className="max-h-60">

                                            <SelectItem value="none">None</SelectItem>

                                            {uniqueProjects.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}

                                        </SelectContent>

                                    </Select>

                                </div>

                                <div className="space-y-2">

                                    <Label>Team</Label>

                                    <Select value={form.teamId || 'none'} onValueChange={handleOnboardTeamChange}>

                                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select team" /></SelectTrigger>

                                        <SelectContent className="max-h-60">

                                            <SelectItem value="none">None</SelectItem>

                                            {teamsForSelectedProject.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}{t.project?.name ? ` (${t.project.name})` : ''}</SelectItem>)}

                                        </SelectContent>

                                    </Select>

                                </div>

                            </div>

                        </>)}



                        {tab === 'report-schedules' && (<>

                            <div className="space-y-2">

                                <Label>Schedule Name *</Label>

                                <Input className="rounded-xl" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Weekly Executive Report" />

                            </div>

                            <div className="space-y-2">

                                <Label>Recipients (Comma-separated emails) *</Label>

                                <Input className="rounded-xl" value={form.recipients || ''} onChange={e => set('recipients', e.target.value)} placeholder="e.g. boss@corp.com, admin@corp.com" />

                            </div>

                            <div className="grid grid-cols-2 gap-4">

                                <div className="space-y-2">

                                    <Label>Frequency</Label>

                                    <Select value={form.frequency || 'WEEKLY'} onValueChange={v => set('frequency', v)}>

                                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>

                                        <SelectContent>

                                            <SelectItem value="DAILY">Daily</SelectItem>

                                            <SelectItem value="WEEKLY">Weekly</SelectItem>

                                            <SelectItem value="MONTHLY">Monthly</SelectItem>

                                        </SelectContent>

                                    </Select>

                                </div>

                                <div className="space-y-2">

                                    <Label>Schedule Time (24h format)</Label>

                                    <Input type="time" className="rounded-xl" value={form.scheduleTime || '09:00'} onChange={e => set('scheduleTime', e.target.value)} />

                                </div>

                            </div>

                            <div className="space-y-2">

                                <Label>Report Type</Label>

                                <Select value={form.reportType || 'PERFORMANCE'} onValueChange={v => set('reportType', v)}>

                                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>

                                    <SelectContent>

                                        <SelectItem value="JIRA_ANALYTICS">Jira Analytics</SelectItem>

                                        <SelectItem value="TEAM_KPI">Team KPI</SelectItem>

                                        <SelectItem value="PERFORMANCE">Performance Summary</SelectItem>

                                    </SelectContent>

                                </Select>

                            </div>

                            <div className="space-y-3">

                                <div className="flex items-center justify-between">

                                    <Label>Scoped Projects (Fenced Data) *</Label>

                                    <Button

                                        variant="ghost"

                                        size="sm"

                                        className="h-7 text-[10px] rounded-lg"

                                        onClick={() => {

                                            const allSelected = uniqueProjects.every((p: any) => (form.projectIds || []).includes(p.id));

                                            if (allSelected) {

                                                set('projectIds', []);

                                            } else {

                                                set('projectIds', uniqueProjects.map((p: any) => p.id));

                                            }

                                        }}

                                    >

                                        {uniqueProjects.every((p: any) => (form.projectIds || []).includes(p.id)) ? 'Deselect All' : 'Select All'}

                                    </Button>

                                </div>

                                <div className="grid grid-cols-1 gap-1 max-h-[180px] overflow-y-auto p-2 rounded-xl border border-border/40 bg-muted/20">

                                    {uniqueProjects.map((p: any) => (

                                        <div key={p.id} className="flex items-center space-x-2 p-2 hover:bg-accent/50 rounded-lg transition-colors group">

                                            <input

                                                type="checkbox"

                                                id={`sched-proj-${p.id}`}

                                                className="h-4 w-4 rounded border-primary"

                                                checked={(form.projectIds || []).includes(p.id)}

                                                onChange={(e) => {

                                                    const currentIds = form.projectIds || [];

                                                    if (e.target.checked) {

                                                        set('projectIds', [...currentIds, p.id]);

                                                    } else {

                                                        set('projectIds', currentIds.filter((id: string) => id !== p.id));

                                                    }

                                                }}

                                            />

                                            <label htmlFor={`sched-proj-${p.id}`} className="grid cursor-pointer flex-1">

                                                <span className="text-sm font-medium leading-none">{p.name}</span>

                                                <span className="text-[10px] text-muted-foreground line-clamp-1">Status: {p.status}</span>

                                            </label>

                                        </div>

                                    ))}

                                </div>

                            </div>

                            <div className="flex items-center space-x-2 py-2">

                                <input

                                    type="checkbox"

                                    id="sched-active"

                                    className="h-4 w-4 rounded border-primary"

                                    checked={form.isActive !== false}

                                    onChange={(e) => set('isActive', e.target.checked)}

                                />

                                <Label htmlFor="sched-active" className="cursor-pointer font-medium">Is Schedule Active</Label>

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

        case 'teams': return { teamId: '', name: '', description: '', teamLeadId: '', accountId: '', projectId: '', onboardDate: '', transformationStartDate: '', transformationEndDate: '', isTransformationMonitor: false };

        case 'members': return { teamId: '', userIds: [], roleInTeam: 'Member' };

        case 'users': return { fullName: '', email: '', role: 'TEAM', jobRole: '', employeeId: '', auth0Id: '', jiraAccountId: '', githubEmail: '', scopeOrgId: '', scopeMarketId: '', scopeAccountId: '', scopeProjectId: '', scopeTeamId: '', badge: '', password: '' };

        case 'onboard-employee': return { employeeId: '', fullName: '', email: '', createdAt: new Date().toISOString().split('T')[0], jobRole: '', projectId: undefined, teamId: undefined };

        case 'report-schedules': return { name: '', recipients: '', frequency: 'WEEKLY', scheduleTime: '09:00', reportType: 'PERFORMANCE', projectIds: [], isActive: true };

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

            if (form.teamId !== undefined) t.teamId = form.teamId.trim();

            if (form.teamLeadId && form.teamLeadId !== 'none') t.teamLeadId = form.teamLeadId;

            if (form.description) t.description = form.description;

            if (form.accountId) t.accountId = form.accountId;

            if (form.projectId) t.projectId = form.projectId;



            // Map onboard and transformation dates

            t.onboardDate = form.onboardDate ? form.onboardDate : null;

            if (form.isTransformationMonitor) {

                t.transformationStartDate = form.transformationStartDate ? form.transformationStartDate : null;

                t.transformationEndDate = form.transformationEndDate ? form.transformationEndDate : null;

            } else {

                t.transformationStartDate = null;

                t.transformationEndDate = null;

            }

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

            if (form.badge !== undefined) u.badge = form.badge ? form.badge : null;

            if (form.password) u.password = form.password;



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

        case 'onboard-employee': {

            const p: any = {

                auth0Id: form.auth0Id?.trim() || `auth0|${Date.now()}`,

                email: form.email.trim(),

                fullName: form.fullName.trim(),

                employeeId: form.employeeId.trim(),

                jobRole: form.jobRole,

                role: 'TEAM',

            };

            if (form.projectId) p.projectId = form.projectId;

            else p.projectId = null;

            if (form.teamId) p.teamId = form.teamId;

            else p.teamId = null;

            return p;

        }

        case 'report-schedules': return {

            name: form.name,

            recipients: form.recipients,

            frequency: form.frequency,

            scheduleTime: form.scheduleTime,

            reportType: form.reportType,

            projectIds: form.projectIds || [],

            isActive: form.isActive !== false

        };

    }

}



// ═══════════════════ BULK UPLOAD DIALOG ═══════════════════════



interface BulkUploadDialogProps {

    open: boolean;

    onOpenChange: (v: boolean) => void;

    type: 'employees' | 'sprints' | 'onboard-employee';

    onSuccess: () => void;

}



function BulkUploadDialog({ open, onOpenChange, type, onSuccess }: BulkUploadDialogProps) {

    const isEmployees = type === 'employees';

    const isSprints = type === 'sprints';

    const isOnboard = type === 'onboard-employee';

    const uploadCopy = {
        employees: {
            title: 'Bulk Upload Users',
            description: 'Upload an Excel (.xlsx) or CSV file to import users in bulk.',
        },
        sprints: {
            title: 'Bulk Upload Sprint Metrics',
            description: 'Upload an Excel (.xlsx) or CSV file to import sprint metrics in bulk.',
        },
        'onboard-employee': {
            title: 'Bulk Upload Onboard Employees',
            description: 'Upload an Excel (.xlsx) or CSV file to import onboarding employees in bulk.',
        },
    }[type];

    const [file, setFile] = useState<File | null>(null);

    const [uploading, setUploading] = useState(false);

    const [result, setResult] = useState<any>(null);

    const [dragOver, setDragOver] = useState(false);



    const reset = () => { setFile(null); setResult(null); };



    const handleDownloadTemplate = async () => {

        if (type === 'onboard-employee') {

            try {

                const toastId = toast.loading('Generating template...');

                const workbook = new ExcelJS.Workbook();

                const worksheet = workbook.addWorksheet('Onboard Employees');

                let projectList: any[] = [];

                let teamList: any[] = [];

                try {

                    const [projectRes, teamRes] = await Promise.all([

                        adminProjectsAPI.getAll().catch(() => []),

                        adminTeamsAPI.getAll().catch(() => []),

                    ]);

                    projectList = Array.isArray(projectRes) ? projectRes : projectRes?.data || [];

                    teamList = Array.isArray(teamRes) ? teamRes : teamRes?.data || [];

                } catch { }

                const projectNameById = new Map(
                    projectList
                        .filter((p: any) => p.id && p.name)
                        .map((p: any) => [p.id, p.name])
                );

                const projectTeamPairs = teamList
                    .map((team: any) => {
                        const projectId = team.projectId || team.project?.id;
                        const projectName = team.project?.name || projectNameById.get(projectId);
                        return {
                            project: projectName,
                            team: team.name,
                        };
                    })
                    .filter((item: any) => item.project && item.team)
                    .sort((a: any, b: any) => a.project.localeCompare(b.project) || a.team.localeCompare(b.team));

                const uniqueProjectNames = Array.from(new Set(projectTeamPairs.map((item: any) => item.project))).sort();

                const firstProjectName = uniqueProjectNames[0] || 'E-commerce Platform';
                const firstTeamName = projectTeamPairs.find((item: any) => item.project === firstProjectName)?.team || 'Alpha Team';

                const lookupSheet = workbook.addWorksheet('Template Lists');

                lookupSheet.state = 'veryHidden';

                lookupSheet.columns = [

                    { header: 'Projects', key: 'project', width: 35 },

                    { header: 'Teams', key: 'team', width: 35 },

                    { header: 'Mapped Project', key: 'mappedProject', width: 35 },

                    { header: 'Mapped Team', key: 'mappedTeam', width: 35 },

                ];

                const maxLookupRows = Math.max(uniqueProjectNames.length, projectTeamPairs.length, 1);

                for (let i = 0; i < maxLookupRows; i++) {

                    lookupSheet.addRow({

                        project: uniqueProjectNames[i] || '',

                        team: '',

                        mappedProject: projectTeamPairs[i]?.project || '',

                        mappedTeam: projectTeamPairs[i]?.team || '',

                    });

                }



                worksheet.columns = [

                    { header: 'Employee ID', key: 'employeeId', width: 20 },

                    { header: 'Name', key: 'name', width: 25 },

                    { header: 'Email', key: 'email', width: 30 },

                    { header: 'Onboarding Date', key: 'onboardDate', width: 20 },

                    { header: 'Role', key: 'role', width: 20 },

                    { header: 'Project', key: 'project', width: 25 },

                    { header: 'Team', key: 'team', width: 25 }

                ];



                worksheet.addRow({

                    employeeId: 'EMP-1001',

                    name: 'John Doe',

                    email: 'john.doe@company.com',

                    onboardDate: new Date().toISOString().split('T')[0],

                    role: 'developer',

                    project: firstProjectName,

                    team: firstTeamName

                });



                for (let i = 2; i <= 500; i++) {

                    worksheet.getCell(`E${i}`).dataValidation = {

                        type: 'list',

                        allowBlank: true,

                        showErrorMessage: true,

                        errorStyle: 'error',

                        errorTitle: 'Invalid Role',

                        error: 'Please select a valid role from the list.',

                        formulae: ['"developer,tester,AI"']

                    };

                    if (uniqueProjectNames.length > 0) {

                        worksheet.getCell(`F${i}`).dataValidation = {

                            type: 'list',

                            allowBlank: true,

                            showErrorMessage: true,

                            errorStyle: 'error',

                            errorTitle: 'Invalid Project',

                            error: 'Please select a project from the dropdown list.',

                            formulae: [`'Template Lists'!$A$2:$A$${uniqueProjectNames.length + 1}`]

                        };

                    }

                    if (projectTeamPairs.length > 0) {

                        worksheet.getCell(`G${i}`).dataValidation = {

                            type: 'list',

                            allowBlank: true,

                            showErrorMessage: true,

                            errorStyle: 'error',

                            errorTitle: 'Invalid Team',

                            error: 'Please select a team mapped to the selected project.',

                            formulae: [`OFFSET('Template Lists'!$D$2,MATCH($F${i},'Template Lists'!$C$2:$C$${projectTeamPairs.length + 1},0)-1,0,COUNTIF('Template Lists'!$C$2:$C$${projectTeamPairs.length + 1},$F${i}),1)`]

                        };

                    }

                }



                worksheet.getRow(1).font = { bold: true };



                const buffer = await workbook.xlsx.writeBuffer();

                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

                saveAs(blob, 'onboard_employee_bulk_import_template.xlsx');

                toast.dismiss(toastId);

                toast.success('Template downloaded');

            } catch (err) {

                console.error(err);

                toast.error('Failed to generate template');

            }

        } else if (isEmployees) {

            try {

                const toastId = toast.loading('Generating template...');

                let usersList: any[] = [];

                try {

                    const res = await adminUsersAPI.getAll();

                    usersList = Array.isArray(res) ? res : res.data || [];

                } catch (e) {

                    console.error('Error fetching users:', e);

                }



                const workbook = new ExcelJS.Workbook();

                const worksheet = workbook.addWorksheet('Employees');



                worksheet.columns = [

                    { header: 'eName', key: 'eName', width: 25 },

                    { header: 'Email', key: 'email', width: 30 },

                    { header: 'Password', key: 'password', width: 20 },

                    { header: 'Access Role', key: 'accessRole', width: 20 },

                    { header: 'Employee ID', key: 'employeeId', width: 20 }

                ];



                if (usersList && usersList.length > 0) {

                    usersList.forEach(u => {

                        let mappedRole = u.role;

                        if (u.role === 'PROJECT_MANAGER') mappedRole = 'Project Manager';

                        else if (u.role === 'TEAM_LEAD') mappedRole = 'Team Lead';

                        else if (u.role === 'TEAM') mappedRole = 'Team Member';

                        else if (u.role === 'ORG') mappedRole = 'Organization';

                        else if (u.role === 'MARKET') mappedRole = 'Market';

                        else if (u.role === 'ACCOUNT') mappedRole = 'Account';

                        else if (u.role === 'CTO') mappedRole = 'CTO';

                        else if (u.role === 'SUPERADMIN') mappedRole = 'SUPERADMIN';

                        else if (u.role === 'ADMIN') mappedRole = 'ADMIN';



                        worksheet.addRow({

                            eName: u.fullName || '',

                            email: u.email || '',

                            password: '',

                            accessRole: mappedRole,

                            employeeId: u.employeeId || ''

                        });

                    });

                } else {

                    worksheet.addRow({ eName: 'John Doe', email: 'john.doe@example.com', password: '', accessRole: 'CTO', employeeId: 'EMP-1001' });

                    worksheet.addRow({ eName: 'Alice Smith', email: 'alice.smith@example.com', password: '', accessRole: 'Team Lead', employeeId: 'EMP-1002' });

                    worksheet.addRow({ eName: 'Bob Johnson', email: 'bob.johnson@example.com', password: '', accessRole: 'Project Manager', employeeId: 'EMP-1003' });

                    worksheet.addRow({ eName: 'Charlie Brown', email: 'charlie.brown@example.com', password: '', accessRole: 'Account', employeeId: 'EMP-1004' });

                    worksheet.addRow({ eName: 'Diana Prince', email: 'diana.prince@example.com', password: '', accessRole: 'Market', employeeId: 'EMP-1005' });

                    worksheet.addRow({ eName: 'Evan Wright', email: 'evan.wright@example.com', password: '', accessRole: 'Organization', employeeId: 'EMP-1006' });

                    worksheet.addRow({ eName: 'Fiona Gallagher', email: 'fiona.gallagher@example.com', password: '', accessRole: 'Team Member', employeeId: 'EMP-1007' });

                    worksheet.addRow({ eName: 'System Admin', email: 'admin@example.com', password: '', accessRole: 'SUPERADMIN', employeeId: 'EMP-1008' });

                }



                // Add data validation

                for (let i = 2; i <= (usersList.length > 0 ? usersList.length + 500 : 500); i++) {

                    worksheet.getCell(`D${i}`).dataValidation = {

                        type: 'list',

                        allowBlank: true,

                        showErrorMessage: true,

                        errorStyle: 'error',

                        errorTitle: 'Invalid Role',

                        error: 'Please select a valid role from the dropdown list.',

                        formulae: ['"SUPERADMIN,ADMIN,CTO,Organization,Market,Account,Project Manager,Team Lead,Team Member"']

                    };

                }



                worksheet.getRow(1).font = { bold: true };



                const buffer = await workbook.xlsx.writeBuffer();

                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

                saveAs(blob, 'employee_bulk_import_template.xlsx');

                toast.dismiss(toastId);

                toast.success('Template downloaded');

            } catch (err) {

                console.error(err);

                toast.error('Failed to generate template');

            }

        } else {

            let headers = ['org', 'country', 'market', 'account', 'project', 'team', 'team_size', 'project_ai_enabled', 'project_ai_tool_licenses', 'project_ai_tools_used', 'sprint_number', 'sprint_name', 'throughput_points', 'quality_score', 'velocity_points', 'done_to_said_ratio', 'technical_debt_index', 'user_stories_delivered'];

            const sampleRow = ['Acme Corp', 'USA', 'US-Market', 'Aetna', 'Claims Mod', 'Alpha Team', '10', 'Yes', '12', 'Copilot', '1', 'Sprint-1', '45.5', '92.0', '50.0', '0.95', '12.5', '8'];

            let csvContent = [headers.join(','), sampleRow.join(',')].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');

            link.href = url;

            link.setAttribute('download', 'sprint_metrics_bulk_import_template.csv');

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

        }

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

            const api = (isEmployees || isOnboard) ? adminEmployeesAPI : adminSprintMetricsAPI;

            const res = await api.bulkUpload(file);

            setResult(res);



            const successCount = (isEmployees || isOnboard) ? (res.created + res.updated) : res.processed;

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

                        <FileSpreadsheet className={cn("h-5 w-5", type === 'onboard-employee' ? "text-emerald-500" : isEmployees ? "text-violet-500" : "text-amber-500")} />

                        {uploadCopy.title}

                    </DialogTitle>

                    <DialogDescription>

                        {uploadCopy.description} {type === 'onboard-employee' || isEmployees ? 'All columns will be mapped automatically.' : 'Teams and projects will be auto-provisioned if missing.'}

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

                            {(type === 'onboard-employee'

                                ? ['Employee ID', 'Name', 'Email', 'Onboarding Date', 'Role', 'Project', 'Team']

                                : isEmployees

                                    ? ['eName', 'Email', 'Password', 'Access Role', 'Employee ID']

                                    : ['team', 'sprint_number', 'throughput_points', 'quality_score', 'velocity_points', 'project_ai_enabled']

                            ).map(col => (

                                <span key={col} className={cn(

                                    "font-mono text-[10px] px-2 py-0.5 rounded-full border font-bold",

                                    type === 'onboard-employee'

                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"

                                        : isEmployees

                                            ? "bg-violet-500/10 text-violet-600 border-violet-500/20"

                                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"

                                )}>{col}</span>

                            ))}

                            {!isEmployees && <span className="text-[10px] text-muted-foreground italic px-1">+ all other metrics</span>}

                        </div>

                        {isEmployees && (

                            <div className="mt-3 pt-3 border-t border-border/20 space-y-1.5">

                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Access Role Values</p>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">

                                    <div className="flex justify-between border-b border-border/10 pb-0.5"><span className="text-muted-foreground">Chief Technology Officer</span> <span className="font-bold text-violet-600">CTO</span></div>

                                    <div className="flex justify-between border-b border-border/10 pb-0.5"><span className="text-muted-foreground">Organization</span> <span className="font-bold text-violet-600">ORG</span></div>

                                    <div className="flex justify-between border-b border-border/10 pb-0.5"><span className="text-muted-foreground">Market</span> <span className="font-bold text-violet-600">MARKET</span></div>

                                    <div className="flex justify-between border-b border-border/10 pb-0.5"><span className="text-muted-foreground">Account</span> <span className="font-bold text-violet-600">ACCOUNT</span></div>

                                    <div className="flex justify-between border-b border-border/10 pb-0.5"><span className="text-muted-foreground">Project Manager</span> <span className="font-bold text-violet-600">PROJECT_MANAGER</span></div>

                                    <div className="flex justify-between border-b border-border/10 pb-0.5"><span className="text-muted-foreground">Team Lead</span> <span className="font-bold text-violet-600">TEAM_LEAD</span></div>

                                    <div className="flex justify-between border-b border-border/10 pb-0.5"><span className="text-muted-foreground">Team Member</span> <span className="font-bold text-violet-600">TEAM</span></div>

                                </div>

                            </div>

                        )}

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

                                {type === 'onboard-employee' || isEmployees ? [

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

                                                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">{(isEmployees || isOnboard) ? 'Employee ID' : 'Team'}</th>

                                                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">{(isEmployees || isOnboard) ? 'Name' : 'Project'}</th>

                                                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">{(isEmployees || isOnboard) ? 'Role' : 'Sprint'}</th>

                                                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Status</th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {(isEmployees || isOnboard) ? result.rows.map((r: any) => (

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

