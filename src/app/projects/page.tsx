'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
    Layers,
} from 'lucide-react';
import { useProjects, useCreateProject } from '@/hooks/use-projects';
import { toast } from 'sonner';

export default function ProjectsPage() {
    const { data: projects = [], isLoading } = useProjects();
    const { mutate: createProject, isPending } = useCreateProject();
    const [open, setOpen] = useState(false);
    const [projectName, setProjectName] = useState('');

    const handleCreate = () => {
        if (!projectName.trim()) {
            toast.error('Project name is required');
            return;
        }

        createProject(
            { name: projectName.trim() },
            {
                onSuccess: () => {
                    toast.success('Project created successfully!');
                    setProjectName('');
                    setOpen(false);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || 'Failed to create project');
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
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                            <Plus className="h-4 w-4" />
                            Create Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px] rounded-2xl border-border/50">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                                <div className="p-2 rounded-xl bg-primary/10">
                                    <FolderKanban className="h-5 w-5 text-primary" />
                                </div>
                                New Project
                            </DialogTitle>
                            <DialogDescription>
                                Create a new project. You can assign team members later.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="project-name" className="text-sm font-semibold">
                                    Project Name
                                </Label>
                                <Input
                                    id="project-name"
                                    placeholder="e.g. E-commerce Platform"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                    className="rounded-xl border-border/50 focus:border-primary/50 focus:shadow-lg focus:shadow-primary/10 transition-all"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
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
                            <p className="text-2xl font-bold">{projects.length}</p>
                            <p className="text-xs text-muted-foreground font-medium">Total Projects</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/40 shadow-sm bg-card/50">
                    <CardContent className="pt-6 flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-500/10">
                            <Shield className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {projects.reduce((acc: number, p: any) => acc + (p.ctos?.length || 0), 0)}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">CTOs Assigned</p>
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
                                {projects.reduce((acc: number, p: any) => acc + (p.pms?.length || 0), 0)}
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
                                {projects.reduce((acc: number, p: any) =>
                                    acc + (p.teamLeads?.length || 0) + (p.employees?.length || 0), 0)}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">Team Members</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Projects Grid */}
            {projects.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project: any) => {
                        const totalMembers =
                            (project.ctos?.length || 0) +
                            (project.pms?.length || 0) +
                            (project.teamLeads?.length || 0) +
                            (project.employees?.length || 0);

                        return (
                            <Card
                                key={project.id}
                                className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 border-border/50 flex flex-col"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm group-hover:shadow-md group-hover:shadow-primary/10 transition-all">
                                                <FolderKanban className="h-5 w-5 text-primary" />
                                            </div>
                                            <CardTitle className="text-lg font-bold tracking-tight">
                                                {project.name}
                                            </CardTitle>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="bg-green-500/10 text-green-500 border-green-500/30 rounded-full px-3 shadow-sm text-xs"
                                        >
                                            Active
                                        </Badge>
                                    </div>
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

                                <CardFooter className="border-t border-border/30 pt-4">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
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
        </div>
    );
}
