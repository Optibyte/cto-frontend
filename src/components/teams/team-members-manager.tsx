'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { UserPlus, Trash2, Users, Hash, Calendar, Award, Briefcase, Loader2, Mail, GraduationCap, X, ChevronRight, Search, Check } from 'lucide-react';
import { TeamMemberFull } from '@/lib/types';
import { toast } from 'sonner';

interface TeamMembersManagerProps {
    teamId: string;
    teamName: string;
    initialMembers?: TeamMemberFull[];
}

const SKILL_OPTIONS = [
    'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker',
    'Kubernetes', 'Java', 'Go', 'SQL', 'GraphQL', 'Vue.js', 'Tailwind',
    'PostgreSQL', 'Redis', 'CI/CD', 'Testing', 'System Design',
];

const ROLE_OPTIONS = [
    'Engineer I', 'Engineer II', 'Senior Engineer', 'Staff Engineer',
    'Principal Engineer', 'Lead Developer', 'QA Automation', 'SDET'
];

const initialMockMembers: TeamMemberFull[] = [
    {
        id: 'tm-001', employeeId: 'EMP-1102', name: 'Alice Johnson', role: 'Staff Engineer',
        email: 'alice.j@cto.ai', dateOfBirth: '1992-05-15', yearsOfExperience: 8,
        skills: ['React', 'TypeScript', 'Node.js', 'System Design'], currentProject: 'Platform V2',
        teamJoinDate: '2021-03-10', status: 'Active',
    },
    {
        id: 'tm-002', employeeId: 'EMP-1105', name: 'David Smith', role: 'Senior Engineer',
        email: 'david.s@cto.ai', dateOfBirth: '1990-11-22', yearsOfExperience: 10,
        skills: ['Python', 'Docker', 'Kubernetes', 'Go'], currentProject: 'Data Pipeline',
        teamJoinDate: '2022-01-15', status: 'Active',
    },
    {
        id: 'tm-003', employeeId: 'EMP-1112', name: 'Elena Rodriguez', role: 'QA Automation',
        email: 'elena.r@cto.ai', dateOfBirth: '1995-08-03', yearsOfExperience: 4,
        skills: ['Testing', 'TypeScript', 'CI/CD'], currentProject: 'Platform V2',
        teamJoinDate: '2023-06-01', status: 'Active',
    },
];

