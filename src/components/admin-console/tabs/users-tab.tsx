import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getBadgeStyles } from '@/lib/badges';
import { formatAdminDate } from './tab-utils';
import type { AdminRowProps } from './types';

export const columns = ["Name","Email","Access Role","Employee ID","Active"];

export function UsersRow({ item, projects, teams, onTriggerReport }: AdminRowProps) {
return (<>

                <td className="py-3 text-sm font-semibold">

                    <div className="flex flex-col gap-0.5">

                        <span className="font-semibold text-foreground">{item.fullName}</span>

                        {item.badge && item.badge !== 'none' && (

                            <div className="flex flex-wrap gap-1 mt-0.5">

                                {item.badge.split(',').map((badgeName: string) => {

                                    const trimmed = badgeName.trim();

                                    if (!trimmed || trimmed === 'none') return null;

                                    const badgeStyle = getBadgeStyles(trimmed);

                                    return (

                                        <span key={trimmed} className={cn(

                                            "inline-flex items-center gap-1 border px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-sm w-fit",

                                            badgeStyle.bg,

                                            badgeStyle.glow

                                        )}>

                                            <badgeStyle.icon className="h-2 w-2 animate-pulse" />

                                            {badgeStyle.label}

                                        </span>

                                    );

                                })}

                            </div>

                        )}

                    </div>

                </td>

                <td className="py-3 text-sm text-muted-foreground">{item.email}</td>

                <td className="py-3"><Badge className={cn('rounded-full text-[10px] px-2', {

                    'bg-purple-500/10 text-purple-500 border-purple-500/20': item.role === 'CTO',

                    'bg-violet-500/10 text-violet-500 border-violet-500/20': item.role === 'ORG',

                    'bg-blue-500/10 text-blue-500 border-blue-500/20': item.role === 'MARKET',

                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20': item.role === 'ACCOUNT',

                    'bg-amber-500/10 text-amber-500 border-amber-500/20': item.role === 'PROJECT_MANAGER',

                    'bg-indigo-500/10 text-indigo-500 border-indigo-500/20': item.role === 'PROJECT',

                    'bg-cyan-500/10 text-cyan-500 border-cyan-500/20': item.role === 'TEAM_LEAD',

                    'bg-slate-500/10 text-slate-500 border-slate-500/20': item.role === 'TEAM',

                })} variant="outline">{item.role === 'CTO' ? 'Super Admin' : item.role}</Badge></td>

                <td className="py-3 text-sm text-muted-foreground">{item.employeeId || '—'}</td>

                <td className="py-3">{item.isActive ? <Badge className="bg-emerald-500/10 text-emerald-500 rounded-full text-[10px]" variant="outline">Active</Badge> : <Badge variant="outline" className="rounded-full text-[10px]">Inactive</Badge>}</td>

            </>);
}
