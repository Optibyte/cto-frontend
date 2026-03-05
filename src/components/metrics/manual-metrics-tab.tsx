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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Save, User, Info, Lock, Pencil, Plus, Check, LayoutGrid, Users, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    PREDEFINED_MANUAL_METRICS,
    MEMBERS_WITH_METRICS,
    type MemberWithMetrics,
    type ManualMetricDef,
} from '@/lib/mock-data/metrics-data';
import { PROJECTS, TEAMS, getTeamsForProject } from '@/lib/mock-data/dashboard-filtered';

// Current user role simulation
const CURRENT_USER_ROLE = 'PROJECT';

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
    const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');
    const [selectedMemberId, setSelectedMemberId] = useState<string>('');
    const [editingValues, setEditingValues] = useState<Record<string, number>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Multi-metric form state for "Add Entry"
    const [newEntries, setNewEntries] = useState<Record<string, string>>({
        'mm-1': '', // Communication
        'mm-2': '', // Learning Level
        'mm-3': '', // Client Interaction
        'mm-4': '', // Initiative
        'mm-5': '', // Documentation Quality
    });

    const [isNewMetricDialogOpen, setIsNewMetricDialogOpen] = useState(false);
    const [newMetricDef, setNewMetricDef] = useState({
        name: '',
        type: 'rating',
        min: 1,
        max: 5,
        thresholds: { red: 2, amber: 3, green: 4 }
    });

    const canEdit = ['ORG', 'MARKET', 'ACCOUNT', 'PROJECT'].includes(CURRENT_USER_ROLE);

    // Filtering logic
    const availableTeams = getTeamsForProject(selectedProjectId);

    const filteredMembers = MEMBERS_WITH_METRICS.filter((m) => {
        const teamMatch = !selectedTeamId || m.team.toLowerCase().replace(/[^a-z]/g, '') === selectedTeamId.replace(/-/g, '');
        // Note: The team names in metrics-data ('Frontend') and dashboard-filtered ('ui-ux' or 'backend') might not match perfectly.
        // Let's assume a match or use the team names directly if possible.
        // For this mock, I'll allow all members if 'all' is selected, or filter by team name.
        if (selectedTeamId === '') return true;
        const teamObj = TEAMS.find(t => t.id === selectedTeamId);
        return m.team === teamObj?.name;
    });

    const selectedMember = MEMBERS_WITH_METRICS.find((m) => m.id === selectedMemberId);

    const handleProjectChange = (val: string) => {
        setSelectedProjectId(val);
        setSelectedTeamId('');
        setSelectedMemberId('');
    };

    const handleTeamChange = (val: string) => {
        setSelectedTeamId(val);
        setSelectedMemberId('');
    };

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

    const handleAddEntries = () => {
        // Validation logic for all 5 metrics
        const ids = ['mm-1', 'mm-2', 'mm-3', 'mm-4', 'mm-5'];
        const values: Record<string, number> = {};

        for (const id of ids) {
            const def = PREDEFINED_MANUAL_METRICS.find(m => m.id === id);
            if (!def) continue;

            const valStr = newEntries[id];
            if (!valStr) {
                toast.error(`Please enter a value for ${def.name}`);
                return;
            }

            const num = Number(valStr);
            if (isNaN(num)) {
                toast.error(`Invalid value for ${def.name}`);
                return;
            }

            values[id] = Math.min(Math.max(num, def.min), def.max);
        }

        toast.success(`Successfully added entries for ${selectedMember?.name}`);
        setIsAddDialogOpen(false);
        // Reset entries
        setNewEntries({
            'mm-1': '', 'mm-2': '', 'mm-3': '', 'mm-4': '', 'mm-5': ''
        });
    };

    const handleCreateMetricDef = () => {
        if (!newMetricDef.name) {
            toast.error('Please enter a metric name');
            return;
        }
        toast.success(`Metric "${newMetricDef.name}" defined successfully`);
        setIsNewMetricDialogOpen(false);
        setNewMetricDef({
            name: '',
            type: 'rating',
            min: 1,
            max: 5,
            thresholds: { red: 2, amber: 3, green: 4 }
        });
    };

    const getDisplayValue = (metricId: string, originalValue: number) => {
        if (isEditing && metricId in editingValues) return editingValues[metricId];
        return originalValue;
    };

    return (
        <div className="space-y-6">
            {/* Selectors Bar */}
            <div className="flex flex-wrap items-center gap-4">
                {/* Project Selector */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">
                        <LayoutGrid className="h-3 w-3" />
                        Project
                    </div>
                    <Select value={selectedProjectId} onValueChange={handleProjectChange}>
                        <SelectTrigger className="w-[200px] rounded-xl bg-muted/20 border-border/50">
                            <SelectValue placeholder="All Projects" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Select Projects</SelectItem>
                            {PROJECTS.map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Team Selector */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">
                        <Users className="h-3 w-3" />
                        Team
                    </div>
                    <Select value={selectedTeamId} onValueChange={handleTeamChange}>
                        <SelectTrigger className="w-[180px] rounded-xl bg-muted/20 border-border/50">
                            <SelectValue placeholder="Select Team..." />
                        </SelectTrigger>
                        <SelectContent>
                            {availableTeams.map((t) => (
                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Member Selector */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">
                        <User className="h-3 w-3" />
                        Team Member
                    </div>
                    <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                        <SelectTrigger className="w-[240px] rounded-xl bg-muted/20 border-border/50">
                            <SelectValue placeholder="Choose a member..." />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredMembers.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                    <span className="flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                                            {member.avatar}
                                        </span>
                                        {member.name}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-end gap-2 ml-auto self-end pb-0.5">
                    {selectedMember && canEdit && !isEditing && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl gap-2 h-10 px-4 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                                onClick={handleStartEdit}
                            >

                                Update Metrics
                            </Button>

                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="rounded-xl gap-2 h-10 px-5 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-violet-600 hover:scale-105 transition-transform">
                                        <Plus className="h-4 w-4" />
                                        Add Entry
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px] rounded-3xl border-primary/20 backdrop-blur-xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold">New Metrics Entry</DialogTitle>
                                        <DialogDescription>
                                            Record manual metrics for {selectedMember.name}.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                                        {['mm-1', 'mm-2', 'mm-3', 'mm-4', 'mm-5'].map((id) => {
                                            const def = PREDEFINED_MANUAL_METRICS.find(m => m.id === id);
                                            if (!def) return null;
                                            return (
                                                <div key={id} className="space-y-2 p-3 rounded-2xl bg-muted/30 border border-border/50">
                                                    <div className="flex justify-between items-center">
                                                        <Label htmlFor={id} className="font-semibold text-sm">
                                                            {def.name}
                                                        </Label>
                                                        <span className="text-[10px] text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full border border-border/50">
                                                            Range: {def.min} – {def.max}{def.type === 'percentage' ? '%' : ''}
                                                        </span>
                                                    </div>
                                                    <Input
                                                        id={id}
                                                        type="number"
                                                        placeholder={`Enter ${def.name}...`}
                                                        className="rounded-xl border-primary/10 bg-background/80 h-10 text-base"
                                                        value={newEntries[id]}
                                                        onChange={(e) => setNewEntries(prev => ({ ...prev, [id]: e.target.value }))}
                                                        min={def.min}
                                                        max={def.max}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <DialogFooter className="mt-4">
                                        <Button
                                            className="w-full rounded-2xl h-12 font-bold text-lg gap-2"
                                            onClick={handleAddEntries}
                                        >
                                            <Check className="h-5 w-5" />
                                            Submit All Metrics
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={isNewMetricDialogOpen} onOpenChange={setIsNewMetricDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="rounded-xl gap-2 h-10 px-5 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all">
                                        <PlusCircle className="h-4 w-4" />
                                        New Metric
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px] rounded-3xl border-primary/20 backdrop-blur-xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold">Define Manual Metric</DialogTitle>
                                        <DialogDescription>
                                            Create a new metric definition for manual entry.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="metric-name">Metric Name</Label>
                                            <Input
                                                id="metric-name"
                                                placeholder="e.g. Code Quality"
                                                className="rounded-xl h-10"
                                                value={newMetricDef.name}
                                                onChange={(e) => setNewMetricDef(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Type</Label>
                                                <Select
                                                    value={newMetricDef.type}
                                                    onValueChange={(v) => setNewMetricDef(prev => ({ ...prev, type: v as any }))}
                                                >
                                                    <SelectTrigger className="rounded-xl h-10">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="rating">Rating</SelectItem>
                                                        <SelectItem value="percentage">Percentage</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Range (Min – Max)</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="number"
                                                        className="rounded-xl h-10"
                                                        value={newMetricDef.min}
                                                        onChange={(e) => setNewMetricDef(prev => ({ ...prev, min: Number(e.target.value) }))}
                                                    />
                                                    <span className="text-muted-foreground">—</span>
                                                    <Input
                                                        type="number"
                                                        className="rounded-xl h-10"
                                                        value={newMetricDef.max}
                                                        onChange={(e) => setNewMetricDef(prev => ({ ...prev, max: Number(e.target.value) }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label>Thresholds (RAG)</Label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                        Red
                                                    </div>
                                                    <Input
                                                        type="number"
                                                        className="rounded-xl h-10 border-red-500/20"
                                                        value={newMetricDef.thresholds.red}
                                                        onChange={(e) => setNewMetricDef(prev => ({
                                                            ...prev,
                                                            thresholds: { ...prev.thresholds, red: Number(e.target.value) }
                                                        }))}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        Amber
                                                    </div>
                                                    <Input
                                                        type="number"
                                                        className="rounded-xl h-10 border-amber-500/20"
                                                        value={newMetricDef.thresholds.amber}
                                                        onChange={(e) => setNewMetricDef(prev => ({
                                                            ...prev,
                                                            thresholds: { ...prev.thresholds, amber: Number(e.target.value) }
                                                        }))}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        Green
                                                    </div>
                                                    <Input
                                                        type="number"
                                                        className="rounded-xl h-10 border-emerald-500/20"
                                                        value={newMetricDef.thresholds.green}
                                                        onChange={(e) => setNewMetricDef(prev => ({
                                                            ...prev,
                                                            thresholds: { ...prev.thresholds, green: Number(e.target.value) }
                                                        }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button className="w-full rounded-2xl h-12 font-bold" onClick={handleCreateMetricDef}>
                                            Create Metric Definition
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}

                    {isEditing && (
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="rounded-xl h-10" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button size="sm" className="rounded-xl h-10 gap-2 px-5" onClick={handleSave}>
                                <Save className="h-3.5 w-3.5" />
                                Save Changes
                            </Button>
                        </div>
                    )}
                </div>
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
