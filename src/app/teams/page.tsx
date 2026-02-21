'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Users, TrendingUp, Search, Trash2, Edit } from 'lucide-react';
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
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Team
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTeams.map((team: any) => (
                    <Card key={team.id} className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 flex flex-col justify-between">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-xl">
                                        <Link href={`/teams/${team.id}`} className="hover:underline">
                                            {team.name}
                                        </Link>
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                        {team.description}
                                    </p>
                                </div>
                                {team.isActive !== false && (
                                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30 rounded-full px-3 shadow-sm">
                                        Active
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>{team.members?.length || team._count?.members || 0} members</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    <span className="font-semibold">{team.performance || 0}%</span>
                                </div>
                            </div>

                            {/* Performance Bar */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Performance</span>
                                    <span className="font-semibold">{team.performance || 0}%</span>
                                </div>
                                <div className="h-2.5 overflow-hidden rounded-full bg-muted/50 shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-primary/80 shadow-sm transition-all duration-500"
                                        style={{ width: `${team.performance || 0}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-3 border-t border-border/30">
                                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden ring-2 ring-primary/10">
                                    {team.teamLead?.avatarUrl ? (
                                        <img src={team.teamLead.avatarUrl} alt="Lead" />
                                    ) : (
                                        <span className="text-xs font-bold text-gray-500">
                                            {(team.teamLead?.fullName || 'TL').charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Lead: </span>
                                    <span className="font-medium">{team.teamLead?.fullName || 'Unassigned'}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 border-t border-border/30 pt-4">
                            <Link href={`/teams/edit`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full rounded-xl border-border/50 hover:bg-accent/50 transition-all">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(team.id)}
                                className="rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-300 transition-all px-3"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            {filteredTeams.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    No teams found. Create one to get started.
                </div>
            )}
        </div>
    );
}
