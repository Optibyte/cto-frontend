'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Save, Pencil, X, TrendingUp, Zap, CheckCircle2, ArrowLeftRight, AlertTriangle, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { sprintMetricsAPI } from '@/lib/api/client';

interface SprintMetricCol {
    key: string;
    label: string;
    unit: string;
    icon: React.ReactNode;
    bgClass: string;
    valueClass: string;
    badgeClass: string;
    min: number;
    max: number;
    step: number;
}

const SPRINT_COLS: SprintMetricCol[] = [
    {
        key: 'throughputPoints',
        label: 'Throughput',
        unit: 'pts',
        icon: <TrendingUp className="h-4 w-4" />,
        bgClass: 'bg-violet-500/10 border-violet-500/30',
        valueClass: 'text-violet-500',
        badgeClass: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
        min: 0, max: 200, step: 0.1,
    },
    {
        key: 'velocityPoints',
        label: 'Velocity',
        unit: 'pts',
        icon: <Zap className="h-4 w-4" />,
        bgClass: 'bg-blue-500/10 border-blue-500/30',
        valueClass: 'text-blue-500',
        badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
        min: 0, max: 200, step: 0.1,
    },
    {
        key: 'qualityScore',
        label: 'Quality Score',
        unit: '%',
        icon: <CheckCircle2 className="h-4 w-4" />,
        bgClass: 'bg-emerald-500/10 border-emerald-500/30',
        valueClass: 'text-emerald-500',
        badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        min: 0, max: 100, step: 0.1,
    },
    {
        key: 'doneToSaidRatio',
        label: 'Done / Said',
        unit: 'x',
        icon: <ArrowLeftRight className="h-4 w-4" />,
        bgClass: 'bg-amber-500/10 border-amber-500/30',
        valueClass: 'text-amber-500',
        badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        min: 0, max: 5, step: 0.01,
    },
    {
        key: 'technicalDebtIndex',
        label: 'Tech Debt Index',
        unit: 'idx',
        icon: <AlertTriangle className="h-4 w-4" />,
        bgClass: 'bg-rose-500/10 border-rose-500/30',
        valueClass: 'text-rose-500',
        badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
        min: 0, max: 100, step: 0.1,
    },
    {
        key: 'userStoriesDelivered',
        label: 'Stories Delivered',
        unit: 'qty',
        icon: <BookOpen className="h-4 w-4" />,
        bgClass: 'bg-cyan-500/10 border-cyan-500/30',
        valueClass: 'text-cyan-500',
        badgeClass: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
        min: 0, max: 500, step: 1,
    },
];

interface Props {
    memberSprintData: any[];
    memberName: string;
    userId: string;
}

