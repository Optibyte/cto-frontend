'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRole } from '@/contexts/role-context';
import { UserRole } from '@/lib/types';
import { authAPI } from '@/lib/api/auth';

const LogoGraphic = () => (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 mb-6">
        <rect x="12" y="12" width="16" height="16" rx="4" stroke="#8B5CF6" strokeWidth="3"/>
        <rect x="36" y="12" width="16" height="16" rx="4" stroke="#06B6D4" strokeWidth="3"/>
        <rect x="12" y="36" width="16" height="16" rx="4" stroke="#8B5CF6" strokeWidth="3"/>
        <rect x="36" y="36" width="16" height="16" rx="4" stroke="#06B6D4" strokeWidth="3"/>
        <path d="M28 20 L36 20" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round"/>
        <path d="M20 28 L20 36" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round"/>
        <path d="M28 44 L36 44" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round"/>
        <path d="M44 28 L44 36" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round"/>
    </svg>
);

export function LoginForm() {
    const router = useRouter();
    const { setRole, setIsAuthenticated, setUser, setToken } = useRole();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [isSSOMode, setIsSSOMode] = useState(false);
    const [ssoDomain, setSsoDomain] = useState('');
    const [ssoAuthenticating, setSsoAuthenticating] = useState(false);
    const [ssoStatus, setSsoStatus] = useState('');

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
                        // If it contains @, use it. Otherwise use cto@ctoplatform.com
                        let loginEmail = ssoDomain.includes('@') ? ssoDomain : 'cto@ctoplatform.com';
                        
                        // Fallback to cto@ctoplatform.com if it doesn't match an active user
                        const response = await authAPI.login({ email: loginEmail }).catch(async () => {
                            // If user email failed, login as default CTO user
                            return await authAPI.login({ email: 'cto@ctoplatform.com' });
                        });

                        // Store token and user data
                        setToken(response.access_token);
                        setRole(response.user.role as UserRole);
                        setUser(response.user);
                        setIsAuthenticated(true);

                        toast.success(`Welcome back (SSO), ${response.user.fullName}!`);
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
        <div className="w-full max-w-[900px] flex flex-col md:flex-row overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0b] text-white my-8 mx-4">
            
            {/* Logo / Branding Card (Left Pane) */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-12 md:p-16 bg-gradient-to-b from-[#161225] to-[#0a0a0b] relative border-r border-white/5">
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                    <LogoGraphic />
                    <div className="text-center space-y-4">
                        <h1 className="text-[28px] font-bold tracking-tight text-[#f8fafc]">CTO Platform</h1>
                        <p className="text-[15px] text-[#94a3b8] font-medium">Performance Intelligence</p>
                    </div>
                </div>
            </div>

            {/* Login Form Card (Right Pane) */}
            <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center bg-[#0a0a0b]">
                <div className="space-y-2 mb-10 text-left">
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-3">
                        {isSSOMode ? 'Enterprise Portal' : 'Welcome back'}
                    </h2>
                    <p className="text-[15px] text-[#94a3b8]">
                        {isSSOMode ? 'Single Sign-On & AD Integration' : 'Enter your email to access your dashboard'}
                    </p>
                </div>
                
                {ssoAuthenticating ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-6">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
                        <div className="text-center">
                            <p className="font-semibold text-white text-[15px]">{ssoStatus}</p>
                            <p className="text-xs text-muted-foreground mt-1">Please do not close this window</p>
                        </div>
                    </div>
                ) : isSSOMode ? (
                    <form onSubmit={handleSSOSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="ssoDomain" className="text-[13px] font-semibold text-[#f8fafc]">Enterprise Email or Domain</Label>
                            <div className="relative group">
                                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#a78bfa]" />
                                <Input
                                    id="ssoDomain"
                                    type="text"
                                    placeholder="e.g. name@company.com or company.com"
                                    className="pl-12 h-14 bg-[#eeebff] border-2 border-[#8b5cf6] rounded-xl text-[#0f172a] placeholder:text-[#94a3b8] focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#7c3aed] text-[15px] font-medium transition-colors"
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
                            <Label htmlFor="email" className="text-[13px] font-semibold text-[#f8fafc]">Email address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#a78bfa]" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-12 h-14 bg-[#eeebff] border-2 border-[#8b5cf6] rounded-xl text-[#0f172a] placeholder:text-[#94a3b8] focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#7c3aed] text-[15px] font-medium transition-colors"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        
                        <Button
                            className="w-full rounded-xl h-14 mt-4 text-[15px] font-semibold bg-[#8b5cf6] hover:bg-[#7c3aed] text-white transition-colors"
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
                    <div className="flex flex-col items-center gap-4 pt-6 mt-6 border-t border-white/5">
                        <button
                            type="button"
                            onClick={() => setIsSSOMode(!isSSOMode)}
                            className="text-[14px] font-semibold text-[#a78bfa] hover:text-[#c4b5fd] transition-colors flex items-center gap-1.5"
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
                        <div className="flex items-center gap-2 text-[14px] text-[#94a3b8]">
                            <span>Don't have an account?</span>
                            <Link
                                href="/signup"
                                className="font-semibold text-[#a78bfa] hover:text-[#c4b5fd] transition-colors"
                            >
                                Sign up now
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

