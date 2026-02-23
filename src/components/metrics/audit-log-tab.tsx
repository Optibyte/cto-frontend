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
import { METRIC_AUDIT_LOG, type MetricAuditEntry } from '@/lib/mock-data/metrics-data';

const sourceStyles: Record<string, string> = {
    Manual: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    'Jira Sync': 'bg-[#0052CC]/10 text-[#0052CC] dark:text-blue-300 border-[#0052CC]/30',
    'GitHub Sync': 'bg-[#24292e]/10 text-[#24292e] dark:text-gray-300 border-[#24292e]/30',
};

export function AuditLogTab() {
    const [searchQuery, setSearchQuery] = useState('');
    const [sourceFilter, setSourceFilter] = useState<string>('all');

    const filtered = METRIC_AUDIT_LOG.filter((entry) => {
        const matchesSearch =
            !searchQuery ||
            entry.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.metric.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.updatedBy.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSource =
            sourceFilter === 'all' || entry.source === sourceFilter;

        return matchesSearch && matchesSource;
    });

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by entity, metric, or user..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 rounded-xl"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                        <SelectTrigger className="w-[160px] rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sources</SelectItem>
                            <SelectItem value="Manual">Manual</SelectItem>
                            <SelectItem value="Jira Sync">Jira Sync</SelectItem>
                            <SelectItem value="GitHub Sync">GitHub Sync</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Badge variant="secondary" className="rounded-full text-xs ml-auto">
                    {filtered.length} entries
                </Badge>
            </div>

            {/* Log Table */}
            <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ScrollText className="h-5 w-5" />
                        Change Log
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/30">
                                    <th className="pb-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entity</th>
                                    <th className="pb-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Metric</th>
                                    <th className="pb-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Old Value</th>
                                    <th className="pb-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Value</th>
                                    <th className="pb-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Updated By</th>
                                    <th className="pb-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source</th>
                                    <th className="pb-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((entry) => (
                                    <tr
                                        key={entry.id}
                                        className="border-b border-border/20 last:border-0 hover:bg-accent/30 transition-colors"
                                    >
                                        <td className="py-3 text-sm font-semibold">{entry.entity}</td>
                                        <td className="py-3 text-sm">
                                            <Badge variant="outline" className="rounded-full text-[10px] px-2 border-primary/20 bg-primary/5 text-primary">
                                                {entry.metric}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-center">
                                            <span className="inline-flex items-center justify-center min-w-[40px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-mono font-semibold">
                                                {entry.oldValue}
                                            </span>
                                        </td>
                                        <td className="py-3 text-center">
                                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                →
                                            </span>
                                            <span className="inline-flex items-center justify-center min-w-[40px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold ml-1">
                                                {entry.newValue}
                                            </span>
                                        </td>
                                        <td className="py-3 text-sm text-muted-foreground">{entry.updatedBy}</td>
                                        <td className="py-3">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'rounded-full text-[10px] px-2 py-0.5',
                                                    sourceStyles[entry.source]
                                                )}
                                            >
                                                {entry.source}
                                            </Badge>
                                            {entry.syncBatchId && (
                                                <p className="text-[9px] text-muted-foreground mt-0.5 font-mono">
                                                    {entry.syncBatchId}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-3 text-right text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDateTime(entry.timestamp)}
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                                            No log entries found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
