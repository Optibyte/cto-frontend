'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/forgot-password');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#05050A] text-white">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
        </div>
    );
}
