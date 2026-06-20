'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/contexts/role-context';
import { TABS } from '@/components/admin-console/constants';

export default function AdminPage() {
    const router = useRouter();
    const { role } = useRole();

    useEffect(() => {
        const filteredTabs = TABS.filter(tab => {
            if (role === 'ORG' || role === 'CTO') return true;
            if (role === 'MARKET') return ['markets', 'accounts', 'teams', 'members', 'users', 'onboard-employee', 'report-schedules'].includes(tab.key);
            if (role === 'ACCOUNT') return ['accounts', 'teams', 'members', 'users', 'onboard-employee', 'report-schedules'].includes(tab.key);
            if (role === 'PROJECT_MANAGER' || role === 'PROJECT') return ['projects', 'teams', 'members', 'users', 'onboard-employee', 'report-schedules'].includes(tab.key);
            if (role === 'TEAM_LEAD') return ['teams', 'members', 'users', 'onboard-employee'].includes(tab.key);
            return ['teams', 'members'].includes(tab.key);
        });

        const defaultTab = filteredTabs[0]?.key || 'teams';
        router.replace(`/admin/${defaultTab}`);
    }, [role, router]);

    return null;
}
