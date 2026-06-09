import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { formatAdminDate } from './tab-utils';
import type { AdminRowProps } from './types';

export const columns = ["Name","Recipients","Frequency","Time","Report Type","Fenced Projects","Last Sent","Status","Dispatch"];

export function ReportSchedulesRow({ item, projects, teams, onTriggerReport }: AdminRowProps) {
return (<>

                <td className="py-3 text-sm font-semibold">{item.name || 'Unnamed Schedule'}</td>

                <td className="py-3 text-sm text-muted-foreground max-w-[200px] truncate" title={item.recipients || ''}>{item.recipients || ''}</td>

                <td className="py-3 text-xs"><Badge variant="outline" className="rounded-full text-[10px] bg-slate-50">{item.frequency || 'WEEKLY'}</Badge></td>

                <td className="py-3 text-sm font-mono text-muted-foreground">{item.scheduleTime || '09:00'}</td>

                <td className="py-3 text-xs"><Badge variant="secondary" className="rounded-full text-[10px]">{(item.reportType || 'PERFORMANCE').replace(/_/g, ' ')}</Badge></td>

                <td className="py-3 text-xs">

                    <div className="flex flex-wrap gap-1 max-w-[150px]">

                        {item.projectIds && item.projectIds.length > 0 ? (

                            item.projectIds.map((pid: string) => {

                                const proj = projects?.find((p: any) => p.id === pid);

                                return (

                                    <Badge key={pid} variant="outline" className="rounded-full text-[9px] px-1.5 py-0">

                                        {proj ? proj.name : pid.slice(0, 4)}

                                    </Badge>

                                );

                            })

                        ) : (

                            <span className="text-muted-foreground italic text-[10px]">None</span>

                        )}

                    </div>

                </td>

                <td className="py-3 text-xs text-muted-foreground">{item.lastSentAt ? new Date(item.lastSentAt).toLocaleString() : 'Never'}</td>

                <td className="py-3">

                    {item.isActive ? (

                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-full text-[10px]" variant="outline">Active</Badge>

                    ) : (

                        <Badge variant="outline" className="rounded-full text-[10px]">Inactive</Badge>

                    )}

                </td>

                <td className="py-3">

                    <Button

                        variant="outline"

                        size="sm"

                        onClick={(e) => {

                            e.stopPropagation();

                            if (onTriggerReport) onTriggerReport(item.id);

                        }}

                        className="h-7 text-[10px] rounded-lg gap-1 border-violet-500/30 text-violet-600 hover:bg-violet-50"

                    >

                        <RefreshCw className="h-3 w-3 animate-none" /> Send Now

                    </Button>

                </td>

            </>);

}
