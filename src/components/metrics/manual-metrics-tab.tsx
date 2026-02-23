'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Save, User, Info, Lock, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    PREDEFINED_MANUAL_METRICS,
    MEMBERS_WITH_METRICS,
    type MemberWithMetrics,
    type ManualMetricDef,
} from '@/lib/mock-data/metrics-data';

// Current user role simulation
const CURRENT_USER_ROLE = 'TeamLead';

function getRAGColor(value: number, thresholds: { red: number; amber: number; green: number }) {
    if (value >= thresholds.green) return 'green';
    if (value >= thresholds.amber) return 'amber';
    return 'red';
}

const ragStyles = {
    green: {
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        text: 'text-emerald-500',
        badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        glow: 'shadow-emerald-500/10',
    },
    amber: {
        bg: 'bg-amber-500/10 border-amber-500/30',
        text: 'text-amber-500',
        badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        glow: 'shadow-amber-500/10',
    },
    red: {
        bg: 'bg-red-500/10 border-red-500/30',
        text: 'text-red-500',
        badge: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
        glow: 'shadow-red-500/10',
    },
};

export function ManualMetricsTab() {
    const [selectedMemberId, setSelectedMemberId] = useState<string>('');
    const [editingValues, setEditingValues] = useState<Record<string, number>>({});
    const [isEditing, setIsEditing] = useState(false);

    const canEdit = ['CTO', 'Manager', 'TeamLead'].includes(CURRENT_USER_ROLE);
    const selectedMember = MEMBERS_WITH_METRICS.find((m) => m.id === selectedMemberId);

    const handleStartEdit = () => {
        if (!selectedMember) return;
        const values: Record<string, number> = {};
        selectedMember.metrics.forEach((m) => {
            values[m.metricId] = m.value;
        });
        setEditingValues(values);
        setIsEditing(true);
    };

    const handleValueChange = (metricId: string, newVal: string, def: ManualMetricDef) => {
        const num = Number(newVal);
        if (isNaN(num)) return;
        const clamped = Math.min(Math.max(num, def.min), def.max);
        setEditingValues((prev) => ({ ...prev, [metricId]: clamped }));
    };

    const handleSave = () => {
        setIsEditing(false);
        toast.success('Metrics updated successfully — changes logged to audit trail');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditingValues({});
    };

    const getDisplayValue = (metricId: string, originalValue: number) => {
        if (isEditing && metricId in editingValues) return editingValues[metricId];
        return originalValue;
    };

    return (
        <div className="space-y-6">
            {/* Member Selector */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <User className="h-4 w-4" />
                    Select Member
                </div>
                <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                    <SelectTrigger className="w-[280px] rounded-xl">
                        <SelectValue placeholder="Choose a team member..." />
                    </SelectTrigger>
                    <SelectContent>
                        {MEMBERS_WITH_METRICS.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                                <span className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                        {member.avatar}
                                    </span>
                                    {member.name}
                                    <span className="text-muted-foreground text-xs">— {member.team}</span>
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {selectedMember && canEdit && !isEditing && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl gap-2"
                        onClick={handleStartEdit}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Metrics
                    </Button>
                )}

                {isEditing && (
                    <div className="flex gap-2 ml-auto">
                        <Button variant="ghost" size="sm" className="rounded-xl" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button size="sm" className="rounded-xl gap-2" onClick={handleSave}>
                            <Save className="h-3.5 w-3.5" />
                            Save Changes
                        </Button>
                    </div>
                )}
            </div>

            {!selectedMember && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <User className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-lg font-medium">Select a team member</p>
                    <p className="text-sm">Choose a member above to view and edit their manual metrics</p>
                </div>
            )}

            {/* Metrics Grid */}
            {selectedMember && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {PREDEFINED_MANUAL_METRICS.map((def) => {
                        const memberMetric = selectedMember.metrics.find(
                            (m) => m.metricId === def.id
                        );
                        const value = getDisplayValue(def.id, memberMetric?.value ?? def.min);
                        const rag = getRAGColor(value, def.thresholds);
                        const styles = ragStyles[rag];

                        return (
                            <Card
                                key={def.id}
                                className={cn(
                                    'relative overflow-hidden rounded-2xl border transition-all duration-300',
                                    styles.bg,
                                    styles.glow,
                                    'shadow-lg',
                                    isEditing && 'ring-2 ring-primary/20'
                                )}
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-sm">{def.name}</h4>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{def.description}</p>
                                                            <p className="text-xs mt-1 opacity-70">
                                                                Range: {def.min} – {def.max}
                                                                {def.type === 'percentage' ? '%' : ''}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {def.type === 'rating'
                                                    ? `Rating ${def.min}–${def.max}`
                                                    : `${def.min}–${def.max}%`}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className={cn('rounded-full text-[10px] px-2 py-0.5', styles.badge)}>
                                            {rag === 'green' ? '● Good' : rag === 'amber' ? '● Fair' : '● Needs Improvement'}
                                        </Badge>
                                    </div>

                                    {isEditing && canEdit ? (
                                        <div className="space-y-2">
                                            <Input
                                                type="number"
                                                min={def.min}
                                                max={def.max}
                                                step={def.type === 'percentage' ? 1 : 1}
                                                value={editingValues[def.id] ?? value}
                                                onChange={(e) =>
                                                    handleValueChange(def.id, e.target.value, def)
                                                }
                                                className="rounded-xl text-2xl font-bold h-14 text-center"
                                            />
                                            <p className="text-[10px] text-center text-muted-foreground">
                                                Min: {def.min} · Max: {def.max}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <span className={cn('text-4xl font-black tracking-tight', styles.text)}>
                                                {value}
                                            </span>
                                            {def.type === 'percentage' && (
                                                <span className={cn('text-lg ml-0.5', styles.text)}>%</span>
                                            )}
                                            <span className="text-sm text-muted-foreground ml-1">
                                                / {def.max}
                                            </span>
                                        </div>
                                    )}

                                    {!canEdit && (
                                        <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-muted-foreground">
                                            <Lock className="h-3 w-3" />
                                            View only
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
