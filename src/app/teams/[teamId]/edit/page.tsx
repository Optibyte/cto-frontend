'use client';

import { useState, useEffect, use, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTeam, useUpdateTeam } from '@/hooks/use-teams';
import { useUsers } from '@/hooks/use-users';
import { useProjects } from '@/hooks/use-projects';
import { useEmployees } from '@/hooks/use-employees';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Briefcase, UserCircle2, Users, Plus, X, UserPlus, BriefcaseIcon } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddMemberModal } from '@/components/teams/add-member-modal';

export default function EditTeamPage({ params }: { params: Promise<{ teamId: string }> }) {
    const router = useRouter();
    const { teamId } = use(params);

    const { data: team, isLoading: isLoadingTeam } = useTeam(teamId) as any;
    const { mutate: updateTeam, isPending: isUpdating } = useUpdateTeam();
    const { data: users = [], isLoading: isLoadingUsers } = useUsers() as { data: any[], isLoading: boolean };
    const { data: projects = [], isLoading: isLoadingProjects } = useProjects() as { data: any[], isLoading: boolean };

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        projectId: '',
        description: '',
        teamLeadId: '',
        employeeIds: [] as string[],
        members: [] as { employeeId: string, role: string }[],
    });

    // Pass the currently selected teamLeadId to filter employees
    const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees(formData.teamLeadId) as { data: any[], isLoading: boolean };

    useEffect(() => {
        if (team) {
            setFormData({
                name: team.name || '',
                projectId: team.projectId || '',
                description: team.description || '',
                teamLeadId: team.teamLeadId || '',
                employeeIds: (team.members || []).map((m: any) => m.employeeId).filter(Boolean),
                members: (team.members || []).map((m: any) => ({
                    employeeId: m.employeeId,
                    role: m.roleInTeam || m.role || 'Member'
                })),
            });
        }
    }, [team]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!formData.teamLeadId) {
            toast.error('Please select a Team Lead');
            return;
        }

        if (!formData.projectId) {
            toast.error('Please select a Project');
            return;
        }

        // Prepare data for backend
        const submissionData = {
            ...formData,
            // Backend expects employeeIds for some operations, and members with roles for others
            // Let's ensure both are consistent if needed, but our PUT /api/v1/teams 
            // likely takes employeeIds for bulk assignment.
            // If the backend needs specifics, we adjust.
        };

        updateTeam({ id: teamId, data: submissionData }, {
            onSuccess: () => {
                toast.success('Team updated successfully');
                router.push('/teams');
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Failed to update team');
            },
        });
    };

    const handleAddMember = (employee: any, role: string) => {
        if (formData.employeeIds.includes(employee.id)) {
            toast.error('Employee is already in this team');
            return;
        }

        setFormData(prev => ({
            ...prev,
            employeeIds: [...prev.employeeIds, employee.id],
            members: [...prev.members, { employeeId: employee.id, role }]
        }));
        toast.success(`Added ${employee.user?.fullName || employee.fullName} as ${role}`);
    };

    const removeMember = (empId: string) => {
        setFormData(prev => ({
            ...prev,
            employeeIds: prev.employeeIds.filter(id => id !== empId),
            members: prev.members.filter(m => m.employeeId !== empId)
        }));
    };

    if (isLoadingTeam) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto fade-in pb-10">
            <div className="flex items-center gap-4">
                <Link href="/teams">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent/50">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Team</h1>
                    <p className="text-muted-foreground">Modify team details and assignments</p>
                </div>
            </div>

            <Card className="border-border/50 shadow-lg overflow-hidden rounded-2xl">
                <CardHeader className="bg-muted/30 pb-8">
                    <CardTitle>Team Configuration</CardTitle>
                    <CardDescription>Update information for {team?.name}.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Team Name</Label>
                                <Input
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Frontend Engineering"
                                    className="rounded-xl border-border/50 min-h-[44px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="project" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Associated Project</Label>
                                <Select
                                    value={formData.projectId}
                                    onValueChange={(value: string) => setFormData({ ...formData, projectId: value })}
                                >
                                    <SelectTrigger className="rounded-xl border-border/50 min-h-[44px]">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                                            <SelectValue placeholder="Select a project" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/50">
                                        {isLoadingProjects ? (
                                            <div className="p-2 text-center text-muted-foreground flex items-center justify-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Loading projects...</span>
                                            </div>
                                        ) : projects.length === 0 ? (
                                            <div className="p-2 text-center text-muted-foreground">No projects found</div>
                                        ) : (
                                            projects.map((project: any) => (
                                                <SelectItem key={project.id} value={project.id} className="rounded-lg">
                                                    {project.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mision & Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of the team's responsibilities"
                                className="rounded-xl border-border/50 min-h-[100px] resize-y"
                            />
                        </div>

                        <div className="space-y-2 max-w-md">
                            <Label htmlFor="teamLead" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Team Lead</Label>
                            <Select
                                value={formData.teamLeadId}
                                onValueChange={(value: string) => setFormData({ ...formData, teamLeadId: value })}
                            >
                                <SelectTrigger className="rounded-xl border-border/50 min-h-[44px]">
                                    <div className="flex items-center gap-2">
                                        <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="Select a team lead" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50">
                                    {isLoadingUsers ? (
                                        <div className="p-2 text-center text-muted-foreground flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Loading users...</span>
                                        </div>
                                    ) : users.length === 0 ? (
                                        <div className="p-2 text-center text-muted-foreground">No users found</div>
                                    ) : (
                                        users.map((user: any) => (
                                            <SelectItem key={user.id} value={user.id} className="rounded-lg">
                                                {user.fullName || user.email}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border/10">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Roster members</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="rounded-xl gap-2 hover:bg-primary hover:text-primary-foreground border-primary/20 transition-all font-bold"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Add Member by Code
                                </Button>
                            </div>

                            <div className="grid gap-3">
                                {formData.members.map(member => {
                                    const emp = employees.find((e: any) => e.id === member.employeeId);
                                    return (
                                        <div key={member.employeeId} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/10 hover:bg-muted/40 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {(emp?.user?.fullName || emp?.fullName || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm tracking-tight">{emp?.user?.fullName || emp?.fullName || 'Searching...'}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 rounded-md bg-primary/5 text-primary border-primary/20">
                                                            {member.role}
                                                        </Badge>
                                                        {emp?.employeeCode && (
                                                            <span className="text-[10px] text-muted-foreground font-mono">#{emp.employeeCode}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeMember(member.employeeId)}
                                                className="rounded-lg text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                                {formData.members.length === 0 && (
                                    <div className="text-center py-10 rounded-2xl bg-muted/20 border-2 border-dashed border-border/20">
                                        <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">No members assigned yet.</p>
                                        <p className="text-xs text-muted-foreground/60 mt-1">Use the button above to start building your team.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-8 flex justify-end gap-3 border-t border-border/10">
                            <Link href="/teams">
                                <Button variant="outline" type="button" className="rounded-xl border-border/50 min-h-[44px] px-8">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={isUpdating} className="rounded-xl min-h-[44px] px-10 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold">
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Deployment
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <AddMemberModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddMember}
                tlId={formData.teamLeadId}
            />
        </div>
    );
}
