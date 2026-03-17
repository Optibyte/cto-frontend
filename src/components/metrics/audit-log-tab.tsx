'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ScrollText, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/utils';
import { useAuditLogs } from '@/hooks/use-audit';

const sourceStyles: Record<string, string> = {
    CREATE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold',
    UPDATE: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-bold',
    DELETE: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 font-bold',
    EXPORT: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold',
};

export function AuditLogTab() {
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');
    
    // Fetch live logs
    const { data: logs = [], isLoading } = useAuditLogs(100);

    const filtered = (Array.isArray(logs) ? logs : []).filter((entry: any) => {
        const matchesSearch =
            !searchQuery ||
            entry.entityType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesAction =
            actionFilter === 'all' || entry.action === actionFilter;

        return matchesSearch && matchesAction;
    });

    const formatValue = (val: any) => {
        if (val === null || val === undefined) return '-';
        if (typeof val === 'object') return JSON.stringify(val).substring(0, 30) + '...';
        return String(val);
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by entity, action, or user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 rounded-xl"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                        <SelectTrigger className="w-[160px] rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Actions</SelectItem>
                            <SelectItem value="CREATE">CREATE</SelectItem>
                            <SelectItem value="UPDATE">UPDATE</SelectItem>
                            <SelectItem value="DELETE">DELETE</SelectItem>
                            <SelectItem value="EXPORT">EXPORT</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Badge variant="secondary" className="rounded-full text-xs ml-auto">
                    {filtered.length} live entries
                </Badge>
            </div>

            {/* Log Table */}
            <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ScrollText className="h-5 w-5" />
                        System Audit Logs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto min-h-[300px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                                <span className="ml-3 text-muted-foreground">Loading audit logs...</span>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/30">
                                        <th className="pb-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entity</th>
                                        <th className="pb-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                                        <th className="pb-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Old Value</th>
                                        <th className="pb-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Value</th>
                                        <th className="pb-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Performed By</th>
                                        <th className="pb-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((entry: any) => (
                                        <tr
                                            key={entry.id}
                                            className="border-b border-border/20 last:border-0 hover:bg-accent/30 transition-colors"
                                        >
                                            <td className="py-3 text-sm font-semibold">
                                                <div className="flex flex-col">
                                                    <span>{entry.entityType}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono opacity-50">{entry.entityId}</span>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'rounded-full text-[10px] px-2 py-0.5',
                                                        sourceStyles[entry.action]
                                                    )}
                                                >
                                                    {entry.action}
                                                </Badge>
                                            </td>
                                            <td className="py-3 text-center max-w-[120px]">
                                                <div className="truncate text-xs px-2 py-1 rounded bg-muted/50 font-mono opacity-60">
                                                    {formatValue(entry.oldValue)}
                                                </div>
                                            </td>
                                            <td className="py-3 text-center max-w-[120px]">
                                                <div className="truncate text-xs px-2 py-1 rounded bg-primary/5 text-primary font-mono font-bold border border-primary/10">
                                                    {formatValue(entry.newValue)}
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    {entry.user?.avatarUrl && (
                                                        <img src={entry.user.avatarUrl} className="h-5 w-5 rounded-full" />
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{entry.user?.fullName || 'System'}</span>
                                                        <span className="text-[10px] text-muted-foreground">{entry.user?.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-right text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDateTime(entry.timestamp)}
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground italic">
                                                No log entries found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
