import { Badge } from '@/components/ui/badge';
import { formatAdminDate } from './tab-utils';
import type { AdminRowProps } from './types';

export const columns = ["Name","Country","Created"];

export function OrganizationsRow({ item, projects, teams, onTriggerReport }: AdminRowProps) {
return (<>

                <td className="py-3 text-sm font-semibold">{item.name}</td>

                <td className="py-3">

                    <div className="flex flex-wrap gap-1">

                        {Array.isArray(item.country) && item.country.length > 0 ? item.country.map((c: string) => (

                            <Badge key={c} variant="outline" className="rounded-full text-[10px] px-2">{c}</Badge>

                        )) : <Badge variant="outline" className="rounded-full text-[10px] px-2">Global</Badge>}

                    </div>

                </td>

                <td className="py-3 text-xs text-muted-foreground">{formatAdminDate(item.createdAt)}</td>

            </>);
}
