'use client';

import { useState, useEffect } from 'react';
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
    X,
    Loader2
} from 'lucide-react';
import { ManagerFull } from '@/lib/types';
import { toast } from 'sonner';
import { managersAPI } from '@/lib/api/client';
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
    const [managers, setManagers] = useState<ManagerFull[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingManager, setEditingManager] = useState<ManagerFull | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        employeeCode: '',
        experience: '',
        status: 'Active' as 'Active' | 'Inactive'
    });

    useEffect(() => {
        fetchManagers();
    }, []);

    const mapManagerData = (m: any): ManagerFull => ({
        ...m,
        name: m.user?.fullName || m.fullName || m.name || 'Unknown Manager',
        email: m.user?.email || m.email || '',
        status: m.status || 'Active'
    });

    const fetchManagers = async () => {
        setIsLoading(true);
        try {
            const { data } = await managersAPI.getAll();
            setManagers((data || []).map(mapManagerData));
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch managers');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenAddDialog = () => {
        setEditingManager(null);
        setFormData({ name: '', email: '', employeeCode: '', experience: '', status: 'Active' });
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (manager: ManagerFull) => {
        if (editingManager) {
            setFormData({
                name: editingManager.name,
                email: editingManager.email,
                employeeCode: editingManager.employeeCode || '',
                experience: editingManager.experience || '',
                status: editingManager.status || 'Active'
            });
        } else {
            setFormData({
                name: '',
                email: '',
                employeeCode: '',
                experience: '',
                status: 'Active'
            });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingManager(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (editingManager) {
                // Update
                const { data } = await managersAPI.update(editingManager.id, formData);
                const updated = mapManagerData(data);
                setManagers(managers.map(m =>
                    m.id === editingManager.id ? updated : m
                ));
                toast.success(`Manager ${formData.name} updated successfully`);
            } else {
                // Create
                const { data } = await managersAPI.create(formData);
                const mapped = mapManagerData(data);
                setManagers([mapped, ...managers]);
                toast.success(`Manager ${formData.name} created successfully`);
            }
            handleCloseDialog();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save manager');
        }
    };

    const handleDeleteManager = async (id: string) => {
        const manager = managers.find(m => m.id === id);
        if (confirm(`Are you sure you want to delete ${manager?.fullName || manager?.name}?`)) {
            try {
                await managersAPI.delete(id);
                setManagers(managers.filter(m => m.id !== id));
                toast.success(`Manager ${manager?.fullName || manager?.name} removed`);
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete manager');
            }
        }
    };

    const filteredManagers = managers.filter(m =>
        (m.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (m.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (m.project?.toLowerCase() || "").includes(searchQuery.toLowerCase())
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
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground text-center">Status</th>
                                    <th className="text-center py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={3} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <p className="text-muted-foreground font-medium">Loading managers...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredManagers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-20 text-center">
                                            <p className="text-muted-foreground font-medium">No managers found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredManagers.map((m) => (
                                        <tr key={m.id} className="border-b border-border/5 hover:bg-primary/5 transition-all duration-300 group/row">
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary group-hover/row:scale-110 transition-transform">
                                                        {m.avatar || m.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm tracking-tight">{m.fullName || m.name || 'Unknown Manager'}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] font-medium text-muted-foreground">{m.email}</span>
                                                            {m.employeeCode && <span className="text-[10px] bg-muted px-1.5 rounded text-muted-foreground uppercase">{m.employeeCode}</span>}
                                                        </div>
                                                    </div>
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
                                placeholder="manager@cto.ai"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="h-11 rounded-xl bg-background border-border/50 focus:bg-accent/50 transition-colors"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="employeeCode">Employee Code</Label>
                                <Input
                                    id="employeeCode"
                                    value={formData.employeeCode}
                                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                                    placeholder="e.g. TL001"
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="experience">Experience</Label>
                                <Input
                                    id="experience"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    placeholder="e.g. 5 years"
                                    className="rounded-xl"
                                />
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
