import React, { useMemo } from 'react';
import { Coins } from 'lucide-react';
import { BaseCard } from './base-card';

interface TokensCardProps {
    data?: any[];
    onTabChange?: (tab: string) => void;
}

export function TokensCard({ data = [], onTabChange }: TokensCardProps) {
    const stats = useMemo(() => {
        if (data.length === 0) return { totalSpend: 4820, totalTokens: 204.1, cacheHitRatio: 42.6 };
        const totalSpend = data.reduce((acc, curr) => acc + Number(curr.tokenCost || 0), 0);
        const totalTokens = data.reduce((acc, curr) => acc + Number(curr.totalTokens || 0), 0);
        const cacheHitRatio = data.reduce((acc, curr) => acc + Number(curr.cacheHitRatio || 0), 0) / data.length;
        return {
            totalSpend: totalSpend || 4820,
            totalTokens: totalTokens ? (totalTokens / 1_000_000) : 204.1, // in Millions
            cacheHitRatio: cacheHitRatio || 42.6
        };
    }, [data]);

    const metrics = [
        { label: 'Total Spend', value: `$${Math.round(stats.totalSpend).toLocaleString()}` },
        { label: 'Total Tokens', value: `${stats.totalTokens.toFixed(1)}M` },
        { label: 'Cache Hit Ratio', value: `${stats.cacheHitRatio.toFixed(1)}%` }
    ];

    return (
        <BaseCard
            title="Tokens & Cost"
            description="Track token volumes, API costs, cache hits, and budget details."
            icon={Coins}
            theme="from-amber-500/10 to-orange-500/5 hover:border-amber-500/30 text-amber-600"
            textColor="text-amber-600"
            metrics={metrics}
            onClick={() => onTabChange?.('tokens-details')}
        />
    );
}
