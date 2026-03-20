'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Plus,
    FolderKanban,
    Users,
    Shield,
    Briefcase,
    UserCheck,
    User,
    Loader2,
    Calendar,
    Activity,
    Pencil,
    Zap,
} from 'lucide-react';
import { useProjects, useCreateProject, useUpdateProject } from '@/hooks/use-projects';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ProjectsPage() {
    const { data: projects = [], isLoading } = useProjects();
    const { mutate: createProject, isPending } = useCreateProject();
    const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();

    // Create dialog state
    const [open, setOpen] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [dtFlag, setDtFlag] = useState(false);
    const [dtStartDate, setDtStartDate] = useState('');
    const [dtEndDate, setDtEndDate] = useState('');

    // Edit DT dialog state
    const [editDTOpen, setEditDTOpen] = useState(false);
    const [editProject, setEditProject] = useState<any>(null);
    const [editDtFlag, setEditDtFlag] = useState(false);
    const [editDtStart, setEditDtStart] = useState('');
    const [editDtEnd, setEditDtEnd] = useState('');

    const resetCreateForm = () => {
        setProjectName('');
        setDtFlag(false);
        setDtStartDate('');
        setDtEndDate('');
    };

    const handleCreate = () => {
        if (!projectName.trim()) {
            toast.error('Project name is required');
            return;
        }
        if (dtFlag && (!dtStartDate || !dtEndDate)) {
            toast.error('DT Start Date and DT End Date are required for DT projects');
            return;
        }

        const payload: any = { name: projectName.trim() };
        if (dtFlag) {
            payload.isDigitalTransformation = true;
            payload.digitalTransformationStartDate = dtStartDate;
            payload.digitalTransformationEndDate = dtEndDate;
        }

        createProject(payload, {
            onSuccess: () => {
                toast.success('Project created successfully!');
                resetCreateForm();
                setOpen(false);
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || 'Failed to create project');
            },
        });
    };

    const openEditDT = (project: any) => {
        setEditProject(project);
        setEditDtFlag(!!project.isDigitalTransformation);
        setEditDtStart(
            project.digitalTransformationStartDate
                ? new Date(project.digitalTransformationStartDate).toISOString().split('T')[0]
                : ''
        );
        setEditDtEnd(
            project.digitalTransformationEndDate
                ? new Date(project.digitalTransformationEndDate).toISOString().split('T')[0]
                : ''
        );
        setEditDTOpen(true);
    };

    const handleUpdateDT = () => {
        if (!editProject) return;
        if (editDtFlag && (!editDtStart || !editDtEnd)) {
            toast.error('DT Start Date and DT End Date are required');
            return;
        }
        updateProject(
            {
                id: editProject.id,
                data: {
                    name: editProject.name,
                    isDigitalTransformation: editDtFlag,
                    digitalTransformationStartDate: editDtFlag && editDtStart ? editDtStart : null,
                    digitalTransformationEndDate: editDtFlag && editDtEnd ? editDtEnd : null,
                },
            },
            {
                onSuccess: () => {
                    toast.success('DT settings updated!');
                    setEditDTOpen(false);
                    setEditProject(null);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || 'Failed to update project');
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-muted-foreground font-medium">Loading projects...</span>
                </div>
            </div>
        );
    }

    const dtProjects = (projects as any[]).filter((p: any) => p.isDigitalTransformation);

    return (
        <div className="space-y-6 fade-in">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Projects
                    </h1>
                    <p className="text-muted-foreground">
                        Create and manage your organization's projects
                    </p>
                </div>

                {/* Create Project Dialog */}
                <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetCreateForm(); }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                            <Plus className="h-4 w-4" />
                            Create Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[520px] rounded-2xl border-border/50">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <div className="p-2 rounded-xl bg-primary/10">
                                    <FolderKanban className="h-5 w-5 text-primary" />
                                </div>
                                New Project
                            </DialogTitle>
                            <DialogDescription>
                                Create a new project. Enable DT Flag for Digital Transformation monitoring.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-5">
                            {/* Project Name */}
                            <div className="space-y-2">
                                <Label htmlFor="project-name" className="text-sm font-semibold">
                                    Project Name <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="project-name"
                                    placeholder="e.g. E-commerce Platform"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !dtFlag && handleCreate()}
                                    className="rounded-xl border-border/50 focus:border-primary/50 focus:shadow-lg focus:shadow-primary/10 transition-all"
                                    autoFocus
                                />
                            </div>

                            {/* DT Flag Toggle */}
                            <div className={cn(
                                'rounded-2xl border p-4 transition-all duration-300',
                                dtFlag
                                    ? 'border-violet-500/40 bg-violet-500/5'
                                    : 'border-border/40 bg-muted/20'
                            )}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            'p-2 rounded-xl transition-colors',
                                            dtFlag ? 'bg-violet-500/20 text-violet-400' : 'bg-muted text-muted-foreground'
                                        )}>
                                            <Activity className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Digital Transformation (DT) Flag</p>
                                            <p className="text-xs text-muted-foreground">
                                                Enable baseline vs. DT performance monitoring
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        id="dt-flag"
                                        checked={dtFlag}
                                        onCheckedChange={setDtFlag}
                                        className="data-[state=checked]:bg-violet-500"
                                    />
                                </div>

                                {/* DT Date fields — visible only when DT flag is ON */}
                                {dtFlag && (
                                    <div className="mt-4 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="dt-start" className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                                                DT Start Date <span className="text-rose-400">*</span>
                                            </Label>
                                            <Input
                                                id="dt-start"
                                                type="date"
                                                value={dtStartDate}
                                                onChange={(e) => setDtStartDate(e.target.value)}
                                                className="rounded-xl border-violet-500/30 focus:border-violet-500/60 bg-background/50 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="dt-end" className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                                                DT End Date <span className="text-rose-400">*</span>
                                            </Label>
                                            <Input
                                                id="dt-end"
                                                type="date"
                                                value={dtEndDate}
                                                onChange={(e) => setDtEndDate(e.target.value)}
                                                min={dtStartDate}
                                                className="rounded-xl border-violet-500/30 focus:border-violet-500/60 bg-background/50 text-sm"
                                            />
                                        </div>
                                        <p className="col-span-2 text-[10px] text-violet-400/70 font-medium">
                                            Metric data before DT Start will be used as the performance baseline.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => { setOpen(false); resetCreateForm(); }}
                                className="rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={isPending || !projectName.trim()}
                                className="rounded-xl gap-2 shadow-lg shadow-primary/20"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Create Project
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-border/40 shadow-sm bg-card/50">
                    <CardContent className="pt-6 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                            <FolderKanban className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{(projects as any[]).length}</p>
                            <p className="text-xs text-muted-foreground font-medium">Total Projects</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/40 shadow-sm bg-card/50">
                    <CardContent className="pt-6 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-violet-500/10">
                            <Activity className="h-5 w-5 text-violet-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{dtProjects.length}</p>
                            <p className="text-xs text-muted-foreground font-medium">DT Projects</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/40 shadow-sm bg-card/50">
                    <CardContent className="pt-6 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10">
                            <Briefcase className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {(projects as any[]).reduce((acc: number, p: any) => acc + (p.pms?.length || 0), 0)}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">Managers</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/40 shadow-sm bg-card/50">
                    <CardContent className="pt-6 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10">
                            <Users className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {(projects as any[]).reduce((acc: number, p: any) =>
                                    acc + (p.teamLeads?.length || 0) + (p.employees?.length || 0), 0)}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">Team Members</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Projects Grid */}
            {(projects as any[]).length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {(projects as any[]).map((project: any) => {
                        const totalMembers =
                            (project.ctos?.length || 0) +
                            (project.pms?.length || 0) +
                            (project.teamLeads?.length || 0) +
                            (project.employees?.length || 0);
                        const isDT = !!project.isDigitalTransformation;

                        return (
                            <Card
                                key={project.id}
                                className={cn(
                                    'group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 border-border/50 flex flex-col',
                                    isDT && 'border-violet-500/30 hover:shadow-violet-500/10'
                                )}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                'p-2.5 rounded-xl shadow-sm group-hover:shadow-md transition-all',
                                                isDT
                                                    ? 'bg-gradient-to-br from-violet-500/20 to-violet-500/5 group-hover:shadow-violet-500/10'
                                                    : 'bg-gradient-to-br from-primary/20 to-primary/5 group-hover:shadow-primary/10'
                                            )}>
                                                <FolderKanban className={cn('h-5 w-5', isDT ? 'text-violet-400' : 'text-primary')} />
                                            </div>
                                            <CardTitle className="text-lg font-bold tracking-tight">
                                                {project.name}
                                            </CardTitle>
                                        </div>
                                        <div className="flex flex-col gap-1.5 items-end shrink-0">
                                            <Badge
                                                variant="outline"
                                                className="bg-green-500/10 text-green-500 border-green-500/30 rounded-full px-3 shadow-sm text-xs"
                                            >
                                                Active
                                            </Badge>
                                            {isDT && (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-violet-500/10 text-violet-400 border-violet-500/30 rounded-full px-2 shadow-sm text-[10px] font-black gap-1 flex items-center"
                                                >
                                                    <Zap className="h-2.5 w-2.5" />
                                                    DT Project
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* DT dates sub-info */}
                                    {isDT && project.digitalTransformationStartDate && project.digitalTransformationEndDate && (
                                        <div className="mt-2 flex items-center gap-2 text-[10px] text-violet-400/80 font-medium bg-violet-500/5 rounded-xl px-3 py-1.5">
                                            <Activity className="h-3 w-3" />
                                            <span>
                                                DT: {new Date(project.digitalTransformationStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                {' → '}
                                                {new Date(project.digitalTransformationEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    )}
                                </CardHeader>

                                <CardContent className="space-y-4 flex-1">
                                    {/* Member Count Summary */}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        <span className="font-medium">{totalMembers} members</span>
                                    </div>

                                    {/* Role Breakdown */}
                                    <div className="space-y-2.5">
                                        {project.ctos?.length > 0 && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="p-1 rounded-md bg-purple-500/10">
                                                    <Shield className="h-3.5 w-3.5 text-purple-500" />
                                                </div>
                                                <span className="text-muted-foreground w-14 text-xs font-semibold uppercase">CTO</span>
                                                <div className="flex flex-wrap gap-1 flex-1">
                                                    {project.ctos.map((m: any) => (
                                                        <Badge
                                                            key={m.id}
                                                            variant="secondary"
                                                            className="rounded-full text-xs px-2 py-0.5 bg-purple-500/5 hover:bg-purple-500/10 transition-colors"
                                                        >
                                                            {m.user?.fullName || 'Unknown'}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {project.pms?.length > 0 && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="p-1 rounded-md bg-blue-500/10">
                                                    <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                                                </div>
                                                <span className="text-muted-foreground w-14 text-xs font-semibold uppercase">PM</span>
                                                <div className="flex flex-wrap gap-1 flex-1">
                                                    {project.pms.map((m: any) => (
                                                        <Badge
                                                            key={m.id}
                                                            variant="secondary"
                                                            className="rounded-full text-xs px-2 py-0.5 bg-blue-500/5 hover:bg-blue-500/10 transition-colors"
                                                        >
                                                            {m.user?.fullName || 'Unknown'}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {project.teamLeads?.length > 0 && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="p-1 rounded-md bg-emerald-500/10">
                                                    <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                </div>
                                                <span className="text-muted-foreground w-14 text-xs font-semibold uppercase">TL</span>
                                                <div className="flex flex-wrap gap-1 flex-1">
                                                    {project.teamLeads.map((m: any) => (
                                                        <Badge
                                                            key={m.id}
                                                            variant="secondary"
                                                            className="rounded-full text-xs px-2 py-0.5 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
                                                        >
                                                            {m.user?.fullName || 'Unknown'}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {project.employees?.length > 0 && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="p-1 rounded-md bg-amber-500/10">
                                                    <User className="h-3.5 w-3.5 text-amber-500" />
                                                </div>
                                                <span className="text-muted-foreground w-14 text-xs font-semibold uppercase">Dev</span>
                                                <div className="flex flex-wrap gap-1 flex-1">
                                                    {project.employees.map((m: any) => (
                                                        <Badge
                                                            key={m.id}
                                                            variant="secondary"
                                                            className="rounded-full text-xs px-2 py-0.5 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                                                        >
                                                            {m.user?.fullName || 'Unknown'}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {totalMembers === 0 && (
                                            <p className="text-xs text-muted-foreground italic py-2">
                                                No members assigned yet
                                            </p>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="border-t border-border/30 pt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>
                                            Created{' '}
                                            {project.createdAt
                                                ? new Date(project.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    {/* Edit DT Settings button */}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => openEditDT(project)}
                                        className={cn(
                                            'gap-1.5 text-xs h-7 rounded-lg transition-all',
                                            isDT
                                                ? 'text-violet-400 hover:text-violet-300 hover:bg-violet-500/10'
                                                : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        <Pencil className="h-3 w-3" />
                                        {isDT ? 'Edit DT' : 'Add DT'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-border/50 bg-card/50">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        <div className="relative bg-card border border-border/50 p-5 rounded-full shadow-xl">
                            <FolderKanban className="h-10 w-10 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="space-y-2 max-w-md">
                        <h3 className="text-xl font-bold">No Projects Yet</h3>
                        <p className="text-muted-foreground">
                            Create your first project to start organizing your teams and tracking progress.
                        </p>
                    </div>
                    <Button
                        onClick={() => setOpen(true)}
                        className="mt-4 rounded-xl gap-2 shadow-lg shadow-primary/20"
                    >
                        <Plus className="h-4 w-4" />
                        Create Your First Project
                    </Button>
                </div>
            )}

            {/* Edit DT Settings Dialog */}
            <Dialog open={editDTOpen} onOpenChange={setEditDTOpen}>
                <DialogContent className="sm:max-w-[480px] rounded-2xl border-border/50">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <div className="p-2 rounded-xl bg-violet-500/10">
                                <Activity className="h-5 w-5 text-violet-400" />
                            </div>
                            DT Settings — {editProject?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Configure the Digital Transformation flag and monitoring period for this project.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-5">
                        {/* DT Flag Toggle */}
                        <div className={cn(
                            'rounded-2xl border p-4 transition-all duration-300',
                            editDtFlag
                                ? 'border-violet-500/40 bg-violet-500/5'
                                : 'border-border/40 bg-muted/20'
                        )}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        'p-2 rounded-xl transition-colors',
                                        editDtFlag ? 'bg-violet-500/20 text-violet-400' : 'bg-muted text-muted-foreground'
                                    )}>
                                        <Activity className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">DT Flag</p>
                                        <p className="text-xs text-muted-foreground">
                                            {editDtFlag ? 'DT monitoring is enabled' : 'Normal project flow'}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={editDtFlag}
                                    onCheckedChange={setEditDtFlag}
                                    className="data-[state=checked]:bg-violet-500"
                                />
                            </div>

                            {editDtFlag && (
                                <div className="mt-4 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                                            DT Start Date <span className="text-rose-400">*</span>
                                        </Label>
                                        <Input
                                            type="date"
                                            value={editDtStart}
                                            onChange={(e) => setEditDtStart(e.target.value)}
                                            className="rounded-xl border-violet-500/30 focus:border-violet-500/60 bg-background/50 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                                            DT End Date <span className="text-rose-400">*</span>
                                        </Label>
                                        <Input
                                            type="date"
                                            value={editDtEnd}
                                            onChange={(e) => setEditDtEnd(e.target.value)}
                                            min={editDtStart}
                                            className="rounded-xl border-violet-500/30 focus:border-violet-500/60 bg-background/50 text-sm"
                                        />
                                    </div>
                                    <p className="col-span-2 text-[10px] text-violet-400/70 font-medium">
                                        Metrics before DT Start Date will form the performance baseline.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditDTOpen(false)}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateDT}
                            disabled={isUpdating}
                            className="rounded-xl gap-2 shadow-lg shadow-violet-500/20 bg-violet-600 hover:bg-violet-700 text-white"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Activity className="h-4 w-4" />
                                    Save DT Settings
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
