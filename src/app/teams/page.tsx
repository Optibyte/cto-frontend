'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Users, Search, Trash2, Edit, Briefcase, UserCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useTeams, useDeleteTeam } from '@/hooks/use-teams';
import { toast } from 'sonner';

export default function TeamsPage() {
    const { data: teams = [], isLoading, refetch }: { data: any[] | undefined, isLoading: boolean, refetch: () => void } = useTeams() as any;
    const { mutate: deleteTeam } = useDeleteTeam();
    const [searchQuery, setSearchQuery] = useState('');

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this team?')) {
            deleteTeam(id, {
                onSuccess: () => {
                    toast.success('Team deleted successfully');
                    refetch();
                },
                onError: () => {
                    toast.error('Failed to delete team');
                }
            });
        }
    };

    const filteredTeams = teams.filter((team: any) =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-muted-foreground">Loading teams...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
                    <p className="text-muted-foreground">
                        Manage teams and track their performance
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search teams..."
                            className="pl-9 w-[250px] rounded-xl border-border/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Link href="/teams/new">
                        <Button className="gap-2 rounded-xl text-primary-foreground">
                            <Plus className="h-4 w-4" />
                            Create Team
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTeams.map((team: any) => (
                    <Card key={team.id} className="overflow-hidden relative group rounded-2xl border border-border/40 shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">
                                    <Link href={`/teams/${team.id}`} className="hover:underline">
                                        {team.name}
                                    </Link>
                                </h3>
                                <Badge variant="outline" className="rounded-lg bg-primary/5 text-primary border-primary/20">
                                    {team.members?.length || 0} Members
                                </Badge>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Briefcase className="h-4 w-4" />
                                    <span>Project: <span className="text-foreground font-medium">{team.project?.name || 'Unassigned'}</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <UserCircle2 className="h-4 w-4" />
                                    <span>Lead: <span className="text-foreground font-medium">{team.teamLead?.fullName || 'Unassigned'}</span></span>
                                </div>
                                {team.region && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="h-4 w-4 rounded-full border border-muted-foreground/30 flex items-center justify-center text-[10px] font-bold">R</div>
                                        <span>Region: <span className="text-foreground font-medium">{team.region}</span></span>
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-muted-foreground mb-6 line-clamp-2 min-h-[40px]">
                                {team.description || 'No description provided.'}
                            </p>

                            <div className="flex items-center gap-3">
                                <Link href={`/teams/${team.id}/edit`} className="flex-1">
                                    <Button variant="outline" className="w-full rounded-xl gap-2">
                                        <Edit className="h-4 w-4" />
                                        Edit Team
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-xl text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(team.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredTeams.length === 0 && (
                <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border/50">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No teams found</h3>
                    <p className="text-muted-foreground mt-1">Try a different search or create a new team.</p>
                </div>
            )}
        </div>
    );
}
