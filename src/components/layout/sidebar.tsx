'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useRole } from '@/contexts/role-context';
import { ROUTE_FEATURE_MAP, ROLE_PERMISSIONS, canAccess } from '@/lib/permissions';
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Target,
    FileText,
    Puzzle,
    Upload,
    Settings,
    Bell,
    FileSearch,
    Layers,
    FolderKanban,
    LucideIcon,
    Shield,
    ShieldCheck,
    UserPlus,
    UserCheck,
    LayoutGrid,
    Activity,
    Settings2,
} from 'lucide-react';
import { title } from 'process';

interface NavItem {
    title: string;
    icon: LucideIcon;
    href: string;
    badge?: number;
}

const navigationItems: NavItem[] = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/',
    },

    {
        title: 'Project Management',
        icon: Layers,
        href: '/drilldown',
    },
    {
        title: 'Metrics',
        icon: BarChart3,
        href: '/metrics',
    },

    {
        title: 'Reports',
        icon: FileText,
        href: '/reports',
    },
    {
        title: 'Integrations',
        icon: Puzzle,
        href: '/integrations',
    },

    {
        title: 'Import',
        icon: Upload,
        href: '/import',
    },


    {
        title: 'Admin Console',
        icon: Settings2,
        href: '/admin',
    },
    {
        title: 'Role Features',
        icon: ShieldCheck,
        href: '/role-features',
    },
    {
        title: 'GitHub Metrics',
        icon: Activity,
        href: '/github-metrics',
    }, {
        title: 'Audit Logs',
        icon: FileSearch,
        href: '/audit',
    },
];

const ROLE_LABELS: Record<string, string> = {
    ORG: 'Organization',
    MARKET: 'Market',
    ACCOUNT: 'Account',
    PROJECT_MANAGER: 'Project Manager',
    PROJECT: 'Project Access',
    TEAM_LEAD: 'Team Lead',
    TEAM: 'Developer',
};

export function Sidebar() {
    const pathname = usePathname();
    const { role } = useRole();

    // Filter nav items based on current role permissions
    const permittedItems = navigationItems.filter((item) => {
        const feature = ROUTE_FEATURE_MAP[item.href];
        if (!feature) return true;
        return canAccess(role, feature);
    });

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/30 bg-card/95 backdrop-blur-sm shadow-xl shadow-black/5 dark:shadow-black/20">
            {/* Logo */}
            <div className="flex h-24 items-center border-b border-border/10 bg-gradient-to-b from-primary/5 to-transparent px-6">
                <Link href="/" className="flex items-center gap-4 w-[100px] transition-transform hover:translate-x-1 duration-300">
                    <img src="/logo.png" alt="CTO Logo" className="h-[85px] w-auto object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] shrink-0" />
                    <div className="flex flex-col items-start justify-center pt-0.5">
                        <span className="text-[25px] font-black text-foreground tracking-tight leading-none whitespace-nowrap">CTO</span>
                        <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap uppercase tracking-[0.25em] mt-1 pl-1">PLATFORM</span>
                    </div>
                </Link>
            </div>

            {/* Role Badge */}
            <div className="px-4 py-3 border-b border-border/30">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                        {ROLE_LABELS[role] || role}
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {permittedItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                            pathname === item.href
                                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground hover:shadow-sm'
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-semibold shadow-md">
                                {item.badge}
                            </span>
                        )}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
