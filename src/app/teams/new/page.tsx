'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTeam } from '@/hooks/use-teams';
import { useUsers } from '@/hooks/use-users';
import { useAccounts } from '@/hooks/use-accounts';
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
import { ArrowLeft, Loader2, Hash } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MOCK_PRODUCTS, MOCK_MARKETS } from '@/lib/constants';

export default function CreateTeamPage() {
    const router = useRouter();
    const { mutate: createTeam, isPending } = useCreateTeam();
    const { data: users = [], isLoading: isLoadingUsers }: { data: any[] | undefined, isLoading: boolean } = useUsers() as any;
    const { data: accounts = [], isLoading: isLoadingAccounts } = useAccounts() as any;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        teamLeadId: '',
        accountId: '',
        product: '',
        market: '',
    });

    // Auto-generate team ID
    const autoTeamId = `TEAM-${String(Date.now()).slice(-6)}`;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!formData.teamLeadId) {
            toast.error('Please select a Team Lead');
            return;
        }

        if (!formData.accountId) {
            // If only one account exists, maybe auto-select? 
            // But explicit selection is safer.
            // Or if accounts loaded and length 1, default it.
            // For now, require selection.
            toast.error('Please select an Account');
            return;
        }

        createTeam(formData, {
            onSuccess: () => {
                toast.success('Team created successfully');
                router.push('/teams');
            },
            onError: (error: any) => {
                const message = error.response?.data?.message;
                if (Array.isArray(message)) {
                    message.forEach((msg: string) => toast.error(msg));
                } else {
                    toast.error(message || 'Failed to create team');
                }
            },
        });
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto fade-in">
            <div className="flex items-center gap-4">
                <Link href="/teams">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent/50">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Team</h1>
                    <p className="text-muted-foreground">Add a new engineering team to the platform</p>
                </div>
            </div>

            <Card className="border-border/50 shadow-lg">
                <CardHeader>
                    <CardTitle>Team Details</CardTitle>
                    <CardDescription>Enter the basic information for the new team.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="account">Account</Label>
                            <Select
                                value={formData.accountId}
                                onValueChange={(value: string) => setFormData({ ...formData, accountId: value })}
                            >
                                <SelectTrigger className="rounded-xl border-border/50 min-h-[44px]">
                                    <SelectValue placeholder="Select an account" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50">
                                    {isLoadingAccounts ? (
                                        <div className="p-2 text-center text-muted-foreground">Loading accounts...</div>
                                    ) : (
                                        accounts?.map((account: any) => (
                                            <SelectItem key={account.id} value={account.id} className="rounded-lg">
                                                {account.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Auto Team ID */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                            <Hash className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Auto-Assigned Team ID</p>
                                <p className="text-lg font-extrabold text-primary">{autoTeamId}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Team Name</Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Platform Engineering"
                                className="rounded-xl border-border/50 min-h-[44px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of the team's responsibilities"
                                className="rounded-xl border-border/50 min-h-[100px] resize-y"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="teamLead">Team Lead</Label>
                            <Select
                                value={formData.teamLeadId}
                                onValueChange={(value: string) => setFormData({ ...formData, teamLeadId: value })}
                            >
                                <SelectTrigger className="rounded-xl border-border/50 min-h-[44px]">
                                    <SelectValue placeholder="Select a team lead" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border/50">
                                    {isLoadingUsers ? (
                                        <div className="p-2 text-center text-muted-foreground">Loading users...</div>
                                    ) : (
                                        users?.map((user: any) => (
                                            <SelectItem key={user.id} value={user.id} className="rounded-lg">
                                                {user.fullName || user.email}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Product</Label>
                                <Select
                                    value={formData.product}
                                    onValueChange={(value: string) => setFormData({ ...formData, product: value })}
                                >
                                    <SelectTrigger className="rounded-xl border-border/50 min-h-[44px]">
                                        <SelectValue placeholder="Select a product" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/50">
                                        {MOCK_PRODUCTS.map((p) => (
                                            <SelectItem key={p.id} value={p.id} className="rounded-lg">
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Market</Label>
                                <Select
                                    value={formData.market}
                                    onValueChange={(value: string) => setFormData({ ...formData, market: value })}
                                >
                                    <SelectTrigger className="rounded-xl border-border/50 min-h-[44px]">
                                        <SelectValue placeholder="Select a market" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-border/50">
                                        {MOCK_MARKETS.map((m) => (
                                            <SelectItem key={m.id} value={m.id} className="rounded-lg">
                                                {m.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end gap-3 border-t border-border/30">
                            <Link href="/teams">
                                <Button variant="outline" type="button" className="rounded-xl border-border/50 min-h-[44px] px-6">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={isPending} className="w-full rounded-xl min-h-[44px] shadow-md shadow-primary/20 hover:shadow-primary/30">
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Team
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
