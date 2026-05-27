'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAppSelector } from '@/redux/store';
import { useTeam } from '@/hooks/use-teams';
import { Loader2, Mail, User, Shield, Briefcase, Calendar, ExternalLink, X, Award, Check, Plus, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getBadgeStyles } from '@/lib/badges';
import { adminUsersAPI } from '@/lib/api/admin';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import * as Popover from '@radix-ui/react-popover';

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
    },
    'Certified Scrum Master': {
        title: 'Certified ScrumMaster (CSM)',
        issuer: 'Scrum Alliance',
        desc: 'Demonstrates understanding of Scrum methodology, roles, events, and artifacts.'
    },
    'AWS Solutions Architect': {
        title: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services (AWS)',
        desc: 'Validates ability to design and deploy scalable, highly available systems on AWS.'
    },
    'Azure DevOps Engineer': {
        title: 'Microsoft Certified: Azure DevOps Engineer Expert',
        issuer: 'Microsoft',
        desc: 'Expert-level certification for designing and implementing DevOps practices using Azure technologies.'
    },
    'Google Cloud Professional': {
        title: 'Google Cloud Professional Architect',
        issuer: 'Google Cloud',
        desc: 'Demonstrates ability to design, develop, and manage robust cloud architecture on GCP.'
    },
    'Kubernetes Administrator': {
        title: 'Certified Kubernetes Administrator',
        issuer: 'CNCF',
        desc: 'Validates skills in Kubernetes cluster administration and operations.'
    },
    'Testing Ninja': {
        title: 'Testing Ninja',
        issuer: 'Internal QA Practice',
        desc: 'Awarded for excellence in test strategy, automation frameworks, and quality assurance.'
    },
    'Data Architect': {
        title: 'Data Architecture Expert',
        issuer: 'Internal Data Practice',
        desc: 'Recognizes proficiency in data modeling, ETL pipelines, and database optimization.'
    },
    'CISSP Certified': {
        title: 'CISSP Certified Professional',
        issuer: 'ISC2',
        desc: 'Information security certification for experienced security practitioners.'
    },
};

const AVAILABLE_BADGES = [
    { name: 'Microsoft Azure AI Engineer', label: 'Azure AI' },
    { name: 'Amazon Web Services DevOps Engineer', label: 'AWS DevOps' },
    { name: 'Cloud Native Computing Foundation Kubernetes Administrator', label: 'CNCF CKA' },
    { name: 'ISC2 CISSP', label: 'ISC2 CISSP' },
    { name: 'Google Professional Data Engineer', label: 'Google Data' },
    { name: 'DevOps Guru', label: 'DevOps Guru' },
    { name: 'AI Pioneer', label: 'AI Pioneer' },
    { name: 'Cloud Architect', label: 'Cloud Architect' },
    { name: 'Security Champion', label: 'Security' },
    { name: 'Agile Master', label: 'Agile Master' },
    { name: 'Code Ninja', label: 'Code Ninja' },
    { name: 'Bug Hunter', label: 'Bug Hunter' },
    { name: 'UI Wizard', label: 'UI Wizard' },
    { name: 'Certified Scrum Master', label: 'Scrum Master' },
    { name: 'AWS Solutions Architect', label: 'AWS SA' },
    { name: 'Azure DevOps Engineer', label: 'Azure DevOps' },
    { name: 'Google Cloud Professional', label: 'GCP Pro' },
    { name: 'Kubernetes Administrator', label: 'K8s Admin' },
    { name: 'Testing Ninja', label: 'Testing Ninja' },
    { name: 'Data Architect', label: 'Data Architect' },
    { name: 'CISSP Certified', label: 'CISSP' },
];

