import type { LucideIcon } from 'lucide-react';

export type TabKey = 'organizations' | 'markets' | 'accounts' | 'projects' | 'ai-projects' | 'teams' | 'members' | 'users' | 'onboard-employee' | 'report-schedules';

export interface TabConfig {
    key: TabKey;
    label: string;
    icon: LucideIcon;
    color: string;
    gradient: string;
}
