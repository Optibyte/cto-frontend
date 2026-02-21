'use client';

import { Bell, Search, User, ChevronDown, Shield, Briefcase, Users, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { useRole } from '@/contexts/role-context';
import { UserRole } from '@/lib/types';
import { ProjectFilter } from '@/components/filters/project-filter';
import { TeamFilter } from '@/components/filters/team-filter';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const ROLES = [
    { value: 'CTO' as UserRole, label: 'CTO', color: 'bg-purple-500', icon: Shield, description: 'Organization-wide view' },
    { value: 'Manager' as UserRole, label: 'Manager', color: 'bg-blue-500', icon: Briefcase, description: 'Project & team management' },
    { value: 'TeamLead' as UserRole, label: 'Team Lead', color: 'bg-emerald-500', icon: Users, description: 'Team performance' },
    { value: 'Employee' as UserRole, label: 'Employee', color: 'bg-amber-500', icon: User, description: 'Individual contributions' },
];

export function Header() {
    const { role, setRole } = useRole();
    const currentRole = ROLES.find((r) => r.value === role) || ROLES[0];

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/30 bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/60 px-6 transition-all shadow-sm shadow-black/5 dark:shadow-black/10">
            <div className="flex flex-1 items-center gap-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search teams, metrics, SLAs..."
                        className="pl-10 rounded-xl border-border/50 transition-all focus:shadow-lg focus:shadow-primary/10 focus:border-primary/50"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Dashboard Filters - Only for CTO and Manager */}
                {(role === 'CTO' || role === 'Manager') && (
                    <>
                        <ProjectFilter />
                        <TeamFilter />
                        <div className="h-6 w-px bg-border/40 mx-1" />
                    </>
                )}

                {/* Role Switcher */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2.5 rounded-xl border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all px-3.5 py-2 h-auto"
                        >
                            <div className={`p-1 rounded-md ${currentRole.color.replace('bg-', 'bg-')}/10`}>
                                <currentRole.icon className={`h-3.5 w-3.5 ${currentRole.color.replace('bg-', 'text-')}`} />
                            </div>
                            <div className="flex flex-col items-start leading-none gap-0.5">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Role</span>
                                <span className="text-sm font-semibold">{currentRole.label}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-2xl border-border/50 bg-popover/95 backdrop-blur-sm">
                        <DropdownMenuLabel className="px-3 py-2 text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                            Experience Portal
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="opacity-50" />
                        <div className="p-1 space-y-1">
                            {ROLES.map((r) => {
                                const Icon = r.icon;
                                const isActive = role === r.value;
                                return (
                                    <DropdownMenuItem
                                        key={r.value}
                                        onClick={() => setRole(r.value)}
                                        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 
                                            ${isActive
                                                ? 'bg-primary/10 border border-primary/20 shadow-inner shadow-primary/5'
                                                : 'hover:bg-muted/50 border border-transparent'
                                            }`}
                                    >
                                        <div className={`mt-0.5 p-2 rounded-lg ${isActive ? r.color : 'bg-muted'} transition-colors`}>
                                            <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                                        </div>
                                        <div className="flex flex-col flex-1 gap-0.5">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-sm font-bold ${isActive ? 'text-primary' : ''}`}>{r.label}</span>
                                                {isActive && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Active</span>
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground leading-tight">
                                                {r.description}
                                            </span>
                                        </div>
                                        {isActive && <Check className="h-4 w-4 text-primary shrink-0 self-center" />}
                                    </DropdownMenuItem>
                                );
                            })}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <ThemeToggle />
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors rounded-xl">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors rounded-xl">
                    <User className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}

