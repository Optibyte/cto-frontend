import { Badge } from '@/components/ui/badge';
import { formatAdminDate } from './tab-utils';
import type { AdminRowProps } from './types';

export const columns = ["Name","AI Enabled","Project","Members","Active"];

export function TeamsRow({ item, projects, teams, onTriggerReport }: AdminRowProps) {
return (<>

                <td className="py-3 text-sm font-semibold">{item.name}</td>

                <td className="py-3">

                    {item.project?.aiEnabled ? (

                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-full text-[9px] px-2" variant="outline">AI ENABLED</Badge>

                    ) : (

                        <span className="text-muted-foreground text-[10px]">Standard</span>

                    )}

                </td>

                <td className="py-3 text-sm text-muted-foreground">{item.project?.name || '—'}</td>

                <td className="py-3 text-sm text-muted-foreground">{item.members?.length ?? 0}</td>

                <td className="py-3">{item.isActive ? <Badge className="bg-emerald-500/10 text-emerald-500 rounded-full text-[10px]" variant="outline">Active</Badge> : <Badge variant="outline" className="rounded-full text-[10px]">Inactive</Badge>}</td>

            </>);
}
