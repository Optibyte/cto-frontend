'use client';

import { LoginForm } from '@/components/auth/login-form';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-950">
            {/* Decorative Blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />

            <div className="z-10 w-full px-4 flex flex-col items-center gap-8">

                <LoginForm />
                <p className="text-slate-500 text-sm">
                    &copy; 2026 CTO Performance Intelligence Platform. All rights reserved.
                </p>
            </div>
        </div>
    );
}
