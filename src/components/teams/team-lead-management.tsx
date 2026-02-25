'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    UserPlus,
    Trash2,
    Users,
    Search,
    Pencil,
    Building2,
    Calendar,
    Briefcase,
    Award,
    MoreVertical
} from 'lucide-react';
import { TeamLeadFull } from '@/lib/types';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

const initialMockTeamLeads: TeamLeadFull[] = [
    {
        id: 'tl-001',
        name: 'Suresh Babu',
        email: 'suresh.b@cto.ai',
        department: 'Banking',
        onboardedDate: '2023-02-10',
        teamSize: 8,
        performance: 88,
        status: 'Active',
        avatar: 'SB'
    },
    {
        id: 'tl-002',
        name: 'Nithya Devi',
        email: 'nithya.d@cto.ai',
        department: 'Logistics',
        onboardedDate: '2023-04-15',
        teamSize: 7,
        performance: 82,
        status: 'Active',
        avatar: 'ND'
    },
    {
        id: 'tl-003',
        name: 'Deepak Verma',
        email: 'deepak.v@cto.ai',
        department: 'Healthcare',
        onboardedDate: '2023-07-01',
        teamSize: 10,
        performance: 90,
        status: 'Active',
        avatar: 'DV'
    }
];

export function TeamLeadManagement() {
    const [teamLeads, setTeamLeads] = useState<TeamLeadFull[]>(initialMockTeamLeads);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTeamLead, setEditingTeamLead] = useState<TeamLeadFull | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        status: 'Active' as 'Active' | 'Inactive'
    });

    const handleOpenAddDialog = () => {
        setEditingTeamLead(null);
        setFormData({ name: '', email: '', department: '', status: 'Active' });
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (tl: TeamLeadFull) => {
        setEditingTeamLead(tl);
        setFormData({
            name: tl.name,
            email: tl.email,
            department: tl.department,
            status: tl.status
        });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingTeamLead(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.department) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (editingTeamLead) {
            // Update
            setTeamLeads(teamLeads.map(tl =>
                tl.id === editingTeamLead.id
                    ? { ...tl, ...formData }
                    : tl
            ));
            toast.success(`Team Lead ${formData.name} updated successfully`);
        } else {
            // Create
            const newTeamLead: TeamLeadFull = {
                id: `tl-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                ...formData,
                onboardedDate: new Date().toISOString().split('T')[0],
                teamSize: 0,
                performance: 0,
                avatar: formData.name.split(' ').map(n => n[0]).join('').toUpperCase()
            };
            setTeamLeads([newTeamLead, ...teamLeads]);
            toast.success(`Team Lead ${formData.name} created successfully`);
        }

        handleCloseDialog();
    };

    const handleDeleteTeamLead = (id: string) => {
        const tl = teamLeads.find(t => t.id === id);
        if (confirm(`Are you sure you want to delete ${tl?.name}?`)) {
            setTeamLeads(teamLeads.filter(t => t.id !== id));
            toast.success(`Team Lead ${tl?.name} removed`);
        }
    };

    const filteredTeamLeads = teamLeads.filter(tl =>
        tl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tl.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tl.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border/10">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Users className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight">Team Lead Directory</h2>
                        <p className="text-muted-foreground font-medium">Manage and monitor squad leadership</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search team leads..."
                            className="pl-9 w-[240px] rounded-xl border-border/50 h-10 bg-card/50"
                        />
                    </div>
                    <Button
                        onClick={handleOpenAddDialog}
                        className="rounded-xl shadow-lg transition-all h-10 px-6 gap-2 bg-primary shadow-primary/20 hover:shadow-primary/40"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add Team Lead
                    </Button>
                </div>
            </div>

            {/* Table */}
            <Card className="border-border/50 shadow-2xl bg-card/60 backdrop-blur-xl overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/10 bg-muted/20">
                                    <th className="text-left py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Team Lead</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Department</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Performance</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Team Size</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground text-center">Status</th>
                                    <th className="text-center py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTeamLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <p className="text-muted-foreground font-medium">No team leads found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTeamLeads.map((tl) => (
                                        <tr key={tl.id} className="border-b border-border/5 hover:bg-primary/5 transition-all duration-300 group/row">
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary group-hover/row:scale-110 transition-transform">
                                                        {tl.avatar || tl.name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm tracking-tight">{tl.name}</span>
                                                        <span className="text-[11px] font-medium text-muted-foreground">{tl.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{tl.department}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Award className="h-4 w-4 text-amber-500" />
                                                    <span className="font-bold text-sm">{tl.performance}%</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{tl.teamSize} Members</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4 text-center">
                                                <Badge className={`rounded-xl px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border-0 ${tl.status === 'Active'
                                                        ? 'bg-emerald-500/10 text-emerald-500'
                                                        : 'bg-rose-500/10 text-rose-500'
                                                    }`}>
                                                    {tl.status}
                                                </Badge>
                                            </td>
                                            <td className="py-5 px-6 text-center">
                                                <div className="flex items-center justify-center gap-1 opacity-0 group-hover/row:opacity-100 transition-all">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenEditDialog(tl)}
                                                        className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-9 w-9 rounded-xl transition-all"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteTeamLead(tl.id)}
                                                        className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 h-9 w-9 rounded-xl transition-all"
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

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>{editingTeamLead ? 'Edit Team Lead' : 'Add New Team Lead'}</DialogTitle>
                        <DialogDescription>
                            {editingTeamLead ? 'Update team lead details below.' : 'Enter details to register a new team lead.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Michael Scott"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="lead@company.com"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                placeholder="e.g. Sales"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={formData.status === 'Active' ? 'default' : 'outline'}
                                    className="flex-1 rounded-xl"
                                    onClick={() => setFormData({ ...formData, status: 'Active' })}
                                >
                                    Active
                                </Button>
                                <Button
                                    type="button"
                                    variant={formData.status === 'Inactive' ? 'destructive' : 'outline'}
                                    className="flex-1 rounded-xl"
                                    onClick={() => setFormData({ ...formData, status: 'Inactive' })}
                                >
                                    Inactive
                                </Button>
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button variant="outline" type="button" onClick={handleCloseDialog} className="rounded-xl">Cancel</Button>
                            <Button type="submit" className="rounded-xl bg-primary hover:bg-primary/90">
                                {editingTeamLead ? 'Update Team Lead' : 'Create Team Lead'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
