'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { ArrowLeft, UserPlus, Loader2, Mail, Calendar, Award, Briefcase, Hash, GraduationCap, Check } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useCreateEmployee } from '@/hooks/use-employees';
import { useUpdateTeam } from '@/hooks/use-teams';

const SKILL_OPTIONS = [
    'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker',
    'Kubernetes', 'Java', 'Go', 'SQL', 'GraphQL', 'Vue.js', 'Tailwind',
    'PostgreSQL', 'Redis', 'CI/CD', 'Testing', 'System Design',
];

const ROLE_OPTIONS = [
    'Engineer I', 'Engineer II', 'Senior Engineer', 'Staff Engineer',
    'Principal Engineer', 'Lead Developer', 'QA Automation', 'SDET'
];

export default function OnboardTalentPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = params.teamId as string;
    const teamName = `Team ${teamId}`;

    const createEmployee = useCreateEmployee();
    const updateTeam = useUpdateTeam();

    const [selectedSkills] = useState<string[]>([]); // Keep for UI, though not in basic create DTO yet
    const [formData, setFormData] = useState({
        employeeId: `EMP-${String(Date.now()).slice(-4)}`,
        name: '',
        role: '',
        email: '',
        joiningDate: new Date().toISOString().split('T')[0],
        yearsOfExperience: '',
        currentProject: '',
    });

    const toggleSkill = (skill: string) => {
        // Implementation remains same or could be expanded
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.role || !formData.email || !formData.employeeId) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            // Step 1: Create the employee
            const createdEmployee = await createEmployee.mutateAsync({
                email: formData.email,
                fullName: formData.name,
                role: formData.role,
                employeeCode: formData.employeeId,
                experience: `${formData.yearsOfExperience} years`,
                joiningDate: formData.joiningDate ? new Date(formData.joiningDate).toISOString() : new Date().toISOString(),
            });

            // Step 2: Add the new employee to the team (and the team's project automatically)
            // Uses PUT /api/v1/teams with { id, employeeIds, projectId }
            // The backend resolves the team's existing projectId and links the employee to it.
            await updateTeam.mutateAsync({
                id: teamId,
                data: {
                    employeeIds: [(createdEmployee as any).data?.id || (createdEmployee as any).id],
                },
            });

            toast.success(`${formData.name} has been onboarded and added to the team`);
            router.push(`/teams/${teamId}/members`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to onboard employee');
        }
    };

    const isPending = createEmployee.isPending || updateTeam.isPending;

    return (
        <div className="space-y-6 max-w-4xl mx-auto fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/teams/${teamId}/members`}>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent/50">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <UserPlus className="h-8 w-8" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">Onboard Talent</h1>
                            <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 text-[10px] font-bold px-2 py-0">
                                {teamName}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">Enter professional background and assigned workspace metadata</p>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <Card className="border-primary/30 shadow-2xl bg-card/60 backdrop-blur-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <UserPlus className="h-32 w-32" />
                </div>
                <CardHeader className="relative z-10">
                    <CardTitle className="text-xl font-bold">Talent Acquisition</CardTitle>
                    <CardDescription>Fill in the details below to onboard a new member to {teamName}</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Bio Data */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-primary/70 mb-2">
                                    <Award className="h-3 w-3" />
                                    Primary Data
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Employee ID *</Label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={formData.employeeId}
                                                onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                                                placeholder="e.g. EMP-1234"
                                                className="pl-10 rounded-xl border-border/50 h-10 bg-background/50 font-mono"
                                            />
                                        </div>
                                    </div>
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
                                        <Label className="text-xs">Joining Date</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="date"
                                                value={formData.joiningDate}
                                                onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
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
                                    Professional Assignment
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


                        </div>

                        {/* Skills Selection */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-primary/70 mb-2">
                                <GraduationCap className="h-3 w-3" />
                                Technology Stack &amp; Competencies
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
                            <Link href={`/teams/${teamId}/members`}>
                                <Button variant="outline" type="button" className="rounded-2xl h-11 px-8 border-border/50">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="rounded-2xl h-11 px-12 shadow-xl shadow-primary/20 bg-primary hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
                            >
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                                Finalize Onboarding
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
