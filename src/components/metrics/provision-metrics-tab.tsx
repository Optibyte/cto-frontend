'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
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
    X
} from 'lucide-react';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { useProjects } from '@/hooks/use-projects';
import { useMetricDefinitions, useCreateMetricDefinition } from '@/hooks/use-metric-definitions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Project } from '@/lib/api/projects';

const DEFAULT_BLUEPRINTS = [
    { 
        id: 'bp-1', 
        name: 'Productivity', 
        metricType: 'productivity', 
        metricClass: 'A', 
        threshold: 85, 
        updateFrequency: 'Sprint/Release', 
        description: 'Stories Accepted / Team Capacity Hours',
        isDefault: true 
    },
    { 
        id: 'bp-2', 
        name: 'Done to Said Ratio', 
        metricType: 'project_management', 
        metricClass: 'B', 
        threshold: 90, 
        updateFrequency: 'Sprint', 
        description: 'Stories Delivered / Stories Planned',
        isDefault: true 
    },
    { 
        id: 'bp-3', 
        name: 'Sprint Velocity', 
        metricType: 'productivity', 
        metricClass: 'A', 
        threshold: 80, 
        updateFrequency: 'Sprint', 
        description: 'Total Story Points Delivered',
        isDefault: true 
    },
    { 
        id: 'bp-4', 
        name: 'Defect Density', 
        metricType: 'quality', 
        metricClass: 'B', 
        threshold: 2, 
        updateFrequency: 'Sprint/Release', 
        description: '(Review Comments + QA Defects) / Stories Delivered',
        isDefault: true 
    },
    { 
        id: 'bp-5', 
        name: 'Defect Leakage', 
        metricType: 'quality', 
        metricClass: 'B', 
        threshold: 5, 
        updateFrequency: 'Sprint/Release', 
        description: 'Client Defects / (QA Defects + Client Defects) * 100',
        isDefault: true 
    },
    { 
        id: 'bp-6', 
        name: 'Resource Utilization', 
        metricType: 'project_management', 
        metricClass: 'C', 
        threshold: 95, 
        updateFrequency: 'Sprint/Release', 
        description: 'Effort Spent Hours / Team Capacity Hours * 100',
        isDefault: true 
    },
    { 
        id: 'bp-7', 
        name: 'Deployment Failure Rate', 
        metricType: 'build_release', 
        metricClass: 'A', 
        threshold: 1, 
        updateFrequency: 'Release', 
        description: 'Deployments Failed / Total Deployments * 100',
        isDefault: true 
    },
    { 
        id: 'bp-8', 
        name: 'Requirement Stability Index', 
        metricType: 'project_management', 
        metricClass: 'B', 
        threshold: 10, 
        updateFrequency: 'Sprint', 
        description: '(Added + Removed + Changed Items) / Planned Items',
        isDefault: true 
    },
    { 
        id: 'bp-9', 
        name: 'Build Success Rate', 
        metricType: 'build_release', 
        metricClass: 'A', 
        threshold: 98, 
        updateFrequency: 'Sprint/Release', 
        description: 'Successful Builds / Total Builds * 100',
        isDefault: true 
    },
];

