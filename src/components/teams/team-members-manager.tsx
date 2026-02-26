'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2, Users, Award, Briefcase, ChevronRight, Search, Pencil } from 'lucide-react';
import { TeamMemberFull } from '@/lib/types';
import { toast } from 'sonner';
import Link from 'next/link';

interface TeamMembersManagerProps {
    teamId: string;
    teamName: string;
    initialMembers?: TeamMemberFull[];
}



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
    const [searchQuery, setSearchQuery] = useState('');


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
                            className="rounded-xl shadow-lg transition-all h-10 px-6 gap-2 bg-primary shadow-primary/20 hover:shadow-primary/40"
                        >
                            <UserPlus className="h-4 w-4" />
                            Add Member
                        </Button>
                   
                </div>
            </div>



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
                                                <div className="flex items-center justify-center gap-1 opacity-0 group-hover/row:opacity-100 transition-all">
                                                    <Link href={`/teams/${teamId}/members/onboard?edit=${m.employeeId}`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-9 w-9 p-0 rounded-xl transition-all transform group-hover/row:scale-110"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveMember(m.id)}
                                                        className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 h-9 w-9 p-0 rounded-xl transition-all transform group-hover/row:scale-110"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
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
