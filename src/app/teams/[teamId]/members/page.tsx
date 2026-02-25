'use client';

import { useParams } from 'next/navigation';
import { TeamMembersManager } from '@/components/teams/team-members-manager';

export default function TeamMembersPage() {
    const params = useParams();
    const teamId = params.teamId as string;

    // In a real app, fetch team name from the API using teamId
    const teamName = `Team ${teamId}`;

    return (
        <div className="space-y-6">
            <TeamMembersManager teamId={teamId} teamName={teamName} />
        </div>
    );
}