export function ProvisionMetricsTab() {
    const { data: hierarchy, isLoading: hierarchyLoading } = useOrgHierarchy();
    const { data: fetchedProjects = [], isLoading: projectsLoading } = useProjects();
    const { data: existingDefinitions = [] } = useMetricDefinitions();
    const createMetricMutation = useCreateMetricDefinition();

    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [projectSearchQuery, setProjectSearchQuery] = useState('');
    const [metricSearchQuery, setMetricSearchQuery] = useState('');
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
    const [isProvisioning, setIsProvisioning] = useState(false);

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

    // Flatten all projects from useProjects, enriched with metadata from hierarchy if found
    const allProjects = useMemo(() => {
        return fetchedProjects.map((p: Project) => {
            const meta = projectMetadataMap.get(p.id) || {
                accountName: 'Unassigned Account',
                accountId: '',
                marketName: 'Global'
            };
            return {
                ...p,
                ...meta
            };
        });
    }, [fetchedProjects, projectMetadataMap]);

    const filteredProjects = allProjects.filter(p =>
        p.name.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
        p.accountName.toLowerCase().includes(projectSearchQuery.toLowerCase())
    );

    // Combine system defaults with unique existing definitions from the database
    const sourceMetrics = useMemo(() => {
        const unique = new Map();
        
        // Add defaults first
        DEFAULT_BLUEPRINTS.forEach(bp => unique.set(bp.name, bp));
        
        // Add existing definitions (database wins if names collide)
        existingDefinitions.forEach((d: any) => {
            if (!unique.has(d.name)) {
                unique.set(d.name, {
                    ...d,
                    isDefault: false
                });
            }
        });
        return Array.from(unique.values());
    }, [existingDefinitions]);

    const filteredBlueprints = sourceMetrics.filter(m =>
        m.name.toLowerCase().includes(metricSearchQuery.toLowerCase()) ||
        (m.metricType || '').toLowerCase().includes(metricSearchQuery.toLowerCase())
    );

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
            const metricsToProvision = sourceMetrics.filter(m => selectedMetrics.includes(m.id));

            if (!project) throw new Error('Project not found');

            const promises = metricsToProvision.map(m => {
                const payload = {
                    name: m.name, // Keep original name or use project-specific? User said "show like manual metrics", maybe they want to clone/assign
                    metricType: m.metricType || m.name.toLowerCase().replace(/\s+/g, '_'),
                    metricClass: m.metricClass,
                    threshold: m.threshold,
                    updateFrequency: m.updateFrequency,
                    rangeMin: m.rangeMin || 0,
                    rangeMax: m.rangeMax || 100,
                    accountId: project.accountId,
                    accountName: project.accountName,
                    marketName: project.marketName,
                    projectId: project.id,
                    projectName: project.name,
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

    if (hierarchyLoading || projectsLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground font-bold animate-pulse">Initializing Provisioning System...</p>
            </div>
        );
    }

    const selectedProjectObj = allProjects.find(p => p.id === selectedProjectId);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

                    {/* Step 2: Metric Selection */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-t border-border/10 pt-10">
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-bold">2. Select Metric Blueprints</h3>
                                <Badge variant="secondary" className="rounded-full shadow-inner">{selectedMetrics.length} Selected</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium -mt-4 ml-1">
                                Choose from standardized system templates or blueprints added from existing projects.
                            </p>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search blueprints..."
                                    className="pl-9 rounded-xl border-border/50 bg-background/50 h-10"
                                    value={metricSearchQuery}
                                    onChange={(e) => setMetricSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-10">
                            {/* System Defaults Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-2">
                                    <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[10px] tracking-widest uppercase">System Defaults</Badge>
                                    <div className="h-px flex-1 bg-border/30" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredBlueprints.filter(m => m.isDefault).map((m) => {
                                        const isSelected = selectedMetrics.includes(m.id);
                                        const styles = classColors[m.metricClass] || classColors.C;
                                        
                                        return (
                                            <div
                                                key={m.id}
                                                onClick={() => toggleMetric(m.id)}
                                                className={cn(
                                                    "group cursor-pointer p-5 rounded-[2rem] border transition-all duration-300 relative overflow-hidden",
                                                    isSelected
                                                        ? cn(styles.bg, "border-primary shadow-xl scale-[1.02] ring-2 ring-primary/20")
                                                        : "bg-card/40 border-border/50 hover:border-primary/30 hover:bg-muted/30"
                                                )}
                                            >
                                                <div className="flex items-start justify-between relative z-10">
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={cn(
                                                                "h-8 w-8 rounded-xl flex items-center justify-center transition-colors",
                                                                isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                                            )}>
                                                                {isSelected ? <Check className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
                                                            </div>
                                                            <Badge className="text-[8px] uppercase font-black rounded-lg border-0 bg-primary/20 text-primary">
                                                                SYSTEM TEMPLATE
                                                            </Badge>
                                                        </div>
                                                        
                                                        <div>
                                                            <h4 className="font-black text-lg leading-tight">{m.name}</h4>
                                                            <p className="text-xs text-muted-foreground font-medium mt-1 line-clamp-1">{m.description || 'Standard platform metric'}</p>
                                                        </div>

                                                        <div className="flex items-center gap-4 mt-2">
                                                            <div className="px-3 py-1.5 rounded-xl bg-background/40 border border-border/50">
                                                                <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Target</p>
                                                                <p className={cn("text-sm font-black", styles.text)}>{m.threshold}%</p>
                                                            </div>
                                                            <div className="px-3 py-1.5 rounded-xl bg-background/40 border border-border/50">
                                                                <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Cycle</p>
                                                                <p className="text-sm font-black capitalize">{m.updateFrequency}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Custom Metrics Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-2">
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black text-[10px] tracking-widest uppercase">Project Blueprints</Badge>
                                    <div className="h-px flex-1 bg-border/30" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredBlueprints.filter(m => !m.isDefault).map((m) => {
                                        const isSelected = selectedMetrics.includes(m.id);
                                        const styles = classColors[m.metricClass] || classColors.C;
                                        
                                        return (
                                            <div
                                                key={m.id}
                                                onClick={() => toggleMetric(m.id)}
                                                className={cn(
                                                    "group cursor-pointer p-5 rounded-[2rem] border transition-all duration-300 relative overflow-hidden",
                                                    isSelected
                                                        ? cn(styles.bg, "border-primary shadow-xl scale-[1.02] ring-2 ring-primary/20")
                                                        : "bg-card/40 border-border/50 hover:border-primary/30 hover:bg-muted/30"
                                                )}
                                            >
                                                <div className="flex items-start justify-between relative z-10">
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={cn(
                                                                "h-8 w-8 rounded-xl flex items-center justify-center transition-colors",
                                                                isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                                            )}>
                                                                {isSelected ? <Check className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
                                                            </div>
                                                            <Badge className={cn("text-[8px] uppercase font-black rounded-lg border-0", styles.badge)}>
                                                                CLASS {m.metricClass}
                                                            </Badge>
                                                        </div>
                                                        
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-black text-lg leading-tight">{m.name}</h4>
                                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Active Project Blueprint" />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground font-medium mt-1 line-clamp-1">{m.description || 'Custom defined metric blueprint'}</p>
                                                        </div>

                                                        <div className="flex items-center gap-4 mt-2">
                                                            <div className="px-3 py-1.5 rounded-xl bg-background/40 border border-border/50">
                                                                <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Target</p>
                                                                <p className={cn("text-sm font-black", styles.text)}>{m.threshold}%</p>
                                                            </div>
                                                            <div className="px-3 py-1.5 rounded-xl bg-background/40 border border-border/50">
                                                                <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Cycle</p>
                                                                <p className="text-sm font-black capitalize">{m.updateFrequency}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500/50 mb-1">Source</p>
                                                        <Badge variant="outline" className="text-[9px] font-black rounded-md bg-emerald-500/5 border-emerald-500/20 text-emerald-500 shadow-sm shadow-emerald-500/10">
                                                            {m.projectName?.split(' ').pop() || 'CUSTOM'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                                                )}
                                            </div>
                                        );
                                    })}
                                    {filteredBlueprints.filter(m => !m.isDefault).length === 0 && (
                                        <div className="col-span-full py-12 text-center border-2 border-dashed border-border/30 rounded-[2rem] bg-muted/5 opacity-50">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No custom project blueprints found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
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
                                            const m = sourceMetrics.find(b => b.id === id);
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
