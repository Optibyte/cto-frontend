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
import { Save, User, Info, Lock, Pencil, Plus, Check, LayoutGrid, Users, PlusCircle, Trash2, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    type MemberWithMetrics,
    type ManualMetricDef,
    PREDEFINED_MANUAL_METRICS,
} from '@/lib/mock-data/metrics-data';
import { getTeamsForProject } from '@/lib/mock-data/dashboard-filtered';
import { useEmployees } from '@/hooks/use-employees';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { useProjects } from '@/hooks/use-projects';
import { useEffect as useReactEffect, useMemo } from 'react';
import { useBulkCreateMetrics, useMetrics, useDeleteMetric, useSprintMetrics } from '@/hooks/use-metrics';
import { useMetricDefinitions, useDeleteMetricDefinition, useCreateMetricDefinition } from '@/hooks/use-metric-definitions';
import { useDataFence, useRole } from '@/contexts/role-context';
import { SprintBulkUploadPanel } from './sprint-bulk-upload-panel';
import { SprintMetricsSection } from './sprint-metrics-section';

const EMPTY_ARRAY: any[] = [];
const CREATOR_ID = '33333333-3333-4333-8333-333333330001'; // Alice Johnson (Admin)

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
    const [manualMetrics, setManualMetrics] = useState<ManualMetricDef[]>([]);
    const [editingValues, setEditingValues] = useState<Record<string, number>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [editingStrings, setEditingStrings] = useState<Record<string, string>>({});
    const [showBulkUpload, setShowBulkUpload] = useState(false);

    // Auto-select initialization locks
    const [projInitialized, setProjInitialized] = useState(false);
    const [teamInitialized, setTeamInitialized] = useState(false);

    // API Hooks
    const { data: liveEmployeesData } = useEmployees();
    const liveEmployees = liveEmployeesData || EMPTY_ARRAY;

    const { data: fetchedProjectsData, isLoading: projectsLoading } = useProjects();
    const fetchedProjects = fetchedProjectsData || EMPTY_ARRAY;

    const { data: hierarchy } = useOrgHierarchy();

    const { data: fetchedMetricsData, isLoading: metricsLoading } = useMetrics({
        projectId: selectedProjectId === 'all' ? undefined : selectedProjectId,
        teamId: selectedTeamId || undefined
    });
    const fetchedMetrics = fetchedMetricsData || EMPTY_ARRAY;

    const currentLevel = selectedTeamId ? 'team' 
        : (selectedProjectId && selectedProjectId !== 'all') ? 'project' 
        : 'none';

    const currentMetrics = useMemo(() => {
        let relevant = fetchedMetrics.filter((mt: any) => mt.source === 'manual');
        
        if (selectedTeamId) {
            relevant = relevant.filter((mt: any) => mt.teamId === selectedTeamId && !mt.userId);
        } else if (selectedProjectId !== 'all') {
            relevant = relevant.filter((mt: any) => mt.projectId === selectedProjectId && !mt.teamId && !mt.userId);
        } else {
            relevant = [];
        }

        const latestMetricsMap = new Map();
        relevant.forEach((mm: any) => {
            if (!latestMetricsMap.has(mm.metricType)) {
                latestMetricsMap.set(mm.metricType, { value: mm.value, id: mm.id });
            }
        });
        const displayMetrics: { metricId: string; value: number; id?: string }[] = [];
        Array.from(latestMetricsMap.entries()).forEach(([mType, data]: [string, any]) => {
            displayMetrics.push({ metricId: mType, value: data.value, id: data.id });
        });
        return displayMetrics;
    }, [fetchedMetrics, selectedTeamId, selectedProjectId]);

    const { data: dbMetricDefsData } = useMetricDefinitions();
    const dbMetricDefs = dbMetricDefsData || EMPTY_ARRAY;

    // Sprint metrics from the bulk-upload table
    const { data: allSprintMetrics } = useSprintMetrics();

    // Data Fence & Role
    const fence = useDataFence();
    const { role: CURRENT_USER_ROLE, user: AUTH_USER } = useRole();
    const currentUserId = AUTH_USER?.id || AUTH_USER?.user?.id || CREATOR_ID;

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
    // Resolve project IDs from team IDs via hierarchy (for TEAM_LEAD / TEAM where projectId is on the team, not user)
    const resolvedAllowedProjectIds = useMemo(() => {
        // If no fence or already has project IDs, use as-is
        if (!fence.isRestricted) return null;
        if (fence.allowedProjectIds && fence.allowedProjectIds.length > 0) return fence.allowedProjectIds;

        // If only team IDs are fenced, derive their projects from hierarchy
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
    };

    const handleTeamChange = (val: string) => {
        setSelectedTeamId(val);
    };

    const handleStartEdit = () => {
        const values: Record<string, number> = {};
        manualMetrics.forEach(def => {
            values[def.id] = def.min;
        });
        currentMetrics.forEach((m: any) => {
            if (m.metricId in values) {
                values[m.metricId] = m.value;
            }
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
        const metricsToSave = Object.entries(editingValues)
            .filter(([_, value]) => value !== undefined && value !== null && !isNaN(value))
            .map(([metricId, value]) => {
                const def = manualMetrics.find(d => d.id === metricId);
                const clampedValue = def ? Math.min(Math.max(value, def.min), def.max) : value;
                const team = availableTeams.find(t => t.id === selectedTeamId);
                const projectId = team?.projectId || (selectedProjectId !== 'all' ? selectedProjectId : '');
                return {
                    time: new Date().toISOString(),
                    teamId: selectedTeamId || null,
                    projectId: projectId || null,
                    metricType: metricId,
                    value: clampedValue,
                    unit: def?.type === 'percentage' ? '%' : def?.type === 'integer' ? 'qty' : 'pts',
                    source: 'manual' as const,
                    createdBy: currentUserId,
                    metadata: { 
                        manual: true, 
                        name: def?.name,
                        enteredByRole: CURRENT_USER_ROLE
                    }
                };
            });
        try {
            if (metricsToSave.length > 0) {
                await bulkCreateMetrics(metricsToSave);
            }
            setIsEditing(false);
            setEditingValues({});
            setEditingStrings({});
            toast.success('Metrics saved to database successfully');
        } catch (error) {
            toast.error('Failed to save metrics to database');
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

                <div className="flex items-end gap-2 ml-auto self-end pb-0.5">
                    {currentLevel !== 'none' && canEdit && !isEditing && (
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

            {currentLevel !== 'none' && (() => {
                const entitySprintData = (allSprintMetrics || [])
                    .filter((sm: any) => {
                        if (currentLevel === 'team') return sm.teamId === selectedTeamId;
                        if (currentLevel === 'project') return sm.projectId === selectedProjectId;
                        return false;
                    })
                    .sort((a: any, b: any) => a.sprintNumber - b.sprintNumber);

                if (entitySprintData.length === 0) return null;

                const selectedProject = liveProjects.find(p => p.id === selectedProjectId);
                const selectedTeam = availableTeams.find(t => t.id === selectedTeamId);
                const entityName = currentLevel === 'team' ? selectedTeam?.name : selectedProject?.name;

                return <SprintMetricsSection
                    memberSprintData={entitySprintData}
                    memberName={entityName || 'Selected Entity'}
                    userId={currentLevel === 'team' ? selectedTeamId : selectedProjectId}
                />;
            })()}

            {currentLevel !== 'none' && (
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

                                        {/* Removed Delete button as per request to show only standard metrics */}
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
            )}
        </div>
    );
}
