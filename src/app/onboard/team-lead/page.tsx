'use client';

import { TeamLeadManagement } from '@/components/teams/team-lead-management';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OnboardTeamLeadPage() {
    return (
        <div className="space-y-6 fade-in p-6">
            <div className="flex items-center gap-4 max-w-6xl mx-auto">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent/50">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Team Lead Management</h1>
            </div>

            <TeamLeadManagement />
        </div>
    );
}

