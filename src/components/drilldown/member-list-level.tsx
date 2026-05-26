'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAppSelector } from '@/redux/store';
import { useTeam } from '@/hooks/use-teams';
import { Loader2, Mail, User, Shield, Briefcase, Calendar, ExternalLink, X, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getBadgeStyles } from '@/lib/badges';

const BADGE_DETAILS: Record<string, { title: string; issuer: string; desc: string }> = {
    'Microsoft Azure AI Engineer': {
        title: 'Microsoft Certified: Azure AI Engineer Associate',
        issuer: 'Microsoft',
        desc: 'Builds, manages, and deploys AI solutions that leverage Azure Cognitive Services, Azure Cognitive Search, and Azure Microsoft Bot Framework.'
    },
    'Amazon Web Services DevOps Engineer': {
        title: 'AWS Certified DevOps Engineer – Professional',
        issuer: 'Amazon Web Services (AWS)',
        desc: 'Validates technical expertise in provisioning, operating, and managing distributed application systems on the AWS platform.'
    },
    'Cloud Native Computing Foundation Kubernetes Administrator': {
        title: 'CNCF Certified Kubernetes Administrator (CKA)',
        issuer: 'Cloud Native Computing Foundation',
        desc: 'Demonstrates the ability to design, build, configure, and manage production-ready Kubernetes clusters.'
    },
    'ISC2 CISSP': {
        title: 'ISC2 Certified Information Systems Security Professional',
        issuer: 'ISC2',
        desc: 'Industry gold-standard credential proving deep knowledge in information security and cybersecurity leadership.'
    },
    'Google Professional Data Engineer': {
        title: 'Google Cloud Professional Data Engineer',
        issuer: 'Google Cloud Platform (GCP)',
        desc: 'Enables data-driven decision making by designing, building, operationalizing, securing, and monitoring data processing systems.'
    },
    'DevOps Guru': {
        title: 'DevOps Guru Champion',
        issuer: 'Internal Platform',
        desc: 'Awarded for demonstrating excellence in automation, CI/CD pipeline optimization, and infrastructure as code.'
    },
    'AI Pioneer': {
        title: 'AI Pioneer Innovator',
        issuer: 'Internal Platform',
        desc: 'Recognizes members driving artificial intelligence integrations, prompt engineering, and LLM orchestration.'
    },
    'Cloud Architect': {
        title: 'Cloud Solutions Architect',
        issuer: 'Internal Platform',
        desc: 'Demonstrates capability in architecting highly available, fault-tolerant, and secure cloud services.'
    },
    'Security Champion': {
        title: 'Information Security Champion',
        issuer: 'Internal Security Group',
        desc: 'Granted to individuals maintaining excellent security hygiene and leading secure development practices.'
    },
    'Agile Master': {
        title: 'Agile & Scrum Master',
        issuer: 'Internal Agile CoE',
        desc: 'Awarded for coaching teams, sprint planning excellence, and agile process leadership.'
    },
    'Code Ninja': {
        title: 'Clean Code Ninja',
        issuer: 'Internal Tech Council',
        desc: 'Recognizes exceptional code craftsmanship, performance tuning, and clean software refactoring.'
    },
    'Bug Hunter': {
        title: 'Elite Bug Hunter',
        issuer: 'Internal Tech Council',
        desc: 'Awarded for outstanding debugging, root cause analysis, and preemptive testing.'
    },
    'UI Wizard': {
        title: 'UI/UX Design & Frontend Wizard',
        issuer: 'Frontend Practice',
        desc: 'Recognizes design system contributions, CSS wizardry, and premium user experience creation.'
    }
};

