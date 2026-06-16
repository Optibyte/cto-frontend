'use client';

import { useState, useEffect as useReactEffect, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { Save, Lock, Plus, Check, LayoutGrid, Users, Upload, ChevronDown, ChevronUp, Zap, Info, Loader2, CheckCircle2, Trash2, Download, FileSpreadsheet, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    type ManualMetricDef,
    PREDEFINED_MANUAL_METRICS,
} from '@/lib/mock-data/metrics-data';
import { useEmployees } from '@/hooks/use-employees';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { useProjects } from '@/hooks/use-projects';
import { useTeams } from '@/hooks/use-teams';
import { useSprintMetrics, useSprintParameters, useCreateSprintParameter } from '@/hooks/use-metrics';
import { useMetricDefinitions } from '@/hooks/use-metric-definitions';
import { useDataFence, useRole } from '@/contexts/role-context';
import { adminManualMetricsAPI } from '@/lib/api/admin';
import * as XLSX from 'xlsx';
import { SprintBulkUploadPanel } from './sprint-bulk-upload-panel';
import { SprintMetricsSection } from './sprint-metrics-section';

const EMPTY_ARRAY: any[] = [];
const CREATOR_ID = '33333333-3333-4333-8333-333333330001'; // Alice Johnson (Admin)

const METRIC_TO_PARAM_MAP: Record<string, string> = {
    stories_planned: 'storiesPlanned',
    stories_delivered: 'storiesDelivered',
    stories_added: 'storiesAddedMid',
    stories_removed: 'storiesRemoved',
    stories_accepted_by_po: 'storiesAcceptedByPo',
    employee_capacity_hours: 'employeeCapacityHours',
    effort_spent_hours: 'effortSpentHours',
    qa_defects: 'bugsFound',
    client_defects: 'defectsLeakedToProd',
    defects_rejected: 'defectsRejected',
    defects_reopened: 'defectsReopened',
    automation_test_cases_created: 'automationTcCreated',
    test_cases_planned: 'testCasesPlanned',
    test_cases_executed: 'testCasesExecuted',
    static_code_violations: 'staticViolations',
    unit_test_coverage: 'unitTestCoverage',
};

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
    const [selectedSprintNumber, setSelectedSprintNumber] = useState<number>(1);
    const [manualMetrics, setManualMetrics] = useState<ManualMetricDef[]>([]);
    const [editingValues, setEditingValues] = useState<Record<string, number>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [editingStrings, setEditingStrings] = useState<Record<string, string>>({});
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [bulkUploadCategory, setBulkUploadCategory] = useState<'metrics' | 'agent-performance' | 'assets-reuse' | 'token-cost' | 'adoption-fluency'>('metrics');

    // Auto-select initialization locks
    const [projInitialized, setProjInitialized] = useState(false);
    const [teamInitialized, setTeamInitialized] = useState(false);

    // API Hooks
    const { data: fetchedProjectsData } = useProjects();
    const fetchedProjects = fetchedProjectsData || EMPTY_ARRAY;

    const { data: hierarchy } = useOrgHierarchy();

    // Fetch sprint parameters for the selected team
    const { data: teamSprintParams } = useSprintParameters(
        selectedTeamId ? { teamId: selectedTeamId } : undefined
    );

    const activeSprintParam = useMemo(() => {
        return (teamSprintParams || []).find((p: any) => p.sprintNumber === selectedSprintNumber);
    }, [teamSprintParams, selectedSprintNumber]);

    const currentMetrics = useMemo(() => {
        if (!selectedTeamId) return [];
        return Object.entries(METRIC_TO_PARAM_MAP).map(([metricId, paramField]) => {
            return {
                metricId,
                value: activeSprintParam ? (activeSprintParam[paramField] ?? 0) : 0,
            };
        });
    }, [activeSprintParam, selectedTeamId]);

    const currentLevel = selectedTeamId ? 'team' 
        : (selectedProjectId && selectedProjectId !== 'all') ? 'project' 
        : 'none';

    const { data: dbMetricDefsData } = useMetricDefinitions();
    const dbMetricDefs = dbMetricDefsData || EMPTY_ARRAY;

    // Sprint metrics from the bulk-upload table
    const { data: allSprintMetrics } = useSprintMetrics();

    // Data Fence & Role
    const fence = useDataFence();
    const { role: CURRENT_USER_ROLE, user: AUTH_USER } = useRole();
    const currentUserId = AUTH_USER?.id || AUTH_USER?.user?.id || CREATOR_ID;

    // Mutation
    const { mutateAsync: createSprintParam } = useCreateSprintParameter();

    const canEdit = ['ORG', 'MARKET', 'ACCOUNT', 'PROJECT'].includes(CURRENT_USER_ROLE);

    // Filtering logic
    // Resolve project IDs from team IDs via hierarchy (for TEAM_LEAD / TEAM where projectId is on the team, not user)
    const resolvedAllowedProjectIds = useMemo(() => {
        if (!fence.isRestricted) return null;
        if (fence.allowedProjectIds && fence.allowedProjectIds.length > 0) return fence.allowedProjectIds;

        if (fence.allowedTeamIds && hierarchy) {
            const projectIds: string[] = [];
            hierarchy.markets?.forEach((m: any) => {
                m.accounts?.forEach((a: any) => {
                    a.teams?.forEach((t: any) => {
                        if (fence.allowedTeamIds!.includes(t.id) && t.projectId && !projectIds.includes(t.projectId)) {
                            projectIds.push(t.projectId);
                        }
                    });
                });
            });
            return projectIds.length > 0 ? projectIds : null;
        }
        return null;
    }, [fence, hierarchy]);

    // Live projects list — fenced for PM/TL/Team roles
    const liveProjects = useMemo(() => {
        if (!resolvedAllowedProjectIds) return fetchedProjects;
        return fetchedProjects.filter((p: any) => resolvedAllowedProjectIds.includes(p.id));
    }, [fetchedProjects, resolvedAllowedProjectIds]);

    // Role-based auto-selection: Set initial project if restricted and currently 'all'
    useReactEffect(() => {
        if (!fence.isRestricted || liveProjects.length === 0 || projInitialized) return;

        const isCurrentValid = liveProjects.some(p => p.id === selectedProjectId);
        if (selectedProjectId === 'all' || !isCurrentValid) {
            setSelectedProjectId(liveProjects[0].id);
            setProjInitialized(true);
        }
    }, [fence.isRestricted, liveProjects, selectedProjectId, projInitialized]);

    // Available teams based on selected project — fenced for TL/Team roles
    const availableTeams = useMemo(() => {
        if (!hierarchy) return [];
        const teams: any[] = [];
        hierarchy.markets?.forEach((m: any) => {
            m.accounts?.forEach((a: any) => {
                a.teams?.forEach((t: any) => {
                    const matchesProject = selectedProjectId === 'all' || t.projectId === selectedProjectId;
                    const withinTeamFence = !fence.allowedTeamIds || fence.allowedTeamIds.includes(t.id);
                    const withinProjectFence = !resolvedAllowedProjectIds || resolvedAllowedProjectIds.includes(t.projectId);
                    if (matchesProject && withinTeamFence && withinProjectFence) {
                        teams.push(t);
                    }
                });
            });
        });
        return teams;
    }, [hierarchy, selectedProjectId, fence.allowedTeamIds, resolvedAllowedProjectIds]);

    useReactEffect(() => {
        const dbRelevant = dbMetricDefs
            .filter((dbDef: any) => {
                const matchesProject = !selectedProjectId || selectedProjectId === 'all' || dbDef.projectId === selectedProjectId;
                const matchesTeam = !selectedTeamId || dbDef.teamId === selectedTeamId;
                return matchesProject && matchesTeam;
            })
            .map((dbDef: any) => {
                const standard = PREDEFINED_MANUAL_METRICS.find(s => s.id === dbDef.metricType);
                return {
                    id: dbDef.metricType || dbDef.id,
                    name: dbDef.name,
                    min: dbDef.rangeMin ?? (standard?.min || 0),
                    max: dbDef.rangeMax ?? (standard?.max || 100),
                    thresholds: {
                        red: (dbDef.threshold || 0) * 0.8,
                        amber: (dbDef.threshold || 0) * 0.9,
                        green: (dbDef.threshold || 0)
                    },
                    dbId: dbDef.id,
                    metricClass: dbDef.metricClass || standard?.metricClass || 'B',
                    updateFrequency: dbDef.updateFrequency || standard?.updateFrequency || 'Sprint',
                    projectId: dbDef.projectId,
                    teamId: dbDef.teamId,
                    description: dbDef.description || standard?.description || '',
                    type: standard?.type || 'rating' as const
                };
            });

        const provisionedIds = new Set(dbRelevant.map((d: any) => d.id));
        const finalMetrics = [...dbRelevant];
        PREDEFINED_MANUAL_METRICS.forEach((standard: any) => {
            if (!provisionedIds.has(standard.id)) {
                finalMetrics.push(standard);
            }
        });
        setManualMetrics(finalMetrics);
    }, [dbMetricDefs, selectedProjectId, selectedTeamId]);

    useReactEffect(() => {
        if (!fence.isRestricted || availableTeams.length === 0 || teamInitialized) return;
        const isCurrentValid = availableTeams.some(t => t.id === selectedTeamId);
        if (selectedTeamId === 'all' || selectedTeamId === '' || !isCurrentValid) {
            setSelectedTeamId(availableTeams[0].id);
            setTeamInitialized(true);
        }
    }, [fence.isRestricted, availableTeams, selectedTeamId, teamInitialized]);

    const handleProjectChange = (val: string) => {
        setSelectedProjectId(val);
        setSelectedTeamId('');
        setTeamInitialized(false);
        setSelectedSprintNumber(1);
    };

    const handleTeamChange = (val: string) => {
        setSelectedTeamId(val);
        setSelectedSprintNumber(1);
    };

    const handleStartEdit = () => {
        const values: Record<string, number> = {};
        manualMetrics.forEach(def => {
            const paramField = METRIC_TO_PARAM_MAP[def.id];
            const val = activeSprintParam ? (activeSprintParam[paramField] ?? def.min) : def.min;
            values[def.id] = val;
        });
        setEditingValues(values);
        setEditingStrings({});
        setIsEditing(true);
    };

    const handleValueChange = (metricId: string, newVal: string) => {
        if (newVal !== '' && !/^-?\d*\.?\d*$/.test(newVal)) return;
        const def = manualMetrics.find(d => d.id === metricId);
        const num = Number(newVal);
        if (!isNaN(num) && newVal !== '' && def) {
            setEditingValues((prev) => ({ ...prev, [metricId]: num }));
        }
        setEditingStrings(prev => ({ ...prev, [metricId]: newVal }));
    };

    const handleSave = async () => {
        const payload: any = {
            teamId: selectedTeamId,
            sprintNumber: selectedSprintNumber,
            sprintName: `Sprint-${selectedSprintNumber}`,
            createdBy: currentUserId,
        };

        manualMetrics.forEach(def => {
            const paramField = METRIC_TO_PARAM_MAP[def.id];
            if (paramField) {
                const val = editingValues[def.id] !== undefined
                    ? editingValues[def.id]
                    : (activeSprintParam ? (activeSprintParam[paramField] ?? def.min) : def.min);
                payload[paramField] = val;
            }
        });

        try {
            await createSprintParam(payload);
            setIsEditing(false);
            setEditingValues({});
            setEditingStrings({});
            toast.success(`Sprint ${selectedSprintNumber} metrics saved successfully`);
        } catch (error) {
            toast.error('Failed to save sprint metrics');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditingValues({});
        setEditingStrings({});
    };

    const getDisplayValue = (metricId: string, originalValue: number) => {
        if (isEditing && metricId in editingValues) return editingValues[metricId];
        return originalValue;
    };

    const sprintOptions = useMemo<number[]>(() => {
        const numbers = (teamSprintParams || []).map((p: any) => p.sprintNumber);
        if (!numbers.includes(1)) {
            numbers.push(1);
        }
        return Array.from(new Set(numbers)).sort((a: any, b: any) => a - b) as number[];
    }, [teamSprintParams]);

    const handleAddSprint = () => {
        const maxSprint = sprintOptions.length > 0 ? Math.max(...sprintOptions) : 0;
        const nextSprint = maxSprint + 1;
        setSelectedSprintNumber(nextSprint);
        toast.info(`Switched to new Sprint ${nextSprint}. Enter values and save to create it.`);
    };

    return (
        <div className="space-y-6">
            {fence.isRestricted && (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Lock className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-bold">{(fence as any).fenceLabel || '🔒 Data restricted to your scope'}</span>
                </div>
            )}

            <div className="rounded-2xl border border-border/50 bg-muted/10 overflow-hidden">
                <button
                    onClick={() => setShowBulkUpload(v => !v)}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Upload className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-foreground">Bulk Import Center</p>
                            <p className="text-[11px] text-muted-foreground">Manage templates, ingest files, or edit parameters directly via interactive grid</p>
                        </div>
                    </div>
                    {showBulkUpload ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {showBulkUpload && (
                    <div className="border-t border-border/40">
                        {/* Tab Selector for Bulk Categories */}
                        <div className="flex border-b border-border/40 bg-muted/5 p-1 gap-1">
                            <button
                                onClick={() => setBulkUploadCategory('metrics')}
                                className={cn(
                                    "px-4 py-2 text-xs font-semibold rounded-lg transition-all",
                                    bulkUploadCategory === 'metrics'
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                                )}
                            >
                                Sprint Metrics
                            </button>
                            <button
                                onClick={() => setBulkUploadCategory('agent-performance')}
                                className={cn(
                                    "px-4 py-2 text-xs font-semibold rounded-lg transition-all",
                                    bulkUploadCategory === 'agent-performance'
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                                )}
                            >
                                Agent Performance
                            </button>
                            <button
                                onClick={() => setBulkUploadCategory('assets-reuse')}
                                className={cn(
                                    "px-4 py-2 text-xs font-semibold rounded-lg transition-all",
                                    bulkUploadCategory === 'assets-reuse'
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                                )}
                            >
                                Assets & Reuse
                            </button>
                            <button
                                onClick={() => setBulkUploadCategory('token-cost')}
                                className={cn(
                                    "px-4 py-2 text-xs font-semibold rounded-lg transition-all",
                                    bulkUploadCategory === 'token-cost'
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                                )}
                            >
                                Tokens & Cost
                            </button>
                            <button
                                onClick={() => setBulkUploadCategory('adoption-fluency')}
                                className={cn(
                                    "px-4 py-2 text-xs font-semibold rounded-lg transition-all",
                                    bulkUploadCategory === 'adoption-fluency'
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                                )}
                            >
                                Adoption & Fluency
                            </button>
                        </div>
                        <div className="p-5">
                            {bulkUploadCategory === 'metrics' ? (
                                <SprintBulkUploadPanel availableTeams={availableTeams} />
                            ) : (
                                <GenericBulkUploadPanel
                                    category={bulkUploadCategory}
                                    categoryLabel={
                                        bulkUploadCategory === 'agent-performance' ? 'Agent Performance' :
                                        bulkUploadCategory === 'assets-reuse' ? 'Assets & Reuse' :
                                        bulkUploadCategory === 'token-cost' ? 'Tokens & Cost' :
                                        'Adoption & Fluency'
                                    }
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">
                        <LayoutGrid className="h-3 w-3" />
                        Project
                    </div>
                    <Select value={selectedProjectId} onValueChange={handleProjectChange}>
                        <SelectTrigger className="w-[200px] rounded-xl bg-muted/20 border-border/50">
                            <SelectValue placeholder="All Projects" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/50">
                            {!fence.isRestricted && <SelectItem value="all">All Projects</SelectItem>}
                            {liveProjects.map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">
                        <Users className="h-3 w-3" />
                        Team
                    </div>
                    <Select value={selectedTeamId} onValueChange={handleTeamChange}>
                        <SelectTrigger className="w-[180px] rounded-xl bg-muted/20 border-border/50">
                            <SelectValue placeholder="Select Team..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/50">
                            {availableTeams.map((t) => (
                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedTeamId && (
                    <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">
                            <Zap className="h-3 w-3 text-violet-500" />
                            Sprint
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={String(selectedSprintNumber)} onValueChange={(val) => setSelectedSprintNumber(Number(val))}>
                                <SelectTrigger className="w-[140px] rounded-xl bg-muted/20 border-border/50">
                                    <SelectValue placeholder="Select Sprint" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50">
                                    {sprintOptions.map((num) => (
                                        <SelectItem key={num} value={String(num)}>Sprint {num}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 rounded-xl border-violet-500/20 hover:bg-violet-500/5 hover:text-violet-600 transition-all animate-pulse"
                                onClick={handleAddSprint}
                                title="Add New Sprint"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex items-end gap-2 ml-auto self-end pb-0.5">
                    {currentLevel === 'team' && canEdit && !isEditing && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl gap-2 h-10 px-4 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                            onClick={handleStartEdit}
                        >
                            Update Metrics
                        </Button>
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

            {currentLevel === 'team' && (() => {
                const entitySprintData = (allSprintMetrics || [])
                    .filter((sm: any) => sm.teamId === selectedTeamId)
                    .sort((a: any, b: any) => a.sprintNumber - b.sprintNumber);

                if (entitySprintData.length === 0) return null;

                const selectedTeam = availableTeams.find(t => t.id === selectedTeamId);

                return <SprintMetricsSection
                    memberSprintData={entitySprintData}
                    memberName={selectedTeam?.name || 'Selected Team'}
                    userId={selectedTeamId}
                />;
            })()}

            {currentLevel === 'team' ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {manualMetrics.map((def) => {
                        const currentMetric = currentMetrics.find(
                            (m: any) => m.metricId === def.id
                        );
                        const value = getDisplayValue(def.id, currentMetric?.value ?? def.min);
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
                                    </div>

                                    {isEditing && canEdit ? (
                                        <div className="space-y-2">
                                            <Input
                                                type="number"
                                                min={def.min}
                                                max={def.max}
                                                step="any"
                                                value={editingStrings[def.id] ?? String(value)}
                                                onChange={(e) =>
                                                    handleValueChange(def.id, e.target.value)
                                                }
                                                className="rounded-xl text-2xl font-bold h-14 text-center appearance-none"
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
            ) : (
                <Card className="rounded-[2.5rem] border-dashed border-2 border-border bg-muted/5 p-12 text-center shadow-sm">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="h-14 w-14 rounded-3xl bg-violet-500/10 text-violet-500 flex items-center justify-center mx-auto">
                            <Users className="h-7 w-7" />
                        </div>
                        <h4 className="text-lg font-black text-foreground">Select a Team to Track Sprint Data</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Sprint-wise parameters, manual entries, and performance calculations are tracked at the team level. Please select a project and a specific team from the dropdowns above to begin.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
}

const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

interface GenericGridRow {
    id: string;
    org: string;
    country: string;
    market: string;
    account: string;
    project: string;
    team_name: string;
    team_id: string;
    date: string;
    
    // Category specific fields
    agent_name?: string;
    eval_pass_rate?: string;
    hitl_acceptance_rate?: string;
    success_rate?: string;
    hallucination_rate?: string;
    escaped_defects?: string;
    
    name?: string;
    type?: string;
    description?: string;
    reuse_rate?: string;
    reuse_count?: string;
    mcp_usage?: string;
    template_usage?: string;
    version_adoption_rate?: string;
    
    provider?: string;
    model?: string;
    input_tokens?: string;
    output_tokens?: string;
    total_tokens?: string;
    token_cost?: string;
    cache_hit_ratio?: string;
    cost_per_story_point?: string;
    spend_by_client?: string;
    
    total_users?: string;
    active_users?: string;
    daily_active_users?: string;
    certification_percent?: string;
    pod_coverage_percent?: string;
    adoption_rate?: string;
}

interface GenericBulkUploadPanelProps {
    category: 'agent-performance' | 'assets-reuse' | 'token-cost' | 'adoption-fluency';
    categoryLabel: string;
}

const getHeaders = (category: string) => {
    if (category === 'agent-performance') {
        return ['org', 'country', 'market', 'account', 'project', 'team_name', 'team_id', 'date', 'agent_name', 'eval_pass_rate', 'hitl_acceptance_rate', 'success_rate', 'hallucination_rate', 'escaped_defects'];
    } else if (category === 'assets-reuse') {
        return ['org', 'country', 'market', 'account', 'project', 'team_name', 'team_id', 'date', 'name', 'type', 'description', 'reuse_rate', 'reuse_count', 'mcp_usage', 'template_usage', 'version_adoption_rate'];
    } else if (category === 'token-cost') {
        return ['org', 'country', 'market', 'account', 'project', 'team_name', 'team_id', 'date', 'provider', 'model', 'input_tokens', 'output_tokens', 'total_tokens', 'token_cost', 'cache_hit_ratio', 'cost_per_story_point', 'spend_by_client'];
    } else {
        return ['org', 'country', 'market', 'account', 'project', 'team_name', 'team_id', 'date', 'total_users', 'active_users', 'daily_active_users', 'certification_percent', 'pod_coverage_percent', 'adoption_rate'];
    }
};

const getSampleData = (category: string) => {
    const todayStr = getTodayDateString();
    if (category === 'agent-performance') {
        return [{
            org: 'Acme Corp',
            country: 'USA',
            market: 'US-Market',
            account: 'Aetna',
            project: 'Claims Mod',
            team_name: 'Alpha Team',
            team_id: 'team-101',
            date: todayStr,
            agent_name: 'CompassCoder',
            eval_pass_rate: 95.5,
            hitl_acceptance_rate: 88.0,
            success_rate: 94.0,
            hallucination_rate: 2.5,
            escaped_defects: 0
        }];
    } else if (category === 'assets-reuse') {
        return [{
            org: 'Acme Corp',
            country: 'USA',
            market: 'US-Market',
            account: 'Aetna',
            project: 'Claims Mod',
            team_name: 'Alpha Team',
            team_id: 'team-101',
            date: todayStr,
            name: 'Claims Parser Template',
            type: 'TEMPLATE',
            description: 'Standard template for parsing claims data',
            reuse_rate: 82.4,
            reuse_count: 154,
            mcp_usage: 12,
            template_usage: 78.5,
            version_adoption_rate: 90.0
        }];
    } else if (category === 'token-cost') {
        return [{
            org: 'Acme Corp',
            country: 'USA',
            market: 'US-Market',
            account: 'Aetna',
            project: 'Claims Mod',
            team_name: 'Alpha Team',
            team_id: 'team-101',
            date: todayStr,
            provider: 'OpenAI',
            model: 'gpt-4o',
            input_tokens: 1200000,
            output_tokens: 800000,
            total_tokens: 2000000,
            token_cost: 15.50,
            cache_hit_ratio: 34.2,
            cost_per_story_point: 0.31,
            spend_by_client: 15.50
        }];
    } else {
        return [{
            org: 'Acme Corp',
            country: 'USA',
            market: 'US-Market',
            account: 'Aetna',
            project: 'Claims Mod',
            team_name: 'Alpha Team',
            team_id: 'team-101',
            date: todayStr,
            total_users: 12,
            active_users: 10,
            daily_active_users: 8,
            certification_percent: 75.0,
            pod_coverage_percent: 83.3,
            adoption_rate: 83.3
        }];
    }
};

const createEmptyRowForCategory = (category: string, teamId: string, dbTeams: any[]): GenericGridRow => {
    const team = dbTeams.find(t => t.id === teamId || t.teamId === teamId) || dbTeams[0];
    const org = team?.project?.account?.market?.org?.name || '';
    const country = team?.project?.account?.market?.org?.country?.[0] || 'USA';
    const market = team?.project?.account?.market?.name || '';
    const account = team?.project?.account?.name || '';
    const project = team?.project?.name || '';
    const teamName = team?.name || '';
    const resolvedTeamId = team?.teamId || team?.id || '';

    const baseRow: GenericGridRow = {
        id: Math.random().toString(36).substring(2, 11),
        org,
        country,
        market,
        account,
        project,
        team_name: teamName,
        team_id: resolvedTeamId,
        date: getTodayDateString(),
    };

    if (category === 'agent-performance') {
        return {
            ...baseRow,
            agent_name: 'CompassCoder',
            eval_pass_rate: '',
            hitl_acceptance_rate: '',
            success_rate: '',
            hallucination_rate: '',
            escaped_defects: '0',
        };
    } else if (category === 'assets-reuse') {
        return {
            ...baseRow,
            name: '',
            type: 'TEMPLATE',
            description: '',
            reuse_rate: '',
            reuse_count: '',
            mcp_usage: '0',
            template_usage: '',
            version_adoption_rate: '',
        };
    } else if (category === 'token-cost') {
        return {
            ...baseRow,
            provider: 'OpenAI',
            model: 'gpt-4o',
            input_tokens: '',
            output_tokens: '',
            total_tokens: '',
            token_cost: '',
            cache_hit_ratio: '',
            cost_per_story_point: '',
            spend_by_client: '',
        };
    } else { // adoption-fluency
        return {
            ...baseRow,
            total_users: '',
            active_users: '',
            daily_active_users: '',
            certification_percent: '',
            pod_coverage_percent: '',
            adoption_rate: '',
        };
    }
};

export function GenericBulkUploadPanel({ category, categoryLabel }: GenericBulkUploadPanelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const [uploadMode, setUploadMode] = useState<'grid' | 'file'>('grid');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [showErrors, setShowErrors] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const { data: dbTeams = [] } = useTeams();

    const [gridRows, setGridRows] = useState<GenericGridRow[]>([]);
    
    useReactEffect(() => {
        if (dbTeams.length > 0 && gridRows.length === 0) {
            const defaultTeamId = dbTeams[0]?.teamId || dbTeams[0]?.id || '';
            setGridRows([createEmptyRowForCategory(category, defaultTeamId, dbTeams)]);
        }
    }, [dbTeams, gridRows.length, category]);

    useReactEffect(() => {
        if (dbTeams.length > 0) {
            const defaultTeamId = dbTeams[0]?.teamId || dbTeams[0]?.id || '';
            setGridRows([createEmptyRowForCategory(category, defaultTeamId, dbTeams)]);
            setResult(null);
            setSelectedFile(null);
        }
    }, [category, dbTeams]);

    const addGridRow = () => {
        const lastRow = gridRows[gridRows.length - 1];
        const defaultTeamId = lastRow?.team_id || dbTeams[0]?.teamId || dbTeams[0]?.id || '';
        const newRow = createEmptyRowForCategory(category, defaultTeamId, dbTeams);
        newRow.date = lastRow?.date || getTodayDateString();
        setGridRows([...gridRows, newRow]);
    };

    const deleteGridRow = (index: number) => {
        if (gridRows.length <= 1) return;
        setGridRows(gridRows.filter((_, i) => i !== index));
    };

    const handleGridRowChange = (index: number, field: keyof GenericGridRow, value: string) => {
        const updated = [...gridRows];
        updated[index] = { ...updated[index], [field]: value } as any;

        if (field === 'team_id') {
            const rowTeamId = value;
            const matchedTeam = dbTeams.find((t: any) => t.teamId === rowTeamId || t.id === rowTeamId);
            if (matchedTeam) {
                updated[index].team_name = matchedTeam.name;
                updated[index].org = matchedTeam.project?.account?.market?.org?.name || '';
                updated[index].country = matchedTeam.project?.account?.market?.org?.country?.[0] || 'USA';
                updated[index].market = matchedTeam.project?.account?.market?.name || '';
                updated[index].account = matchedTeam.project?.account?.name || '';
                updated[index].project = matchedTeam.project?.name || '';
            }
        }
        
        if (category === 'token-cost') {
            if (field === 'input_tokens' || field === 'output_tokens') {
                const input = parseInt(updated[index].input_tokens || '0') || 0;
                const output = parseInt(updated[index].output_tokens || '0') || 0;
                updated[index].total_tokens = String(input + output);
            }
        }

        setGridRows(updated);
    };

    const handleGridSave = async () => {
        const invalidRow = gridRows.find(r => !r.team_id || !r.date);
        if (invalidRow) {
            toast.error('Please ensure Team ID and Date are entered for all rows.');
            return;
        }

        setIsUploading(true);
        setResult(null);
        try {
            const headers = getHeaders(category);
            const csvRows = [headers.join(',')];
            
            gridRows.forEach(row => {
                const line = headers.map(headerKey => {
                    const val = (row as any)[headerKey] ?? '';
                    return `"${String(val).replace(/"/g, '""')}"`;
                }).join(',');
                csvRows.push(line);
            });

            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const file = new File([blob], `grid_${category}_data.csv`, { type: 'text/csv' });

            const res = await adminManualMetricsAPI.bulkUpload(file, category);
            setResult(res);
            queryClient.invalidateQueries({ queryKey: ['metrics'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts-transformation'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts-productivity'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts-adoption'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts-assets'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts-tokens'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts-agentic'] });

            if (res.errors?.length === 0) {
                toast.success(`✅ ${res.processed} ${categoryLabel} records successfully stored in DB!`);
                const defaultTeamId = dbTeams[0]?.teamId || dbTeams[0]?.id || '';
                setGridRows([createEmptyRowForCategory(category, defaultTeamId, dbTeams)]);
            } else {
                toast.warning(`Stored ${res.processed}/${res.total} rows. ${res.errors?.length} errors encountered.`);
            }
        } catch (err: any) {
            toast.error(err.message || 'Saving grid data failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) validateAndSet(file);
    };

    const validateAndSet = (file: File) => {
        const valid = file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
        if (!valid) {
            toast.error('Please upload a .csv or .xlsx file');
            return;
        }
        setSelectedFile(file);
        setResult(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) validateAndSet(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        setResult(null);
        try {
            const res = await adminManualMetricsAPI.bulkUpload(selectedFile, category);
            setResult(res);
            queryClient.invalidateQueries({ queryKey: ['metrics'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts-transformation'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts-productivity'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts-adoption'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts-assets'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts-tokens'] });
            queryClient.invalidateQueries({ queryKey: ['kpi-facts-agentic'] });
            
            if (res.errors?.length === 0) {
                toast.success(`✅ ${res.processed} records uploaded successfully!`);
                setSelectedFile(null);
            } else {
                toast.warning(`Uploaded ${res.processed}/${res.total} rows. ${res.errors?.length} errors found.`);
            }
        } catch (err: any) {
            toast.error(err.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClear = () => {
        setSelectedFile(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const downloadTemplate = () => {
        const headers = getHeaders(category);
        const sample = getSampleData(category);
        const worksheet = XLSX.utils.json_to_sheet(sample, { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `${categoryLabel.replace(/\s+/g, '')}Template`);
        
        const referenceData = dbTeams.map((t: any) => ({
            'Team ID': t.teamId || t.id,
            'Team Name': t.name,
            'Project Name': t.project?.name || 'Unassigned',
            'Account Name': t.project?.account?.name || 'Unassigned',
            'Market Name': t.project?.account?.market?.name || 'Unassigned',
            'Org Name': t.project?.account?.market?.org?.name || 'Unassigned',
        }));
        
        const referenceWorksheet = XLSX.utils.json_to_sheet(referenceData);
        XLSX.utils.book_append_sheet(workbook, referenceWorksheet, 'Available Teams');
        
        XLSX.writeFile(workbook, `${category}_template.xlsx`);
    };

    const successCount = result?.processed ?? 0;
    const errorCount = result?.errors?.length ?? 0;

    return (
        <div className="space-y-5">
            {/* Header Row */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-foreground">Bulk {categoryLabel} Upload</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Add and edit metrics directly in the live table or upload a spreadsheet file.
                    </p>
                </div>
                {uploadMode === 'file' && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadTemplate}
                        className="rounded-xl gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary text-xs h-8"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Template
                    </Button>
                )}
            </div>

            {/* Upload Mode Selector */}
            <div className="flex border-b border-border/40">
                <button
                    onClick={() => { setUploadMode('grid'); setResult(null); }}
                    className={cn(
                        'flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2',
                        uploadMode === 'grid'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                >
                    Interactive Grid Editor
                </button>
                <button
                    onClick={() => { setUploadMode('file'); setResult(null); }}
                    className={cn(
                        'flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2',
                        uploadMode === 'file'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                >
                    Upload CSV / Excel File
                </button>
            </div>

            {uploadMode === 'grid' ? (
                /* Interactive Grid Editor Mode */
                <div className="space-y-4">
                    <div className="border border-border/40 rounded-2xl overflow-hidden bg-muted/5">
                        <div className="overflow-x-auto max-h-[380px]">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-muted/30 border-b border-border/40 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                                        <th className="p-3 min-w-[180px]">Team</th>
                                        <th className="p-3 min-w-[140px]">Project / Account</th>
                                        <th className="p-3 min-w-[130px]">Date</th>
                                        
                                        {category === 'agent-performance' && (
                                            <>
                                                <th className="p-3 min-w-[110px]">Agent Name</th>
                                                <th className="p-3 min-w-[80px]">Eval Pass %</th>
                                                <th className="p-3 min-w-[80px]">HITL Acc %</th>
                                                <th className="p-3 min-w-[80px]">Success %</th>
                                                <th className="p-3 min-w-[80px]">Hallucination %</th>
                                                <th className="p-3 min-w-[80px]">Escaped Defects</th>
                                            </>
                                        )}

                                        {category === 'assets-reuse' && (
                                            <>
                                                <th className="p-3 min-w-[140px]">Asset Name</th>
                                                <th className="p-3 min-w-[110px]">Type</th>
                                                <th className="p-3 min-w-[150px]">Description</th>
                                                <th className="p-3 min-w-[75px]">Reuse %</th>
                                                <th className="p-3 min-w-[75px]">Reuse Qty</th>
                                                <th className="p-3 min-w-[75px]">MCP Qty</th>
                                                <th className="p-3 min-w-[75px]">Template %</th>
                                                <th className="p-3 min-w-[75px]">Adoption %</th>
                                            </>
                                        )}

                                        {category === 'token-cost' && (
                                            <>
                                                <th className="p-3 min-w-[90px]">Provider</th>
                                                <th className="p-3 min-w-[90px]">Model</th>
                                                <th className="p-3 min-w-[85px]">Input Toks</th>
                                                <th className="p-3 min-w-[85px]">Output Toks</th>
                                                <th className="p-3 min-w-[95px]">Total Toks</th>
                                                <th className="p-3 min-w-[75px]">Cost ($)</th>
                                                <th className="p-3 min-w-[75px]">Cache Hit %</th>
                                                <th className="p-3 min-w-[75px]">Cost/Story</th>
                                                <th className="p-3 min-w-[75px]">Client Spend</th>
                                            </>
                                        )}

                                        {category === 'adoption-fluency' && (
                                            <>
                                                <th className="p-3 min-w-[80px]">Total Users</th>
                                                <th className="p-3 min-w-[80px]">Active Users</th>
                                                <th className="p-3 min-w-[85px]">Daily Active</th>
                                                <th className="p-3 min-w-[80px]">Cert %</th>
                                                <th className="p-3 min-w-[80px]">Pod Cover %</th>
                                                <th className="p-3 min-w-[80px]">Adoption %</th>
                                            </>
                                        )}

                                        <th className="p-3 text-center w-[50px]">Act</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {gridRows.map((row, index) => (
                                        <tr key={row.id} className="hover:bg-muted/10">
                                            {/* Team Selector column */}
                                            <td className="p-2">
                                                <select
                                                    value={row.team_id}
                                                    onChange={(e) => handleGridRowChange(index, 'team_id', e.target.value)}
                                                    className="w-full h-8 pl-2 pr-8 rounded-lg bg-background border border-border/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                                >
                                                    <option value="" disabled>Select Team...</option>
                                                    {dbTeams.map((t: any) => (
                                                        <option key={t.id} value={t.teamId || t.id}>{t.name}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* Read-only hierarchy metadata */}
                                            <td className="p-2 text-muted-foreground whitespace-nowrap">
                                                <span className="font-medium text-[11px] block max-w-[130px] truncate">{row.project || '-'}</span>
                                                <span className="text-[9px] opacity-75 block max-w-[130px] truncate">{row.account || '-'}</span>
                                            </td>

                                            {/* Date Input */}
                                            <td className="p-2">
                                                <input
                                                    type="date"
                                                    value={row.date}
                                                    onChange={(e) => handleGridRowChange(index, 'date', e.target.value)}
                                                    className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                                                />
                                            </td>

                                            {/* Dynamic columns based on Category */}
                                            {category === 'agent-performance' && (
                                                <>
                                                    <td className="p-2">
                                                        <input
                                                            type="text"
                                                            value={row.agent_name || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'agent_name', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs"
                                                            placeholder="CompassCoder"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={row.eval_pass_rate || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'eval_pass_rate', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0.0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={row.hitl_acceptance_rate || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'hitl_acceptance_rate', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0.0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={row.success_rate || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'success_rate', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0.0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={row.hallucination_rate || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'hallucination_rate', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0.0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            value={row.escaped_defects || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'escaped_defects', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                </>
                                            )}

                                            {category === 'assets-reuse' && (
                                                <>
                                                    <td className="p-2">
                                                        <input
                                                            type="text"
                                                            value={row.name || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'name', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs"
                                                            placeholder="Asset Name"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <select
                                                            value={row.type || 'TEMPLATE'}
                                                            onChange={(e) => handleGridRowChange(index, 'type', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                                        >
                                                            <option value="PROMPT">PROMPT</option>
                                                            <option value="TEMPLATE">TEMPLATE</option>
                                                            <option value="WORKFLOW">WORKFLOW</option>
                                                            <option value="AGENT">AGENT</option>
                                                            <option value="MCP">MCP</option>
                                                            <option value="DOCUMENT">DOCUMENT</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="text"
                                                            value={row.description || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'description', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs"
                                                            placeholder="Description..."
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={row.reuse_rate || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'reuse_rate', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0.0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            value={row.reuse_count || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'reuse_count', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            value={row.mcp_usage || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'mcp_usage', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={row.template_usage || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'template_usage', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0.0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={row.version_adoption_rate || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'version_adoption_rate', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0.0"
                                                        />
                                                    </td>
                                                </>
                                            )}

                                            {category === 'token-cost' && (
                                                <>
                                                    <td className="p-2">
                                                        <input
                                                            type="text"
                                                            value={row.provider || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'provider', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs"
                                                            placeholder="OpenAI"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="text"
                                                            value={row.model || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'model', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs"
                                                            placeholder="gpt-4o"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            value={row.input_tokens || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'input_tokens', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            value={row.output_tokens || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'output_tokens', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            value={row.total_tokens || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'total_tokens', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right bg-muted/20"
                                                            placeholder="0"
                                                            readOnly
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={row.token_cost || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'token_cost', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0.0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={row.cache_hit_ratio || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'cache_hit_ratio', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0.0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={row.cost_per_story_point || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'cost_per_story_point', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0.0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={row.spend_by_client || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'spend_by_client', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0.0"
                                                        />
                                                    </td>
                                                </>
                                            )}

                                            {category === 'adoption-fluency' && (
                                                <>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            value={row.total_users || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'total_users', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            value={row.active_users || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'active_users', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            value={row.daily_active_users || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'daily_active_users', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={row.certification_percent || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'certification_percent', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0.0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={row.pod_coverage_percent || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'pod_coverage_percent', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0.0"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={row.adoption_rate || ''}
                                                            onChange={(e) => handleGridRowChange(index, 'adoption_rate', e.target.value)}
                                                            className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs text-right"
                                                            placeholder="0.0"
                                                        />
                                                    </td>
                                                </>
                                            )}

                                            {/* Delete Row button */}
                                            <td className="p-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => deleteGridRow(index)}
                                                    disabled={gridRows.length <= 1}
                                                    className="p-1.5 rounded-md hover:bg-destructive/15 text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Grid Actions */}
                        <div className="flex items-center gap-2 p-3 bg-muted/10 border-t border-border/40">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addGridRow}
                                className="rounded-lg text-xs gap-1 border-primary/20 hover:bg-primary/5 hover:text-primary h-8"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add Row
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    const defaultTeamId = dbTeams[0]?.teamId || dbTeams[0]?.id || '';
                                    setGridRows([createEmptyRowForCategory(category, defaultTeamId, dbTeams)]);
                                }}
                                className="rounded-lg text-xs hover:bg-destructive/5 hover:text-destructive h-8 ml-auto"
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>

                    {/* Save Button */}
                    {!result && (
                        <Button
                            className="w-full rounded-xl h-11 gap-2 text-sm font-semibold"
                            onClick={handleGridSave}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving {categoryLabel} Data to DB…
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Save Grid Data to Database
                                </>
                            )}
                        </Button>
                    )}
                </div>
            ) : (
                /* Spreadsheet File Upload Mode */
                <div className="space-y-4">
                    {/* Required Columns Hint */}
                    <div className="rounded-xl bg-muted/30 border border-border/40 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Required Columns</p>
                        <div className="flex flex-wrap gap-1.5">
                            {getHeaders(category).map(col => (
                                <Badge
                                    key={col}
                                    variant="outline"
                                    className="font-mono text-[10px] rounded-md px-1.5 py-0 border-border/60 bg-background"
                                >
                                    {col}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* File Dropzone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                            'border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer relative overflow-hidden',
                            isDragging ? 'border-primary bg-primary/5' : 'border-border/60 bg-muted/5 hover:bg-muted/10',
                            selectedFile && 'border-emerald-500/50 bg-emerald-500/5'
                        )}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileChange}
                        />

                        <div className="space-y-3">
                            <div className={cn(
                                'h-12 w-12 rounded-2xl flex items-center justify-center mx-auto transition-transform duration-300 scale-100 hover:scale-110',
                                selectedFile ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                            )}>
                                {selectedFile ? <FileSpreadsheet className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
                            </div>

                            {selectedFile ? (
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-foreground truncate max-w-xs mx-auto">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-mono">
                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-foreground">
                                        Drag & drop your file here, or <span className="text-primary hover:underline">browse</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Supports CSV, XLSX, XLS files up to 10MB
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* File Mode Actions */}
                    {selectedFile && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-xl h-11"
                                onClick={handleClear}
                                disabled={isUploading}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear
                            </Button>
                            <Button
                                className="flex-1 rounded-xl h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                                onClick={handleUpload}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading…
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Upload File
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Results Feedback Card */}
            {result && (
                <Card className={cn(
                    'rounded-3xl border shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300',
                    errorCount > 0 ? 'border-amber-500/30 bg-amber-500/5' : 'border-emerald-500/30 bg-emerald-500/5'
                )}>
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className={cn(
                                    'h-8 w-8 rounded-xl flex items-center justify-center mt-0.5',
                                    errorCount > 0 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                                )}>
                                    {errorCount > 0 ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-foreground">Ingestion Process Completed</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Processed <span className="font-bold text-foreground">{successCount}</span> of <span className="font-bold text-foreground">{result.total}</span> total records.
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full"
                                onClick={() => setResult(null)}
                            >
                                <X className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>

                        {/* Summary details */}
                        {result.summary && result.summary.length > 0 && (
                            <div className="mt-4 border-t border-border/40 pt-4 space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Processed Teams Summary</p>
                                <div className="grid gap-2 grid-cols-2">
                                    {result.summary.map((sum: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center bg-background/50 border border-border/30 rounded-xl p-2.5 text-xs">
                                            <div className="truncate max-w-[130px]">
                                                <span className="font-bold text-foreground block truncate">{sum.team}</span>
                                                <span className="text-[9px] text-muted-foreground block truncate">{sum.project}</span>
                                            </div>
                                            <Badge variant="secondary" className="font-bold rounded-lg px-2 py-0.5">
                                                +{sum.count} rows
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Error logs */}
                        {errorCount > 0 && (
                            <div className="mt-4 border-t border-border/40 pt-4">
                                <button
                                    onClick={() => setShowErrors(!showErrors)}
                                    className="w-full flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                                >
                                    <span>Toggle Error Logs ({errorCount})</span>
                                    {showErrors ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                                {showErrors && (
                                    <div className="mt-2 rounded-xl bg-background border border-border/50 p-3 max-h-[200px] overflow-y-auto font-mono text-[10px] text-rose-600 space-y-1.5">
                                        {result.errors.map((err: any, idx: number) => (
                                            <div key={idx} className="flex gap-2">
                                                <span className="font-bold shrink-0">Row {err.row}:</span>
                                                <span>{err.error}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
