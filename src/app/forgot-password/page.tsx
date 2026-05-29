'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Lock, KeyRound, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authAPI } from '@/lib/api/auth';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1 = Email entry, 2 = Password entry
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }
        
        // Simple regex check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password) {
            toast.error('Please enter a new password');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            await authAPI.resetPassword(email, password);
            setIsSuccess(true);
            toast.success('Password changed successfully!');
            
            setTimeout(() => {
                router.push('/login');
            }, 2500);
        } catch (error: any) {
            console.error('Password reset error:', error);
            let message = 'Failed to change password. Please check if email is correct.';
            if (!error.response) {
                message = 'Network error: Cannot reach the backend server. Please verify it is running on port 4000.';
            } else if (error.response.data?.message) {
                message = Array.isArray(error.response.data.message) 
                    ? error.response.data.message.join(', ') 
                    : error.response.data.message;
            }
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#05050A] font-sans">
            <div className="flex-1 flex w-full items-center justify-center p-4">
                <div className="w-full max-w-[450px] overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0b] text-white p-8 md:p-10 shadow-2xl relative">
                    
                    {/* Back Link */}
                    <div className="mb-6">
                        {step === 2 && !isSuccess ? (
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-[#a78bfa] hover:text-[#c4b5fd] transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Email Entry
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-[#a78bfa] hover:text-[#c4b5fd] transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Sign In
                            </Link>
                        )}
                    </div>

                    {isSuccess ? (
                        <div className="py-6 text-center space-y-4">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                                <KeyRound className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Password Updated</h3>
                            <p className="text-slate-400 text-[14px] leading-relaxed">
                                Your password has been successfully updated. Redirecting you to the sign in page...
                            </p>
                            <div className="pt-6">
                                <Link href="/login" style={{ width: '100%' }}>
                                    <Button className="w-full rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors font-semibold font-sans">
                                        Sign In Now
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : step === 1 ? (
                        <>
                            <div className="space-y-2 mb-8 text-left">
                                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                                    Forgot Password
                                </h2>
                                <p className="text-[14px] text-[#94a3b8] leading-relaxed">
                                    Enter your account email to proceed to password reset.
                                </p>
                            </div>

                            <form onSubmit={handleNextStep} className="space-y-5">
                                <div className="space-y-2">
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
                                >
                                    <div className="flex items-center gap-2 justify-center w-full">
                                        <span>Continue</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </Button>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2 mb-8 text-left">
                                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                                    Reset Password
                                </h2>
                                <p className="text-[14px] text-[#94a3b8] leading-relaxed">
                                    Set your new password for <strong className="text-white font-medium">{email}</strong>.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-[13px] font-semibold text-[#f8fafc]">New Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#a78bfa]" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-12 h-14 bg-[#eeebff] border-2 border-[#8b5cf6] rounded-xl text-[#0f172a] placeholder:text-[#94a3b8] focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#7c3aed] text-[15px] font-medium transition-colors"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-[13px] font-semibold text-[#f8fafc]">Confirm Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#a78bfa]" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-12 h-14 bg-[#eeebff] border-2 border-[#8b5cf6] rounded-xl text-[#0f172a] placeholder:text-[#94a3b8] focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#7c3aed] text-[15px] font-medium transition-colors"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                                        <div className="flex items-center gap-2 justify-center w-full">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            <span>Updating password...</span>
                                        </div>
                                    ) : (
                                        <span>Change Password</span>
                                    )}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            <div className="w-full pb-8 flex flex-col items-center justify-center relative">
                <p className="text-[#64748b] text-[13px] font-medium">
                    &copy; 2026 SkillVector Performance Intelligence Platform. All rights reserved.
                </p>
            </div>
        </div>
    );
}
