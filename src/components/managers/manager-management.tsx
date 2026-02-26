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
    MoreVertical,
    Check,
    X
} from 'lucide-react';
import { ManagerFull } from '@/lib/types';
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

const initialMockManagers: ManagerFull[] = [
    {
        id: 'mgr-001',
        name: 'Ravi Kumar',
        email: 'ravi.k@cto.ai',
        project: 'Banking',
        onboardedDate: '2023-01-15',
        teamSize: 24,
        activeProjects: 6,
        status: 'Active',
        avatar: 'RK'
    },
    {
        id: 'mgr-002',
        name: 'Priya Sharma',
        email: 'priya.s@cto.ai',
        project: 'Healthcare',
        onboardedDate: '2023-03-20',
        teamSize: 18,
        activeProjects: 5,
        status: 'Active',
        avatar: 'PS'
    },
    {
        id: 'mgr-003',
        name: 'Ankit Patel',
        email: 'ankit.p@cto.ai',
        project: 'E-Commerce',
        onboardedDate: '2023-06-10',
        teamSize: 20,
        activeProjects: 4,
        status: 'Active',
        avatar: 'AP'
    }
];

export function ManagerManagement() {
    const [managers, setManagers] = useState<ManagerFull[]>(initialMockManagers);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingManager, setEditingManager] = useState<ManagerFull | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        project: '',
        status: 'Active' as 'Active' | 'Inactive'
    });

    const handleOpenAddDialog = () => {
        setEditingManager(null);
        setFormData({ name: '', email: '', project: '', status: 'Active' });
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (manager: ManagerFull) => {
        setEditingManager(manager);
        setFormData({
            name: manager.name,
            email: manager.email,
            project: manager.project,
            status: manager.status
        });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingManager(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.project) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (editingManager) {
            // Update
            setManagers(managers.map(m =>
                m.id === editingManager.id
                    ? { ...m, ...formData }
                    : m
            ));
            toast.success(`Manager ${formData.name} updated successfully`);
        } else {
            // Create
            const newManager: ManagerFull = {
                id: `mgr-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                ...formData,
                onboardedDate: new Date().toISOString().split('T')[0],
                teamSize: 0,
                activeProjects: 0,
                avatar: formData.name.split(' ').map(n => n[0]).join('').toUpperCase()
            };
            setManagers([newManager, ...managers]);
            toast.success(`Manager ${formData.name} created successfully`);
        }

        handleCloseDialog();
    };

    const handleDeleteManager = (id: string) => {
        const manager = managers.find(m => m.id === id);
        if (confirm(`Are you sure you want to delete ${manager?.name}?`)) {
            setManagers(managers.filter(m => m.id !== id));
            toast.success(`Manager ${manager?.name} removed`);
        }
    };

    const filteredManagers = managers.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.project.toLowerCase().includes(searchQuery.toLowerCase())
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
                        <h2 className="text-2xl font-extrabold tracking-tight">Manager Directory</h2>
                        <p className="text-muted-foreground font-medium">Manage and monitor organizational leadership</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search managers..."
                            className="pl-9 w-[240px] rounded-xl border-border/50 h-10 bg-card/50"
                        />
                    </div>
                    <Button
                        onClick={handleOpenAddDialog}
                        className="rounded-xl shadow-lg transition-all h-10 px-6 gap-2 bg-primary shadow-primary/20 hover:shadow-primary/40"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add Manager
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
                                    <th className="text-left py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Manager</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Project</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Stats</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Joined</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground text-center">Status</th>
                                    <th className="text-center py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredManagers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <p className="text-muted-foreground font-medium">No managers found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredManagers.map((m) => (
                                        <tr key={m.id} className="border-b border-border/5 hover:bg-primary/5 transition-all duration-300 group/row">
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary group-hover/row:scale-110 transition-transform">
                                                        {m.avatar || m.name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm tracking-tight">{m.name}</span>
                                                        <span className="text-[11px] font-medium text-muted-foreground">{m.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{m.project}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {m.teamSize} Member Team
                                                    </span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                                        <Briefcase className="h-3 w-3" />
                                                        {m.activeProjects} Active Projects
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span className="text-xs font-mono">{m.onboardedDate}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4 text-center">
                                                <Badge className={`rounded-xl px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border-0 ${m.status === 'Active'
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : 'bg-rose-500/10 text-rose-500'
                                                    }`}>
                                                    {m.status}
                                                </Badge>
                                            </td>
                                            <td className="py-5 px-6 text-center">
                                                <div className="flex items-center justify-center gap-1 opacity-0 group-hover/row:opacity-100 transition-all">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenEditDialog(m)}
                                                        className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-9 w-9 rounded-xl transition-all"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteManager(m.id)}
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
                        <DialogTitle>{editingManager ? 'Edit Manager' : 'Add New Manager'}</DialogTitle>
                        <DialogDescription>
                            {editingManager ? 'Update manager details below.' : 'Enter details to register a new manager.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. John Doe"
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
                                placeholder="name@company.com"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="project">Project</Label>
                            <Input
                                id="project"
                                value={formData.project}
                                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                                placeholder="e.g. Banking"
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
                                {editingManager ? 'Update Manager' : 'Create Manager'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
