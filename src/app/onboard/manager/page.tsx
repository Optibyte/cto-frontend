'use client';

import { ManagerManagement } from '@/components/managers/manager-management';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OnboardManagerPage() {
    return (
        <div className="space-y-6 fade-in p-6">
            <div className="flex items-center gap-4 max-w-6xl mx-auto">
                <Link href="/">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent/50">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Manager Management</h1>
            </div>

            <ManagerManagement />
        </div>
    );
}
