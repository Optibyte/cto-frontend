'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useAppSelector } from '@/redux/store';
import { useTeam } from '@/hooks/use-teams';
import { Loader2, Mail, User, Shield, Briefcase, Calendar, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function MemberListLevel() {
    const { selectedTeam, selectedTeamName, selectedProjectName } = useAppSelector((s) => s.drilldown);
    const { data: team, isLoading } = useTeam(selectedTeam || '');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-muted-foreground font-medium">Loading members...</span>
                </div>
            </div>
        );
    }

    const members = team?.members || [];

    if (members.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-border/50 bg-card/50">
                <User className="h-10 w-10 text-muted-foreground" />
                <h3 className="text-xl font-bold">No Members Found</h3>
                <p className="text-muted-foreground">No members are assigned to "{selectedTeamName}".</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1 uppercase tracking-widest">
                        <span>{selectedProjectName}</span>
                        <span className="opacity-30">/</span>
                        <span className="text-primary">{selectedTeamName}</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                    <p className="text-muted-foreground mt-1">Detailed directory of all professionals in this team</p>
                </div>
                <div className="flex items-center gap-2 pb-1">
                    <Badge variant="secondary" className="rounded-full px-3 py-1 font-semibold text-xs bg-primary/10 text-primary border-primary/20">
                        {members.length} Members
                    </Badge>
                </div>
            </div>

            {/* Member Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {members.map((member: any) => {
                    const user = member.user;
                    const initials = (user?.fullName || 'UN').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

                    return (
                        <Card
                            key={member.id}
                            className="overflow-hidden relative group rounded-2xl border border-border/40 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <CardContent className="p-0">
                                <div className="h-20 bg-gradient-to-r from-primary/20 via-purple-500/10 to-transparent" />
                                <div className="px-6 pb-6 -mt-10 relative z-10">
                                    <div className="flex items-end justify-between mb-4">
                                        <div className="h-20 w-20 rounded-2xl bg-background p-1.5 shadow-xl ring-1 ring-border/50">
                                            <div className="h-full w-full rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-inner">
                                                {initials}
                                            </div>
                                        </div>
                                        <Badge className={cn("rounded-full text-[10px] px-2 py-0.5 font-bold uppercase tracking-tighter",
                                            member.roleInTeam === 'MEMBER' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20")}>
                                            {member.roleInTeam}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">{user?.fullName}</h3>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                            <Briefcase className="h-3 w-3 text-primary/60" />
                                            {user?.role || 'Contributor'}
                                        </p>
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        <div className="flex items-center gap-2.5 text-xs text-muted-foreground group/item cursor-pointer hover:text-foreground transition-colors">
                                            <div className="p-1.5 rounded-lg bg-muted group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors">
                                                <Mail className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="truncate">{user?.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                                            <div className="p-1.5 rounded-lg bg-muted">
                                                <Calendar className="h-3.5 w-3.5" />
                                            </div>
                                            <span>Joined {new Date(member.joinedAt || member.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-border/20 flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1 rounded-xl h-8 text-xs font-bold gap-1.5 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all">
                                            Profile
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl hover:bg-primary hover:text-white transition-all">
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
