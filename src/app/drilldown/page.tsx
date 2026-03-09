'use client';

import { useAppSelector, useAppDispatch } from '@/redux/store';
import { goBack, resetDrilldown } from '@/redux/slices/drilldownSlice';
import { BreadcrumbNav } from '@/components/drilldown/breadcrumb-nav';
import { ProjectLevel } from '@/components/drilldown/project-level';
import { CTOLevel } from '@/components/drilldown/cto-level';
import { PMLevel } from '@/components/drilldown/pm-level';
import { TLLevel } from '@/components/drilldown/tl-level';
import { EmployeeLevel } from '@/components/drilldown/employee-level';
import { EmployeeProjectsLevel } from '@/components/drilldown/employee-projects-level';
import { TeamListLevel } from '@/components/drilldown/team-list-level';
import { MemberListLevel } from '@/components/drilldown/member-list-level';
import { ArrowLeft, RotateCcw } from 'lucide-react';

export default function DrilldownPage() {
    const dispatch = useAppDispatch();
    const { level } = useAppSelector((state) => state.drilldown);

    const renderLevel = () => {
        switch (level) {
            case 'project':
                return <ProjectLevel />;
            case 'cto':
                return <CTOLevel />;
            case 'pm':
                return <PMLevel />;
            case 'tl':
                return <TLLevel />;
            case 'employee':
                return <EmployeeLevel />;
            case 'employeeProjects':
                return <EmployeeProjectsLevel />;
            case 'team':
                return <TeamListLevel />;
            case 'member':
                return <MemberListLevel />;
            default:
                return <ProjectLevel />;
        }
    };

    return (
        <div className="space-y-2">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {level !== 'project' && (
                        <button
                            onClick={() => dispatch(goBack())}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>
                    )}
                </div>
                {level !== 'project' && (
                    <button
                        onClick={() => dispatch(resetDrilldown())}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </button>
                )}
            </div>

            {/* Breadcrumb */}
            <BreadcrumbNav />

            {/* Level Content */}
            {renderLevel()}
        </div>
    );
}
