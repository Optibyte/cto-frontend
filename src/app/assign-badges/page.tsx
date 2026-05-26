'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    Award, 
    Search, 
    RefreshCcw, 
    X,
    ChevronLeft, 
    ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminUsersAPI } from '@/lib/api/admin';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRole } from '@/contexts/role-context';
import { getBadgeStyles } from '@/lib/badges';

const PAGE_SIZE = 10;

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

export default function AssignBadgesPage() {
    const { role } = useRole();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchUsers = useCallback(async (page: number, searchQuery?: string) => {
        setLoading(true);
        try {
            const result = await adminUsersAPI.getAll(page, PAGE_SIZE, searchQuery);
            if (result && result.data) {
                setUsers(result.data);
                setTotalItems(result.total || result.data.length);
            } else {
                const arr = Array.isArray(result) ? result : [];
                setUsers(arr);
                setTotalItems(arr.length);
            }
        } catch (err: any) {
            toast.error(`Failed to load users: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchUsers(1, search.trim() || undefined);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, fetchUsers]);

    const handleAssignBadge = async (userId: string, userFullName: string, badgeName: string, currentBadgeStr: string) => {
        try {
            const badgeList = currentBadgeStr ? currentBadgeStr.split(',').map((x: string) => x.trim()).filter((x: string) => x && x !== 'none') : [];
            let nextBadges: string[];
            if (badgeName === 'none') {
                nextBadges = [];
            } else {
                if (badgeList.includes(badgeName)) {
                    // Toggle off (remove)
                    nextBadges = badgeList.filter((x: string) => x !== badgeName);
                } else {
                    // Toggle on (add)
                    nextBadges = [...badgeList, badgeName];
                }
            }
            const finalVal = nextBadges.join(', ');
            await adminUsersAPI.update(userId, { badge: finalVal || 'none' });
            toast.success(`Updated badges for ${userFullName}`);
            fetchUsers(currentPage, search.trim() || undefined);
        } catch (err: any) {
            toast.error(`Badge assignment failed: ${err.message}`);
        }
    };

    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

    return (
        <div className="space-y-6 fade-in p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Assign Badges Manually</h1>
                    <p className="text-muted-foreground">
                        Select and assign industry-recognized certification badges directly to team members
                    </p>
                </div>
                <Button
                    onClick={() => fetchUsers(currentPage, search.trim() || undefined)}
                    disabled={loading}
                    variant="outline"
                    className="rounded-xl gap-2"
                >
                    <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            <Card className="border-border/50 shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardHeader className="border-b border-border/50 bg-muted/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl shadow-inner">
                                <Award className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Team Certifications</CardTitle>
                                <CardDescription>Manage user badges and skill credentials</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 rounded-xl border-border/50 bg-background/50 focus:bg-background transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border/50">
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">System Role</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Current Badge</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Assign Badge</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse border-b border-border/5">
                                            <td className="py-6 px-6"><div className="h-5 w-32 bg-muted rounded-lg" /></td>
                                            <td className="py-6 px-6"><div className="h-5 w-48 bg-muted rounded-lg" /></td>
                                            <td className="py-6 px-6"><div className="h-5 w-16 bg-muted rounded-lg" /></td>
                                            <td className="py-6 px-6"><div className="h-5 w-24 bg-muted rounded-lg" /></td>
                                            <td className="py-6 px-6"><div className="h-5 w-64 bg-muted rounded-lg" /></td>
                                        </tr>
                                    ))
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <p className="font-semibold text-lg text-foreground/80">No team members found</p>
                                            <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="border-b border-border/5 hover:bg-muted/30 transition-colors group">
                                            <td className="py-5 px-6 font-semibold text-sm">{user.fullName}</td>
                                            <td className="py-5 px-6 text-sm text-muted-foreground">{user.email}</td>
                                            <td className="py-5 px-6">
                                                <Badge className={cn('rounded-full text-[10px] px-2', {
                                                    'bg-violet-500/10 text-violet-500 border-violet-500/20': user.role === 'ORG',
                                                    'bg-blue-500/10 text-blue-500 border-blue-500/20': user.role === 'MARKET',
                                                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20': user.role === 'ACCOUNT',
                                                    'bg-amber-500/10 text-amber-500 border-amber-500/20': user.role === 'PROJECT_MANAGER',
                                                    'bg-indigo-500/10 text-indigo-500 border-indigo-500/20': user.role === 'PROJECT',
                                                    'bg-cyan-500/10 text-cyan-500 border-cyan-500/20': user.role === 'TEAM_LEAD',
                                                    'bg-slate-500/10 text-slate-500 border-slate-500/20': user.role === 'TEAM',
                                                })} variant="outline">{user.role}</Badge>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                                    {user.badge && user.badge !== 'none' ? (
                                                        user.badge.split(',').map((badgeName: string) => {
                                                            const trimmed = badgeName.trim();
                                                            if (!trimmed || trimmed === 'none') return null;
                                                            const badgeStyle = getBadgeStyles(trimmed);
                                                            return (
                                                                <span key={trimmed} className={cn(
                                                                    "inline-flex items-center gap-1 border px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm",
                                                                    badgeStyle.bg,
                                                                    badgeStyle.glow
                                                                )}>
                                                                    <badgeStyle.icon className="h-2.5 w-2.5 animate-pulse" />
                                                                    {badgeStyle.label}
                                                                </span>
                                                            );
                                                        })
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">None</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex flex-wrap gap-1.5 max-w-[520px]">
                                                    {AVAILABLE_BADGES.map((b) => {
                                                        const badgeList = user.badge ? user.badge.split(',').map((x: string) => x.trim()).filter((x: string) => x && x !== 'none') : [];
                                                        const isCurrent = b.name === 'none' 
                                                            ? (badgeList.length === 0)
                                                            : badgeList.includes(b.name);
                                                        const badgeStyle = b.name === 'none' ? null : getBadgeStyles(b.name);
                                                        return (
                                                            <button
                                                                key={b.name}
                                                                onClick={() => handleAssignBadge(user.id, user.fullName, b.name, user.badge)}
                                                                className={cn(
                                                                    "inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-full text-[9px] font-bold uppercase transition-all duration-200 hover:scale-105 shadow-sm",
                                                                    isCurrent 
                                                                        ? (b.name === 'none' ? "bg-muted text-muted-foreground border-muted-foreground/30 font-black" : `${badgeStyle?.bg} ${badgeStyle?.glow} border-primary/50 font-black`)
                                                                        : "bg-background text-muted-foreground border-border/85 hover:text-foreground hover:bg-muted"
                                                                )}
                                                                title={b.name === 'none' ? "Clear Badges" : `Toggle ${b.name}`}
                                                            >
                                                                {badgeStyle ? <badgeStyle.icon className="h-2.5 w-2.5 animate-pulse" /> : <X className="h-2.5 w-2.5" />}
                                                                {b.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-muted/20">
                            <span className="text-xs text-muted-foreground">
                                Showing page {currentPage} of {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const prev = Math.max(1, currentPage - 1);
                                        setCurrentPage(prev);
                                        fetchUsers(prev, search.trim() || undefined);
                                    }}
                                    disabled={currentPage === 1 || loading}
                                    className="rounded-xl h-8 w-8 p-0"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const next = Math.min(totalPages, currentPage + 1);
                                        setCurrentPage(next);
                                        fetchUsers(next, search.trim() || undefined);
                                    }}
                                    disabled={currentPage === totalPages || loading}
                                    className="rounded-xl h-8 w-8 p-0"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
