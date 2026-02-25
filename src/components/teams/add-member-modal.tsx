'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useEmployeeByCode } from '@/hooks/use-employees';
import { Loader2, Search, User, Briefcase, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (member: any, role: string) => void;
    tlId?: string;
}

const TEAM_ROLES = [
    'Developer',
    'Senior Developer',
    'Lead Developer',
    'UI/UX Designer',
    'Product Manager',
    'QA Engineer',
    'Analyst',
    'Architect',
    'DevOps Engineer',
];

export function AddMemberModal({ isOpen, onClose, onAdd, tlId }: AddMemberModalProps) {
    const [empCode, setEmpCode] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [debouncedCode, setDebouncedCode] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedCode(empCode);
        }, 500);
        return () => clearTimeout(handler);
    }, [empCode]);

    const { data: employee, isLoading, isError } = useEmployeeByCode(debouncedCode, tlId);

    const handleAdd = () => {
        if (employee && selectedRole) {
            onAdd(employee, selectedRole);
            setEmpCode('');
            setSelectedRole('');
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl border-border/50 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <User className="h-6 w-6 text-primary" />
                        Add Team Member
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="empCode" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Employee Code</Label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="empCode"
                                placeholder="Enter employee code (e.g. EMP101)"
                                value={empCode}
                                onChange={(e) => setEmpCode(e.target.value)}
                                className="pl-9 rounded-xl border-border/50 h-11"
                            />
                            {isLoading && (
                                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary" />
                            )}
                        </div>
                    </div>

                    {employee && (
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                    {(employee.user?.fullName || employee.fullName || '?').charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{employee.user?.fullName || employee.fullName}</h4>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Briefcase className="h-3 w-3" />
                                        {employee.jobTitle || 'No Title'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {isError && debouncedCode && (
                        <p className="text-xs text-destructive bg-destructive/5 p-3 rounded-lg border border-destructive/10">No employee found with this code.</p>
                    )}

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role in Team</Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="rounded-xl border-border/50 h-11">
                                <SelectValue placeholder="Select a team role" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/50">
                                {TEAM_ROLES.map((role) => (
                                    <SelectItem key={role} value={role} className="rounded-lg">
                                        {role}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="rounded-xl h-11 px-6">Cancel</Button>
                    <Button
                        onClick={handleAdd}
                        disabled={!employee || !selectedRole}
                        className="rounded-xl h-11 px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-bold"
                    >
                        Add Member
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
