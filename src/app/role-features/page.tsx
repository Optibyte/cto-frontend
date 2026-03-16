'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    Shield, ShieldCheck, ShieldX, Check, ChevronRight, Search,
    BarChart3, FolderKanban, Users, UserPlus, Settings2, Plus, Trash2,
    Save, RotateCcw, Lock, Unlock, CheckSquare, Square, Info,
    Activity, LayoutDashboard, FileText, Puzzle, Upload, FileSearch,
    Bell, Layers, Star, Zap, Globe, Database, Key, Eye, Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useRole } from '@/contexts/role-context';
import { cn } from '@/lib/utils';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// ─── Types ───────────────────────────────────────────────────────────────────
type RoleKey = 'ORG' | 'MARKET' | 'ACCOUNT' | 'PROJECT_MANAGER' | 'PROJECT' | 'TEAM_LEAD' | 'TEAM' | 'MEMBER' | 'CTO';

interface FeatureItem {
    id: string;
    label: string;
    description: string;
    icon: React.ElementType;
    category: string;
    isCustom?: boolean;
}

interface FeatureCategory {
    id: string;
    label: string;
    icon: React.ElementType;
    color: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const ROLES: { key: RoleKey; label: string; description: string; color: string; icon: React.ElementType }[] = [
    { key: 'CTO', label: 'CTO', description: 'Chief Technology Officer', color: 'from-violet-500 to-purple-600', icon: Star },
    { key: 'ORG', label: 'Organization', description: 'Org-level admin access', color: 'from-blue-500 to-indigo-600', icon: Globe },
    { key: 'MARKET', label: 'Market', description: 'Market-level manager', color: 'from-cyan-500 to-blue-500', icon: BarChart3 },
    { key: 'ACCOUNT', label: 'Account', description: 'Account-level manager', color: 'from-teal-500 to-cyan-500', icon: Database },
    { key: 'PROJECT_MANAGER', label: 'Project Manager', description: 'Manages specific projects', color: 'from-emerald-500 to-teal-500', icon: FolderKanban },
    { key: 'PROJECT', label: 'Project Access', description: 'Project-level access', color: 'from-amber-500 to-orange-500', icon: Layers },
    { key: 'TEAM_LEAD', label: 'Team Lead', description: 'Leads one or more teams', color: 'from-orange-500 to-red-500', icon: Users },
    { key: 'TEAM', label: 'Team Member', description: 'General team member', color: 'from-rose-500 to-pink-500', icon: UserPlus },
    { key: 'MEMBER', label: 'Member', description: 'Basic member access', color: 'from-pink-500 to-fuchsia-500', icon: Key },
];

const FEATURE_CATEGORIES: FeatureCategory[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
    { id: 'metrics', label: 'Metrics', icon: BarChart3, color: 'text-violet-500' },
    { id: 'projects', label: 'Projects', icon: FolderKanban, color: 'text-emerald-500' },
    { id: 'teams', label: 'Teams', icon: Users, color: 'text-orange-500' },
    { id: 'reports', label: 'Reports', icon: FileText, color: 'text-cyan-500' },
    { id: 'admin', label: 'Admin', icon: Settings2, color: 'text-red-500' },
];

const DEFAULT_FEATURES: FeatureItem[] = [
    // Dashboard
    { id: 'dashboard.view', label: 'View Dashboard', description: 'Access the main dashboard overview', icon: LayoutDashboard, category: 'dashboard' },

    // Metrics
    { id: 'metrics.view', label: 'View Metrics', description: 'View all metric definitions and values', icon: Eye, category: 'metrics' },
    { id: 'metrics.create', label: 'Create Metrics', description: 'Define and create new metric definitions', icon: Plus, category: 'metrics' },
    { id: 'metrics.edit', label: 'Edit Metrics', description: 'Modify existing metric definitions', icon: Edit3, category: 'metrics' },
    { id: 'metrics.github', label: 'GitHub Metrics', description: 'Access GitHub-linked metric data', icon: Activity, category: 'metrics' },

    // Projects
    { id: 'projects.view', label: 'View Projects', description: 'Browse the project list and details', icon: Eye, category: 'projects' },
    { id: 'projects.create', label: 'Create Project', description: 'Create new projects in the system', icon: Plus, category: 'projects' },
    { id: 'projects.edit', label: 'Edit Project', description: 'Modify existing project details', icon: Edit3, category: 'projects' },
    { id: 'projects.drilldown', label: 'Project Drilldown', description: 'Deep-dive analytics for projects', icon: Layers, category: 'projects' },

    // Teams
    { id: 'teams.view', label: 'View Teams', description: 'Browse teams and their members', icon: Eye, category: 'teams' },
    { id: 'teams.create', label: 'Create Team', description: 'Create new teams in the system', icon: Plus, category: 'teams' },
    { id: 'teams.add_member', label: 'Add Team Member', description: 'Add members to existing teams', icon: UserPlus, category: 'teams' },
    { id: 'teams.manage', label: 'Manage Teams', description: 'Edit and administer team settings', icon: Settings2, category: 'teams' },

    // Reports
    { id: 'reports.view', label: 'View Reports', description: 'Access generated reports', icon: Eye, category: 'reports' },
    { id: 'reports.export', label: 'Export Reports', description: 'Export reports to PDF / CSV', icon: Upload, category: 'reports' },

    // Admin
    { id: 'admin.access_control', label: 'Access Control', description: 'Manage employee access and roles', icon: Shield, category: 'admin' },
    { id: 'admin.audit_logs', label: 'Audit Logs', description: 'View system audit trail', icon: FileSearch, category: 'admin' },
    { id: 'admin.integrations', label: 'Integrations', description: 'Configure third-party integrations', icon: Puzzle, category: 'admin' },
    { id: 'admin.import', label: 'Data Import', description: 'Import data via CSV / API', icon: Upload, category: 'admin' },
    { id: 'admin.console', label: 'Admin Console', description: 'Full system administration panel', icon: Settings2, category: 'admin' },
    { id: 'admin.role_features', label: 'Role Feature Config', description: 'Configure this role-feature permissions page', icon: ShieldCheck, category: 'admin' },
];

const DEFAULT_ROLE_PERMISSIONS: Record<RoleKey, string[]> = {
    CTO: DEFAULT_FEATURES.map(f => f.id),
    ORG: DEFAULT_FEATURES.map(f => f.id),
    MARKET: ['dashboard.view', 'metrics.view'],
    ACCOUNT: ['dashboard.view', 'metrics.view'],
    PROJECT_MANAGER: ['dashboard.view', 'metrics.view'],
    PROJECT: ['dashboard.view', 'metrics.view'],
    TEAM_LEAD: ['dashboard.view', 'metrics.view'],
    TEAM: ['dashboard.view', 'metrics.view'],
    MEMBER: ['dashboard.view', 'metrics.view'],
};

const STORAGE_KEY = 'role_feature_permissions';

// ─── Component ────────────────────────────────────────────────────────────────
export default function RoleFeaturesPage() {
    const [selectedRole, setSelectedRole] = useState<RoleKey>('ORG');
    const [roleSearch, setRoleSearch] = useState('');
    const [featureSearch, setFeatureSearch] = useState('');
    const [permissions, setPermissions] = useState<Record<RoleKey, string[]>>(DEFAULT_ROLE_PERMISSIONS);
    const [savedPermissions, setSavedPermissions] = useState<Record<RoleKey, string[]>>(DEFAULT_ROLE_PERMISSIONS);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const { role } = useRole();
    const router = useRouter();

    // Security check: Only ORG and CTO can access this page
    useEffect(() => {
        if (role !== 'ORG' && role !== 'CTO') {
            toast.error('Access Denied', {
                description: 'You do not have permission to access the Role Configuration page.'
            });
            router.push('/');
        }
    }, [role, router]);

    // Load from localStorage
    useEffect(() => {
        if (role !== 'ORG' && role !== 'CTO') return;
        
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setPermissions(parsed);
                setSavedPermissions(parsed);
            } catch { /* ignore */ }
        }
    }, [role]);

    if (role !== 'ORG' && role !== 'CTO') {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium">Verifying authorization...</p>
                </div>
            </div>
        );
    }


    const allFeatures = DEFAULT_FEATURES;

    const filteredRoles = useMemo(() =>
        ROLES.filter(r => r.label.toLowerCase().includes(roleSearch.toLowerCase()) ||
            r.description.toLowerCase().includes(roleSearch.toLowerCase())),
        [roleSearch]);

    const filteredFeatures = useMemo(() => {
        let items = allFeatures;
        if (selectedCategory !== 'all') items = items.filter(f => f.category === selectedCategory);
        if (featureSearch) items = items.filter(f =>
            f.label.toLowerCase().includes(featureSearch.toLowerCase()) ||
            f.description.toLowerCase().includes(featureSearch.toLowerCase()));
        return items;
    }, [allFeatures, selectedCategory, featureSearch]);

    const currentPermissions = permissions[selectedRole] ?? [];

    const isGranted = (featureId: string) => currentPermissions.includes(featureId);

    const toggleFeature = (featureId: string) => {
        setPermissions(prev => {
            const current = prev[selectedRole] ?? [];
            const updated = current.includes(featureId)
                ? current.filter(f => f !== featureId)
                : [...current, featureId];
            return { ...prev, [selectedRole]: updated };
        });
        setHasChanges(true);
    };

    const toggleCategoryAll = (categoryId: string) => {
        const categoryFeatures = allFeatures.filter(f => f.category === categoryId).map(f => f.id);
        const allGranted = categoryFeatures.every(id => currentPermissions.includes(id));
        setPermissions(prev => {
            const current = prev[selectedRole] ?? [];
            const updated = allGranted
                ? current.filter(id => !categoryFeatures.includes(id))
                : [...new Set([...current, ...categoryFeatures])];
            return { ...prev, [selectedRole]: updated };
        });
        setHasChanges(true);
    };

    const grantAll = () => {
        setPermissions(prev => ({ ...prev, [selectedRole]: allFeatures.map(f => f.id) }));
        setHasChanges(true);
    };

    const revokeAll = () => {
        setPermissions(prev => ({ ...prev, [selectedRole]: [] }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 600));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(permissions));
        setSavedPermissions({ ...permissions });
        setHasChanges(false);
        setIsSaving(false);
        toast.success('Role permissions saved successfully!', {
            description: `Updated access matrix for all ${ROLES.length} roles.`,
        });
    };

    const handleReset = () => {
        setPermissions({ ...savedPermissions });
        setHasChanges(false);
        toast.info('Changes reverted to last saved state.');
    };

    const handleResetToDefaults = () => {
        setPermissions({ ...DEFAULT_ROLE_PERMISSIONS });
        setHasChanges(true);
        toast.info('Permissions reset to system defaults. Save to apply.');
    };

    const selectedRoleInfo = ROLES.find(r => r.key === selectedRole)!;
    const grantedCount = currentPermissions.length;
    const totalCount = allFeatures.length;
    const coveragePercent = Math.round((grantedCount / totalCount) * 100);

    // Group features by category for display
    const featuresByCategory = useMemo(() => {
        const cats = selectedCategory === 'all' ? FEATURE_CATEGORIES : FEATURE_CATEGORIES.filter(c => c.id === selectedCategory);
        return cats.map(cat => ({
            ...cat,
            features: filteredFeatures.filter(f => f.category === cat.id),
        })).filter(c => c.features.length > 0);
    }, [filteredFeatures, selectedCategory]);

    return (
        <div className="min-h-screen bg-background">
            {/* ── Page Header ── */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/30 px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Role Feature Access</h1>
                            <p className="text-xs text-muted-foreground">Configure which features each role can access</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasChanges && (
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 rounded-xl animate-pulse">
                                Unsaved Changes
                            </Badge>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            disabled={!hasChanges}
                            className="rounded-xl h-9 gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <RotateCcw className="h-3.5 w-3.5" /> Revert
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={!hasChanges || isSaving}
                            className="rounded-xl h-9 gap-2 bg-primary shadow-md shadow-primary/20 font-semibold"
                        >
                            {isSaving ? (
                                <span className="flex items-center gap-1.5">
                                    <span className="h-3.5 w-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Saving…
                                </span>
                            ) : (
                                <><Save className="h-3.5 w-3.5" /> Save Changes</>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex h-[calc(100vh-73px)]">
                {/* ── Left: Role Sidebar ── */}
                <aside className="w-72 border-r border-border/30 bg-card/60 flex flex-col flex-shrink-0 overflow-hidden">
                    <div className="p-4 border-b border-border/20">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search roles…"
                                value={roleSearch}
                                onChange={e => setRoleSearch(e.target.value)}
                                className="pl-8 h-9 rounded-xl text-sm bg-muted/30 border-border/30 focus-visible:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-1">
                        {filteredRoles.map(role => {
                            const perms = permissions[role.key] ?? [];
                            const pct = Math.round((perms.length / totalCount) * 100);
                            const isSelected = selectedRole === role.key;

                            return (
                                <button
                                    key={role.key}
                                    onClick={() => setSelectedRole(role.key)}
                                    className={cn(
                                        'w-full text-left p-3 rounded-2xl transition-all duration-200 group border',
                                        isSelected
                                            ? 'bg-primary/10 border-primary/30 shadow-sm'
                                            : 'border-transparent hover:bg-muted/50 hover:border-border/30'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            'h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0',
                                            `bg-gradient-to-br ${role.color}`
                                        )}>
                                            <role.icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className={cn('text-sm font-semibold truncate', isSelected ? 'text-primary' : 'text-foreground')}>
                                                    {role.label}
                                                </p>
                                                <span className={cn('text-[10px] font-bold ml-1', pct === 100 ? 'text-emerald-500' : pct === 0 ? 'text-rose-500' : 'text-muted-foreground')}>
                                                    {pct}%
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground truncate">{role.description}</p>
                                            {/* Mini progress bar */}
                                            <div className="mt-1.5 h-1 w-full bg-muted/50 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        'h-full rounded-full transition-all duration-500',
                                                        pct === 100 ? 'bg-emerald-500' : pct === 0 ? 'bg-rose-400/50' : 'bg-primary/60'
                                                    )}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                        {isSelected && <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Reset to defaults */}
                    <div className="p-3 border-t border-border/20">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResetToDefaults}
                            className="w-full rounded-xl h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                        >
                            <RotateCcw className="h-3 w-3" /> Reset All to Defaults
                        </Button>
                    </div>
                </aside>

                {/* ── Right: Feature Matrix ── */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Role Stats Bar */}
                    <div className={cn(
                        'px-6 py-4 border-b border-border/20 bg-gradient-to-r to-transparent',
                        `from-${selectedRoleInfo.color.split(' ')[0].replace('from-', '')}/5`
                    )}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    'h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg',
                                    `bg-gradient-to-br ${selectedRoleInfo.color}`
                                )}>
                                    <selectedRoleInfo.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">{selectedRoleInfo.label}</h2>
                                    <p className="text-sm text-muted-foreground">{selectedRoleInfo.description}</p>
                                </div>
                                <div className="ml-4 px-4 py-2 rounded-2xl bg-muted/40 border border-border/30 text-center">
                                    <p className="text-2xl font-black leading-none">{coveragePercent}<span className="text-sm font-medium text-muted-foreground">%</span></p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">{grantedCount}/{totalCount} granted</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={revokeAll}
                                    className="rounded-xl h-9 gap-1.5 border-rose-500/20 text-rose-600 hover:bg-rose-500/10"
                                >
                                    <Lock className="h-3.5 w-3.5" /> Revoke All
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={grantAll}
                                    className="rounded-xl h-9 gap-1.5 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10"
                                >
                                    <Unlock className="h-3.5 w-3.5" /> Grant All
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Search + Category Filter */}
                    <div className="px-6 py-3 border-b border-border/20 flex items-center gap-3 bg-muted/10">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search features…"
                                value={featureSearch}
                                onChange={e => setFeatureSearch(e.target.value)}
                                className="pl-8 h-9 rounded-xl text-sm bg-background border-border/30 focus-visible:ring-primary/20"
                            />
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={cn(
                                    'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border',
                                    selectedCategory === 'all'
                                        ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                                        : 'border-border/30 text-muted-foreground hover:bg-muted/50'
                                )}
                            >
                                All
                            </button>
                            {FEATURE_CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1',
                                        selectedCategory === cat.id
                                            ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                                            : 'border-border/30 text-muted-foreground hover:bg-muted/50'
                                    )}
                                >
                                    <cat.icon className="h-3 w-3" />
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feature Checkboxes */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {featuresByCategory.map(cat => {
                            const catFeatures = cat.features;
                            const allChecked = catFeatures.every(f => currentPermissions.includes(f.id));
                            const someChecked = catFeatures.some(f => currentPermissions.includes(f.id));

                            return (
                                <div key={cat.id} className="space-y-3">
                                    {/* Category Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <cat.icon className={cn('h-4 w-4', cat.color)} />
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                                {cat.label}
                                            </h3>
                                            <Badge variant="outline" className="rounded-lg text-[10px] px-1.5 py-0 border-border/30">
                                                {catFeatures.filter(f => currentPermissions.includes(f.id)).length}/{catFeatures.length}
                                            </Badge>
                                        </div>
                                        {/* Category toggle checkbox */}
                                        <button
                                            onClick={() => toggleCategoryAll(cat.id)}
                                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {allChecked ? (
                                                <CheckSquare className={cn('h-4 w-4', cat.color)} />
                                            ) : someChecked ? (
                                                <div className="h-4 w-4 rounded border-2 border-current flex items-center justify-center">
                                                    <div className="h-1.5 w-2 bg-current rounded-sm" />
                                                </div>
                                            ) : (
                                                <Square className="h-4 w-4" />
                                            )}
                                            {allChecked ? 'Deselect all' : 'Select all'}
                                        </button>
                                    </div>

                                    {/* Feature Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                                        {catFeatures.map(feature => {
                                            const granted = currentPermissions.includes(feature.id);
                                            return (
                                                <button
                                                    key={feature.id}
                                                    onClick={() => toggleFeature(feature.id)}
                                                    className={cn(
                                                        'relative flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all duration-150 group',
                                                        granted
                                                            ? 'bg-primary/5 border-primary/20 shadow-sm'
                                                            : 'border-border/30 hover:border-border/60 hover:bg-muted/30'
                                                    )}
                                                >
                                                    {/* Checkbox */}
                                                    <div className={cn(
                                                        'mt-0.5 h-4.5 w-4.5 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all',
                                                        granted
                                                            ? 'bg-primary border-primary'
                                                            : 'border-border/50 group-hover:border-primary/50'
                                                    )}>
                                                        {granted && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                                                    </div>

                                                    {/* Icon */}
                                                    <div className={cn(
                                                        'h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0',
                                                        granted ? `bg-primary/10 ${cat.color}` : 'bg-muted/50 text-muted-foreground'
                                                    )}>
                                                        <feature.icon className="h-3.5 w-3.5" />
                                                    </div>

                                                    {/* Text */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <p className={cn('text-sm font-semibold leading-tight', granted ? 'text-foreground' : 'text-muted-foreground/80')}>
                                                                {feature.label}
                                                            </p>
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                                                            {feature.description}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {featuresByCategory.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
                                <Search className="h-10 w-10 opacity-20" />
                                <p className="font-medium">No features match your search</p>
                                <p className="text-sm">Try a different filter or search term</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
