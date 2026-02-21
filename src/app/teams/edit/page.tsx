'use client';

import { useState, useEffect, use, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTeam, useUpdateTeam } from '@/hooks/use-teams';
import { useUsers } from '@/hooks/use-users';
import { useAccounts } from '@/hooks/use-accounts';
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
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: teamId } = use(params);

    const { data: team, isLoading: isLoadingTeam } = useTeam(teamId);
    const { mutate: updateTeam, isPending: isUpdating } = useUpdateTeam();
    const { data: users = [], isLoading: isLoadingUsers }: { data: any[] | undefined, isLoading: boolean } = useUsers() as any;
    const { data: accounts = [], isLoading: isLoadingAccounts } = useAccounts() as any;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        teamLeadId: '',
        accountId: '',
    });

    useEffect(() => {
        if (team) {
            setFormData({
                name: team.name || '',
                description: team.description || '',
                teamLeadId: team.teamLeadId || '',
                accountId: team.accountId || '',
            });
        }
    }, [team]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!formData.teamLeadId) {
            toast.error('Please select a Team Lead');
            return;
        }

        if (!formData.accountId) {
            toast.error('Please select an Account');
            return;
        }

        // Remove accountId from payload as it cannot be updated
        const { accountId, ...updateData } = formData;

        updateTeam({ id: teamId, data: updateData }, {
            onSuccess: () => {
                toast.success('Team updated successfully');
                router.push('/teams');
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || 'Failed to update team');
            },
        });
    };

    if (isLoadingTeam) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto fade-in">
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

            <Card className="border-border/50 shadow-lg">
                <CardHeader>
                    <CardTitle>Team Details</CardTitle>
                    <CardDescription>Update information for {team?.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="account">Account</Label>
                            <Select
                                value={formData.accountId}
                                onValueChange={(value: string) => setFormData({ ...formData, accountId: value })}
                            >
                                <SelectTrigger className="rounded-xl border-border/50 min-h-[44px]">
                                    <SelectValue placeholder="Select an account" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50">
                                    {isLoadingAccounts ? (
                                        <div className="p-2 text-center text-muted-foreground">Loading accounts...</div>
                                    ) : (
                                        accounts?.map((account: any) => (
                                            <SelectItem key={account.id} value={account.id} className="rounded-lg">
                                                {account.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Team Name</Label>
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
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of the team's responsibilities"
                                className="rounded-xl border-border/50 min-h-[100px] resize-y"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="teamLead">Team Lead</Label>
                            <Select
                                value={formData.teamLeadId}
                                onValueChange={(value: string) => setFormData({ ...formData, teamLeadId: value })}
                            >
                                <SelectTrigger className="rounded-xl border-border/50 min-h-[44px]">
                                    <SelectValue placeholder="Select a team lead" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50">
                                    {isLoadingUsers ? (
                                        <div className="p-2 text-center text-muted-foreground">Loading users...</div>
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

                        <div className="pt-6 flex justify-end gap-3 border-t border-border/30">
                            <Link href="/teams">
                                <Button variant="outline" type="button" className="rounded-xl border-border/50 min-h-[44px] px-6">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={isUpdating} className="rounded-xl min-h-[44px] px-6 shadow-md shadow-primary/20 hover:shadow-primary/30">
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
