'use client';

import { useState, useEffect, use, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSLA, useUpdateSLA } from '@/hooks/use-sla';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function EditSLAPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: slaId } = use(params);

    const { data: sla, isLoading: isLoadingSLA } = useSLA(slaId) as { data: any, isLoading: boolean };
    const { mutate: updateSLA, isPending: isUpdating } = useUpdateSLA();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        targetValue: '',
        thresholdWarning: '',
        thresholdCritical: '',
        measurementWindow: '',
    });

    useEffect(() => {
        if (sla) {
            setFormData({
                name: sla.name || '',
                description: sla.description || '',
                targetValue: sla.targetValue?.toString() || '',
                thresholdWarning: sla.thresholdWarning?.toString() || '',
                thresholdCritical: sla.thresholdCritical?.toString() || '',
                measurementWindow: sla.measurementWindow || '',
            });
        }
    }, [sla]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        updateSLA({
            id: slaId,
            data: {
                name: formData.name,
                description: formData.description,
                targetValue: Number(formData.targetValue),
                thresholdWarning: Number(formData.thresholdWarning),
                thresholdCritical: Number(formData.thresholdCritical),
                measurementWindow: formData.measurementWindow,
            }
        }, {
            onSuccess: () => {
                toast.success('SLA updated successfully');
                router.push('/sla');
            },
            onError: (error: any) => {
                const message = error.response?.data?.message;
                if (Array.isArray(message)) {
                    message.forEach((msg: string) => toast.error(msg));
                } else {
                    toast.error(message || 'Failed to update SLA');
                }
            },
        });
    };

    if (isLoadingSLA) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto fade-in">
            <div className="flex items-center gap-4">
                <Link href="/sla">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent/50">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit SLA</h1>
                    <p className="text-muted-foreground">Update service level agreement parameters</p>
                </div>
            </div>

            <Card className="border-border/50 shadow-lg">
                <CardHeader>
                    <CardTitle>SLA Details</CardTitle>
                    <CardDescription>Update parameters for {sla?.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Read-only fields */}
                        <div className="space-y-2">
                            <Label>Team</Label>
                            <div className="p-3 bg-muted/50 rounded-xl border border-border/50 text-sm font-medium">
                                {sla?.team?.name || 'N/A'}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Metric Type</Label>
                            <div className="p-3 bg-muted/50 rounded-xl border border-border/50 flex">
                                <Badge variant="outline" className="rounded-lg bg-background shadow-sm px-3 py-1">{sla?.metricType || 'N/A'}</Badge>
                            </div>
                        </div>

                        {/* Editable fields */}
                        <div className="space-y-2">
                            <Label htmlFor="name">SLA Name</Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Response Time SLA"
                                className="rounded-xl border-border/50 min-h-[44px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of this SLA"
                                className="rounded-xl border-border/50 min-h-[100px] resize-y"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="targetValue">Target Value</Label>
                                <Input
                                    id="targetValue"
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.targetValue}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, targetValue: e.target.value })}
                                    placeholder="e.g. 2.0"
                                    className="rounded-xl border-border/50 min-h-[44px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="measurementWindow">Measurement Window</Label>
                                <Select
                                    value={formData.measurementWindow}
                                    onValueChange={(value: string) => setFormData({ ...formData, measurementWindow: value })}
                                >
                                    <SelectTrigger className="rounded-xl border-border/50 min-h-[44px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/50">
                                        <SelectItem value="1h" className="rounded-lg">1 Hour</SelectItem>
                                        <SelectItem value="24h" className="rounded-lg">24 Hours</SelectItem>
                                        <SelectItem value="7d" className="rounded-lg">7 Days</SelectItem>
                                        <SelectItem value="30d" className="rounded-lg">30 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="thresholdWarning">Warning Threshold</Label>
                                <Input
                                    id="thresholdWarning"
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.thresholdWarning}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, thresholdWarning: e.target.value })}
                                    placeholder="e.g. 1.6"
                                    className="rounded-xl border-border/50 min-h-[44px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="thresholdCritical">Critical Threshold</Label>
                                <Input
                                    id="thresholdCritical"
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.thresholdCritical}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, thresholdCritical: e.target.value })}
                                    placeholder="e.g. 1.8"
                                    className="rounded-xl border-border/50 min-h-[44px]"
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end gap-3 border-t border-border/30">
                            <Link href="/sla">
                                <Button variant="outline" type="button" className="rounded-xl border-border/50 min-h-[44px] px-6">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={isUpdating} className="rounded-xl min-h-[44px] px-6 shadow-md shadow-primary/20 hover:shadow-primary/30">
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
