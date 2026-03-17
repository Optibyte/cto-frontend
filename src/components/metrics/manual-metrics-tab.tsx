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
import { Save, User, Info, Lock, Pencil, Plus, Check, LayoutGrid, Users, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    type MemberWithMetrics,
    type ManualMetricDef,
} from '@/lib/mock-data/metrics-data';
import { getTeamsForProject } from '@/lib/mock-data/dashboard-filtered';
import { useEmployees } from '@/hooks/use-employees';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { useProjects } from '@/hooks/use-projects';
import { useEffect as useReactEffect, useMemo } from 'react';
import { useBulkCreateMetrics, useTeamMetrics, useDeleteMetric } from '@/hooks/use-metrics';
import { useMetricDefinitions, useDeleteMetricDefinition, useCreateMetricDefinition } from '@/hooks/use-metric-definitions';
import { useDataFence } from '@/contexts/role-context';

const CREATOR_ID = '33333333-3333-4333-8333-333333330001'; // Alice Johnson (Admin)

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
    const [manualMetrics, setManualMetrics] = useState<ManualMetricDef[]>([]);
    const [editingValues, setEditingValues] = useState<Record<string, number>>({});
    const [isEditing, setIsEditing] = useState(false);
    
    // API Hooks
    const { data: liveEmployees = [] } = useEmployees();
    const { data: fetchedProjects = [], isLoading: projectsLoading } = useProjects();
    const { data: hierarchy } = useOrgHierarchy();
    const { data: teamMetrics = [], isLoading: metricsLoading } = useTeamMetrics(selectedTeamId);
    const { data: dbMetricDefs = [] } = useMetricDefinitions();

    // Data Fence
    const fence = useDataFence();

    // Mutations
    const { mutateAsync: deleteMetricDef } = useDeleteMetricDefinition();
    const { mutateAsync: createMetricDef } = useCreateMetricDefinition();
    const { mutateAsync: bulkCreateMetrics } = useBulkCreateMetrics();
    const { mutateAsync: deleteMetric } = useDeleteMetric();

    const [isNewMetricDialogOpen, setIsNewMetricDialogOpen] = useState(false);

    // Live projects list
    const [newMetricDef, setNewMetricDef] = useState({
        name: '',
        type: 'rating',
        min: 1,
        max: 5,
        thresholds: { red: 2, amber: 3, green: 4 }
    });

    const canEdit = ['ORG', 'MARKET', 'ACCOUNT', 'PROJECT'].includes(CURRENT_USER_ROLE);

    // Filtering logic
    // Live projects list — fenced for PM/TL/Team roles
    const liveProjects = useMemo(() => {
        if (!fence.allowedProjectIds) return fetchedProjects;
        return fetchedProjects.filter((p: any) => fence.allowedProjectIds!.includes(p.id));
    }, [fetchedProjects, fence.allowedProjectIds]);

    // Available teams based on selected project — fenced for TL/Team roles
    const availableTeams = useMemo(() => {
        if (!hierarchy) return [];
        const teams: any[] = [];
        hierarchy.markets?.forEach((m: any) => {
            m.accounts?.forEach((a: any) => {
                a.teams?.forEach((t: any) => {
                    const matchesProject = selectedProjectId === 'all' || t.projectId === selectedProjectId;
                    const withinFence = !fence.allowedTeamIds || fence.allowedTeamIds.includes(t.id);
                    const withinProjectFence = !fence.allowedProjectIds || fence.allowedProjectIds.includes(t.projectId);
                    if (matchesProject && withinFence && withinProjectFence) {
                        teams.push(t);
                    }
                });
            });
        });
        return teams;
    }, [hierarchy, selectedProjectId, fence.allowedTeamIds, fence.allowedProjectIds]);

    // DERIVED MEMBERS STATE
    const members = useMemo(() => {
        if (!selectedTeamId) return [];
        
        const selectedTeam = availableTeams.find(t => t.id === selectedTeamId);
        if (!selectedTeam || !selectedTeam.members) return [];

        // 1. Map base team members
        const teamMembers: MemberWithMetrics[] = selectedTeam.members.map((m: any) => {
            const userId = m.userId || m.id;
            
            // Enrich with live employee info if available
            const employeeInfo = liveEmployees.find((e: any) => (e.id || e._id) === userId);
            
            // Extract display metrics from teamMetrics
            const memberMetricsFromServer = teamMetrics.filter((mt: any) => 
                mt.userId === userId && mt.source === 'manual'
            );

            const displayMetrics: { metricId: string; value: number; id?: string }[] = [];
            
            // Latest manual metrics for this user
            const latestMetricsMap = new Map();
            [...memberMetricsFromServer].forEach((mm: any) => {
                latestMetricsMap.set(mm.metricType, { value: mm.value, id: mm.id });
            });

            Array.from(latestMetricsMap.entries()).forEach(([mType, data]: [string, any]) => {
                displayMetrics.push({ metricId: mType, value: data.value, id: data.id });
            });

            return {
                id: userId,
                name: employeeInfo?.user?.fullName || employeeInfo?.fullName || m.user?.fullName || m.fullName || 'Unknown',
                role: m.roleInTeam || m.role || employeeInfo?.role || 'Member',
                avatar: (employeeInfo?.fullName || m.fullName || 'U').charAt(0),
                team: selectedTeam.name,
                teamId: selectedTeam.id,
                metrics: displayMetrics
            };
        });

        // Deduplicate just in case
        const uniqueMembersMap = new Map();
        teamMembers.forEach(m => uniqueMembersMap.set(m.id, m));
        return Array.from(uniqueMembersMap.values());
    }, [selectedTeamId, availableTeams, liveEmployees, teamMetrics]);

    const filteredMembers = members;
    

    // Sync metric definitions from backend
    useReactEffect(() => {
        if (dbMetricDefs.length > 0) {
            const mappedDefs: ManualMetricDef[] = dbMetricDefs.map((d: any) => ({
                id: d.metricType,
                name: d.name,
                type: d.metricType === 'velocity' ? 'points' : 
                      d.metricType === 'quality' ? 'percentage' : 
                      ((d.rangeMax || 0) <= 5 ? 'rating' : 'integer'),
                min: d.rangeMin || 0,
                max: d.rangeMax || 100,
                thresholds: { 
                    red: (d.threshold || 0) * 0.8, 
                    amber: (d.threshold || 0) * 0.9, 
                    green: (d.threshold || 0) 
                },
                dbId: d.id,
                projectId: d.projectId,
                teamId: d.teamId,
                memberId: d.memberId,
                metricClass: d.metricClass,
                updateFrequency: d.updateFrequency,
            }));

            // Filter definitions based on selected context
            const filtered = mappedDefs.filter(d => {
                // If a definition is tied to a specific project, it must match
                if (d.projectId && d.projectId !== 'all' && d.projectId !== selectedProjectId) return false;
                
                // If a definition is tied to a specific team, it must match
                if (d.teamId && d.teamId !== 'all' && d.teamId !== selectedTeamId) return false;
                
                // If a definition is tied to a specific member, it must match
                if (d.memberId && d.memberId !== 'all' && d.memberId !== selectedMemberId) return false;
                
                return true;
            });

            setManualMetrics(filtered);
        } else {
            setManualMetrics([]);
        }
    }, [dbMetricDefs, selectedProjectId, selectedTeamId, selectedMemberId]);


    const selectedMember = filteredMembers.find((m: any) => m.id === selectedMemberId);

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
        
        // 1. Initialize with all available definitions (default to min)
        manualMetrics.forEach(def => {
            values[def.id] = def.min;
        });

        // 2. Overwrite with existing recorded values
        selectedMember.metrics.forEach((m: any) => {
            if (m.metricId in values) {
                values[m.metricId] = m.value;
            }
        });

        setEditingValues(values);
        setEditingStrings({});
        setIsEditing(true);
    };

    const [editingStrings, setEditingStrings] = useState<Record<string, string>>({});

    const handleValueChange = (metricId: string, newVal: string) => {
        setEditingStrings(prev => ({ ...prev, [metricId]: newVal }));
        const num = Number(newVal);
        if (!isNaN(num) && newVal !== '') {
            setEditingValues((prev) => ({ ...prev, [metricId]: num }));
        }
    };

    const handleSave = async () => {
        if (!selectedMember) return;

        const metricsToSave = Object.entries(editingValues).map(([metricId, value]) => {
            const def = manualMetrics.find(d => d.id === metricId);
            const clampedValue = def ? Math.min(Math.max(value, def.min), def.max) : value;
            
            return {
                time: new Date().toISOString(),
                teamId: selectedMember.teamId || '',
                userId: selectedMember.id,
                metricType: metricId,
                value: clampedValue,
                unit: def?.type === 'percentage' ? '%' : def?.type === 'integer' ? 'qty' : 'pts',
                source: 'manual' as const,
                createdBy: CREATOR_ID,
                metadata: { manual: true, name: def?.name }
            };
        });

        try {
            if (metricsToSave.length > 0) {
                console.log('Saving metrics:', metricsToSave);
                await bulkCreateMetrics(metricsToSave);
            }

            setIsEditing(false);
            setEditingValues({});
            setEditingStrings({});
            toast.success('Metrics saved to database successfully');
        } catch (error) {
            console.error('Failed to save metrics:', error);
            toast.error('Failed to save metrics to database');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditingValues({});
        setEditingStrings({});
    };

    const handleCreateMetricDef = async () => {
        if (!newMetricDef.name) {
            toast.error('Please enter a metric name');
            return;
        }
        
        const metricType = newMetricDef.name.toLowerCase().replace(/\s+/g, '_');
        
        try {
            const selectedProject = liveProjects.find(p => p.id === selectedProjectId);
            const selectedTeam = availableTeams.find(t => t.id === selectedTeamId);
            const selectedMember = filteredMembers.find(m => m.id === selectedMemberId);

            await createMetricDef({
                name: newMetricDef.name,
                metricType,
                metricClass: 'C',
                threshold: newMetricDef.thresholds.green,
                updateFrequency: 'weekly',
                rangeMin: newMetricDef.min,
                rangeMax: newMetricDef.max,
                projectId: selectedProjectId !== 'all' ? selectedProjectId : undefined,
                projectName: selectedProject?.name || '',
                teamId: selectedTeamId || undefined,
                teamName: selectedTeam?.name || '',
                memberId: selectedMemberId || undefined,
                memberName: selectedMember?.name || '',
            });

            toast.success(`Metric "${newMetricDef.name}" created and saved to database`);
            setIsNewMetricDialogOpen(false);
            setNewMetricDef({
                name: '',
                type: 'rating',
                min: 1,
                max: 5,
                thresholds: { red: 2, amber: 3, green: 4 }
            });
        } catch (error) {
            console.error('Failed to create metric definition:', error);
            toast.error('Failed to save metric definition to database');
        }
    };

    const handleDeleteMetric = async (def: ManualMetricDef) => {
        if (!def.dbId) {
            toast.error('Cannot delete: This metric does not have a database ID');
            return;
        }

        if (confirm(`Are you sure you want to delete the metric "${def.name}"?`)) {
            try {
                await deleteMetricDef(def.dbId);
                setManualMetrics(prev => prev.filter(d => d.dbId !== def.dbId));
                toast.success(`Metric "${def.name}" deleted successfully`);
            } catch (error) {
                console.error('Failed to delete metric:', error);
                toast.error('Failed to delete metric from database');
            }
        }
    };

    const getDisplayValue = (metricId: string, originalValue: number) => {
        if (isEditing && metricId in editingValues) return editingValues[metricId];
        return originalValue;
    };

    return (
        <div className="space-y-6">
            {/* Data Fence Banner */}
            {fence.isRestricted && (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Lock className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-bold">{(fence as any).fenceLabel || '🔒 Data restricted to your scope'}</span>
                </div>
            )}
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
                            <SelectItem value="all">All Projects</SelectItem>
                            {liveProjects.map((p) => (
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
                                                        <SelectItem value="integer">Integer / Count</SelectItem>
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
                    {manualMetrics.map((def) => {
                        const memberMetric = selectedMember.metrics.find(
                            (m: any) => m.metricId === def.id
                        );
                        const value = getDisplayValue(def.id, memberMetric?.value ?? def.min);
                        const rag = getRAGColor(value, def.thresholds);
                        const styles = ragStyles[rag];

                        return (
                            <Card
                                key={def.dbId || def.id}
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
                                                {def.metricClass && (
                                                    <Badge variant="outline" className="text-[9px] h-4 px-1 rounded-sm bg-primary/5 border-primary/20 text-primary font-bold">
                                                        CLASS {def.metricClass}
                                                    </Badge>
                                                )}
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
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-muted-foreground">
                                                    {def.type === 'rating'
                                                        ? `Rating ${def.min}–${def.max}`
                                                        : `${def.min}–${def.max}%`}
                                                </p>
                                                {def.updateFrequency && (
                                                    <span className="text-[9px] text-muted-foreground/50 border-l border-border/50 pl-2 uppercase font-bold tracking-tighter">
                                                       Cycle: {def.updateFrequency}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                         <Badge variant="outline" className={cn('rounded-full text-[10px] px-2 py-0.5', styles.badge)}>
                                            {rag === 'green' ? '● Good' : rag === 'amber' ? '● Fair' : '● Needs Improvement'}
                                        </Badge>
                                        
                                        {canEdit && def.dbId && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 -mt-1 -mr-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteMetric(def);
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>

                                    {isEditing && canEdit ? (
                                        <div className="space-y-2">
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                value={editingStrings[def.id] ?? String(value)}
                                                onChange={(e) =>
                                                    handleValueChange(def.id, e.target.value)
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
                                            {def.type === 'percentage' ? (
                                                <span className={cn('text-lg ml-0.5', styles.text)}>%</span>
                                            ) : def.type === 'integer' ? (
                                                <span className="text-sm text-muted-foreground ml-1.5 font-bold uppercase tracking-widest">
                                                    qty
                                                </span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground ml-1">
                                                    / {def.max}
                                                </span>
                                            )}
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
