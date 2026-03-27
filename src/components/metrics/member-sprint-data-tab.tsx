'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutGrid, Users, User, Calendar, Save, Briefcase, Workflow, ShieldCheck, Info, X, TrendingUp, Save as SaveIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useOrgHierarchy } from '@/hooks/use-hierarchy';
import { useProjects } from '@/hooks/use-projects';
import { useEmployees } from '@/hooks/use-employees';
import { Project } from '@/lib/api/projects';
import { useDataFence, useRole } from '@/contexts/role-context';
import { useBulkCreateMetrics, useMetrics } from '@/hooks/use-metrics';

const DEFAULT_SPRINT_DATA = {
    stories_planned: 0,
    stories_delivered: 0,
    stories_added: 0,
    stories_removed: 0,
    stories_changed: 0,
    stories_accepted_by_po: 0,
    team_capacity_hours: 0,
    effort_spent_hours: 0,
    deployments_total: 0,
    deployments_failed: 0,
    builds_total: 0,
    builds_successful: 0,
    builds_failed: 0,
    qa_defects: 0,
    client_defects: 0,
    defects_rejected: 0,
    defects_reopened: 0,
    review_comments: 0,
    test_cases_created: 0,
    automation_test_cases_created: 0,
    test_cases_planned: 0,
    test_cases_executed: 0,
    static_code_violations: 0,
    unit_test_coverage: 0,
    doc_coverage_percentage: 0,
    review_cycle_hrs: 0,
    mttr_hours: 0,
    team_members: 0,
    productivity: 0
};

const METRIC_METADATA: Record<string, { label: string; unit: string }> = {
    stories_planned: { label: 'Stories Planned', unit: 'pts' },
    stories_delivered: { label: 'Stories Delivered', unit: 'pts' },
    stories_added: { label: 'Stories Added', unit: 'pts' },
    stories_removed: { label: 'Stories Removed', unit: 'pts' },
    stories_changed: { label: 'Stories Changed', unit: 'pts' },
    stories_accepted_by_po: { label: 'Stories Accepted (PO)', unit: 'pts' },
    team_capacity_hours: { label: 'Team Capacity (Hours)', unit: 'hrs' },
    effort_spent_hours: { label: 'Effort Spent (Hours)', unit: 'hrs' },
    deployments_total: { label: 'Total Deployments', unit: 'qty' },
    deployments_failed: { label: 'Failed Deployments', unit: 'qty' },
    builds_total: { label: 'Total Builds', unit: 'qty' },
    builds_successful: { label: 'Successful Builds', unit: 'qty' },
    builds_failed: { label: 'Failed Builds', unit: 'qty' },
    qa_defects: { label: 'QA Defects', unit: 'bug' },
    client_defects: { label: 'Client Defects', unit: 'bug' },
    defects_rejected: { label: 'Defects Rejected', unit: 'bug' },
    defects_reopened: { label: 'Defects Reopened', unit: 'bug' },
    review_comments: { label: 'Review Comments', unit: 'qty' },
    test_cases_created: { label: 'Test Cases Created', unit: 'qty' },
    automation_test_cases_created: { label: 'Auto Tests Created', unit: 'qty' },
    test_cases_planned: { label: 'Test Cases Planned', unit: 'qty' },
    test_cases_executed: { label: 'Test Cases Executed', unit: 'qty' },
    static_code_violations: { label: 'Static Violations', unit: 'qty' },
    unit_test_coverage: { label: 'UT Coverage (%)', unit: '%' },
    doc_coverage_percentage: { label: 'Doc Coverage (%)', unit: '%' },
    review_cycle_hrs: { label: 'Review Cycle (Hrs)', unit: 'hrs' },
    mttr_hours: { label: 'MTTR (Hours)', unit: 'hrs' },
    team_members: { label: 'Team Member Count', unit: 'qty' },
    productivity: { label: 'Team Productivity', unit: 'ratio' }
};

const CREATOR_ID = '33333333-3333-4333-8333-333333330001'; // Default system creator

