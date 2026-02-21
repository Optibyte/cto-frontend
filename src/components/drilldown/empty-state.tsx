'use client';

import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
    title?: string;
    description?: string;
}

export function EmptyState({
    title = 'No data found',
    description = 'There are no records to display at this level.',
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mb-6">
                <PackageOpen className="h-10 w-10 text-primary/60" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        </div>
    );
}
