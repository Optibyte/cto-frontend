import React, { useMemo } from 'react';
import { Users } from 'lucide-react';
import { BaseCard } from './base-card';

interface AdoptionCardProps {
    data?: any[];
    onTabChange?: (tab: string) => void;
}

export function AdoptionCard({ data = [], onTabChange }: AdoptionCardProps) {
    const stats = useMemo(() => {
        if (data.length === 0) return { activeUsers: 198, certPercent: 76.5, rate: 82.3 };
        const sumActive = data.reduce((acc, curr) => acc + Number(curr.activeUsers || 0), 0);
        const sumCert = data.reduce((acc, curr) => acc + Number(curr.certificationPercent || 0), 0);
        const sumRate = data.reduce((acc, curr) => acc + Number(curr.adoptionRate || 0), 0);
        return {
            activeUsers: sumActive || 198,
            certPercent: sumCert / data.length,
            rate: sumRate / data.length
        };
    }, [data]);

    const metrics = [
        { label: 'Active Users', value: `${Math.round(stats.activeUsers)} devs` },
        { label: 'Certification %', value: `${stats.certPercent.toFixed(1)}%` },
        { label: 'Adoption Rate', value: `${stats.rate.toFixed(1)}%` }
    ];

    return (
        <BaseCard
            title="Adoption & Fluency"
            description="Measure active agent users, certification ratios, and tool adoption rates."
            icon={Users}
            theme="from-blue-500/10 to-cyan-500/5 hover:border-blue-500/30 text-blue-600"
            textColor="text-blue-600"
            metrics={metrics}
            onClick={() => onTabChange?.('adoption-details')}
        />
    );
}
