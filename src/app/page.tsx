'use client';

import { useRole } from '@/contexts/role-context';
import { CTODashboard } from '@/components/dashboard/cto-dashboard';
import { ManagerDashboard } from '@/components/dashboard/manager-dashboard';
import { TLDashboard } from '@/components/dashboard/tl-dashboard';
import { EmployeeDashboard } from '@/components/dashboard/employee-dashboard';

export default function DashboardPage() {
  const { role } = useRole();

  // Render the appropriate dashboard based on the selected role
  switch (role) {
    case 'CTO':
      return <CTODashboard />;
    case 'Manager':
      return <ManagerDashboard />;
    case 'TeamLead':
      return <TLDashboard />;
    case 'Employee':
      return <EmployeeDashboard />;
    default:
      return <CTODashboard />;
  }
}

