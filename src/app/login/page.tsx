'use client';

import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#05050A] font-sans">
            <div className="flex-1 flex w-full items-center justify-center p-4">
                <LoginForm />
            </div>
            
            <div className="w-full pb-8 flex flex-col items-center justify-center relative">
                <p className="text-[#64748b] text-[13px] font-medium">
                    &copy; 2026 CTO Performance Intelligence Platform. All rights reserved.
                </p>
                
                
            </div>
        </div>
    );
}
