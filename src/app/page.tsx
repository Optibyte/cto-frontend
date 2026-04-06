'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/contexts/role-context';
export default function DashboardPage() {
  const { isAuthenticated } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      router.push('/metrics-dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
