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
    Search,
    X,
    Menu,
    LayoutTemplate,
} from 'lucide-react';
import { useState, useEffect, createContext, useContext } from 'react';

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
        title: 'Audit Logs',
        icon: FileSearch,
        href: '/audit',
    },
    {
        title: 'Templates',
        icon: LayoutTemplate,
        href: '/templates',
    },
];

const ROLE_LABELS: Record<string, string> = {
    ORG: 'Organization',
    MARKET: 'Market',
    ACCOUNT: 'Account',
    PROJECT_MANAGER: 'Project Manager',

    TEAM_LEAD: 'Team Lead',
    TEAM: 'Developer',
    CTO: 'Super Admin',
};

// ── Mobile sidebar context ──────────────────────────────────────
interface SidebarContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    toggle: () => void;
}
const SidebarContext = createContext<SidebarContextType>({
    isOpen: false,
    setIsOpen: () => { },
    toggle: () => { },
});

export function useSidebar() {
    return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(prev => !prev);

    // Close sidebar on route changes (mobile)
    const pathname = usePathname();
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function MobileMenuButton() {
    const { toggle } = useSidebar();
    return (
        <button
            onClick={toggle}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl hover:bg-accent transition-colors"
            aria-label="Toggle navigation menu"
        >
            <Menu className="h-5 w-5 text-foreground" />
        </button>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const { role } = useRole();
    const { isOpen, setIsOpen } = useSidebar();

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

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex h-24 items-center justify-between border-b border-border/10 bg-gradient-to-b from-primary/5 to-transparent px-6 shrink-0">
                <Link href="/" className="flex items-center gap-3 transition-transform hover:translate-y-[-1px] duration-300 flex-1">
                    <img src="/cto-logo.webp" alt="Compass Logo" className="w-[80px] h-[50px] object-contain shrink-0" />
                    <div className="flex flex-col justify-center select-none">
                        <span className="text-[20px] font-extrabold tracking-[0.02em] leading-none font-sans logo-title">
                            COMPASS
                        </span>
                        <div className="h-[1.5px] w-full bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 my-[4px]" />
                        <span className="text-[5.5px] font-bold tracking-[0.05em] uppercase leading-none font-sans logo-subtitle">
                            AI TRACKING GOVERNANCE PLATFORM
                        </span>
                    </div>
                </Link>
                {/* Close button on mobile */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg hover:bg-accent transition-colors shrink-0 ml-2"
                    aria-label="Close menu"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                {permittedItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                            pathname === item.href || (item.href === '/metrics-dashboard' && pathname.startsWith('/metrics-dashboard/')) || (item.href === '/admin' && pathname.startsWith('/admin/'))
                                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground hover:shadow-sm'
                        )}
                    >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-semibold shadow-md">
                                {item.badge}
                            </span>
                        )}
                    </Link>
                ))}
            </nav>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col border-r border-border/30 bg-card/95 backdrop-blur-sm shadow-xl shadow-black/5 dark:shadow-black/20">
                {sidebarContent}
            </aside>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Mobile drawer */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-50 h-screen w-72 flex-col border-r border-border/30 bg-card shadow-xl shadow-black/20 transition-transform duration-300 ease-in-out md:hidden flex',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
