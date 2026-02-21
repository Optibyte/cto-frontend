'use client';

import { ReactNode } from 'react';
import { useRole } from '@/contexts/role-context';
import { UserRole } from '@/lib/types';

interface RoleGuardProps {
    allowedRoles: UserRole[];
    children: ReactNode;
    fallback?: ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
    const { role } = useRole();

    if (!allowedRoles.includes(role)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
