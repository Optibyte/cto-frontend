import { Badge } from '@/components/ui/badge';
import { formatAdminDate } from './tab-utils';
import type { AdminRowProps } from './types';

export const columns = ["Employee ID","Name","Email","Onboarding Date","Role","Project","Team"];

export function OnboardEmployeeRow({ item, projects, teams, onTriggerReport }: AdminRowProps) {
return (<>

                <td className="py-3 text-sm font-semibold">{item.employeeId || '—'}</td>

                <td className="py-3 text-sm font-semibold">{item.fullName}</td>

                <td className="py-3 text-sm text-muted-foreground">{item.email}</td>

                <td className="py-3 text-xs text-muted-foreground">{formatAdminDate(item.createdAt)}</td>

                <td className="py-3">

                    <Badge variant="secondary" className="rounded-full text-[10px] px-2">{item.jobRole || '—'}</Badge>

                </td>

                <td className="py-3 text-sm text-muted-foreground">

                    {projects?.find((p: any) => p.id === item.projectId)?.name || '—'}

                </td>

                <td className="py-3 text-sm text-muted-foreground">

                    {teams?.find((t: any) => t.id === item.teamId)?.name || '—'}

                </td>

            </>);
}
