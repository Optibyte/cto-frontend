'use client';

import { useState, useMemo } from 'react';
import {
    Shield, Check, Info, User, Mail, Briefcase, Hash, Calendar,
    Clock, Loader2, Search, Edit2, UserPlus, Trash2, X, MoreVertical,
    Power, UserCheck, UserX
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
    DialogFooter, DialogClose
} from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useCreateEmployee, useEmployees, useUpdateEmployee } from '@/hooks/use-employees';

export default function AccessControlPage() {
    const { data: employees = [], isLoading: employeesLoading } = useEmployees();
    const createEmployee = useCreateEmployee();
    const updateEmployee = useUpdateEmployee();

    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        employeeCode: '',
        email: '',
        role: '',
        experience: '1 years',
        joiningDate: new Date().toISOString().split('T')[0],
    });

    const filteredEmployees = useMemo(() => {
        if (!searchTerm) return employees;
        const term = searchTerm.toLowerCase();
        return employees.filter((emp: any) =>
            emp.user?.fullName?.toLowerCase().includes(term) ||
            emp.user?.email?.toLowerCase().includes(term) ||
            emp.employeeCode?.toLowerCase().includes(term) ||
            emp.id.toLowerCase().includes(term)
        );
    }, [employees, searchTerm]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleEditInputChange = (field: string, value: any) => {
        setEditingEmployee((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleCreateEmployee = async () => {
        if (!formData.fullName || !formData.email || !formData.role || !formData.employeeCode) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            await createEmployee.mutateAsync({
                email: formData.email,
                fullName: formData.fullName,
                role: formData.role,
                employeeCode: formData.employeeCode,
                experience: formData.experience,
                joiningDate: new Date(formData.joiningDate).toISOString(),
            });
            toast.success('Employee created successfully!');
            resetForm();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create employee');
        }
    };

    const handleUpdateEmployee = async () => {
        if (!editingEmployee) return;

        try {
            await updateEmployee.mutateAsync({
                id: editingEmployee.id,
                data: {
                    fullName: editingEmployee.user?.fullName,
                    email: editingEmployee.user?.email,
                    role: editingEmployee.user?.role,
                    employeeCode: editingEmployee.employeeCode,
                    experience: editingEmployee.experience,
                    isActive: editingEmployee.user?.isActive,
                }
            });
            toast.success('Employee updated successfully!');
            setIsEditModalOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update employee');
        }
    };

    const resetForm = () => {
        setFormData({
            fullName: '',
            employeeCode: '',
            email: '',
            role: '',
            experience: '1 years',
            joiningDate: new Date().toISOString().split('T')[0],
        });
    };

    const openEditModal = (employee: any) => {
        setEditingEmployee({ ...employee });
        setIsEditModalOpen(true);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/20 pb-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-tr from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                        Access Control
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Manage your workforce, roles, and system access.
                    </p>
                </div>
                <Badge variant="outline" className="h-fit py-1 px-4 text-sm font-medium border-primary/20 bg-primary/5 text-primary">
                    {employees.length} Total Employees
                </Badge>
            </div>

            <Tabs defaultValue="list" className="w-full">
                <TabsList className="mb-6 h-12 p-1 bg-muted/50 rounded-2xl border border-border/40 w-full max-w-[400px]">
                    <TabsTrigger value="list" className="rounded-xl flex-1 data-[state=active]:bg-background data-[state=active]:shadow-md">
                        <User className="h-4 w-4 mr-2" /> Employee List
                    </TabsTrigger>
                    <TabsTrigger value="onboard" className="rounded-xl flex-1 data-[state=active]:bg-background data-[state=active]:shadow-md">
                        <UserPlus className="h-4 w-4 mr-2" /> New Onboarding
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:max-w-md group">
                            <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search by name, email, or employee code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 h-12 rounded-2xl border-border/40 bg-muted/20 focus-visible:ring-primary/20 focus-visible:bg-background transition-all"
                            />
                        </div>
                    </div>

                    <Card className="border-border/40 shadow-xl shadow-black/5 overflow-hidden rounded-3xl">
                        <CardHeader className="bg-muted/30 border-b border-border/10">
                            <CardTitle className="text-xl">Workforce Records</CardTitle>
                            <CardDescription>Comprehensive list of all registered employees.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="h-[600px] w-full overflow-y-auto">
                                {employeesLoading ? (
                                    <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <p>Synchronizing workforce data...</p>
                                    </div>
                                ) : filteredEmployees.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground border-2 border-dashed border-border/20 m-6 rounded-3xl">
                                        <UserX className="h-12 w-12 opacity-20" />
                                        <div className="text-center">
                                            <p className="font-semibold">No records found</p>
                                            <p className="text-sm">Try adjusting your search criteria</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full">
                                        <table className="w-full text-sm">
                                            <thead className="sticky top-0 bg-background/95 backdrop-blur-md z-10 border-b border-border/20">
                                                <tr className="text-muted-foreground font-medium uppercase text-[10px] tracking-wider">
                                                    <th className="text-left px-6 py-4">Employee</th>
                                                    <th className="text-left px-6 py-4">Designation</th>
                                                    <th className="text-left px-6 py-4">Code</th>
                                                    <th className="text-center px-6 py-4">Status</th>
                                                    <th className="text-right px-6 py-4">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/10">
                                                {filteredEmployees.map((emp: any) => (
                                                    <tr key={emp.id} className="hover:bg-muted/30 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-xs font-bold text-white shadow-lg ${emp.user?.isActive ? 'bg-gradient-to-br from-primary/80 to-primary' : 'bg-muted-foreground/40'}`}>
                                                                    {emp.user?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold text-foreground">{emp.user?.fullName}</span>
                                                                    <span className="text-[11px] text-muted-foreground mt-0.5">{emp.user?.email}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-muted-foreground truncate max-w-[150px]">
                                                            <Badge variant="secondary" className="bg-muted/50 font-normal text-xs rounded-lg border-none">
                                                                {emp.user?.role}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-xs font-medium text-muted-foreground/70">
                                                            {emp.employeeCode}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <Badge variant={emp.user?.isActive ? 'default' : 'secondary'} className={`rounded-xl px-3 py-0.5 text-[10px] font-bold uppercase transition-all ${emp.user?.isActive ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/20'}`}>
                                                                {emp.user?.isActive ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                                                    onClick={() => openEditModal(emp)}
                                                                >
                                                                    <Edit2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="onboard">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-border/40 shadow-xl shadow-black/5 overflow-hidden rounded-3xl">
                                <CardHeader className="bg-muted/30 pb-4 border-b border-border/10">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-primary/10 rounded-xl">
                                            <UserPlus className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">Employee Onboarding</CardTitle>
                                            <CardDescription>Initialize a new professional profile in the system.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name *</Label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/50" />
                                                <Input
                                                    id="name"
                                                    placeholder="e.g. Abi"
                                                    value={formData.fullName}
                                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                                    className="pl-12 h-12 rounded-2xl border-border/40 bg-muted/10 focus-visible:ring-primary/20 focus-visible:bg-background transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="id" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Employee ID *</Label>
                                            <div className="relative">
                                                <Hash className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/50" />
                                                <Input
                                                    id="id"
                                                    placeholder="e.g. EMP004"
                                                    value={formData.employeeCode}
                                                    onChange={(e) => handleInputChange('employeeCode', e.target.value)}
                                                    className="pl-12 h-12 rounded-2xl border-border/40 bg-muted/10 focus-visible:ring-primary/20 focus-visible:bg-background transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Corporate Email *</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/50" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="abi@example.com"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    className="pl-12 h-12 rounded-2xl border-border/40 bg-muted/10 focus-visible:ring-primary/20 focus-visible:bg-background transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Role *</Label>
                                            <div className="relative">
                                                <Briefcase className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/50" />
                                                <Input
                                                    id="role"
                                                    placeholder="e.g. Senior Software Engineer"
                                                    value={formData.role}
                                                    onChange={(e) => handleInputChange('role', e.target.value)}
                                                    className="pl-12 h-12 rounded-2xl border-border/40 bg-muted/10 focus-visible:ring-primary/20 focus-visible:bg-background transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="experience" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experience Tenure</Label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/50" />
                                                <Input
                                                    id="experience"
                                                    placeholder="e.g. 5 Years"
                                                    value={formData.experience}
                                                    onChange={(e) => handleInputChange('experience', e.target.value)}
                                                    className="pl-12 h-12 rounded-2xl border-border/40 bg-muted/10 focus-visible:ring-primary/20 focus-visible:bg-background transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="joiningDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Official Joining</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/50" />
                                                <Input
                                                    id="joiningDate"
                                                    type="date"
                                                    value={formData.joiningDate}
                                                    onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                                                    className="pl-12 h-12 rounded-2xl border-border/40 bg-muted/10 focus-visible:ring-primary/20 focus-visible:bg-background transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/10 border-t border-border/10 px-8 py-6 flex justify-between gap-4">
                                    <Button variant="ghost" onClick={resetForm} className="rounded-2xl h-12 px-6 hover:bg-rose-500/5 hover:text-rose-500">
                                        Discard Changes
                                    </Button>
                                    <Button
                                        onClick={handleCreateEmployee}
                                        disabled={createEmployee.isPending}
                                        className="h-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 px-8 font-bold"
                                    >
                                        {createEmployee.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="mr-2 h-4 w-4" />
                                                Finalize Onboarding
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="border-border/40 shadow-lg shadow-black/5 rounded-3xl bg-muted/20">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <div className="p-1.5 bg-primary/10 rounded-lg">
                                            <Info className="h-4 w-4 text-primary" />
                                        </div>
                                        Guidance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground space-y-4">
                                    <p className="leading-relaxed">
                                        Ensure data parity with official documentation before saving.
                                    </p>
                                    <div className="space-y-3 pt-2">
                                        <div className="bg-background/50 p-3 rounded-2xl border border-border/50">
                                            <p className="text-[10px] font-bold uppercase text-primary mb-1">Employee Code</p>
                                            <p className="text-xs">Must align with ERP identifiers for payroll sync.</p>
                                        </div>
                                        <div className="bg-background/50 p-3 rounded-2xl border border-border/50">
                                            <p className="text-[10px] font-bold uppercase text-primary mb-1">Corporate Identity</p>
                                            <p className="text-xs">Authentication is tied to the provided corporate email.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 shadow-none rounded-3xl overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                                    <Shield className="h-20 w-20 text-emerald-500" />
                                </div>
                                <CardContent className="p-6 relative z-10">
                                    <div className="flex gap-4">
                                        <div className="p-2.5 bg-emerald-500/20 rounded-2xl h-fit">
                                            <Shield className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-emerald-900">Security Note</p>
                                            <p className="text-xs text-emerald-800/70 leading-relaxed">
                                                All administrative actions are cryptographically signed and stored in immutable audit trails for compliance.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Edit Employee Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden border-none rounded-[32px] shadow-2xl overflow-y-auto max-h-[90vh]">
                    <DialogHeader className="p-8 bg-muted/30 border-b border-border/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                                    <Edit2 className="h-7 w-7" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
                                    <DialogDescription className="text-base">Modify professional details for {editingEmployee?.user?.fullName}.</DialogDescription>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                                <Input
                                    value={editingEmployee?.user?.fullName || ''}
                                    onChange={(e) => handleEditInputChange('user', { ...editingEmployee.user, fullName: e.target.value })}
                                    className="h-12 rounded-2xl border-border/40 bg-muted/10 focus-visible:ring-primary/20 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Employee Code</Label>
                                <Input
                                    value={editingEmployee?.employeeCode || ''}
                                    onChange={(e) => handleEditInputChange('employeeCode', e.target.value)}
                                    className="h-12 rounded-2xl border-border/40 bg-muted/10 focus-visible:ring-primary/20 transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Corporate Email</Label>
                                <Input
                                    value={editingEmployee?.user?.email || ''}
                                    onChange={(e) => handleEditInputChange('user', { ...editingEmployee.user, email: e.target.value })}
                                    className="h-12 rounded-2xl border-border/40 bg-muted/10 focus-visible:ring-primary/20 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experience Tenure</Label>
                                <Input
                                    value={editingEmployee?.experience || ''}
                                    onChange={(e) => handleEditInputChange('experience', e.target.value)}
                                    className="h-12 rounded-2xl border-border/40 bg-muted/10 focus-visible:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Role</Label>
                            <Input
                                value={editingEmployee?.user?.role || ''}
                                onChange={(e) => handleEditInputChange('user', { ...editingEmployee.user, role: e.target.value })}
                                className="h-12 rounded-2xl border-border/40 bg-muted/10 focus-visible:ring-primary/20 transition-all"
                            />
                        </div>

                        <div className="pt-4 p-6 rounded-3xl bg-muted/20 border border-border/40 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${editingEmployee?.user?.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                    {editingEmployee?.user?.isActive ? <UserCheck className="h-6 w-6" /> : <UserX className="h-6 w-6" />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-tight">Employment Status</p>
                                    <p className="text-xs text-muted-foreground">{editingEmployee?.user?.isActive ? 'Employee is active and has system access.' : 'Employee is inactive and access is revoked.'}</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => handleEditInputChange('user', { ...editingEmployee.user, isActive: !editingEmployee.user?.isActive })}
                                className={`rounded-2xl px-6 h-11 font-bold border-2 transition-all ${editingEmployee?.user?.isActive ? 'hover:bg-rose-500/10 hover:text-rose-600 border-rose-500/10' : 'hover:bg-emerald-500/10 hover:text-emerald-600 border-emerald-500/10'}`}
                            >
                                {editingEmployee?.user?.isActive ? (
                                    <>Deactivate</>
                                ) : (
                                    <>Activate</>
                                )}
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className="p-8 bg-muted/10 border-t border-border/10 gap-3">
                        <DialogClose asChild>
                            <Button variant="ghost" className="h-12 rounded-2xl px-6 font-semibold">Discard</Button>
                        </DialogClose>
                        <Button
                            onClick={handleUpdateEmployee}
                            disabled={updateEmployee.isPending}
                            className="h-12 rounded-2xl bg-primary px-10 font-bold shadow-lg shadow-primary/20"
                        >
                            {updateEmployee.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>Save Changes</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
