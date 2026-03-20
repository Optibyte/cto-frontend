'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger
} from '@/components/ui/dialog';
import {
    Tabs, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    Plus,
    Loader2,
    Check,
    Target,
    Layers,
    Workflow,
    Info,
    Search,
    ChevronRight,
    Settings2,
    ShieldCheck,
    Cpu,
    Briefcase,
    Building2,
    CheckCircle2,
    X,
    Lock,
    Clock,
    Percent,
    Hash,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    TrendingDown,
    Minus,
    Activity,
    Pencil,
    Save
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Project } from '@/lib/api/projects';

// ─── Sprint Input Data ──────────────────────────────────────────────────────
const DEFAULT_SPRINT_DATA = {
    stories_planned: 20,
    stories_delivered: 18,
    stories_added: 3,
    stories_removed: 1,
    stories_changed: 2,
    stories_accepted_by_po: 17,
    employee_capacity_hours: 160,
    effort_spent_hours: 148,
    qa_defects: 5,
    client_defects: 2,
    defects_rejected: 1,
    defects_reopened: 1,
    review_comments: 12,
    test_cases_created: 25,
    automation_test_cases_created: 10,
    test_cases_planned: 30,
    test_cases_executed: 28,
    static_code_violations: 4,
    unit_test_coverage: 82,
    deployments_total: 12,
    deployments_failed: 1,
    builds_total: 45,
    builds_failed: 2,
    mttr_hours: 4.5,
    doc_coverage_percentage: 65,
    review_cycle_hrs: 18.5
};

