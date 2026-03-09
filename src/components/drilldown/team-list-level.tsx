'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { drillToMember } from '@/redux/slices/drilldownSlice';
import { useTeams } from '@/hooks/use-teams';
import { Loader2, Users, ArrowRight, Boxes, Info } from 'lucide-react';

const COLORS = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#84CC16'];

export function TeamListLevel() {
    const dispatch = useAppDispatch();
    const { selectedProject, selectedProjectName } = useAppSelector((s) => s.drilldown);
    const { data: allTeams = [], isLoading } = useTeams();

    // Filter teams assigned to the selected project
    const projectTeams = allTeams.filter((t: any) => t.projectId === selectedProject);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-muted-foreground font-medium">Loading teams...</span>
                </div>
            </div>
        );
    }

    if (projectTeams.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-border/50 bg-card/50">
                <Boxes className="h-10 w-10 text-muted-foreground" />
                <h3 className="text-xl font-bold">No Teams Found</h3>
                <p className="text-muted-foreground">No teams are assigned to "{selectedProjectName}".</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {selectedProjectName} — Teams
                </h1>
                <p className="text-muted-foreground mt-1 text-lg italic">Select a team to drill down into its members</p>
            </div>

            {/* Team Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projectTeams.map((team: any, index: number) => {
                    const color = COLORS[index % COLORS.length];
                    const memberCount = team.members?.length || 0;

                    return (
                        <Card
                            key={team.id}
                            className="overflow-hidden relative group rounded-2xl border border-border/40 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/30"
                            onClick={() => dispatch(drillToMember({ teamId: team.id, teamName: team.name }))}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-2xl" style={{ backgroundColor: color }} />

                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-primary/10">
                                            <Boxes className="h-5 w-5 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{team.name}</h3>
                                    </div>
                                    <div className="h-4 w-4 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                                </div>

                                <p className="text-sm text-muted-foreground mb-6 line-clamp-2 min-h-[40px]">
                                    {team.description || 'No description available for this team.'}
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex flex-col p-3 rounded-2xl bg-muted/30 border border-border/20">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Members</span>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-emerald-500" />
                                            <span className="text-xl font-bold">{memberCount}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col p-3 rounded-2xl bg-muted/30 border border-border/20">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Status</span>
                                        <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-sm">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Active
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border/20">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Info className="h-3.5 w-3.5" />
                                        <span>Drill down for member details</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="rounded-xl gap-2 font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                        View Members <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
