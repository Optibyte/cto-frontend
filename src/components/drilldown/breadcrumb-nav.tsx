'use client';

import { useAppSelector, useAppDispatch } from '@/redux/store';
import { goToLevel } from '@/redux/slices/drilldownSlice';
import { ChevronRight, Home } from 'lucide-react';
import { DrilldownLevel } from '@/lib/mock-data/drilldown';

interface BreadcrumbItem {
    label: string;
    level: DrilldownLevel;
}

export function BreadcrumbNav() {
    const dispatch = useAppDispatch();
    const {
        level,
        selectedTeamName,
        selectedManagerName,
        selectedTLName,
        selectedEmployeeName,
    } = useAppSelector((state) => state.drilldown);

    const items: BreadcrumbItem[] = [];

    if (selectedTeamName) {
        items.push({ label: selectedTeamName, level: 'team' });
    }
    if (selectedManagerName) {
        items.push({ label: selectedManagerName, level: 'manager' });
    }
    if (selectedTLName) {
        items.push({ label: selectedTLName, level: 'tl' });
    }
    if (selectedEmployeeName) {
        items.push({ label: selectedEmployeeName, level: 'employee' });
    }

    return (
        <nav className="flex items-center gap-1 text-sm mb-6">
            <button
                onClick={() => dispatch(goToLevel('team'))}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200"
            >
                <Home className="h-4 w-4" />
            </button>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const isCurrent = item.level === level;

                return (
                    <div key={index} className="flex items-center gap-1">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                        <button
                            onClick={() => !isLast && dispatch(goToLevel(item.level))}
                            disabled={isLast}
                            className={`px-2 py-1.5 rounded-lg transition-all duration-200 ${isLast
                                ? 'text-foreground font-semibold cursor-default'
                                : 'text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer'
                                }`}
                        >
                            {item.label}
                        </button>
                    </div>
                );
            })}
        </nav>
    );
}
