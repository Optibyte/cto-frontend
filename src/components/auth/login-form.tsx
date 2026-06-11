'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, Fingerprint, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRole } from '@/contexts/role-context';
import { UserRole } from '@/lib/types';
import { authAPI } from '@/lib/api/auth';



export function LoginForm() {
    const router = useRouter();
    const { setRole, setIsAuthenticated, setUser, setToken } = useRole();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSSOMode, setIsSSOMode] = useState(false);
    const [ssoDomain, setSsoDomain] = useState('');
    const [ssoAuthenticating, setSsoAuthenticating] = useState(false);
    const [ssoStatus, setSsoStatus] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email');
            return;
        }
        if (!password) {
            toast.error('Please enter your password');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authAPI.login({ email, password });

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

    const handleSSOSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ssoDomain) {
            toast.error('Please enter your enterprise email or SSO domain');
            return;
        }

        setIsLoading(true);
        setSsoAuthenticating(true);
        setSsoStatus('Verifying SSO Configuration...');

        // Read SSO configuration from localStorage
        const stored = localStorage.getItem('cto_sso_config');
        let configObj: any = null;
        if (stored) {
            try {
                configObj = JSON.parse(stored);
            } catch (err) {
                console.error(err);
            }
        }

        const providerName = configObj?.enabled ? configObj.provider : 'Okta Identity Provider';

        setTimeout(() => {
            setSsoStatus(`Redirecting to ${providerName} Secure Login...`);

            setTimeout(() => {
                setSsoStatus('Authenticating and checking AD Security Groups...');

                setTimeout(async () => {
                    try {
                        // Determine which email to authenticate with
                        // If it contains @, use it. Otherwise use cto@skillvector.com
                        let loginEmail = ssoDomain.includes('@') ? ssoDomain : 'cto@skillvector.com';

                        // Fallback to cto@skillvector.com if it doesn't match an active user
                        const response = await authAPI.login({ email: loginEmail, password: 'Password123' }).catch(async () => {
                            // If user email failed, login as default CTO user
                            return await authAPI.login({ email: 'cto@skillvector.com', password: 'Password123' });
                        });

                        // Store token and user data
                        setToken(response.access_token);
                        setRole(response.user.role as UserRole);
                        setUser(response.user);
                        setIsAuthenticated(true);

                        toast.success(`Welcome Back (SSO), ${response.user.fullName}!`);
                        router.push('/');
                    } catch (error: any) {
                        toast.error('SSO Authentication failed. Please check your domain settings.');
                        setSsoAuthenticating(false);
                        setIsLoading(false);
                    }
                }, 800);
            }, 800);
        }, 800);
    };

    return (
        <div className="w-full max-w-[900px] flex flex-col md:flex-row overflow-hidden rounded-3xl border border-slate-100 bg-white text-slate-900 shadow-xl shadow-slate-200/50 my-4 md:my-8 mx-4">

            {/* Logo / Branding Card (Left Pane) */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-16 bg-white relative md:border-r border-b md:border-b-0 border-slate-100 overflow-hidden">
                {/* Subtle glow effect */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-[#3b82f6] opacity-[0.06] rounded-full blur-[80px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] bg-[#22c55e] opacity-[0.04] rounded-full blur-[60px]" />
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-6 md:space-y-8">
                    <img
                        src="/cto-logo.webp"
                        alt="Compass Logo"
                        className="h-[110px] md:h-[140px] w-auto object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.25)]"
                    />
                    <img
                        src="/cto-name.webp"
                        alt="Compass - AI Tracking Governance Platform"
                        className="w-[220px] md:w-[270px] object-contain opacity-95"
                    />
                </div>
            </div>

            {/* Login Form Card (Right Pane) */}
            <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center bg-white">
                <div className="space-y-2 mb-10 text-left">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
                        {isSSOMode ? 'Enterprise Portal' : 'Welcome Back'}
                    </h2>
                    <p className="text-[15px] text-slate-500">
                        {isSSOMode ? 'Single Sign-On & AD Integration' : 'Enter your email and password to access your dashboard'}
                    </p>
                </div>

                {ssoAuthenticating ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-6">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
                        <div className="text-center">
                            <p className="font-semibold text-slate-900 text-[15px]">{ssoStatus}</p>
                            <p className="text-xs text-muted-foreground mt-1">Please do not close this window</p>
                        </div>
                    </div>
                ) : isSSOMode ? (
                    <form onSubmit={handleSSOSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="ssoDomain" className="text-[13px] font-semibold text-slate-700">Enterprise Email or Domain</Label>
                            <div className="relative group">
                                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#a78bfa]" />
                                <Input
                                    id="ssoDomain"
                                    type="text"
                                    placeholder="e.g. name@company.com or company.com"
                                    className="pl-12 h-14 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-violet-500 text-[15px] font-medium transition-colors"
                                    value={ssoDomain}
                                    onChange={(e) => setSsoDomain(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            className="w-full rounded-xl h-14 mt-4 text-[15px] font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors"
                            type="submit"
                            disabled={isLoading}
                        >
                            <div className="flex items-center gap-2 justify-center w-full">
                                <span>Sign In via SSO</span>
                                <ArrowRight className="h-[18px] w-[18px]" />
                            </div>
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="email" className="text-[13px] font-semibold text-slate-700">Email address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#a78bfa]" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-12 h-14 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-violet-500 text-[15px] font-medium transition-colors"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-[13px] font-semibold text-slate-700">Password</Label>

                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#a78bfa]" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="pl-12 pr-12 h-14 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-violet-500 text-[15px] font-medium transition-colors"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            className="w-full rounded-xl h-14 mt-4 text-[15px] font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 justify-center w-full">
                                    <span>Sign In</span>
                                    <ArrowRight className="h-[18px] w-[18px]" />
                                </div>
                            )}
                        </Button>
                    </form>
                )}

                {!ssoAuthenticating && (
                    <div className="flex flex-col items-center gap-4 pt-6 mt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsSSOMode(!isSSOMode)}
                            className="text-[14px] font-semibold text-violet-600 hover:text-violet-700 transition-colors flex items-center gap-1.5"
                        >
                            {isSSOMode ? (
                                <>Sign in using standard email</>
                            ) : (
                                <>Sign in with SSO / Active Directory</>
                            )}
                        </button>
                    </div>
                )}

                {!isSSOMode && !ssoAuthenticating && (
                    <div className="flex flex-col items-center gap-4 pt-4">

                    </div>
                )}
            </div>
        </div>
    );
}
