import React, { useMemo } from 'react';
import { Database } from 'lucide-react';
import { BaseCard } from './base-card';

interface AssetsCardProps {
    data?: any[];
    onTabChange?: (tab: string) => void;
}

export function AssetsCard({ data = [], onTabChange }: AssetsCardProps) {
    const stats = useMemo(() => {
        if (data.length === 0) return { totalReuse: 8421, avgReuseRate: 46.2, templateUsage: 84.5 };

        const totalReuse = data.reduce((acc, curr) => acc + Number(curr.reuseCount || 0), 0);
        const avgReuseRate = data.reduce((acc, curr) => acc + Number(curr.reuseRate || 0), 0) / data.length;
        const avgTemplate = data.reduce((acc, curr) => acc + Number(curr.templateUsage || 0), 0) / data.length;

        return {
            totalReuse: totalReuse || 8421,
            avgReuseRate: avgReuseRate || 46.2,
            templateUsage: avgTemplate || 84.5
        };
    }, [data]);

    const metrics = [
        { label: 'Reuse Rate', value: `${stats.avgReuseRate.toFixed(1)}%` },
        { label: 'Prompt Reuse', value: `${stats.totalReuse.toLocaleString()} runs` },
        { label: 'Template Rate', value: `${stats.templateUsage.toFixed(1)}%` }
    ];

    return (
        <BaseCard
            title="Assets & Reuse"
            description="Monitor library component reuse, prompt sharing, and template usage rates."
            icon={Database}
            theme="from-emerald-500/10 to-teal-500/5 hover:border-emerald-500/30 text-emerald-600"
            textColor="text-emerald-600"
            metrics={metrics}
            onClick={() => onTabChange?.('assets-details')}
        />
    );
}
