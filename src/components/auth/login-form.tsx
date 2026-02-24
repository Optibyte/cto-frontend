'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRole } from '@/contexts/role-context';
import { UserRole } from '@/lib/types';

export function LoginForm() {
    const router = useRouter();
    const { setRole, setIsAuthenticated } = useRole();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'CTO' as UserRole,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setRole(formData.role);
            setIsAuthenticated(true);
            toast.success('Logged in successfully!');
            router.push('/');
        }, 1500);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Card className="w-full max-w-md border-white/10 shadow-2xl bg-black/40 backdrop-blur-2xl text-white">
            <CardHeader className="space-y-1 text-center pb-8">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-primary/20 rounded-2xl ring-1 ring-primary/40">
                        <Lock className="h-7 w-7 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight text-white">Welcome back</CardTitle>
                <CardDescription className="text-slate-400 text-base">
                    Enter your credentials to access your dashboard
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-slate-200">Email address</Label>
                        <div className="relative group">
                            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl focus:bg-white/10 focus-visible:ring-primary/40 text-white placeholder:text-slate-600"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" title="Password" className="text-sm font-medium text-slate-200">Password</Label>
                            <Link
                                href="/forgot-password"
                                className="text-xs font-semibold text-primary/80 hover:text-primary transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl focus:bg-white/10 focus-visible:ring-primary/40 text-white placeholder:text-slate-600"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-medium text-slate-200">Role</Label>
                        <Select
                            onValueChange={(value) => handleInputChange('role', value)}
                            value={formData.role}
                        >
                            <SelectTrigger id="role" className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/40 text-white">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="h-4 w-4 text-slate-500" />
                                    <SelectValue placeholder="Select role" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                <SelectItem value="CTO">CTO</SelectItem>
                                <SelectItem value="Manager">Manager</SelectItem>
                                <SelectItem value="TeamLead">Team Lead</SelectItem>
                                <SelectItem value="Employee">Employee</SelectItem>
                                <SelectItem value="Market">Market</SelectItem>
                                <SelectItem value="Accounts">Accounts</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        className="w-full rounded-xl h-12 mt-4 text-lg font-bold bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all duration-300"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Verifying...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>Sign In</span>
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center gap-4 border-t border-white/5 pt-8 mt-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>Don't have an account?</span>
                    <Link
                        href="/signup"
                        className="font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                        Sign up now
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
