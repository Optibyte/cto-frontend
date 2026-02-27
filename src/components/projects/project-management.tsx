'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Trash2,
    Users,
    Search,
    Pencil,
    Building2,
    Calendar,
    Briefcase,
    LayoutGrid,
    Target,
    Activity,
    Loader2
} from 'lucide-react';
import { ProjectFull } from '@/lib/types';
import { toast } from 'sonner';
import { useEffect, useCallback } from 'react';
import { projectsAPI } from '@/lib/api/client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Removal of initialMockProjects as we are now using the API

export function ProjectManagement() {
    const [projects, setProjects] = useState<ProjectFull[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<ProjectFull | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        enddate: '',
        status: 'Active' as ProjectFull['status'],
        teamSize: 0,
        progress: 0
    });

    const fetchProjects = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await projectsAPI.getAll();
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
            toast.error('Failed to load projects');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleOpenAddDialog = () => {
        setEditingProject(null);
        setFormData({
            name: '',
            startDate: '',
            enddate: '',
            status: 'Active',
            teamSize: 0,
            progress: 0
        });
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (project: ProjectFull) => {
        setEditingProject(project);
        setFormData({
            name: project.name,
            startDate: project.startDate,
            enddate: project.enddate,
            status: project.status,
            teamSize: project.teamSize,
            progress: project.progress
        });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingProject(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Please enter a project name');
            return;
        }

        setIsActionLoading(true);
        try {
            if (editingProject) {
                await projectsAPI.update(editingProject.id, formData);
                toast.success(`Project ${formData.name} updated successfully`);
            } else {
                await projectsAPI.create(formData);
                toast.success(`Project ${formData.name} created successfully`);
            }
            fetchProjects();
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving project:', error);
            toast.error(editingProject ? 'Failed to update project' : 'Failed to create project');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteProject = async (id: string) => {
        const project = projects.find(p => p.id === id);
        if (!project) return;

        if (confirm(`Are you sure you want to delete ${project.name}?`)) {
            try {
                await projectsAPI.delete(id);
                toast.success(`Project ${project.name} removed`);
                fetchProjects();
            } catch (error) {
                console.error('Error deleting project:', error);
                toast.error('Failed to delete project');
            }
        }
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/10">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <LayoutGrid className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight">Project Directory</h2>
                        <p className="text-muted-foreground font-medium">Manage and monitor organizational projects</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search projects..."
                            className="pl-9 w-[240px] rounded-xl border-border/50 h-10 bg-card/50"
                        />
                    </div>
                    <Button
                        onClick={handleOpenAddDialog}
                        className="rounded-xl shadow-lg transition-all h-10 px-6 gap-2 bg-primary shadow-primary/20 hover:shadow-primary/40"
                    >
                        <Plus className="h-4 w-4" />
                        Add Project
                    </Button>
                </div>
            </div>

            {/* Table */}
            <Card className="border-border/50 shadow-2xl bg-card/60 backdrop-blur-xl overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/10 bg-muted/20">
                                    <th className="text-left py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Project</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Team Size</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Timeline</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground text-center">Status</th>
                                    <th className="text-center py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <p className="text-muted-foreground font-medium">Loading projects...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredProjects.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <p className="text-muted-foreground font-medium">No projects found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProjects.map((p) => (
                                        <tr key={p.id} className="border-b border-border/5 hover:bg-primary/5 transition-all duration-300 group/row">
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary group-hover/row:scale-110 transition-transform">
                                                        {p.name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm tracking-tight">{p.name}</span>

                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {p.teamSize} teams
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${p.progress >= 80 ? 'bg-emerald-500' : p.progress >= 40 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                                                style={{ width: `${p.progress}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-muted-foreground">{p.progress}%</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex flex-col gap-1 text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        <span className="text-[11px] font-mono">{p.startDate}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Activity className="h-3.5 w-3.5" />
                                                        <span className="text-[11px] font-mono">{p.enddate}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4 text-center">
                                                <Badge className={`rounded-xl px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border-0 ${p.status === 'Active'
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : p.status === 'Delayed'
                                                        ? 'bg-rose-500/10 text-rose-500'
                                                        : p.status === 'PLANNED'
                                                            ? 'bg-blue-500/10 text-blue-500'
                                                            : 'bg-amber-500/10 text-amber-500'
                                                    }`}>
                                                    {p.status}
                                                </Badge>
                                            </td>
                                            <td className="py-5 px-6 text-center">
                                                <div className="flex items-center justify-center gap-1 opacity-0 group-hover/row:opacity-100 transition-all">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenEditDialog(p)}
                                                        className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-9 w-9 rounded-xl transition-all"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteProject(p.id)}
                                                        className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 h-9 w-9 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</DialogTitle>
                        <DialogDescription>
                            {editingProject ? 'Update project details below.' : 'Enter details to create a new project.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Apollo Banking App"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="enddate">End Date</Label>
                                <Input
                                    id="enddate"
                                    type="date"
                                    value={formData.enddate}
                                    onChange={(e) => setFormData({ ...formData, enddate: e.target.value })}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="teamSize">Team Size</Label>
                                <Input
                                    id="teamSize"
                                    type="number"
                                    value={formData.teamSize}
                                    onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) || 0 })}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="progress">Progress (%)</Label>
                                <Input
                                    id="progress"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.progress}
                                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={(val: ProjectFull['status']) => setFormData({ ...formData, status: val })}>
                                <SelectTrigger className="rounded-xl">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="PLANNED">Planned</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Delayed">Delayed</SelectItem>
                                    <SelectItem value="On-Hold">On Hold</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button variant="outline" type="button" onClick={handleCloseDialog} className="rounded-xl" disabled={isActionLoading}>Cancel</Button>
                            <Button type="submit" className="rounded-xl bg-primary hover:bg-primary/90" disabled={isActionLoading}>
                                {isActionLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Saving...</span>
                                    </div>
                                ) : (
                                    editingProject ? 'Update Project' : 'Create Project'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
