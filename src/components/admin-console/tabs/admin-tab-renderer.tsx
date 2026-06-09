import { columns as OrganizationsRowColumns, OrganizationsRow } from './organizations-tab';
import { columns as MarketsRowColumns, MarketsRow } from './markets-tab';
import { columns as AccountsRowColumns, AccountsRow } from './accounts-tab';
import { columns as ProjectsRowColumns, ProjectsRow } from './projects-tab';
import { columns as AiProjectsRowColumns, AiProjectsRow } from './ai-projects-tab';
import { columns as TeamsRowColumns, TeamsRow } from './teams-tab';
import { columns as MembersRowColumns, MembersRow } from './members-tab';
import { columns as UsersRowColumns, UsersRow } from './users-tab';
import { columns as OnboardEmployeeRowColumns, OnboardEmployeeRow } from './onboard-employee-tab';
import { columns as ReportSchedulesRowColumns, ReportSchedulesRow } from './report-schedules-tab';

import type { TabKey } from '../types';
import type { AdminRowProps } from './types';

export function getColumns(tab: TabKey): string[] {
    switch (tab) {
        case 'organizations': return OrganizationsRowColumns;
        case 'markets': return MarketsRowColumns;
        case 'accounts': return AccountsRowColumns;
        case 'projects': return ProjectsRowColumns;
        case 'ai-projects': return AiProjectsRowColumns;
        case 'teams': return TeamsRowColumns;
        case 'members': return MembersRowColumns;
        case 'users': return UsersRowColumns;
        case 'onboard-employee': return OnboardEmployeeRowColumns;
        case 'report-schedules': return ReportSchedulesRowColumns;
    }
}

export function renderRow(tab: TabKey, props: AdminRowProps) {
    switch (tab) {
        case 'organizations':
            return <OrganizationsRow {...props} />;
        case 'markets':
            return <MarketsRow {...props} />;
        case 'accounts':
            return <AccountsRow {...props} />;
        case 'projects':
            return <ProjectsRow {...props} />;
        case 'ai-projects':
            return <AiProjectsRow {...props} />;
        case 'teams':
            return <TeamsRow {...props} />;
        case 'members':
            return <MembersRow {...props} />;
        case 'users':
            return <UsersRow {...props} />;
        case 'onboard-employee':
            return <OnboardEmployeeRow {...props} />;
        case 'report-schedules':
            return <ReportSchedulesRow {...props} />;
    }
}
