'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Settings2, Trash2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { METRIC_VALUE_TYPES, METRIC_CATEGORIES, USER_ROLES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import {
    CUSTOM_METRIC_DEFINITIONS,
    type CustomMetricDef,
} from '@/lib/mock-data/metrics-data';

export function DynamicMetricCreation() {
    const [definitions, setDefinitions] = useState<CustomMetricDef[]>(CUSTOM_METRIC_DEFINITIONS);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [form, setForm] = useState({
        name: '',
        valueType: '' as CustomMetricDef['valueType'] | '',
        min: '0',
        max: '5',
        category: '',
        editableBy: [] as string[],
        visibleTo: ['All'],
        redThreshold: '',
        amberThreshold: '',
        greenThreshold: '',
    });

    const handleCreate = () => {
        if (!form.name || !form.valueType || !form.category) {
            toast.error('Please fill all required fields');
            return;
        }

        const newDef: CustomMetricDef = {
            id: `cm-${Date.now()}`,
            name: form.name,
            valueType: form.valueType as CustomMetricDef['valueType'],
            min: Number(form.min),
            max: Number(form.max),
            category: form.category,
            editableBy: form.editableBy,
            visibleTo: form.visibleTo,
            thresholds: {
                red: Number(form.redThreshold),
                amber: Number(form.amberThreshold),
                green: Number(form.greenThreshold),
            },
            createdAt: new Date().toISOString(),
        };

        setDefinitions((prev) => [...prev, newDef]);
        setIsDialogOpen(false);
        setForm({
            name: '',
            valueType: '',
            min: '0',
            max: '5',
            category: '',
            editableBy: [],
            visibleTo: ['All'],
            redThreshold: '',
            amberThreshold: '',
            greenThreshold: '',
        });
        toast.success(`Metric "${newDef.name}" created successfully`);
    };

    const handleDelete = (id: string) => {
        setDefinitions((prev) => prev.filter((d) => d.id !== id));
        toast.success('Metric definition deleted');
    };

    const toggleEditableRole = (role: string) => {
        setForm((prev) => ({
            ...prev,
            editableBy: prev.editableBy.includes(role)
                ? prev.editableBy.filter((r) => r !== role)
                : [...prev.editableBy, role],
        }));
    };

    const valueTypeLabel = METRIC_VALUE_TYPES.find((t) => t.value === form.valueType)?.label;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Super Admin — Dynamic Metric Definitions
                </div>
                <Button className="rounded-xl gap-2" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Create New Metric
                </Button>
            </div>

            {/* Existing Definitions Table */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Settings2 className="h-5 w-5" />
                        Metric Definitions ({definitions.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/30">
                                    <th className="pb-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                                    <th className="pb-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                                    <th className="pb-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Range</th>
                                    <th className="pb-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                                    <th className="pb-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Editable By</th>
                                    <th className="pb-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thresholds</th>
                                    <th className="pb-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
                                    <th className="pb-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider pr-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {definitions.map((def) => (
                                    <tr key={def.id} className="border-b border-border/20 last:border-0 hover:bg-accent/30 group transition-colors">
                                        <td className="py-3 text-sm font-semibold">{def.name}</td>
                                        <td className="py-3">
                                            <Badge variant="outline" className="rounded-full text-[10px] px-2">
                                                {def.valueType}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-sm text-muted-foreground">{def.min} – {def.max}</td>
                                        <td className="py-3">
                                            <Badge variant="secondary" className="rounded-full text-[10px] px-2">
                                                {def.category}
                                            </Badge>
                                        </td>
                                        <td className="py-3">
                                            <div className="flex gap-1 flex-wrap">
                                                {def.editableBy.map((role) => (
                                                    <Badge key={role} variant="outline" className="rounded-full text-[10px] px-1.5 bg-primary/5 border-primary/20">
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
                                                <span className="text-[10px] text-muted-foreground">&lt;{def.thresholds.red}</span>
                                                <span className="inline-flex h-2 w-2 rounded-full bg-amber-500 ml-1" />
                                                <span className="text-[10px] text-muted-foreground">&lt;{def.thresholds.amber}</span>
                                                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 ml-1" />
                                                <span className="text-[10px] text-muted-foreground">≥{def.thresholds.green}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-right text-xs text-muted-foreground">{formatDate(def.createdAt)}</td>
                                        <td className="py-3 text-right pr-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-all bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                                onClick={() => handleDelete(def.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {definitions.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center text-muted-foreground text-sm">
                                            No custom metrics defined yet. Click "Create New Metric" to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Create Metric Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[520px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Metric Definition</DialogTitle>
                        <DialogDescription>
                            Define a new custom metric that can be tracked across team members.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Metric Name *</Label>
                            <Input
                                placeholder="e.g. Innovation Contribution"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Value Type *</Label>
                                <Select
                                    value={form.valueType}
                                    onValueChange={(val) => setForm({ ...form, valueType: val as any })}
                                >
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {METRIC_VALUE_TYPES.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <Select
                                    value={form.category}
                                    onValueChange={(val) => setForm({ ...form, category: val })}
                                >
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {METRIC_CATEGORIES.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Min Value</Label>
                                <Input
                                    type="number"
                                    value={form.min}
                                    onChange={(e) => setForm({ ...form, min: e.target.value })}
                                    className="rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Value</Label>
                                <Input
                                    type="number"
                                    value={form.max}
                                    onChange={(e) => setForm({ ...form, max: e.target.value })}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Thresholds */}
                        <div className="space-y-2">
                            <Label>Thresholds (RAG)</Label>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                        <span className="text-xs text-muted-foreground">Red &lt;</span>
                                    </div>
                                    <Input
                                        type="number"
                                        placeholder="2"
                                        value={form.redThreshold}
                                        onChange={(e) => setForm({ ...form, redThreshold: e.target.value })}
                                        className="rounded-xl h-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                        <span className="text-xs text-muted-foreground">Amber &lt;</span>
                                    </div>
                                    <Input
                                        type="number"
                                        placeholder="3.5"
                                        value={form.amberThreshold}
                                        onChange={(e) => setForm({ ...form, amberThreshold: e.target.value })}
                                        className="rounded-xl h-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                        <span className="text-xs text-muted-foreground">Green ≥</span>
                                    </div>
                                    <Input
                                        type="number"
                                        placeholder="3.5"
                                        value={form.greenThreshold}
                                        onChange={(e) => setForm({ ...form, greenThreshold: e.target.value })}
                                        className="rounded-xl h-9"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Editable By Roles */}
                        <div className="space-y-2">
                            <Label>Editable By</Label>
                            <div className="flex flex-wrap gap-2">
                                {USER_ROLES.filter((r) => r.value !== 'TEAM').map((role) => (
                                    <Button
                                        key={role.value}
                                        type="button"
                                        variant={form.editableBy.includes(role.value) ? 'default' : 'outline'}
                                        size="sm"
                                        className="rounded-full text-xs h-7 px-3"
                                        onClick={() => toggleEditableRole(role.value)}
                                    >
                                        {role.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button variant="ghost" className="rounded-xl" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="rounded-xl gap-2 font-bold" onClick={handleCreate}>
                            <Plus className="h-4 w-4" />
                            Create Metric
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
