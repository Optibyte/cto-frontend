import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatAdminDate } from './tab-utils';
import type { AdminRowProps } from './types';

export const columns = ["Name","Status","Licenses","AI Tools","Manager","Created"];

export function AiProjectsRow({ item, projects, teams, onTriggerReport }: AdminRowProps) {
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

                    <Badge className="bg-violet-500/10 text-violet-500 border-violet-500/20 rounded-full text-[10px] font-bold px-2" variant="outline">

                        {item.aiToolLicenses || 0}

                    </Badge>

                </td>

                <td className="py-3">

                    <div className="flex flex-wrap gap-1">

                        {item.aiToolsUsed && item.aiToolsUsed.length > 0 ? item.aiToolsUsed.map((tool: string) => (

                            <Badge key={tool} className="rounded-full text-[9px] px-1.5 py-0 bg-violet-100 text-violet-600 border-violet-200" variant="secondary">{tool}</Badge>

                        )) : <span className="text-muted-foreground text-[10px]">None</span>}

                    </div>

                </td>

                <td className="py-3 text-sm text-muted-foreground">

                    {item.users && item.users.length > 0 ? item.users.filter((u: any) => u.role === 'PROJECT_MANAGER' || u.role === 'PROJECT' || u.role === 'CTO').map((u: any) => u.fullName).join(', ') || '—' : '—'}

                </td>

                <td className="py-3 text-xs text-muted-foreground">{formatAdminDate(item.createdAt)}</td>

            </>);
}
