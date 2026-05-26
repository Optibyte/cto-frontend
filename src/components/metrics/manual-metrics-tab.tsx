'use client';

import { useState, useEffect as useReactEffect, useMemo } from 'react';
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
import { Save, Lock, Plus, Check, LayoutGrid, Users, Upload, ChevronDown, ChevronUp, Zap, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    type ManualMetricDef,
    PREDEFINED_MANUAL_METRICS,
} from '@/lib/mock-data/metrics-data';
import { useEmployees } from '@/hooks/use-employees';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { useProjects } from '@/hooks/use-projects';
import { useSprintMetrics, useSprintParameters, useCreateSprintParameter } from '@/hooks/use-metrics';
import { useMetricDefinitions } from '@/hooks/use-metric-definitions';
import { useDataFence, useRole } from '@/contexts/role-context';
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
                            <p className="text-sm font-bold text-foreground">Bulk Upload Sprint Data</p>
                            <p className="text-[11px] text-muted-foreground">Upload CSV / Excel — data stored directly to DB</p>
                        </div>
                    </div>
                    {showBulkUpload ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
                {showBulkUpload && (
                    <div className="border-t border-border/40 px-5 py-5">
                        <SprintBulkUploadPanel availableTeams={availableTeams} />
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
