'use client';

import { useState, useEffect } from 'react';
import { Bell, Search, User, ChevronDown, Shield, Briefcase, Users, Check, Globe, Landmark, Lock, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { useRole } from '@/contexts/role-context';
import { UserRole } from '@/lib/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const ROLES = [
    { value: 'ORG' as UserRole, label: 'Organization', color: 'bg-purple-500', icon: Shield, description: 'Organization-wide view' },
    { value: 'MARKET' as UserRole, label: 'Market', color: 'bg-cyan-500', icon: Globe, description: 'Market analytics & oversight' },
    { value: 'ACCOUNT' as UserRole, label: 'Account', color: 'bg-rose-500', icon: Landmark, description: 'Account performance' },
    { value: 'PROJECT' as UserRole, label: 'Project', color: 'bg-blue-500', icon: Briefcase, description: 'Project management' },
    { value: 'TEAM' as UserRole, label: 'Team', color: 'bg-emerald-500', icon: Users, description: 'Team performance' },
];

export function Header() {
    const { role, setRole, setIsAuthenticated, user, logout } = useRole();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const currentRole = ROLES.find((r) => r.value === role) || ROLES[0];

    // Get display email and ID
    const displayEmail = user?.email || user?.user?.email || 'user@ctoplatform.com';
    const displayId = user?.id || '';

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/30 bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/60 px-6 transition-all shadow-sm shadow-black/5 dark:shadow-black/10">
            <div className="flex flex-1 items-center gap-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search teams, metrics..."
                        className="pl-10 rounded-xl border-border/50 transition-all focus:shadow-lg focus:shadow-primary/10 focus:border-primary/50"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                {mounted ? (
                    <>
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors rounded-xl">
                            <Bell className="h-5 w-5" />
                            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors rounded-xl overflow-hidden border border-border/40 p-0 h-9 w-9">
                                    <span className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                        <User className="h-5 w-5 text-primary" />
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-border/50 bg-popover/95 backdrop-blur-sm">
                                <DropdownMenuLabel className="px-3 py-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold leading-none">Logged in as</span>
                                        <span className="text-sm font-bold truncate leading-none mt-1">{displayEmail}</span>
                                        {displayId && (
                                            <span className="text-[10px] text-primary font-mono mt-1 font-bold bg-primary/10 px-1.5 py-0.5 rounded-sm w-fit" title="Tracking/Employee ID">
                                                TRK: {displayId}
                                            </span>
                                        )}
                                        {user?.id && (
                                            <span className="text-[9px] text-muted-foreground font-mono mt-1 bg-muted/50 px-1.5 py-0.5 rounded-sm w-fit" title="System UUID">
                                                ID: {user?.id?.slice(0, 8)}...
                                            </span>
                                        )}
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <span className={`h-1.5 w-1.5 rounded-full ${currentRole.color}`} />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{currentRole.label} ROLE</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="my-1 opacity-50" />
                                <DropdownMenuItem className="flex items-center gap-2 p-2.5 rounded-xl cursor-not-allowed opacity-50">
                                    <User className="h-4 w-4" />
                                    <span className="text-sm font-medium">Profile Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2 p-2.5 rounded-xl cursor-not-allowed opacity-50">
                                    <Shield className="h-4 w-4" />
                                    <span className="text-sm font-medium">Security</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1 opacity-50" />
                                <DropdownMenuItem
                                    onClick={() => {
                                        logout();
                                        router.push('/login');
                                    }}
                                    className="flex items-center gap-2 p-2.5 rounded-xl cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        <span className="text-sm font-bold">Log out</span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <div className="h-9 w-[124px]" /> // Placeholder for ThemeToggle (36) + Bell (36) + User (36) + Gaps to avoid layout shift
                )}
            </div>
        </header>
    );
}