export function MemberListLevel() {
    const { selectedTeam, selectedTeamName, selectedProjectName } = useAppSelector((s) => s.drilldown);
    const { data: team, isLoading } = useTeam(selectedTeam || '');
    const [selectedMember, setSelectedMember] = useState<any | null>(null);

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
                    const badgesList = user?.badge ? user.badge.split(',').map((x: string) => x.trim()).filter((x: string) => x && x !== 'none') : [];

                    return (
                        <Card
                            key={member.id}
                            className="overflow-hidden relative group rounded-2xl border border-border/40 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card/70 backdrop-blur-sm"
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
                                        
                                        {badgesList.length > 0 && (
                                            <div className="flex flex-wrap gap-1 pt-1.5">
                                                {badgesList.map((badgeName: string) => {
                                                    const badgeStyle = getBadgeStyles(badgeName);
                                                    return (
                                                        <span key={badgeName} className={cn(
                                                            "inline-flex items-center gap-1 border px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-sm transition-all duration-300 hover:scale-[1.02]",
                                                            badgeStyle.bg,
                                                            badgeStyle.glow
                                                        )}>
                                                            <badgeStyle.icon className="h-2 w-2 animate-pulse" />
                                                            {badgeStyle.label}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
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
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => setSelectedMember(member)}
                                            className="flex-1 rounded-xl h-8 text-xs font-bold gap-1.5 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all"
                                        >
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

            {/* Profile Modal */}
            {selectedMember && (() => {
                const user = selectedMember.user;
                const initials = (user?.fullName || 'UN').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                const badgesList = user?.badge ? user.badge.split(',').map((x: string) => x.trim()).filter((x: string) => x && x !== 'none') : [];

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md fade-in animate-duration-200">
                        <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-scale-up">
                            
                            {/* Gradient Header Banner */}
                            <div className="h-32 bg-gradient-to-r from-primary via-purple-600 to-indigo-500 relative flex items-center px-8">
                                <button 
                                    onClick={() => setSelectedMember(null)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="px-8 pb-8 -mt-12 relative z-10">
                                {/* Avatar & Primary Info Row */}
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                                    <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                                        <div className="h-24 w-24 rounded-2xl bg-card p-1.5 shadow-2xl ring-2 ring-border/20">
                                            <div className="h-full w-full rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-inner">
                                                {initials}
                                            </div>
                                        </div>
                                        <div className="space-y-1 pb-1">
                                            <h2 className="text-2xl font-black tracking-tight text-foreground">{user?.fullName}</h2>
                                            <p className="text-sm font-semibold text-primary uppercase tracking-wider">{selectedMember.roleInTeam}</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full py-1 px-3.5 text-xs font-bold w-fit">
                                        {user?.role || 'Contributor'}
                                    </Badge>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-border/40">
                                    {/* Left Details Info panel */}
                                    <div className="md:col-span-1 space-y-4">
                                        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Employee Profile</h4>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-muted-foreground block font-medium">Email Address</span>
                                                <span className="text-xs font-bold text-foreground break-all">{user?.email}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-muted-foreground block font-medium">System Role</span>
                                                <Badge className="bg-muted text-muted-foreground hover:bg-muted font-bold text-[10px] px-2 rounded-lg" variant="outline">
                                                    {user?.role || 'TEAM'}
                                                </Badge>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-muted-foreground block font-medium">Joined At</span>
                                                <span className="text-xs font-bold text-foreground">
                                                    {new Date(selectedMember.joinedAt || selectedMember.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Certifications Panel */}
                                    <div className="md:col-span-2 space-y-4">
                                        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                            <Award className="h-4 w-4 text-primary" />
                                            Professional Certifications ({badgesList.length})
                                        </h4>

                                        <div className="space-y-3.5 max-h-[260px] overflow-y-auto pr-1">
                                            {badgesList.length === 0 ? (
                                                <div className="p-6 rounded-2xl border border-dashed border-border/60 bg-muted/20 text-center">
                                                    <p className="text-sm font-medium text-muted-foreground">No certification badges assigned yet.</p>
                                                </div>
                                            ) : (
                                                badgesList.map((badgeName: string) => {
                                                    const badgeStyle = getBadgeStyles(badgeName);
                                                    const detail = BADGE_DETAILS[badgeName] || {
                                                        title: badgeName,
                                                        issuer: 'Platform verified',
                                                        desc: 'Verified user qualification badge.'
                                                    };

                                                    return (
                                                        <div key={badgeName} className="flex gap-4 p-3.5 rounded-2xl border border-border/40 bg-muted/10 hover:bg-muted/20 transition-all">
                                                            <div className="shrink-0 pt-0.5">
                                                                <span className={cn(
                                                                    "inline-flex items-center justify-center p-2 rounded-xl border shadow-sm",
                                                                    badgeStyle.bg,
                                                                    badgeStyle.glow
                                                                )}>
                                                                    <badgeStyle.icon className="h-5 w-5 animate-pulse" />
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1 min-w-0">
                                                                <div className="flex flex-wrap items-center gap-x-2">
                                                                    <span className="text-sm font-black text-foreground truncate">{detail.title}</span>
                                                                </div>
                                                                <div className="text-[10px] text-primary font-bold uppercase tracking-wider">
                                                                    Issuer: {detail.issuer}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                                    {detail.desc}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-4 border-t border-border/40 flex justify-end">
                                    <Button 
                                        onClick={() => setSelectedMember(null)}
                                        className="rounded-xl px-5"
                                    >
                                        Close Profile
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
