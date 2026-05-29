'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useRole } from '@/contexts/role-context';
import { ROUTE_FEATURE_MAP, canAccess } from '@/lib/permissions';
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
import { useState, useEffect } from 'react';

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
        href: '/metrics-dashboard',
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
        title: 'Integrations',
        icon: Puzzle,
        href: '/integrations',
    },

    {
        title: 'Admin Console',
        icon: Settings2,
        href: '/admin',
    },
    {
        title: 'Reports',
        icon: FileText,
        href: '/reports',
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
    },
    {
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

    TEAM_LEAD: 'Team Lead',
    TEAM: 'Developer',
    CTO: 'CTO',
};

export function Sidebar() {
    const pathname = usePathname();
    const { role } = useRole();

    // Defer permission filtering to client to avoid SSR hydration mismatch.
    // localStorage is only available client-side, so we must not filter during SSR.
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    // On the server (or before mount), show all items so HTML matches.
    // After mount, filter by the user's actual permissions read from localStorage.
    const permittedItems = mounted
        ? navigationItems.filter((item) => {
            const feature = ROUTE_FEATURE_MAP[item.href];
            if (!feature) return true;
            return canAccess(role, feature);
        })
        : navigationItems;

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/30 bg-card/95 backdrop-blur-sm shadow-xl shadow-black/5 dark:shadow-black/20">
            {/* Logo */}
            <div className="flex h-24 items-center justify-center border-b border-border/10 bg-gradient-to-b from-primary/5 to-transparent px-4">
                <Link href="/" className="flex flex-col items-center gap-2 transition-transform hover:translate-y-[-1px] duration-300">
                    <div className="flex items-center gap-2">
                        <img src="/ct-icon.png" alt="Icon" className="h-[22px] w-auto object-contain shrink-0" />
                        <span className="text-[22px] font-black text-foreground tracking-tight leading-none whitespace-nowrap">SkillVector</span>
                    </div>
                    <img src="/logo.png" alt="CitiusTech Logo" className="h-[36px] w-auto object-contain shrink-0" />
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