export function MemberSprintDataTab() {
    const fence = useDataFence();
    const { data: hierarchy } = useOrgHierarchy();
    const { data: fetchedProjects = [] } = useProjects();
    const { mutateAsync: bulkCreateMetrics } = useBulkCreateMetrics();
    const { data: liveEmployeesData = [] } = useEmployees();
    const liveEmployees = liveEmployeesData;

    // Selectors
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');
    const [selectedMemberId, setSelectedMemberId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // Data
    const [sprintData, setSprintData] = useState<typeof DEFAULT_SPRINT_DATA>(DEFAULT_SPRINT_DATA);

    // Derived State
    const allProjects = useMemo(() => {
        if (!fence.isRestricted) return fetchedProjects;
        return fetchedProjects.filter((p: any) => 
            fence.allowedProjectIds?.includes(p.id) || 
            (fence as any).allowedProjectIds?.includes(p.id)
        );
    }, [fetchedProjects, fence]);

    const selectedProjectObj = allProjects.find(p => p.id === selectedProjectId);
    const projectTeams = (selectedProjectObj as any)?.teams || [];

    // Filtered members based on selection
    const projectMembers = useMemo(() => {
        if (!selectedProjectId) return [];
        
        const projectTeamIds = projectTeams.map((t: any) => t.id);
        
        return liveEmployees.filter((emp: any) => {
            // Check direct match OR via project's teams
            const matchesProject = emp.projectId === selectedProjectId || 
                                 emp.user?.projectId === selectedProjectId ||
                                 projectTeamIds.includes(emp.teamId) ||
                                 emp.teamMembers?.some((tm: any) => projectTeamIds.includes(tm.teamId)) ||
                                 emp.teams?.some((t: any) => t.projectId === selectedProjectId);
            
            if (!matchesProject) return false;
            
            // Further filter by team if selected
            if (selectedTeamId) {
                return (emp.teamId === selectedTeamId || 
                        emp.user?.teamId === selectedTeamId ||
                        emp.teamMembers?.some((tm: any) => tm.teamId === selectedTeamId));
            }
            
            return true;
        });
    }, [selectedProjectId, selectedTeamId, liveEmployees, projectTeams]);
    
    // ─── Fetch and Sync Existing Data ──────────────────────────────────────────
    const { data: existingUserMetrics, isLoading: metricsLoading } = useMetrics(
        selectedMemberId ? { 
            userId: selectedMemberId, 
            projectId: selectedProjectId,
            limit: 100 // Get enough to cover all metric types
        } : undefined
    );

    useEffect(() => {
        if (selectedMemberId === 'TEAM_LEVEL' && selectedTeamId && selectedProjectId) {
            handleCalculateFromMembers();
        } else if (selectedMemberId && selectedMemberId !== 'TEAM_LEVEL' && existingUserMetrics && existingUserMetrics.length > 0) {
            const newData = { ...DEFAULT_SPRINT_DATA };
            const seen = new Set();
            existingUserMetrics.forEach((m: any) => {
                if (Object.keys(newData).includes(m.metricType) && !seen.has(m.metricType)) {
                    (newData as any)[m.metricType] = Number(m.value) || 0;
                    seen.add(m.metricType);
                }
            });
            setSprintData(newData);
        } else if (selectedMemberId) {
            setSprintData(DEFAULT_SPRINT_DATA);
        }
    }, [existingUserMetrics, selectedMemberId, selectedTeamId, selectedProjectId]);

    const handleProjectChange = (val: string) => {
        setSelectedProjectId(val);
        setSelectedTeamId('');
        setSelectedMemberId('');
    };

    const handleTeamChange = (val: string) => {
        setSelectedTeamId(val);
        setSelectedMemberId('');
    };

    const handleCalculateFromMembers = async () => {
        if (!selectedProjectId || !selectedTeamId) return;

        toast.loading('Finding and aggregating team data...', { id: 'agg-loading' });

        try {
            // Fetch all manual metrics for this team on this project for the selected date
            const response = await fetch(`/api/v1/metrics?projectId=${selectedProjectId}&teamId=${selectedTeamId}&source=manual`);
            const metrics = await response.json();

            // Filter for the specific date on client side since backend doesn't support date filter in findAll
            const targetDate = new Date(selectedDate).toISOString().split('T')[0];
            const dateMetrics = metrics.filter((m: any) => m.time.startsWith(targetDate) && m.userId !== null);

            if (dateMetrics.length === 0) {
                toast.error('No member data found for this team on selected date', { id: 'agg-loading' });
                // We don't reset to zero here to allow manual entry if no member data exists
                return;
            }

            const totals: any = { ...DEFAULT_SPRINT_DATA };
            Object.keys(totals).forEach(k => totals[k] = 0);

            const avgFields = ['unit_test_coverage', 'doc_coverage_percentage', 'review_cycle_hrs', 'mttr_hours', 'productivity'];
            const counts: Record<string, number> = {};

            dateMetrics.forEach((m: any) => {
                if (Object.keys(totals).includes(m.metricType)) {
                    totals[m.metricType] += Number(m.value) || 0;
                    counts[m.metricType] = (counts[m.metricType] || 0) + 1;
                }
            });

            avgFields.forEach(field => {
                if (counts[field]) totals[field] = totals[field] / counts[field];
            });

            setSprintData(totals);
            toast.success(`Aggregated data from ${new Set(dateMetrics.map((m: any) => m.userId)).size} members`, { id: 'agg-loading' });
        } catch (error) {
            console.error('Aggregation failed:', error);
            toast.error('Failed to fetch team data', { id: 'agg-loading' });
        }
    };

    const handleSave = async () => {
        if (!selectedProjectId || !selectedMemberId) {
            toast.error('Please select both a project and a target context');
            return;
        }

        const isTeamLevel = selectedMemberId === 'TEAM_LEVEL';

        const metricsToSave = Object.entries(sprintData).map(([key, value]) => {
            const teamId = selectedTeamId || (selectedProjectObj as any)?.teams?.[0]?.id;
            return {
                time: new Date(selectedDate).toISOString(),
                projectId: selectedProjectId,
                teamId: teamId || undefined,
                userId: isTeamLevel ? null : selectedMemberId,
                metricType: key,
                value: Number(value),
                unit: METRIC_METADATA[key]?.unit || 'qty',
                source: 'manual' as const,
                createdBy: CREATOR_ID,
                metadata: { 
                    manual: true, 
                    level: isTeamLevel ? 'team' : 'member',
                    projectName: selectedProjectObj?.name,
                    memberName: isTeamLevel ? 'Entire Team' : (projectMembers.find((m: any) => m.id === selectedMemberId)?.fullName || 
                                projectMembers.find((m: any) => m.id === selectedMemberId)?.user?.fullName)
                }
            };
        });

        try {
            await bulkCreateMetrics(metricsToSave);
            toast.success(`Successfully saved ${metricsToSave.length} data points ${isTeamLevel ? 'for the entire team' : 'for the member'}`);
        } catch (error) {
            console.error('Save failed:', error);
            toast.error('Failed to save metrics to database');
        }
    };

    return (
        <TooltipProvider>
            <div className="space-y-8 max-w-7xl mx-auto pb-20">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black tracking-tight text-gradient">Member Sprint Data</h2>
                        <p className="text-muted-foreground font-medium">Record detailed sprint quantities for individual team members.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10">
                            <Calendar className="h-4 w-4 text-primary" />
                            <Input 
                                type="date" 
                                className="bg-transparent border-none p-0 h-auto text-sm font-bold w-32 focus-visible:ring-0" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        {selectedMemberId === 'TEAM_LEVEL' && (
                            <Button 
                                variant="outline" 
                                onClick={handleCalculateFromMembers} 
                                className="h-10 rounded-2xl gap-2 px-6 font-bold border-primary/20 text-primary hover:bg-primary/5 transition-all"
                            >
                                <TrendingUp className="h-4 w-4" />
                                Find Team Values
                            </Button>
                        )}
                        <Button onClick={handleSave} className="h-10 rounded-2xl gap-2 px-6 font-bold shadow-lg bg-primary text-white">
                            <SaveIcon className="h-4 w-4" />
                            Save to Database
                        </Button>
                    </div>
                </div>

                {/* Selectors Card */}
                <Card className="rounded-[2.5rem] border-none bg-muted/20 shadow-inner overflow-hidden">
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Project Selection */}
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Project Selector</Label>
                                <Select value={selectedProjectId} onValueChange={handleProjectChange}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-background border-border/50 font-bold transition-all hover:bg-muted/50">
                                        <div className="flex items-center gap-3 text-left">
                                            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                                                <Briefcase className="h-4 w-4" />
                                            </div>
                                            <SelectValue placeholder="Choose a project..." />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        {allProjects.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Team Selection */}
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Team Selector</Label>
                                <Select value={selectedTeamId} onValueChange={handleTeamChange} disabled={!selectedProjectId}>
                                    <SelectTrigger className={cn("h-14 rounded-2xl bg-background border-border/50 font-bold transition-all", selectedProjectId ? "hover:bg-muted/50" : "opacity-50")}>
                                        <div className="flex items-center gap-3 text-left">
                                            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                                                <Workflow className="h-4 w-4" />
                                            </div>
                                            <SelectValue placeholder="Select Team..." />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        {projectTeams.map((t: any) => (
                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                        ))}
                                        {projectTeams.length === 0 && <SelectItem value="none" disabled>No teams found</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Member Selection */}
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Target Member</Label>
                                <Select value={selectedMemberId} onValueChange={setSelectedMemberId} disabled={!selectedProjectId}>
                                    <SelectTrigger className={cn("h-14 rounded-2xl bg-background border-border/50 font-bold transition-all", selectedProjectId ? "hover:bg-muted/50" : "opacity-50")}>
                                        <div className="flex items-center gap-3 text-left">
                                            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-500">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <SelectValue placeholder="Choose a member..." />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="TEAM_LEVEL" className="font-black text-primary italic">
                                            <span className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-primary" />
                                                Entire Team (Collective)
                                            </span>
                                        </SelectItem>
                                        {projectMembers.map((m: any) => {
                                            const name = m.fullName || m.user?.fullName || 'Unknown';
                                            return (
                                                <SelectItem key={m.id} value={m.id}>
                                                    <span className="flex items-center gap-2">
                                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/10 text-[9px] font-bold text-violet-500">
                                                            {name.charAt(0)}
                                                        </span>
                                                        {name}
                                                    </span>
                                                </SelectItem>
                                            );
                                        })}
                                        {projectMembers.length === 0 && <SelectItem value="none" disabled>No members found</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Grid Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {!selectedProjectId || !selectedMemberId ? (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center animate-pulse">
                                <Users className="h-10 w-10 text-muted-foreground/30" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-bold">Waiting for Selection</h4>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto">Please select a project and a target member above to start entering sprint data.</p>
                            </div>
                        </div>
                    ) : (
                        Object.entries(sprintData).map(([key, value]) => (
                            <Card key={key} className="rounded-3xl border border-border/10 bg-card hover:border-primary/30 transition-all group overflow-hidden shadow-md">
                                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 group-hover:text-primary transition-colors">
                                        {METRIC_METADATA[key]?.label || key.replace(/_/g, ' ')}
                                    </Label>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="h-3 w-3 text-muted-foreground opacity-20 hover:opacity-100" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="rounded-xl p-3 max-w-xs">
                                            <p className="text-xs font-semibold">Standard Unit: {METRIC_METADATA[key]?.unit}</p>
                                            <p className="text-[10px] opacity-70 mt-1">This value helps calculate derived performance metrics for this specific member.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={value as number}
                                            onChange={(e) => setSprintData(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                                            className="h-12 rounded-2xl bg-muted/30 border-none font-black text-xl tabular-nums focus-visible:ring-primary/20 text-center"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30 select-none">
                                            {METRIC_METADATA[key]?.unit}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
                
                {/* Footer Summary */}
                {selectedProjectId && selectedMemberId && (
                    <div className="sticky bottom-8 left-0 right-0 max-w-2xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-background/80 backdrop-blur-xl border border-primary/20 p-4 rounded-3xl shadow-2xl flex items-center justify-between">
                            <div className="flex items-center gap-4 px-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-black uppercase tracking-widest text-primary/70">Recording for</span>
                                    <span className="text-sm font-bold truncate max-w-[180px]">
                                        {projectMembers.find((m: any) => m.id === selectedMemberId)?.fullName || 
                                         projectMembers.find((m: any) => m.id === selectedMemberId)?.user?.fullName}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="h-8 rounded-xl bg-primary/5 text-primary border-primary/20 font-bold px-4">
                                    {Object.keys(sprintData).length} Metrics Active
                                </Badge>
                                <Button onClick={handleSave} className="rounded-2xl h-10 px-8 font-black uppercase tracking-widest text-[10px] shadow-lg">
                                    Sync Data
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
