import { Badge } from '@/components/ui/badge';
import { formatAdminDate } from './tab-utils';
import type { AdminRowProps } from './types';

export const columns = ["User","Email","Team","Role in Team","Joined"];

export function MembersRow({ item, projects, teams, onTriggerReport }: AdminRowProps) {
return (<>

                <td className="py-3 text-sm font-semibold">{item.userName}</td>

                <td className="py-3 text-sm text-muted-foreground">{item.userEmail}</td>

                <td className="py-3"><Badge variant="secondary" className="rounded-full text-[10px] px-2">{item.teamName}</Badge></td>

                <td className="py-3 text-sm text-muted-foreground">{item.roleInTeam}</td>

                <td className="py-3 text-xs text-muted-foreground">{formatAdminDate(item.joinedAt)}</td>

            </>);
}
