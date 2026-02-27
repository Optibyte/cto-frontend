'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    FileSearch,
    Clock,
    PlusCircle,
    Pencil,
    Trash2,
    User,
    RefreshCcw,
    Search,
    Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auditAPI } from '@/lib/api/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useRole } from '@/contexts/role-context';

export default function AuditPage() {
    const { user: currentUser } = useRole();
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const { data } = await auditAPI.getAll(100);
            setLogs(data || []);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch audit logs');
        } finally {
            setIsLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        switch (action.toUpperCase()) {
            case 'CREATE': return <PlusCircle className="h-4 w-4 text-emerald-500" />;
            case 'UPDATE': return <Pencil className="h-4 w-4 text-amber-500" />;
            case 'DELETE': return <Trash2 className="h-4 w-4 text-rose-500" />;
            default: return <RefreshCcw className="h-4 w-4 text-primary" />;
        }
    };

    const getActionBadgeStyle = (action: string) => {
        switch (action.toUpperCase()) {
            case 'CREATE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'UPDATE': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'DELETE': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            default: return 'bg-primary/10 text-primary border-primary/20';
        }
    };

    const filteredLogs = logs.filter(log =>
        log.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.user?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 fade-in p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground">
                        Track all system activities, creations, updates and deletions
                    </p>
                </div>
                <Button
                    onClick={fetchLogs}
                    disabled={isLoading}
                    variant="outline"
                    className="rounded-xl gap-2"
                >
                    <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <Card className="border-border/50 shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardHeader className="border-b border-border/50 bg-muted/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl shadow-inner">
                                <FileSearch className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">System Activity</CardTitle>
                                <CardDescription>Comprehensive history of user actions</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden lg:flex flex-col items-end px-4 border-r border-border/50">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Active Performer</span>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-mono text-primary font-bold bg-primary/5 px-2 py-0.5 rounded border border-primary/20">
                                        ID: {currentUser?.user?.id || logs[0]?.userId || 'Tracking Ready'}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground mt-1 font-medium">
                                        {currentUser?.user?.email || 'Guest User'}
                                    </span>
                                </div>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search activity..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
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
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Action</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Entity</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Performed By</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Details</th>
                                    <th className="py-4 px-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse border-b border-border/5">
                                            <td className="py-6 px-6"><div className="h-6 w-24 bg-muted rounded-lg" /></td>
                                            <td className="py-6 px-6"><div className="h-6 w-20 bg-muted rounded-lg" /></td>
                                            <td className="py-6 px-6"><div className="h-6 w-32 bg-muted rounded-lg" /></td>
                                            <td className="py-6 px-6"><div className="h-6 w-40 bg-muted rounded-lg" /></td>
                                            <td className="py-6 px-6"><div className="h-6 w-28 bg-muted rounded-lg ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 bg-muted/20 rounded-full">
                                                    <Clock className="h-10 w-10 text-muted-foreground/50" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-lg text-foreground/80">No activities found</p>
                                                    <p className="text-sm text-muted-foreground">Try adjusting your search or perform some actions</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="border-b border-border/5 hover:bg-muted/30 transition-colors group">
                                            <td className="py-5 px-6">
                                                <Badge variant="outline" className={`rounded-lg py-1 px-2.5 gap-1.5 font-bold uppercase tracking-tight text-[10px] ${getActionBadgeStyle(log.action)}`}>
                                                    {getActionIcon(log.action)}
                                                    {log.action}
                                                </Badge>
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className="font-bold text-sm bg-muted/50 px-2 py-1 rounded-md text-foreground/80">
                                                    {log.entityType}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold">{log.user?.fullName || 'System User'}</span>
                                                        <span className="text-[11px] text-muted-foreground">{log.user?.email || 'system@internal.ai'}</span>
                                                        {log.userId && (
                                                            <span className="text-[10px] text-primary/70 font-mono mt-0.5 bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10 w-fit">
                                                                ID: {log.userId}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <p className="text-sm text-muted-foreground font-medium truncate max-w-[200px]">
                                                    {log.action === 'CREATE' ? 'Successfully created' : 'Modified entity records'} ID: {log.entityId.substring(0, 8)}...
                                                </p>
                                            </td>
                                            <td className="py-5 px-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-bold text-foreground/80">
                                                        {format(new Date(log.timestamp), 'MMM dd, yyyy')}
                                                    </span>
                                                    <span className="text-[11px] font-medium text-muted-foreground">
                                                        {format(new Date(log.timestamp), 'hh:mm:ss a')}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
