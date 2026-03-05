'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRole } from '@/contexts/role-context';
import { UserRole } from '@/lib/types';
import { authAPI } from '@/lib/api/auth';

export function LoginForm() {
    const router = useRouter();
    const { setRole, setIsAuthenticated, setUser, setToken } = useRole();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authAPI.login({ email });

            // Store token and user data
            setToken(response.access_token);
            setRole(response.user.role as UserRole);
            setUser(response.user);
            setIsAuthenticated(true);

            toast.success(`Welcome back, ${response.user.fullName}!`);
            router.push('/');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed. Please check your email.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
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
                    Enter your email to access your dashboard
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <Button
                        className="w-full rounded-xl h-12 mt-4 text-lg font-bold bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all duration-300"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Signing in...</span>
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
                    <span>Don&apos;t have an account?</span>
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
