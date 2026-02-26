'use client';

import { ProjectManagement } from '@/components/projects/project-management';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OnboardProjectPage() {
    return (
        <div className="space-y-6 fade-in p-6">
            <div className="flex items-center gap-4 max-w-6xl mx-auto">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent/50">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
            </div>

            <ProjectManagement />
        </div>
    );
}