// ─── Badge Popover (inline badge assignment) ─────────────────────────
function BadgePopover({ userId, userName, currentBadge, onUpdate }: {
    userId: string;
    userName: string;
    currentBadge: string;
    onUpdate: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const badgeList = currentBadge
        ? currentBadge.split(',').map((x: string) => x.trim()).filter((x: string) => x && x !== 'none')
        : [];

    const handleToggle = async (badgeName: string) => {
        setSaving(true);
        try {
            let nextBadges: string[];
            if (badgeList.includes(badgeName)) {
                nextBadges = badgeList.filter((x: string) => x !== badgeName);
            } else {
                nextBadges = [...badgeList, badgeName];
            }
            const finalVal = nextBadges.join(', ');
            await adminUsersAPI.update(userId, { badge: finalVal || 'none' });
            toast.success(`Badge updated for ${userName}`);
            onUpdate();
        } catch (err: any) {
            toast.error(`Failed to update badge: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleClear = async () => {
        setSaving(true);
        try {
            await adminUsersAPI.update(userId, { badge: 'none' });
            toast.success(`Badges cleared for ${userName}`);
            onUpdate();
        } catch (err: any) {
            toast.error(`Failed to clear badges: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                        "p-1.5 rounded-lg transition-all duration-200 shrink-0 cursor-pointer z-50",
                        "hover:bg-primary/10 hover:text-primary hover:scale-110",
                        open
                            ? "bg-primary/15 text-primary shadow-sm"
                            : "text-muted-foreground"
                    )}
                    title="Manage badges"
                >
                    <Award className="h-3.5 w-3.5" />
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    align="end"
                    sideOffset={6}
                    className="z-[9999] w-[260px] rounded-xl border border-border/60 bg-card shadow-2xl shadow-black/20 dark:shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                >
                    {/* Header */}
                    <div className="px-3 py-2 bg-gradient-to-r from-primary/10 via-purple-500/5 to-transparent border-b border-border/30 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5 text-primary" />
                            <span className="text-[11px] font-bold text-foreground">Badges</span>
                            <span className="text-[10px] text-muted-foreground">• {userName.split(' ')[0]}</span>
                        </div>
                        <Popover.Close asChild>
                            <button
                                className="p-0.5 rounded hover:bg-muted transition-colors cursor-pointer"
                            >
                                <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                        </Popover.Close>
                    </div>

                    {/* Badge Grid */}
                    <div className="p-1.5 max-h-[240px] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-1">
                            {AVAILABLE_BADGES.map((b) => {
                                const isActive = badgeList.includes(b.name);
                                const badgeStyle = getBadgeStyles(b.name);
                                return (
                                    <button
                                        key={b.name}
                                        onClick={() => handleToggle(b.name)}
                                        disabled={saving}
                                        className={cn(
                                            "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left transition-all duration-100 cursor-pointer",
                                            isActive
                                                ? "bg-primary/10 ring-1 ring-primary/25"
                                                : "hover:bg-muted/60"
                                        )}
                                    >
                                        <span className={cn(
                                            "shrink-0 p-0.5 rounded",
                                            isActive ? badgeStyle.bg : "text-muted-foreground/50"
                                        )}>
                                            <badgeStyle.icon className="h-2.5 w-2.5" />
                                        </span>
                                        <span className={cn(
                                            "flex-1 text-[10px] font-semibold truncate leading-tight",
                                            isActive ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                            {b.label}
                                        </span>
                                        {isActive && (
                                            <Check className="h-2.5 w-2.5 text-primary shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    {badgeList.length > 0 && (
                        <div className="px-2 py-1.5 border-t border-border/30 bg-muted/20">
                            <button
                                onClick={handleClear}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold text-destructive hover:bg-destructive/10 transition-colors uppercase tracking-wider cursor-pointer"
                            >
                                <X className="h-2.5 w-2.5" />
                                Clear All
                            </button>
                        </div>
                    )}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}

// ── Member Profile Modal Component ──────────────────────────────────
interface MemberProfileModalProps {
    member: any;
    onClose: () => void;
    onUpdate: () => void;
}

function MemberProfileModal({ member, onClose, onUpdate }: MemberProfileModalProps) {
    const user = member.user;
    const initials = (user?.fullName || 'UN').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    const badgesList = user?.badge ? user.badge.split(',').map((x: string) => x.trim()).filter((x: string) => x && x !== 'none') : [];
    const aiProfile = user?.aiProfile;

    return (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            {/* Modal Box */}
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                {/* Gradient Header Banner */}
                <div className="h-32 bg-gradient-to-r from-primary via-purple-600 to-indigo-500 relative flex items-center px-8 shrink-0">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors z-20 cursor-pointer"
                        title="Close profile"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="px-8 pb-6 -mt-12 relative z-10 flex-1 overflow-y-auto">
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
                                <p className="text-sm font-semibold text-primary uppercase tracking-wider">{member.roleInTeam}</p>
                            </div>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full py-1 px-3.5 text-xs font-bold w-fit">
                            {user?.role || 'Contributor'}
                        </Badge>
                    </div>

                    <div className="grid md:grid-cols-12 gap-6 pt-4 border-t border-border/40">
                        {/* Left Details Info panel (4 cols) */}
                        <div className="md:col-span-4 space-y-5">
                            <div>
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Employee Details</h4>
                                <div className="space-y-3.5">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-muted-foreground block font-medium">Email Address</span>
                                        <a href={`mailto:${user?.email}`} className="text-xs font-bold text-primary hover:underline break-all">{user?.email}</a>
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
                                            {new Date(member.joinedAt || member.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    {aiProfile?.employmentType && (
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-muted-foreground block font-medium">Employment Type</span>
                                            <span className="text-xs font-bold text-foreground">{aiProfile.employmentType}</span>
                                        </div>
                                    )}
                                    {aiProfile?.experienceYears !== undefined && aiProfile?.experienceYears !== null && (
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-muted-foreground block font-medium">Experience</span>
                                            <span className="text-xs font-bold text-foreground">{aiProfile.experienceYears} Years</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Content panel (8 cols): Certifications + AI Profile */}
                        <div className="md:col-span-8 space-y-6">
                            {/* Certifications Section */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                        <Award className="h-4 w-4 text-primary animate-pulse" />
                                        Professional Certifications ({badgesList.length})
                                    </h4>
                                    <BadgePopover
                                        userId={user?.id}
                                        userName={user?.fullName || ''}
                                        currentBadge={user?.badge || ''}
                                        onUpdate={onUpdate}
                                    />
                                </div>

                                <div className="grid gap-2 max-h-[160px] overflow-y-auto pr-1">
                                    {badgesList.length === 0 ? (
                                        <div className="p-4 rounded-xl border border-dashed border-border/60 bg-muted/20 text-center">
                                            <p className="text-xs font-medium text-muted-foreground">No certification badges assigned yet.</p>
                                            <p className="text-[10px] text-muted-foreground/60 mt-1">Click the award icon above to assign badges</p>
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
                                                <div key={badgeName} className="flex gap-3 p-3 rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/20 transition-all">
                                                    <div className="shrink-0 pt-0.5">
                                                        <span className={cn(
                                                            "inline-flex items-center justify-center p-1.5 rounded-lg border shadow-sm",
                                                            badgeStyle.bg,
                                                            badgeStyle.glow
                                                        )}>
                                                            <badgeStyle.icon className="h-4 w-4" />
                                                        </span>
                                                    </div>
                                                    <div className="space-y-0.5 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-x-2">
                                                            <span className="text-xs font-black text-foreground truncate">{detail.title}</span>
                                                        </div>
                                                        <div className="text-[8px] text-primary font-bold uppercase tracking-wider">
                                                            Issuer: {detail.issuer}
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-1">
                                                            {detail.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* AI Profile Section */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <Brain className="h-4 w-4 text-emerald-500 animate-pulse" />
                                    AI Enablement Profile
                                </h4>

                                {aiProfile ? (
                                    <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">AI Integration Active</span>
                                            </div>
                                            {aiProfile.overallAiProficiency !== null && (
                                                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                    Overall: <span className="text-sm font-black">{aiProfile.overallAiProficiency}/10</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Skill Bars */}
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {aiProfile.primaryAiSkill && (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span className="text-foreground truncate">{aiProfile.primaryAiSkill}</span>
                                                        <span className="text-emerald-500">{aiProfile.primaryAiSkillProficiency}/10</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-emerald-500 rounded-full" 
                                                            style={{ width: `${(aiProfile.primaryAiSkillProficiency || 0) * 10}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {aiProfile.secondaryAiSkill && (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span className="text-foreground truncate">{aiProfile.secondaryAiSkill}</span>
                                                        <span className="text-emerald-500">{aiProfile.secondaryAiSkillProficiency}/10</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-emerald-500/70 rounded-full" 
                                                            style={{ width: `${(aiProfile.secondaryAiSkillProficiency || 0) * 10}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* AI Tools Used */}
                                        {aiProfile.aiToolsUsed && aiProfile.aiToolsUsed.length > 0 && (
                                            <div className="space-y-1.5">
                                                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">AI Tools Utilized</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {aiProfile.aiToolsUsed.map((tool: string) => (
                                                        <span key={tool} className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md text-[9px] font-black uppercase">
                                                            {tool}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-5 rounded-2xl border border-dashed border-border/60 bg-muted/10 text-center">
                                        <p className="text-xs font-semibold text-muted-foreground">AI enablement profile is not active for this member.</p>
                                        <p className="text-[10px] text-muted-foreground/60 mt-1">To enable AI capabilities, complete the team transformation program.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-border/40 flex justify-end bg-muted/10 shrink-0">
                    <Button 
                        onClick={onClose}
                        className="rounded-xl px-5 cursor-pointer"
                    >
                        Close Profile
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function MemberListLevel() {
    const { selectedTeam, selectedTeamName, selectedProjectName } = useAppSelector((s) => s.drilldown);
    const { data: team, isLoading } = useTeam(selectedTeam || '');
    const [selectedMember, setSelectedMember] = useState<any | null>(null);
    const queryClient = useQueryClient();

    const refreshTeam = () => {
        queryClient.invalidateQueries({ queryKey: ['teams', selectedTeam] });
    };

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
                <p className="text-muted-foreground">No members are assigned to &quot;{selectedTeamName}&quot;.</p>
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
                                        <div className="h-20 w-20 rounded-2xl bg-background p-1.5 shadow-xl ring-1 ring-border/50 animate-in zoom-in-95 duration-200">
                                            <div className="h-full w-full rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-inner">
                                                {initials}
                                            </div>
                                        </div>
                                        <Badge className={cn("rounded-full text-[10px] px-2 py-0.5 font-bold uppercase tracking-tighter",
                                            member.roleInTeam.toUpperCase().includes('LEAD') ? "bg-primary/10 text-primary border-primary/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20")}>
                                            {member.roleInTeam}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">{user?.fullName}</h3>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                                                <Briefcase className="h-3 w-3 text-primary/60" />
                                                {user?.role || 'Contributor'}
                                            </p>
                                            {user?.aiProfile && (
                                                <span className="flex items-center gap-1 text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full select-none animate-pulse">
                                                    <Brain className="h-2.5 w-2.5" />
                                                    AI ENABLED
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Badge Display + Inline Edit Icon */}
                                        <div className="flex items-start gap-1 pt-1.5">
                                            <div className="flex flex-wrap gap-1 flex-1 min-h-[22px]">
                                                {badgesList.length > 0 ? (
                                                    badgesList.map((badgeName: string) => {
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
                                                    })
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground/50 italic pt-0.5">No badges</span>
                                                )}
                                            </div>
                                            {/* Badge assignment icon */}
                                            <BadgePopover
                                                userId={user?.id}
                                                userName={user?.fullName || ''}
                                                currentBadge={user?.badge || ''}
                                                onUpdate={refreshTeam}
                                            />
                                        </div>
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
                                            className="flex-1 rounded-xl h-8 text-xs font-bold gap-1.5 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
                                        >
                                            Profile
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer">
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
            {selectedMember && (
                <MemberProfileModal 
                    member={selectedMember} 
                    onClose={() => setSelectedMember(null)} 
                    onUpdate={refreshTeam} 
                />
            )}
        </div>
    );
}
