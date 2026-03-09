'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/contexts/role-context';
import { CTODashboard } from '@/components/dashboard/cto-dashboard';
import { ManagerDashboard } from '@/components/dashboard/manager-dashboard';
import { TLDashboard } from '@/components/dashboard/tl-dashboard';
import { MarketDashboard } from '@/components/dashboard/market-dashboard';
import { AccountsDashboard } from '@/components/dashboard/accounts-dashboard';

export default function DashboardPage() {
  const { role, isAuthenticated } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Render the appropriate dashboard based on the selected role
  switch (role) {
    case 'ORG':
      return <CTODashboard />;
    case 'MARKET':
      return <MarketDashboard />;
    case 'ACCOUNT':
    case 'ACCOUNTS' as any:
      return <AccountsDashboard />;
    case 'PROJECT_MANAGER':
    case 'PROJECT' as any:
    case 'Manager' as any:
      return <ManagerDashboard />;
    case 'TEAM_LEAD':
    case 'TeamLead' as any:
      return <TLDashboard />;
    case 'TEAM':
   
      return <CTODashboard />;
  }
}