export function SprintMetricsSection({ memberSprintData, memberName, userId }: Props) {
    const queryClient = useQueryClient();
    const [selectedSprintIdx, setSelectedSprintIdx] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const sprint = memberSprintData[selectedSprintIdx];
    if (!sprint) return null;

    const handleStartEdit = () => {
        // Default sprint number to last sprint + 1 so new sprint entry is pre-filled
        const maxSprintNumber = memberSprintData.reduce(
            (max, s) => Math.max(max, s.sprintNumber ?? 0),
            0,
        );
        const nextSprintNumber = maxSprintNumber + 1;

        const vals: Record<string, string> = {
            sprintNumber: String(nextSprintNumber),
            sprintName: `Sprint-${nextSprintNumber}`,
        };
        SPRINT_COLS.forEach(col => {
            vals[col.key] = String(sprint[col.key] ?? 0);
        });
        setEditValues(vals);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditValues({});
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload: any = {
                sprintNumber: parseInt(editValues['sprintNumber']) || sprint.sprintNumber,
                sprintName: editValues['sprintName'] || sprint.sprintName,
            };
            SPRINT_COLS.forEach(col => {
                const num = parseFloat(editValues[col.key]);
                if (!isNaN(num)) payload[col.key] = num;
            });
            await sprintMetricsAPI.update(sprint.id, {
                ...payload,
                source: 'manual',
            });
            queryClient.invalidateQueries({ queryKey: ['sprint-metrics'] });
            toast.success(`Sprint ${payload.sprintNumber} metrics updated!`);
            setIsEditing(false);
            setEditValues({});
        } catch (err: any) {
            toast.error(err.message || 'Failed to save sprint metrics');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="rounded-2xl border border-border/50 bg-muted/10 overflow-hidden">
            {/* Section Header */}
            <div className="px-5 py-3.5 border-b border-border/40 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <TrendingUp className="h-3.5 w-3.5 text-violet-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground">Sprint Performance Records</p>
                        <p className="text-[11px] text-muted-foreground">
                            {memberSprintData.length} sprint{memberSprintData.length > 1 ? 's' : ''} · {memberName}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Sprint navigator */}
                    {memberSprintData.length > 1 && !isEditing && (
                        <div className="flex items-center gap-1 rounded-xl bg-muted/40 border border-border/40 p-1">
                            <button
                                onClick={() => setSelectedSprintIdx(i => Math.max(0, i - 1))}
                                disabled={selectedSprintIdx === 0}
                                className="h-6 w-6 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-muted/60 transition-colors"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-[11px] font-bold px-1 text-foreground">
                                Sprint {sprint.sprintNumber}
                            </span>
                            <button
                                onClick={() => setSelectedSprintIdx(i => Math.min(memberSprintData.length - 1, i + 1))}
                                disabled={selectedSprintIdx === memberSprintData.length - 1}
                                className="h-6 w-6 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-muted/60 transition-colors"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}

                    <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500 border-violet-500/20">
                        {sprint.source === 'csv' ? '📁 CSV' : '✏️ Manual'}
                    </Badge>

                    {!isEditing ? (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleStartEdit}
                            className="rounded-xl h-8 gap-1.5 px-3 text-xs border-primary/20 hover:bg-primary/5 hover:text-primary"
                        >
                            <Pencil className="h-3 w-3" />
                            Update Sprint
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={handleCancel} className="rounded-xl h-8 text-xs">
                                <X className="h-3 w-3 mr-1" /> Cancel
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={isSaving} className="rounded-xl h-8 gap-1.5 px-3 text-xs">
                                <Save className="h-3 w-3" />
                                {isSaving ? 'Saving…' : 'Save'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Sprint info row — editable in edit mode */}
            <div className="px-5 pt-4 pb-1 flex items-center gap-3 flex-wrap">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Sprint #</span>
                    {isEditing ? (
                        <Input
                            type="number"
                            min={1}
                            max={999}
                            step={1}
                            value={editValues['sprintNumber'] ?? sprint.sprintNumber}
                            onChange={e => setEditValues(prev => ({ ...prev, sprintNumber: e.target.value }))}
                            className="w-24 rounded-xl font-black text-lg h-11 text-center"
                        />
                    ) : (
                        <div className="rounded-xl bg-muted/30 border border-border/30 px-4 py-2 flex items-center gap-2">
                            <span className="text-lg font-black text-foreground">{sprint.sprintNumber}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Sprint Name</span>
                    {isEditing ? (
                        <Input
                            type="text"
                            value={editValues['sprintName'] ?? (sprint.sprintName || '')}
                            onChange={e => setEditValues(prev => ({ ...prev, sprintName: e.target.value }))}
                            placeholder="e.g. Sprint-2"
                            className="rounded-xl font-semibold h-11"
                        />
                    ) : (
                        <div className="rounded-xl bg-muted/30 border border-border/30 px-4 py-2">
                            <span className="text-sm font-semibold text-foreground">{sprint.sprintName || `Sprint ${sprint.sprintNumber}`}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SPRINT_COLS.map(col => {
                    const rawValue = sprint[col.key];
                    const displayValue = typeof rawValue === 'number'
                        ? col.unit === 'qty' ? rawValue.toFixed(0) : rawValue.toFixed(1)
                        : '—';

                    return (
                        <Card
                            key={col.key}
                            className={cn(
                                'relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-lg',
                                col.bgClass,
                                isEditing && 'ring-2 ring-primary/20'
                            )}
                        >
                            <CardContent className="p-5">
                                {/* Card header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={cn('opacity-70', col.valueClass)}>{col.icon}</span>
                                            <h4 className="font-semibold text-sm">{col.label}</h4>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Range: {col.min} – {col.max} {col.unit}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className={cn('rounded-full text-[10px] px-2 py-0.5', col.badgeClass)}>
                                        Sprint {sprint.sprintNumber}
                                    </Badge>
                                </div>

                                {/* Value / Edit */}
                                {isEditing ? (
                                    <div className="space-y-1.5">
                                        <Input
                                            type="number"
                                            min={col.min}
                                            max={col.max}
                                            step={col.step}
                                            value={editValues[col.key] ?? displayValue}
                                            onChange={e => setEditValues(prev => ({ ...prev, [col.key]: e.target.value }))}
                                            className="rounded-xl text-2xl font-bold h-14 text-center appearance-none"
                                        />
                                        <p className="text-[10px] text-center text-muted-foreground">
                                            Min: {col.min} · Max: {col.max}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <span className={cn('text-4xl font-black tracking-tight', col.valueClass)}>
                                            {displayValue}
                                        </span>
                                        <span className="text-sm text-muted-foreground ml-1.5 font-bold uppercase tracking-widest">
                                            {col.unit}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
