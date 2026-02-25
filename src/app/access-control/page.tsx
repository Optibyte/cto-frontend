'use client';

import { useState } from 'react';
import { Shield, Key, Copy, Check, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AccessControlPage() {
    const [formData, setFormData] = useState({
        name: '',
        id: '',
        email: '',
        role: '',
        market: '',
        account: '',
        project: '',
        team: '',
    });

    const [token, setToken] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const generateToken = () => {
        if (!formData.name || !formData.email || !formData.role) {
            toast.error('Please fill in Name, Email and Role at minimum');
            return;
        }

        setIsGenerating(true);

        // Simulate API call
        setTimeout(() => {
            const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const prefix = formData.role.substring(0, 3).toUpperCase();
            setToken(`cto_${prefix}_${randomString}`);
            setIsGenerating(false);
            toast.success('Access token generated successfully!');
        }, 1500);
    };

    const copyToClipboard = () => {
        if (token) {
            navigator.clipboard.writeText(token);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
            toast.success('Token copied to clipboard');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            id: '',
            email: '',
            role: '',
            market: '',
            account: '',
            project: '',
            team: '',
        });
        setToken(null);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Access Control
                </h1>
                <p className="text-muted-foreground">
                    Grant system access, assign roles, and generate secure access tokens for team members.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-border/40 shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30 pb-4">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                <CardTitle className="text-xl">User Access Configuration</CardTitle>
                            </div>
                            <CardDescription>
                                Enter the user details and define their scope of access.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="rounded-xl border-border/40 focus-visible:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="id">Employee ID</Label>
                                    <Input
                                        id="id"
                                        placeholder="EMP-001"
                                        value={formData.id}
                                        onChange={(e) => handleInputChange('id', e.target.value)}
                                        className="rounded-xl border-border/40 focus-visible:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Mail ID</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john.doe@example.com"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="rounded-xl border-border/40 focus-visible:ring-primary/20"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value) => handleInputChange('role', value)}
                                    >
                                        <SelectTrigger id="role" className="rounded-xl border-border/40 focus:ring-primary/20">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cto">CTO</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="teamlead">Team Lead</SelectItem>
                                            <SelectItem value="employee">Employee</SelectItem>
                                            <SelectItem value="market">Market</SelectItem>
                                            <SelectItem value="accounts">Accounts</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="market">Market</Label>
                                    <Select
                                        value={formData.market}
                                        onValueChange={(value) => handleInputChange('market', value)}
                                    >
                                        <SelectTrigger id="market" className="rounded-xl border-border/40 focus:ring-primary/20">
                                            <SelectValue placeholder="Select market" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="north-america">North America</SelectItem>
                                            <SelectItem value="europe">Europe</SelectItem>
                                            <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                                            <SelectItem value="global">Global</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="account">Account</Label>
                                    <Input
                                        id="account"
                                        placeholder="Enterprise"
                                        value={formData.account}
                                        onChange={(e) => handleInputChange('account', e.target.value)}
                                        className="rounded-xl border-border/40 focus-visible:ring-primary/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="project">Project</Label>
                                    <Input
                                        id="project"
                                        placeholder="Project X"
                                        value={formData.project}
                                        onChange={(e) => handleInputChange('project', e.target.value)}
                                        className="rounded-xl border-border/40 focus-visible:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="team">Team</Label>
                                <Select
                                    value={formData.team}
                                    onValueChange={(value) => handleInputChange('team', value)}
                                >
                                    <SelectTrigger id="team" className="rounded-xl border-border/40 focus:ring-primary/20">
                                        <SelectValue placeholder="Select team" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="alpha">Team Alpha</SelectItem>
                                        <SelectItem value="beta">Team Beta</SelectItem>
                                        <SelectItem value="gamma">Team Gamma</SelectItem>
                                        <SelectItem value="delta">Team Delta</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 border-t border-border/20 px-6 py-4 flex justify-between gap-3">
                            <Button variant="outline" onClick={resetForm} className="rounded-xl">
                                Reset Form
                            </Button>
                            <Button
                                onClick={generateToken}
                                disabled={isGenerating}
                                className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/20 transition-all font-semibold px-6"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Key className="mr-2 h-4 w-4" />
                                        Generate Access Token
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-border/40 shadow-sm h-fit">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Info className="h-4 w-4 text-primary" />
                                Guidelines
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-3 pb-6 border-b border-border/20 mx-6 px-0">
                            <p>
                                Tokens provide temporary access based on the selected role and scope.
                            </p>
                            <ul className="list-disc pl-4 space-y-1 text-xs">
                                <li><strong>CTO</strong>: Full system access</li>
                                <li><strong>Manager</strong>: Team and project level access</li>
                                <li><strong>Employee</strong>: Dashboard and personal metrics</li>
                            </ul>
                        </CardContent>
                        <CardFooter className="pt-4 flex flex-col items-start gap-4">
                            <div className="w-full space-y-3">
                                <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Generated Token</Label>
                                {token ? (
                                    <div className="group relative">
                                        <div className="p-3 bg-secondary/50 rounded-xl font-mono text-xs break-all border border-border/40 pr-10">
                                            {token}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-lg group-hover:opacity-100 opacity-0 transition-opacity"
                                            onClick={copyToClipboard}
                                        >
                                            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-4 border-2 border-dashed border-border/30 rounded-xl flex flex-col items-center justify-center text-center py-8">
                                        <Key className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                        <p className="text-xs text-muted-foreground">No token generated yet</p>
                                    </div>
                                )}
                            </div>

                            {token && (
                                <Badge variant="outline" className="text-[10px] py-0 px-2 rounded-full border-green-500/30 text-green-600 bg-green-50/50">
                                    Token Active
                                </Badge>
                            )}
                        </CardFooter>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20 shadow-none">
                        <CardContent className="p-4 pt-4">
                            <div className="flex gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg h-fit">
                                    <Shield className="h-4 w-4 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-primary">Security Note</p>
                                    <p className="text-xs text-muted-foreground leading-relaxed text-primary/70">
                                        All access changes are recorded in the audit logs. Ensure you have the necessary approvals before generating tokens for high-level roles.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
