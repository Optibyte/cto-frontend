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
    Award,
    Code
} from 'lucide-react';
import { TeamMemberFull } from '@/lib/types';
import { toast } from 'sonner';
import { employeesAPI } from '@/lib/api/client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';


export function EmployeeManagement() {
    const [employees, setEmployees] = useState<TeamMemberFull[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<TeamMemberFull | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        employeeId: '',
        experience: '',
        joiningDate: '',
        status: 'Active'
    });

    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const { data } = await employeesAPI.getAll();
            // Map backend fields to frontend expected fields
            const mappedEmployees = data.map((emp: any) => {
                // Aggressive name search
                const findName = (obj: any): string => {
                    if (!obj) return '';
                    const priority = ['fullName', 'full_name', 'name', 'employeeName', 'employee_name', 'displayName', 'display_name'];
                    for (const p of priority) {
                        if (obj[p]) return obj[p];
                    }
                    const nameKey = Object.keys(obj).find(key => key.toLowerCase().includes('name') && typeof obj[key] === 'string');
                    if (nameKey) return obj[nameKey];
                    if (obj.user && typeof obj.user === 'object') return findName(obj.user);
                    return '';
                };

                const findRole = (obj: any): string => {
                    if (!obj) return '';
                    const priority = ['role', 'jobTitle', 'designation', 'position', 'roleInTeam'];
                    for (const p of priority) {
                        if (obj[p]) return obj[p];
                    }
                    if (obj.user && typeof obj.user === 'object') return findRole(obj.user);
                    return '';
                };

                const findId = (obj: any): string => {
                    if (!obj) return '';
                    const priority = ['employeeCode', 'employee_code', 'employeeId', 'empId', 'code', 'id'];
                    for (const p of priority) {
                        if (obj[p]) return obj[p];
                    }
                    return '';
                };

                const name = findName(emp) || 'Unknown Name';
                const role = findRole(emp) || 'Staff';
                const employeeId = findId(emp) || 'N/A';

                return {
                    id: emp.id || emp._id || Math.random().toString(),
                    name,
                    email: emp.email || (emp.user && emp.user.email) || '',
                    role,
                    employeeId,
                    experience: emp.experience || '',
                    joiningDate: emp.joiningDate || emp.joining_date || '',
                    status: emp.status || 'Active',
                    onboardedDate: (emp.joiningDate || emp.joining_date) ? (emp.joiningDate || emp.joining_date).split('T')[0] : ''
                };
            });
            console.log('Mapped employees:', mappedEmployees);
            setEmployees(mappedEmployees);
        } catch (error) {
            toast.error('Failed to fetch employees');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleOpenAddDialog = () => {
        setEditingEmployee(null);
        setFormData({ name: '', email: '', role: '', employeeId: '', experience: '', joiningDate: '', status: 'Active' });
        setIsDialogOpen(true);
    };

    const handleOpenEditDialog = (emp: TeamMemberFull) => {
        setEditingEmployee(emp);
        setFormData({
            name: emp.name,
            email: emp.email,
            role: emp.role,
            employeeId: emp.employeeId,
            experience: (emp as any).experience || '',
            joiningDate: (emp as any).joiningDate || '',
            status: emp.status
        });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingEmployee(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.role || !formData.employeeId) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (editingEmployee) {
                await employeesAPI.update(editingEmployee.id, formData);
                toast.success(`Employee ${formData.name} updated successfully`);
            } else {
                await employeesAPI.create(formData);
                toast.success(`Employee ${formData.name} created successfully`);
            }
            fetchEmployees();
            handleCloseDialog();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save employee');
        }
    };

    const handleDeleteEmployee = async (id: string) => {
        const emp = employees.find(e => e.id === id);
        console.log(`Attempting to delete employee with ID: ${id}`, emp);
        if (confirm(`Are you sure you want to delete ${emp?.name}?`)) {
            try {
                await employeesAPI.delete(id);
                toast.success(`Employee ${emp?.name} removed`);
                fetchEmployees();
            } catch (error: any) {
                console.error('Delete error:', error);
                toast.error(error.message || 'Failed to delete employee');
            }
        }
    };

    const filteredEmployees = employees.filter(emp =>
        (emp.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (emp.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (emp.role?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (emp.employeeId?.toLowerCase() || "").includes(searchQuery.toLowerCase())
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
                        <h2 className="text-2xl font-extrabold tracking-tight">Employee Directory</h2>
                        <p className="text-muted-foreground font-medium">Manage and monitor the workforce talent</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search employees..."
                            className="pl-9 w-[240px] rounded-xl border-border/50 h-10 bg-card/50"
                        />
                    </div>
                    <Button
                        onClick={handleOpenAddDialog}
                        className="rounded-xl shadow-lg transition-all h-10 px-6 gap-2 bg-primary shadow-primary/20 hover:shadow-primary/40"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add Employee
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
                                    <th className="text-left py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Employee</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Role & ID</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Experience</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Joined</th>
                                    <th className="text-left py-5 px-4 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground text-center">Status</th>
                                    <th className="text-center py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <div className="text-muted-foreground font-medium flex items-center justify-center gap-2">
                                                <div className="h-4 w-4 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
                                                Loading employees...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <p className="text-muted-foreground font-medium">No employees found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map((emp) => (
                                        <tr key={emp.id} className="border-b border-border/5 hover:bg-primary/5 transition-all duration-300 group/row">
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary group-hover/row:scale-110 transition-transform">
                                                        {emp.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm tracking-tight">{emp.name || 'Unknown Employee'}</span>
                                                        <span className="text-[11px] font-medium text-muted-foreground">{emp.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm font-medium">{emp.role}</span>
                                                    </div>
                                                    <span className="text-[10px] font-mono font-bold text-primary">{emp.employeeId}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Award className="h-4 w-4 text-primary/70" />
                                                    <span className="text-sm font-medium">{(emp as any).experience || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span className="text-xs font-mono">{emp.onboardedDate || emp.teamJoinDate}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4 text-center">
                                                <Badge className={`rounded-xl px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest border-0 ${emp.status === 'Active'
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : 'bg-rose-500/10 text-rose-500'
                                                    }`}>
                                                    {emp.status}
                                                </Badge>
                                            </td>
                                            <td className="py-5 px-6 text-center">
                                                <div className="flex items-center justify-center gap-1 opacity-0 group-hover/row:opacity-100 transition-all">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenEditDialog(emp)}
                                                        className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-9 w-9 rounded-xl transition-all"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteEmployee(emp.id)}
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
                        <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                        <DialogDescription>
                            {editingEmployee ? 'Update employee details below.' : 'Enter details to register a new employee.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="employeeId">Employee ID</Label>
                            <Input
                                id="employeeId"
                                value={formData.employeeId}
                                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                placeholder="e.g. EMP-101"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Jane Doe"
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
                                placeholder="jane@company.com"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                placeholder="e.g. Software Engineer"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="experience">Experience</Label>
                            <Input
                                id="experience"
                                value={formData.experience}
                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                placeholder="e.g. 1 years"
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="joiningDate">Joining Date</Label>
                            <Input
                                id="joiningDate"
                                type="date"
                                value={formData.joiningDate ? formData.joiningDate.split('T')[0] : ''}
                                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button variant="outline" type="button" onClick={handleCloseDialog} className="rounded-xl">Cancel</Button>
                            <Button type="submit" className="rounded-xl bg-primary hover:bg-primary/90">
                                {editingEmployee ? 'Update Employee' : 'Create Employee'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
