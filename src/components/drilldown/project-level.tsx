'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch } from '@/redux/store';
import { drillToTeam } from '@/redux/slices/drilldownSlice';
import { useProjects } from '@/hooks/use-projects';
import { useTeams } from '@/hooks/use-teams';
import { useUsers } from '@/hooks/use-users';
import { FolderKanban, Users, Loader2, Shield, UserCog, Boxes } from 'lucide-react';

const COLORS = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#84CC16'];

export function ProjectLevel() {
    const dispatch = useAppDispatch();
    const { data: projects = [], isLoading: projectsLoading } = useProjects();
    const { data: teams = [], isLoading: teamsLoading } = useTeams();
    const { data: users = [], isLoading: usersLoading } = useUsers();

    const isLoading = projectsLoading || teamsLoading || usersLoading;

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

    const projectCards = projects.map((project: any, index: number) => {
        const teamsInProject = teams.filter((t: any) => t.projectId === project.id);
        const teamCount = teamsInProject.length;
        const memberCount = teamsInProject.reduce((acc: number, t: any) => acc + (t.members?.length || 0), 0);

        return {
            id: project.id,
            name: project.name,
            teamCount,
            memberCount,
            color: COLORS[index % COLORS.length],
            createdAt: project.createdAt,
        };
    });

    const totalTeams = teams.length;
    const totalMembers = users.length;

    const summaryCards = [
        { title: 'Projects', value: projects.length, icon: FolderKanban, color: 'from-purple-500/20 to-purple-600/10', textColor: 'text-purple-500', iconBg: 'bg-purple-500/10' },
        { title: 'Total Teams', value: totalTeams, icon: Boxes, color: 'from-blue-500/20 to-blue-600/10', textColor: 'text-blue-500', iconBg: 'bg-blue-500/10' },
        { title: 'Total Members', value: totalMembers, icon: Users, color: 'from-emerald-500/20 to-emerald-600/10', textColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10' },
    ];

    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Projects Overview</h1>
                <p className="text-muted-foreground">Click on a project to drill down into its team structure</p>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {summaryCards.map((card, i) => (
                    <Card key={i} className="overflow-hidden relative group rounded-2xl border border-border/40 shadow-lg shadow-black/5 dark:shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30">
                        <div className={`absolute inset-0 bg-gradient-to-br opacity-30 group-hover:opacity-50 transition-opacity duration-300 ${card.color}`} />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{card.title}</p>
                                    <h3 className="text-4xl font-bold tracking-tight">{card.value}</h3>
                                </div>
                                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <card.icon className={`h-7 w-7 ${card.textColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Project Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projectCards.map((project: any) => (
                    <Card
                        key={project.id}
                        className="overflow-hidden relative group rounded-2xl border border-border/40 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/30"
                        onClick={() => dispatch(drillToTeam({ projectId: project.id, projectName: project.name }))}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl" style={{ backgroundColor: project.color }} />
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">{project.name}</h3>
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                    <p className="text-2xl font-black text-blue-500">{project.teamCount}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Teams</p>
                                </div>
                                <div className="text-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                    <p className="text-2xl font-black text-emerald-500">{project.memberCount}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Members</p>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-between items-center pt-4 border-t border-border/20">
                                <span className="text-xs font-semibold text-muted-foreground">{project.memberCount} active professionals</span>
                                <span className="text-sm text-primary font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                    Explore <Boxes className="h-4 w-4" />
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {projectCards.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-border/50 bg-card/50">
                    <FolderKanban className="h-10 w-10 text-muted-foreground" />
                    <h3 className="text-xl font-bold">No Projects Found</h3>
                    <p className="text-muted-foreground">Create projects to see them here.</p>
                </div>
            )}
        </div>
    );
}