// ─── Metric Calculations ────────────────────────────────────────────────────
function computeMetrics(d: typeof SPRINT_DATA) {
    const productivity         = +(d.stories_accepted_by_po / d.employee_capacity_hours).toFixed(3);
    const doneToSaidRatio      = +((d.stories_delivered / d.stories_planned) * 100).toFixed(2);
    const sprintVelocity       = d.stories_delivered; // story points delivered (raw value)
    const defectDensity        = +((d.review_comments + d.qa_defects) / d.stories_delivered).toFixed(3);
    const defectLeakage        = +((d.client_defects / (d.qa_defects + d.client_defects)) * 100).toFixed(2);
    const resourceUtilization  = +((d.effort_spent_hours / d.employee_capacity_hours) * 100).toFixed(2);
    const reqStabilityIndex    = +((d.stories_added + d.stories_removed + d.stories_changed) / d.stories_planned * 100).toFixed(2);
    const testExecutionRate    = +((d.test_cases_executed / d.test_cases_planned) * 100).toFixed(2);
    const unitTestCoverage     = d.unit_test_coverage;
    const automationCoverage   = +((d.automation_test_cases_created / d.test_cases_created) * 100).toFixed(2);

    const deployFrequency    = d.deployments_total;
    const changeFailureRate  = +((d.deployments_failed / d.deployments_total) * 100).toFixed(2);
    const buildSuccessRate   = +(((d.builds_total - d.builds_failed) / d.builds_total) * 100).toFixed(2);
    const mttrValue          = d.mttr_hours;
    const docCoverage        = d.doc_coverage_percentage;
    const reviewCycle        = d.review_cycle_hrs;

    return {
        hours: [
            {
                id: 'effort_spent',
                name: 'Effort Spent',
                value: d.effort_spent_hours,
                unit: 'hrs',
                target: d.employee_capacity_hours,
                targetLabel: `Target: ${d.employee_capacity_hours} hrs`,
                formula: 'effort_spent_hours',
                higherIsBetter: true,
                threshold: 140,
                description: 'Total hours spent by team this sprint',
            },
            {
                id: 'capacity_used',
                name: 'Capacity Used',
                value: d.employee_capacity_hours - d.effort_spent_hours,
                unit: 'hrs remaining',
                target: 0,
                targetLabel: `Spent: ${d.effort_spent_hours} of ${d.employee_capacity_hours} hrs`,
                formula: 'employee_capacity_hours − effort_spent_hours',
                higherIsBetter: false,
                threshold: 20,
                description: 'Remaining hours from sprint capacity',
            },
            {
                id: 'mttr',
                name: 'Mean Time to Recover',
                value: mttrValue,
                unit: 'hrs',
                targetLabel: 'Target ≤ 5 hrs',
                formula: 'avg_mttr_hours',
                higherIsBetter: false,
                threshold: 5,
                description: 'Average time to restore service after failure',
            },
            {
                id: 'review_cycle',
                name: 'Review Cycle Time',
                value: reviewCycle,
                unit: 'hrs',
                targetLabel: 'Goal ≤ 24 hrs',
                formula: 'avg_review_turnaround_hrs',
                higherIsBetter: false,
                threshold: 24,
                description: 'Average time to complete a code review',
            },
        ],
        percentage: [
            {
                id: 'done_to_said',
                name: 'Done to Said Ratio',
                value: doneToSaidRatio,
                unit: '%',
                targetLabel: 'Target ≥ 90%',
                formula: 'stories_delivered / stories_planned × 100',
                higherIsBetter: true,
                threshold: 90,
                description: 'Stories delivered vs planned',
            },
            {
                id: 'defect_leakage',
                name: 'Defect Leakage',
                value: defectLeakage,
                unit: '%',
                targetLabel: 'Target ≤ 5%',
                formula: 'client_defects / (qa_defects + client_defects) × 100',
                higherIsBetter: false,
                threshold: 5,
                description: 'Defects that escaped QA to client',
            },
            {
                id: 'resource_utilization',
                name: 'Resource Utilization',
                value: resourceUtilization,
                unit: '%',
                targetLabel: 'Target ≤ 95%',
                formula: 'effort_spent_hours / employee_capacity_hours × 100',
                higherIsBetter: true,
                threshold: 95,
                description: 'Team effort vs total capacity',
            },
            {
                id: 'req_stability',
                name: 'Requirement Stability Index',
                value: reqStabilityIndex,
                unit: '%',
                targetLabel: 'Target ≤ 10%',
                formula: '(added + removed + changed) / stories_planned × 100',
                higherIsBetter: false,
                threshold: 10,
                description: 'Scope churn relative to planned stories',
            },
            {
                id: 'test_execution',
                name: 'Test Execution Rate',
                value: testExecutionRate,
                unit: '%',
                targetLabel: 'Target ≥ 95%',
                formula: 'test_cases_executed / test_cases_planned × 100',
                higherIsBetter: true,
                threshold: 95,
                description: 'Test cases executed vs planned',
            },
            {
                id: 'unit_test_coverage',
                name: 'Unit Test Coverage',
                value: unitTestCoverage,
                unit: '%',
                targetLabel: 'Target ≥ 80%',
                formula: 'unit_test_coverage (direct input)',
                higherIsBetter: true,
                threshold: 80,
                description: 'Code covered by unit tests',
            },
            {
                id: 'automation_coverage',
                name: 'Automation Coverage',
                value: automationCoverage,
                unit: '%',
                targetLabel: 'Target ≥ 50%',
                formula: 'automation_test_cases_created / test_cases_created × 100',
                higherIsBetter: true,
                threshold: 50,
                description: 'Test cases covered by automation',
            },
            {
                id: 'build_success',
                name: 'Build Success Rate',
                value: buildSuccessRate,
                unit: '%',
                targetLabel: 'Target ≥ 98%',
                formula: 'successful_builds / total_builds × 100',
                higherIsBetter: true,
                threshold: 95,
                description: 'Percentage of successful CI builds',
            },
            {
                id: 'change_failure',
                name: 'Change Failure Rate',
                value: changeFailureRate,
                unit: '%',
                targetLabel: 'Target ≤ 10%',
                formula: 'failed_deploys / total_deploys × 100',
                higherIsBetter: false,
                threshold: 10,
                description: 'Percentage of deployments causing failure',
            },
            {
                id: 'doc_coverage',
                name: 'Documentation Coverage',
                value: docCoverage,
                unit: '%',
                targetLabel: 'Target ≥ 80%',
                formula: 'documented_apis / total_apis × 100',
                higherIsBetter: true,
                threshold: 80,
                description: 'API and code documentation coverage',
            },
        ],
        value: [
            {
                id: 'productivity',
                name: 'Productivity',
                value: productivity,
                unit: 'ratio',
                targetLabel: 'Target ≥ 0.085',
                formula: 'stories_accepted_by_po / employee_capacity_hours',
                higherIsBetter: true,
                threshold: 0.085,
                description: 'Stories accepted per capacity hour',
            },
            {
                id: 'sprint_velocity',
                name: 'Sprint Velocity',
                value: sprintVelocity,
                unit: 'stories',
                targetLabel: 'Target ≥ 18',
                formula: 'stories_delivered',
                higherIsBetter: true,
                threshold: 18,
                description: 'Total stories delivered this sprint',
            },
            {
                id: 'defect_density',
                name: 'Defect Density',
                value: defectDensity,
                unit: 'defects/story',
                targetLabel: 'Target ≤ 2',
                formula: '(review_comments + qa_defects) / stories_delivered',
                higherIsBetter: false,
                threshold: 2,
                description: 'Defects & review issues per story',
            },
            {
                id: 'deploy_frequency',
                name: 'Deployment Frequency',
                value: deployFrequency,
                unit: 'deploys',
                targetLabel: 'Target ≥ 10',
                formula: 'total_deployments',
                higherIsBetter: true,
                threshold: 10,
                description: 'Total successful deployments to production',
            },
        ],
    };
}

function getStatus(metric: { value: number; threshold: number; higherIsBetter: boolean }) {
    const ratio = metric.higherIsBetter
        ? metric.value / metric.threshold
        : metric.threshold / metric.value;
    if (ratio >= 1) return 'good';
    if (ratio >= 0.85) return 'warn';
    return 'poor';
}