export function TeamMembersManager({ teamId, teamName, initialMembers }: TeamMembersManagerProps) {
    const [members, setMembers] = useState<TeamMemberFull[]>(initialMembers || initialMockMembers);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '', role: '', email: '', dateOfBirth: '',
        yearsOfExperience: '', currentProject: '',
    });

    const nextEmployeeId = `EMP-${2000 + members.length + 1}`;

    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
    };

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.role || !formData.email) {
            toast.error('Please fill in all required fields');
            return;
        }
        setIsAdding(true);
        setTimeout(() => {
            const newMember: TeamMemberFull = {
                id: `tm-${Date.now()}`,
                employeeId: nextEmployeeId,
                name: formData.name,
                role: formData.role,
                email: formData.email,
                dateOfBirth: formData.dateOfBirth || undefined,
                yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
                skills: selectedSkills,
                currentProject: formData.currentProject || undefined,
                teamJoinDate: new Date().toISOString().split('T')[0],
                status: 'Active',
            };
            setMembers([newMember, ...members]);
            setFormData({ name: '', role: '', email: '', dateOfBirth: '', yearsOfExperience: '', currentProject: '' });
            setSelectedSkills([]);
            setShowAddForm(false);
            setIsAdding(false);
            toast.success(`${newMember.name} has been onboarded to ${teamName}`);
        }, 800);
    };

    const handleRemoveMember = (memberId: string) => {
        const member = members.find(m => m.id === memberId);
        setMembers(members.filter(m => m.id !== memberId));
        if (member) toast.success(`Removed ${member.name} from roster`);
    };

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Context Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/10">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Users className="h-8 w-8" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-extrabold tracking-tight">{teamName}</h2>
                            <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 text-[10px] font-bold px-2 py-0">ID: {teamId}</Badge>
                        </div>
                        <p className="text-muted-foreground font-medium">Workforce Roster & Asset Management</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter roster..."
                            className="pl-9 w-[240px] rounded-xl border-border/50 h-10 bg-card/50"
                        />
                    </div>
                    <Button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className={`rounded-xl shadow-lg transition-all h-10 px-6 gap-2 ${showAddForm ? 'bg-muted text-foreground' : 'bg-primary shadow-primary/20 hover:shadow-primary/40'}`}
                    >
                        {showAddForm ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                        {showAddForm ? 'Close Editor' : 'Onboard Talent'}
                    </Button>
                </div>
            </div>

            {/* Add Member Form */}
            {showAddForm && (
                <Card className="border-primary/30 shadow-2xl bg-card/60 backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <UserPlus className="h-32 w-32" />
                    </div>
                    <CardHeader className="relative z-10">
                        <CardTitle className="text-xl font-bold">Talent Acquisition</CardTitle>
                        <CardDescription>Enter professional background and assigned workspace metadata</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 space-y-8">
                        <form onSubmit={handleAddMember} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Bio Data */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-primary/70 mb-2">
                                        <Award className="h-3 w-3" />
                                        Primary Data
                                    </div>
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Full Capacity Name *</Label>
                                            <Input
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g. John Doe"
                                                className="rounded-xl border-border/50 h-10 bg-background/50"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Corporate Email *</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="john.doe@cto.ai"
                                                    className="pl-10 rounded-xl border-border/50 h-10 bg-background/50"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Date of Birth</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="date"
                                                    value={formData.dateOfBirth}
                                                    onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                                    className="pl-10 rounded-xl border-border/50 h-10 bg-background/50"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Data */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-primary/70 mb-2">
                                        <Briefcase className="h-3 w-3" />
                                        Professional assignment
                                    </div>
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Assigned Role *</Label>
                                            <Select value={formData.role} onValueChange={v => setFormData({ ...formData, role: v })}>
                                                <SelectTrigger className="rounded-xl border-border/50 h-10 bg-background/50"><SelectValue placeholder="Select role" /></SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    {ROLE_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Industry Experience (Years)</Label>
                                            <Input
                                                type="number"
                                                value={formData.yearsOfExperience}
                                                onChange={e => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                                                placeholder="e.g. 5"
                                                className="rounded-xl border-border/50 h-10 bg-background/50"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Current Mission (Project)</Label>
                                            <Input
                                                value={formData.currentProject}
                                                onChange={e => setFormData({ ...formData, currentProject: e.target.value })}
                                                placeholder="e.g. Platform Core"
                                                className="rounded-xl border-border/50 h-10 bg-background/50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Metadata & Summary */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-primary/70 mb-2">
                                        <Hash className="h-3 w-3" />
                                        System Assignment
                                    </div>
                                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Permanent ID</span>
                                            <span className="font-mono text-sm font-black text-primary">{nextEmployeeId}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">Allocation</span>
                                            <span className="text-xs font-bold">{teamName}</span>
                                        </div>
                                        <div className="h-px bg-primary/10 w-full" />
                                        <div className="text-[10px] text-muted-foreground leading-relaxed italic">
                                            By onboarding this talent, you agree to track all associated performance indicators and learning levels.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Selection */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-primary/70 mb-2">
                                    <GraduationCap className="h-3 w-3" />
                                    Technology Stack & Competencies
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {SKILL_OPTIONS.map(skill => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => toggleSkill(skill)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300
                                                ${selectedSkills.includes(skill)
                                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 ring-2 ring-primary/20'
                                                    : 'bg-card border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                                }`}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-border/10">
                                <Button
                                    type="submit"
                                    disabled={isAdding}
                                    className="rounded-2xl h-11 px-12 shadow-xl shadow-primary/20 bg-primary hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
                                >
                                    {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                                    Finalize Onboarding
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Members Table */}
            <Card className="border-border/50 shadow-2xl bg-card/60 backdrop-blur-xl overflow-hidden group/container">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/10 bg-muted/20">
                                    <th className="text-left py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Employee Reference</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Identity & Mission</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Capability Matrix</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Allocation</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground text-center">Lifecycle</th>
                                    <th className="text-center py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Control</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <p className="text-muted-foreground font-medium">No matching talent found in roster</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMembers.map((m) => (
                                        <tr key={m.id} className="border-b border-border/5 hover:bg-primary/5 transition-all duration-300 group/row">
                                            <td className="py-5 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-xs font-black text-primary mb-1 underline underline-offset-4 decoration-primary/20">{m.employeeId}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground leading-none">JOINED {m.teamJoinDate}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary group-hover/row:scale-110 transition-transform">
                                                        {m.name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm tracking-tight">{m.name}</span>
                                                        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                                            <Briefcase className="h-3 w-3 opacity-50" />
                                                            {m.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                                        <Award className="h-3 w-3" />
                                                        {m.yearsOfExperience} Yrs Exp
                                                    </span>
                                                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                                                        {m.skills.slice(0, 3).map(s => (
                                                            <Badge key={s} variant="secondary" className="text-[9px] px-2 py-0 rounded-md font-bold bg-primary/10 border-0 text-primary">{s}</Badge>
                                                        ))}
                                                        {m.skills.length > 3 && (
                                                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 rounded-md font-bold border-border/50">+{m.skills.length - 3}</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold group-hover/row:text-primary transition-colors">{m.currentProject || 'Bench'}</span>
                                                    <div className="flex items-center gap-1.5 mt-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Product Track</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4 text-center">
                                                <Badge className="rounded-xl px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border-0">
                                                    {m.status}
                                                </Badge>
                                            </td>
                                            <td className="py-5 px-6 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveMember(m.id)}
                                                    className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 h-9 w-9 p-0 rounded-xl opacity-0 group-hover/row:opacity-100 transition-all transform group-hover/row:scale-110"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-center pt-4">
                <Button variant="outline" className="rounded-xl border-border/50 text-xs font-bold gap-2 text-muted-foreground hover:text-primary transition-all">
                    Load Archive
                    <ChevronRight className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}
