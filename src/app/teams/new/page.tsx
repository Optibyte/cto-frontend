'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTeam } from '@/hooks/use-teams';
import { useUsers } from '@/hooks/use-users';
import { useProjects } from '@/hooks/use-projects';
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
import { ArrowLeft, Loader2, Briefcase, UserCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CreateTeamPage() {
    const router = useRouter();
    const { mutate: createTeam, isPending } = useCreateTeam();
    const { data: users = [], isLoading: isLoadingUsers } = useUsers() as { data: any[], isLoading: boolean };
    const { data: projects = [], isLoading: isLoadingProjects } = useProjects() as { data: any[], isLoading: boolean };

    const [formData, setFormData] = useState({
        name: '',
        projectId: '',
        description: '',
        teamLeadId: '',
    });

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

        createTeam(formData, {
            onSuccess: () => {
                toast.success('Team created successfully');
                router.push('/teams');
            },
            onError: (error: any) => {
                const message = error.response?.data?.message;
                if (Array.isArray(message)) {
                    message.forEach((msg: string) => toast.error(msg));
                } else {
                    toast.error(message || 'Failed to create team');
                }
            },
        });
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto fade-in">
            <div className="flex items-center gap-4">
                <Link href="/teams">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent/50">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Team</h1>
                    <p className="text-muted-foreground">Add a new engineering team to the platform</p>
                </div>
            </div>

            <Card className="border-border/50 shadow-lg">
                <CardHeader>
                    <CardTitle>Team Details</CardTitle>
                    <CardDescription>Enter the basic information for the new team.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Team Name</Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Frontend Web Tech"
                                className="rounded-xl border-border/50 min-h-[44px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="project">Project</Label>
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

                        <div className="space-y-2">
                            <Label htmlFor="teamLead">Team Lead</Label>
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

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of the team's responsibilities"
                                className="rounded-xl border-border/50 min-h-[100px] resize-y"
                            />
                        </div>

                        <div className="pt-6 flex justify-end gap-3 border-t border-border/30">
                            <Link href="/teams">
                                <Button variant="outline" type="button" className="rounded-xl border-border/50 min-h-[44px] px-6">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={isPending} className="w-full rounded-xl min-h-[44px] shadow-md shadow-primary/20 hover:shadow-primary/30">
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Team
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
