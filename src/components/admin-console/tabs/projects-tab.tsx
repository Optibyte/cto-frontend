import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatAdminDate } from './tab-utils';
import type { AdminRowProps } from './types';

export const columns = ["Name","Status","AI Enabled","Manager","Team Size","Created"];

export function ProjectsRow({ item, projects, teams, onTriggerReport }: AdminRowProps) {
return (<>

                <td className="py-3 text-sm font-semibold">{item.name}</td>

                <td className="py-3">

                    <Badge className={cn('rounded-full text-[10px] px-2', {

                        'bg-emerald-500/10 text-emerald-500 border-emerald-500/20': item.status === 'ACTIVE',

                        'bg-amber-500/10 text-amber-500 border-amber-500/20': item.status === 'ON_HOLD',

                        'bg-blue-500/10 text-blue-500 border-blue-500/20': item.status === 'PLANNED',

                        'bg-gray-500/10 text-gray-500 border-gray-500/20': item.status === 'COMPLETED',

                    })} variant="outline">{item.status}</Badge>

                </td>

                <td className="py-3">

                    {item.aiEnabled ? (

                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-full text-[9px] px-2" variant="outline">AI ENABLED</Badge>

                    ) : (

                        <span className="text-muted-foreground text-[10px]">Standard</span>

                    )}

                </td>

                <td className="py-3 text-sm text-muted-foreground">

                    {item.users && item.users.length > 0 ? item.users.filter((u: any) => u.role === 'PROJECT_MANAGER' || u.role === 'PROJECT' || u.role === 'CTO').map((u: any) => u.fullName).join(', ') || '—' : '—'}

                </td>

                <td className="py-3 text-sm text-muted-foreground">{item.teamSize || 0}</td>

                <td className="py-3 text-xs text-muted-foreground">{formatAdminDate(item.createdAt)}</td>

            </>);
}
