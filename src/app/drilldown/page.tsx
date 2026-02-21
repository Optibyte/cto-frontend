'use client';

import { useAppSelector, useAppDispatch } from '@/redux/store';
import { goBack, resetDrilldown } from '@/redux/slices/drilldownSlice';
import { BreadcrumbNav } from '@/components/drilldown/breadcrumb-nav';
import { TeamLevel } from '@/components/drilldown/team-level';
import { ManagerLevel } from '@/components/drilldown/manager-level';
import { TLLevel } from '@/components/drilldown/tl-level';
import { EmployeeLevel } from '@/components/drilldown/employee-level';
import { ProjectDetail } from '@/components/drilldown/project-detail';
import { ArrowLeft, RotateCcw } from 'lucide-react';

export default function DrilldownPage() {
    const dispatch = useAppDispatch();
    const { level } = useAppSelector((state) => state.drilldown);

    const renderLevel = () => {
        switch (level) {
            case 'team':
                return <TeamLevel />;
            case 'manager':
                return <ManagerLevel />;
            case 'tl':
                return <TLLevel />;
            case 'employee':
                return <EmployeeLevel />;
            case 'project':
                return <ProjectDetail />;
            default:
                return <TeamLevel />;
        }
    };

    return (
        <div className="space-y-2">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {level !== 'team' && (
                        <button
                            onClick={() => dispatch(goBack())}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </button>
                    )}
                </div>
                {level !== 'team' && (
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