const STATUS_STYLES = {
    good: { badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400', icon: TrendingUp, barColor: 'bg-emerald-500' },
    warn: { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-400', icon: Minus, barColor: 'bg-amber-500' },
    poor: { badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30', dot: 'bg-rose-400', icon: TrendingDown, barColor: 'bg-rose-500' },
};

const UOM_GROUPS = [
    { key: 'hours' as const,      label: 'Hours',       icon: Clock,   color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',    accent: 'bg-blue-500' },
    { key: 'percentage' as const, label: 'Percentage',  icon: Percent, color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20', accent: 'bg-violet-500' },
    { key: 'value' as const,      label: 'Value',       icon: Hash,    color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20',    accent: 'bg-cyan-500' },
] as const;

import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { useProjects, useUpdateProject } from '@/hooks/use-projects';
import { useMetricDefinitions, useCreateMetricDefinition } from '@/hooks/use-metric-definitions';
import { useGlobalBaseline, useUpdateGlobalBaseline } from '@/hooks/use-metrics';
import { useDataFence } from '@/contexts/role-context';
import { toast } from 'sonner';

const EMPTY_ARRAY: any[] = [];

export function ProvisionMetricsTab() {
    const { data: hierarchy, isLoading: hierarchyLoading } = useOrgHierarchy();
    const { data: fetchedProjectsData, isLoading: projectsLoading } = useProjects();
    const fetchedProjects = fetchedProjectsData || EMPTY_ARRAY;
    const { data: existingDefinitionsData } = useMetricDefinitions();
    const existingDefinitions = existingDefinitionsData || EMPTY_ARRAY;
    const createMetricMutation = useCreateMetricDefinition();
    
    const { data: globalBaseline, isLoading: baselineLoading } = useGlobalBaseline();
    const saveBaselineMutation = useUpdateGlobalBaseline();
    const updateProjectMutation = useUpdateProject();

    // Data Fence — useProjects() already passes userId for restricted roles to the backend.
    // resolvedAllowedProjectIds is an extra frontend safety net for hybrid cases.
    const fence = useDataFence();

    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [projInitialized, setProjInitialized] = useState(false);
    
    const [projectSearchQuery, setProjectSearchQuery] = useState('');
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [step2Tab, setStep2Tab] = useState<'sprint' | 'library'>('sprint');
    const [sessionCustomMetrics, setSessionCustomMetrics] = useState<any[]>([]);
    const [isAddingCustom, setIsAddingCustom] = useState(false);
    const [inventoryProjectFilter, setInventoryProjectFilter] = useState<string>('all');
    const [inventoryAccountFilter, setInventoryAccountFilter] = useState<string>('all');
    const [inventorySearchQuery, setInventorySearchQuery] = useState('');

    const [customMetric, setCustomMetric] = useState({
        name: '',
        metricClass: 'B',
        threshold: '',
        description: '',
        unit: 'value',
        updateFrequency: 'Sprint'
    });

    const [sprintCategoryFilter, setSprintCategoryFilter] = useState<string>('all');

    const [sprintData, setSprintData] = useState<typeof DEFAULT_SPRINT_DATA>(DEFAULT_SPRINT_DATA);

    const computedMetrics = useMemo(() => computeMetrics(sprintData), [sprintData]);

    // Map Project ID -> Hierarchy Metadata (Market, Account)
    const projectMetadataMap = useMemo(() => {
        const map = new Map<string, { accountName: string; accountId: string; marketName: string }>();
        hierarchy?.markets.forEach(market => {
            market.accounts.forEach(acc => {
                acc.teams.forEach(t => {
                    if (t.project) {
                        map.set(t.project.id, {
                            accountName: acc.name,
                            accountId: acc.id,
                            marketName: market.name
                        });
                    }
                });
            });
        });
        return map;
    }, [hierarchy]);

    // Resolve allowed project IDs: use backend-filtered list + optional frontend fence override
    const resolvedAllowedProjectIds = useMemo(() => {
        if (!fence.isRestricted) return null;
        // If fence already has direct project IDs, use them
        if (fence.allowedProjectIds && fence.allowedProjectIds.length > 0) return fence.allowedProjectIds;
        // Derive from team IDs via hierarchy (for TEAM_LEAD who only has teamId on user record)
        if (fence.allowedTeamIds && hierarchy) {
            const pids: string[] = [];
            hierarchy.markets?.forEach((m: any) => {
                m.accounts?.forEach((a: any) => {
                    a.teams?.forEach((t: any) => {
                        if (fence.allowedTeamIds!.includes(t.id) && t.projectId && !pids.includes(t.projectId)) {
                            pids.push(t.projectId);
                        }
                    });
                });
            });
            return pids.length > 0 ? pids : null;
        }
        return null;
    }, [fence, hierarchy]);

    // Flatten all projects from useProjects (already server-fenced), enriched with hierarchy metadata
    const allProjects = useMemo(() => {
        let projects = fetchedProjects.map((p: Project) => {
            const meta = projectMetadataMap.get(p.id) || {
                accountName: 'Unassigned Account',
                accountId: '',
                marketName: 'Global'
            };
            return { ...p, ...meta };
        });
        // Extra frontend guard: apply resolvedAllowedProjectIds if backend couldn't filter
        if (resolvedAllowedProjectIds) {
            projects = projects.filter((p: any) => resolvedAllowedProjectIds.includes(p.id));
        }
        return projects;
    }, [fetchedProjects, projectMetadataMap, resolvedAllowedProjectIds]);

    const filteredProjects = allProjects.filter((p: any) =>
        p.name.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
        p.accountName.toLowerCase().includes(projectSearchQuery.toLowerCase())
    );

    // Role-based auto-selection: Set initial project if restricted and none selected
    useEffect(() => {
        if (!fence.isRestricted || allProjects.length === 0 || projInitialized) return;

        const isCurrentValid = allProjects.some(p => p.id === selectedProjectId);
        if (selectedProjectId === '' || !isCurrentValid) {
            setSelectedProjectId(allProjects[0].id);
            setProjInitialized(true);
        }
    }, [fence.isRestricted, allProjects, selectedProjectId, projInitialized]);

    // sync sprintData with global baseline from DB - merge with defaults to ensure all 26 fields exist
    useEffect(() => {
        if (globalBaseline) {
            setSprintData(prev => ({
                ...prev,
                ...globalBaseline
            }));
        }
    }, [globalBaseline]);

    const handleSaveGlobalBaseline = async () => {
        try {
            await saveBaselineMutation.mutateAsync(sprintData);
            toast.success("Baseline configuration saved globally");
        } catch (error) {
            toast.error("Failed to save baseline configuration");
        }
    };


    const toggleMetric = (id: string) => {
        setSelectedMetrics(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleProvision = async () => {
        if (!selectedProjectId) {
            toast.error('Please select a target project');
            return;
        }
        if (selectedMetrics.length === 0) {
            toast.error('Please select at least one metric to provision');
            return;
        }

        setIsProvisioning(true);
        try {
            const project = allProjects.find(p => p.id === selectedProjectId);
            const allAvailable = [
                ...Object.values(computedMetrics).flat(),
                ...existingDefinitions,
                ...sessionCustomMetrics
            ] as any[];
            const metricsToProvision = allAvailable.filter(m => selectedMetrics.includes(m.id));

            if (!project) throw new Error('Project not found');

            const promises = metricsToProvision.map(m => {
                const payload = {
                    name: m.name,
                    metricType: (m as any).metricType || m.id.replace(/-/g, '_'),
                    metricClass: (m as any).metricClass || 'B',
                    threshold: m.threshold || 0,
                    updateFrequency: 'Sprint',
                    rangeMin: 0,
                    rangeMax: 100,
                    accountId: project.accountId,
                    accountName: project.accountName,
                    marketName: project.marketName,
                    projectId: project.id,
                    projectName: project.name,
                    parameters: sprintData,
                };
                return createMetricMutation.mutateAsync(payload);
            });

            await Promise.all(promises);
            toast.success(`Successfully provisioned ${selectedMetrics.length} metrics to ${project.name}`);
            setSelectedMetrics([]);
            setSelectedProjectId('');
        } catch (error) {
            console.error('Provisioning failed', error);
            toast.error('Failed to provision some metrics. Please check logs.');
        } finally {
            setIsProvisioning(false);
        }
    };

    const classColors: Record<string, any> = {
        A: { 
            text: 'text-rose-500', 
            bg: 'bg-rose-500/10 border-rose-500/20',
            glow: 'shadow-rose-500/5',
            badge: 'bg-rose-500/15 text-rose-500 border-rose-500/30'
        },
        B: { 
            text: 'text-amber-500', 
            bg: 'bg-amber-500/10 border-amber-500/20',
            glow: 'shadow-amber-500/5',
            badge: 'bg-amber-500/15 text-amber-500 border-amber-500/30'
        },
        C: { 
            text: 'text-emerald-500', 
            bg: 'bg-emerald-500/10 border-emerald-500/20',
            glow: 'shadow-emerald-500/5',
            badge: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
        },
    };

    const selectedProjectObj = allProjects.find(p => p.id === selectedProjectId);

    const filteredInventory = useMemo(() => {
        return existingDefinitions.filter((item: any) => {
            const matchesProject = inventoryProjectFilter === 'all' || item.projectId === inventoryProjectFilter;
            const matchesAccount = inventoryAccountFilter === 'all' || item.accountName === inventoryAccountFilter;
            const matchesSearch = item.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) || 
                                 item.metricType.toLowerCase().includes(inventorySearchQuery.toLowerCase());
            return matchesProject && matchesAccount && matchesSearch;
        });
    }, [existingDefinitions, inventoryProjectFilter, inventoryAccountFilter, inventorySearchQuery]);

    const uniqueInventoryAccounts = useMemo(() => {
        const accounts = new Set<string>();
        existingDefinitions.forEach((d: any) => {
            if (d.accountName) accounts.add(d.accountName);
        });
        return Array.from(accounts).sort();
    }, [existingDefinitions]);

    const uniqueInventoryProjects = useMemo(() => {
        const projects = new Map<string, string>();
        existingDefinitions.forEach((d: any) => {
            if (d.projectId && d.projectName) projects.set(d.projectId, d.projectName);
        });
        return Array.from(projects.entries()).sort((a, b) => a[1].localeCompare(b[1]));
    }, [existingDefinitions]);

    if (hierarchyLoading || projectsLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground font-bold animate-pulse">Initializing Provisioning System...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Data Fence Banner */}
            {fence.isRestricted && (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Lock className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-bold">
                        {(fence as any).fenceLabel || '🔒 Showing only your assigned projects'}
                    </span>
                </div>
            )}
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-muted/20 p-8 rounded-[2.5rem] border border-border/50 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck className="h-40 w-40" />
                </div>
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <Cpu className="h-6 w-6" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight">Provision Metrics</h2>
                    </div>
                    <p className="text-muted-foreground max-w-lg font-medium">
                        Standardize project performance by provisioning pre-defined metric blueprints to your target project.
                    </p>
                </div>

                <div className="relative z-10 flex flex-col gap-2 min-w-[200px] text-right">
                    <div className="flex flex-col items-end">
                        <span className="text-4xl font-black text-primary">{selectedProjectId ? 1 : 0}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Target Project Selected</span>
                    </div>
                </div>
            </div>



            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-12">
                    {/* Step 1: Project Selection */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                    <Briefcase className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-bold">1. Select Target Project</h3>
                                {selectedProjectId && (
                                    <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-primary/20">Selected</Badge>
                                )}
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search projects..."
                                    className="pl-9 rounded-xl border-border/50 bg-background/50 h-10"
                                    value={projectSearchQuery}
                                    onChange={(e) => setProjectSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                            {filteredProjects.map(project => (
                                <div
                                    key={project.id}
                                    onClick={() => setSelectedProjectId(project.id === selectedProjectId ? '' : project.id)}
                                    className={cn(
                                        "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group",
                                        selectedProjectId === project.id
                                            ? "bg-primary/10 border-primary shadow-sm"
                                            : "bg-card/40 border-border/50 hover:bg-muted/50"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm",
                                            selectedProjectId === project.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                        )}>
                                            {project.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold truncate max-w-[150px]">{project.name}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase font-medium">{project.accountName}</span>
                                        </div>
                                    </div>
                                    {selectedProjectId === project.id ? (
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                    ) : (
                                        <div className="h-2 w-2 rounded-full bg-border group-hover:bg-primary/50 transition-colors" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Step 2: Select Metrics ───────────────────────────────────── */}
                    <div className="space-y-6 pt-10 border-t border-border/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">2. Select Metrics</h3>
                                    <Tabs value={step2Tab} onValueChange={(v: any) => setStep2Tab(v)} className="mt-1">
                                        <TabsList className="h-8 bg-muted/50 p-1 rounded-lg">
                                            <TabsTrigger value="sprint" className="text-[10px] px-3 py-1 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Sprint Metrics</TabsTrigger>
                                            <TabsTrigger value="library" className="text-[10px] px-3 py-1 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Metric Library (Inventory)</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {step2Tab === 'sprint' && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-8 rounded-lg gap-2 text-[10px] font-bold uppercase tracking-wider border-primary/20 hover:bg-primary/5">
                                                <Pencil className="h-3 w-3" />
                                                Edit Raw Data
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto rounded-[2rem]">
                                            <DialogHeader className="mb-4">
                                                <DialogTitle className="text-2xl font-black">Raw Sprint Data</DialogTitle>
                                                <DialogDescription className="font-medium">
                                                    Manually insert values to recalculate baseline metrics.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                {Object.entries(sprintData).map(([key, value]) => (
                                                    <div key={key} className="space-y-2">
                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-80 whitespace-nowrap overflow-hidden text-ellipsis block">
                                                            {key.replace(/_/g, ' ')}
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            value={value}
                                                            onChange={(e) => setSprintData(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                                                            className="h-10 rounded-xl bg-background/50 border-border/50 font-black tabular-nums"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-end pt-6 border-t border-border/10 mt-6">
                                                <DialogTrigger asChild>
                                                    <Button 
                                                        onClick={handleSaveGlobalBaseline}
                                                        className="rounded-xl gap-2 h-10 px-8 bg-primary text-white font-bold"
                                                    >
                                                        Apply & Save to DB
                                                    </Button>
                                                </DialogTrigger>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                                <Badge variant="secondary" className="rounded-full shadow-inner">{selectedMetrics.length} Selected</Badge>
                                {step2Tab === 'sprint' ? (
                                    <Select value={sprintCategoryFilter} onValueChange={setSprintCategoryFilter}>
                                        <SelectTrigger className="h-8 w-32 rounded-lg border-primary/20 bg-background/50 text-[10px] font-bold">
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {UOM_GROUPS.map(g => (
                                                <SelectItem key={g.key} value={g.key}>{g.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">Organizational Metric Inventory</span>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="h-8 rounded-lg gap-2 text-[10px] font-bold uppercase tracking-wider border-primary/20 hover:bg-primary/5"
                                            onClick={() => setIsAddingCustom(!isAddingCustom)}
                                        >
                                            <Plus className="h-3 w-3" />
                                            Define Custom
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isAddingCustom && step2Tab === 'library' && (
                            <div className="p-6 rounded-[2rem] border border-primary/20 bg-primary/5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    <span className="text-xs font-black uppercase tracking-widest text-primary">Quick Define Definition</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase ml-1 opacity-70">Metric Name</Label>
                                        <Input 
                                            placeholder="e.g. Code Stability" 
                                            className="h-10 rounded-xl bg-background/50 border-border/50"
                                            value={customMetric.name}
                                            onChange={e => setCustomMetric({...customMetric, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase ml-1 opacity-70">Unit</Label>
                                        <Input 
                                            placeholder="e.g. %, hrs, count" 
                                            className="h-10 rounded-xl bg-background/50 border-border/50"
                                            value={customMetric.unit}
                                            onChange={e => setCustomMetric({...customMetric, unit: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase ml-1 opacity-70">Threshold</Label>
                                        <Input 
                                            type="number"
                                            placeholder="80" 
                                            className="h-10 rounded-xl bg-background/50 border-border/50"
                                            value={customMetric.threshold}
                                            onChange={e => setCustomMetric({...customMetric, threshold: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase ml-1 opacity-70">Class</Label>
                                        <Select value={customMetric.metricClass} onValueChange={v => setCustomMetric({...customMetric, metricClass: v})}>
                                            <SelectTrigger className="h-10 rounded-xl bg-background/50 border-border/50 text-[11px] font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">Class A (Critical)</SelectItem>
                                                <SelectItem value="B">Class B (High)</SelectItem>
                                                <SelectItem value="C">Class C (Performance)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase ml-1 opacity-70">Frequency</Label>
                                        <Select value={customMetric.updateFrequency} onValueChange={v => setCustomMetric({...customMetric, updateFrequency: v})}>
                                            <SelectTrigger className="h-10 rounded-xl bg-background/50 border-border/50 text-[11px] font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Sprint">Sprint Based</SelectItem>
                                                <SelectItem value="Weekly">Weekly</SelectItem>
                                                <SelectItem value="Monthly">Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-4">
                                    <Button variant="ghost" size="sm" onClick={() => setIsAddingCustom(false)} className="rounded-xl text-[10px] font-bold">Cancel</Button>
                                    <Button 
                                        size="sm" 
                                        className="rounded-xl px-6 text-[10px] font-bold bg-primary text-white"
                                        onClick={() => {
                                            if(!customMetric.name) return toast.error("Metric name required");
                                            const newId = `custom-${Date.now()}`;
                                            const newMetric = {
                                                id: newId,
                                                name: customMetric.name,
                                                unit: customMetric.unit,
                                                threshold: parseFloat(customMetric.threshold) || 0,
                                                metricClass: customMetric.metricClass,
                                                updateFrequency: customMetric.updateFrequency,
                                                isCustom: true
                                            };
                                            setSessionCustomMetrics([...sessionCustomMetrics, newMetric]);
                                            toast.success("Definition added to workflow");
                                            setSelectedMetrics([...selectedMetrics, newId]);
                                            setIsAddingCustom(false);
                                            // Reset
                                            setCustomMetric({ name: '', metricClass: 'B', threshold: '', description: '', unit: 'value', updateFrequency: 'Sprint' });
                                        }}
                                    >Add to Workflow</Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-8">
                            {step2Tab === 'sprint' ? (
                                UOM_GROUPS
                                    .filter(g => sprintCategoryFilter === 'all' || g.key === sprintCategoryFilter)
                                    .map(group => {
                                        const metrics = computedMetrics[group.key];
                                    const GroupIcon = group.icon;
                                    return (
                                        <div key={group.key} className="space-y-4">
                                            {/* Group header */}
                                            <div className="flex items-center gap-2">
                                                <div className={cn('p-1.5 rounded-lg border', group.bg)}>
                                                    <GroupIcon className={cn('h-3.5 w-3.5', group.color)} />
                                                </div>
                                                <span className={cn('text-xs font-black uppercase tracking-widest', group.color)}>
                                                    {group.label}
                                                </span>
                                                <div className="h-px flex-1 bg-border/20" />
                                                <span className="text-[10px] text-muted-foreground font-bold">{metrics.length} metrics</span>
                                            </div>

                                            {/* Metric cards grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {metrics.map((m: any) => {
                                                    const isSelected = selectedMetrics.includes(m.id);
                                                    const status = getStatus(m);
                                                    const st = STATUS_STYLES[status];
                                                    const StatusIcon = st.icon;
                                                    
                                                    const barPct = group.key === 'hours'
                                                        ? Math.min(100, (m.value / sprintData.employee_capacity_hours) * 100)
                                                        : group.key === 'percentage'
                                                            ? Math.min(100, m.value)
                                                            : Math.min(100, (m.value / (m.threshold * 1.5)) * 100);

                                                    return (
                                                        <div
                                                            key={m.id}
                                                            onClick={() => toggleMetric(m.id)}
                                                            className={cn(
                                                                'relative p-5 rounded-[2rem] border transition-all duration-300 group cursor-pointer overflow-hidden',
                                                                isSelected
                                                                    ? 'bg-primary/10 border-primary shadow-xl scale-[1.02] ring-2 ring-primary/10'
                                                                    : 'bg-card/40 border-border/50 hover:border-primary/30 hover:bg-muted/30'
                                                            )}
                                                        >
                                                            {/* Selection indicator */}
                                                            {isSelected && (
                                                                <div className="absolute top-0 right-0 p-3">
                                                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                                                </div>
                                                            )}

                                                            {/* Header */}
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div className="flex flex-col gap-1">
                                                                    <p className="text-sm font-black leading-tight max-w-[140px]">{m.name}</p>
                                                                    <p className="text-[10px] text-muted-foreground font-medium line-clamp-1">{m.description}</p>
                                                                </div>
                                                            </div>

                                                            {/* Value & Status */}
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-baseline gap-1.5">
                                                                    <span className={cn('text-3xl font-black tabular-nums', {
                                                                        'text-emerald-500': status === 'good',
                                                                        'text-amber-500': status === 'warn',
                                                                        'text-rose-500': status === 'poor',
                                                                    })}>{m.value}</span>
                                                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{m.unit}</span>
                                                                </div>
                                                                <div className={cn('flex items-center gap-1 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase', st.badge)}>
                                                                    <StatusIcon className="h-2.5 w-2.5" />
                                                                    {status}
                                                                </div>
                                                            </div>

                                                            {/* Progress bar */}
                                                            <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden mb-3">
                                                                <div
                                                                    className={cn('h-full rounded-full transition-all duration-700', st.barColor)}
                                                                    style={{ width: `${barPct}%` }}
                                                                />
                                                            </div>

                                                            {/* Target label */}
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{m.targetLabel}</p>
                                                                <span className="text-[10px] text-primary font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">ƒ formula</span>
                                                            </div>

                                                            {/* Formula Tooltip */}
                                                            <div className="absolute inset-x-0 bottom-0 bg-primary/20 backdrop-blur-md px-4 py-2.5 text-[10px] text-primary-foreground font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-full group-hover:translate-y-0 border-t border-primary/20">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-black text-xs">ƒ</span>
                                                                    <code className="text-[9px]">{m.formula}</code>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[...existingDefinitions, ...sessionCustomMetrics].map((d: any) => {
                                            const isSelected = selectedMetrics.includes(d.id);
                                            return (
                                                <div
                                                    key={d.id}
                                                    onClick={() => toggleMetric(d.id)}
                                                    className={cn(
                                                        'relative p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer group',
                                                        isSelected
                                                            ? 'bg-primary/10 border-primary shadow-lg scale-[1.02]'
                                                            : 'bg-card/40 border-border/50 hover:border-primary/30'
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                                                                <Settings2 className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <p className="text-sm font-black">{d.name}</p>
                                                        </div>
                                                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                        <span>{d.updateFrequency || 'Sprint'}</span>
                                                        <span>·</span>
                                                        <span>Goal: {d.threshold} {d.unit || ''}</span>
                                                    </div>
                                                    {d.isCustom && (
                                                        <Badge className="absolute bottom-4 right-4 bg-primary/20 text-primary border-primary/20 text-[8px] uppercase">New Session Entry</Badge>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {[...existingDefinitions, ...sessionCustomMetrics].length === 0 && (
                                            <div className="col-span-full py-12 text-center border border-dashed border-border/50 rounded-[2.5rem] bg-muted/5">
                                                <p className="text-sm text-muted-foreground font-medium italic">No existing definitions found in library</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Provisioning Status Table ─────────────────────────────────────── */}
                    <div className="space-y-6 pt-12 border-t border-border/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
                                    <Layers className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Organizational Metric Inventory</h3>
                                    <p className="text-[11px] text-muted-foreground font-medium">
                                        View and manage all metrics currently provisioned across projects and accounts
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input 
                                        placeholder="Filter inventory..."
                                        className="h-9 w-48 pl-9 rounded-xl border-border/50 bg-background/50 text-[11px] font-medium"
                                        value={inventorySearchQuery}
                                        onChange={(e) => setInventorySearchQuery(e.target.value)}
                                    />
                                </div>
                                <Select value={inventoryAccountFilter} onValueChange={setInventoryAccountFilter}>
                                    <SelectTrigger className="h-9 w-40 rounded-xl border-border/50 bg-background/50 text-[11px] font-bold">
                                        <SelectValue placeholder="All Accounts" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Accounts</SelectItem>
                                        {uniqueInventoryAccounts.map(acc => (
                                            <SelectItem key={acc} value={acc}>{acc}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={inventoryProjectFilter} onValueChange={setInventoryProjectFilter}>
                                    <SelectTrigger className="h-9 w-48 rounded-xl border-border/50 bg-background/50 text-[11px] font-bold">
                                        <SelectValue placeholder="All Projects" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Projects</SelectItem>
                                        {uniqueInventoryProjects.map(([id, name]) => (
                                            <SelectItem key={id} value={id}>{name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Badge variant="outline" className="rounded-full bg-muted/30 border-border/50 font-mono text-[10px] h-9 px-3">
                                    {filteredInventory.length} Match
                                </Badge>
                            </div>
                        </div>

                        <div className="rounded-[2.5rem] border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent border-border/50">
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest pl-8 py-5">Metric Identity</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Target Project</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Class</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Frequency</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Threshold</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-right pr-8">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInventory.map((d: any) => (
                                        <TableRow key={d.id} className="border-border/10 hover:bg-primary/5 transition-colors group">
                                            <TableCell className="pl-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                        <Settings2 className="h-4 w-4 text-primary/70" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold tracking-tight">{d.name}</p>
                                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">ID: {d.metricType}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-foreground/80">{d.projectName || 'Global'}</span>
                                                    <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">{d.accountName || 'All Accounts'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className={cn('text-[9px] font-black rounded-sm border-0 h-5 px-1.5', classColors[d.metricClass]?.badge)}>
                                                    {d.metricClass}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-[11px] font-medium capitalize text-muted-foreground">{d.updateFrequency}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-sm font-black text-primary/80 tabular-nums">{d.threshold}{d.unit || '%'}</span>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 rounded-lg gap-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => {
                                                        if(!selectedMetrics.includes(d.id)) {
                                                            setSelectedMetrics([...selectedMetrics, d.id]);
                                                            toast.success("Metric added to current selection");
                                                        }
                                                    }}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    Select
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {existingDefinitions.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic text-xs">
                                                No provisioned metrics found in the global registry.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* Summary & Actions */}
                <div className="space-y-6">
                    <Card className="rounded-[2.5rem] border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl sticky top-24 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                        <CardHeader className="p-8 border-b border-border/10">
                            <CardTitle className="text-xl font-bold">Execution Plan</CardTitle>
                            <CardDescription>Setup metrics for your selected project</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {/* Selected Project Summary */}
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Target Project</Label>
                                {!selectedProjectId ? (
                                    <div className="p-6 rounded-2xl border border-dashed border-border/50 text-center text-xs text-muted-foreground italic bg-muted/5">
                                        No project selected
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                                                {selectedProjectObj?.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold">{selectedProjectObj?.name}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase">{selectedProjectObj?.accountName}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedProjectId('')} className="p-1 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Selected Metrics Summary */}
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Metrics to Provision ({selectedMetrics.length})</Label>
                                {selectedMetrics.length === 0 ? (
                                    <div className="p-4 rounded-2xl border border-dashed border-border/50 text-center text-xs text-muted-foreground italic bg-muted/5">
                                        No metrics selected
                                    </div>
                                ) : (
                                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 no-scrollbar">
                                        {selectedMetrics.map(id => {
                                             const allComputed = [
                                                 ...Object.values(computedMetrics).flat(),
                                                 ...existingDefinitions,
                                                 ...sessionCustomMetrics
                                             ] as any[];
                                             const m = allComputed.find(b => b.id === id);
                                            return (
                                                <div key={id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/50 text-xs font-bold animate-in slide-in-from-right-2 duration-200">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_5px_rgba(139,92,246,0.5)]" />
                                                        {m?.name}
                                                    </div>
                                                    <button onClick={() => toggleMetric(id)} className="text-muted-foreground hover:text-rose-500">
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-border/10 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 text-center group hover:border-primary/30 transition-colors">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 group-hover:text-primary transition-colors">New Definitions</p>
                                        <p className="text-3xl font-black text-primary">{selectedMetrics.length}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 text-center">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Est. Time</p>
                                        <p className="text-3xl font-black text-primary">~{(selectedMetrics.length * 0.2).toFixed(1)}s</p>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all font-bold text-lg disabled:opacity-50 disabled:grayscale"
                                    disabled={selectedMetrics.length === 0 || !selectedProjectId || isProvisioning}
                                    onClick={handleProvision}
                                >
                                    {isProvisioning ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Provisioning...
                                        </>
                                    ) : (
                                        <>
                                            Confirm Provisioning
                                            <ChevronRight className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </Button>

                                <p className="text-[10px] text-muted-foreground text-center font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    <Info className="h-3 w-3 text-primary" />
                                    This will create {selectedMetrics.length} definitions for {selectedProjectObj?.name || 'project'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
