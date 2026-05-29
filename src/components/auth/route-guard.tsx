'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useRole } from '@/contexts/role-context';
import { canAccess, ROUTE_FEATURE_MAP } from '@/lib/permissions';
import { Loader2 } from 'lucide-react';

export function RouteGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isInitializing, role } = useRole();
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (isInitializing) return;

        // Skip auth check for login/signup/forgot-password/reset-password
        const isAuthRoute = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname === '/reset-password';
        
        if (!isAuthenticated && !isAuthRoute) {
            router.push('/login');
            return;
        }

        if (isAuthenticated && isAuthRoute) {
            router.push('/metrics-dashboard');
            return;
        }

        // Check feature permissions based on route
        const requiredFeature = ROUTE_FEATURE_MAP[pathname];
        if (requiredFeature && isAuthenticated) {
            if (!canAccess(role, requiredFeature)) {
                // If they don't have access, redirect to dashboard or show 403
                router.push('/metrics-dashboard');
                return;
            }
        }

        setAuthorized(true);
    }, [isAuthenticated, isInitializing, pathname, role, router]);

    if (isInitializing || !authorized) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
