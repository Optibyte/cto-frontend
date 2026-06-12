import { Badge } from '@/components/ui/badge';
import { formatAdminDate } from './tab-utils';
import type { AdminRowProps } from './types';

export const columns = ["Name","Market","Teams","Created"];

export function AccountsRow({ item, projects, teams, onTriggerReport }: AdminRowProps) {
return (<>

                <td className="py-3 text-sm font-semibold">{item.name}</td>

                <td className="py-3 text-sm text-muted-foreground">{item.market?.name || '—'}</td>

                <td className="py-3 text-sm text-muted-foreground">{item._count?.teams ?? item.teams?.length ?? 0}</td>

                <td className="py-3 text-xs text-muted-foreground">{formatAdminDate(item.createdAt)}</td>

            </>);
}
