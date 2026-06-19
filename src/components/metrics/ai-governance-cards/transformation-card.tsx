import React, { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { BaseCard } from './base-card';

interface TransformationCardProps {
    data?: any[];
    onTabChange?: (tab: string) => void;
}

export function TransformationCard({ data = [], onTabChange }: TransformationCardProps) {
    const stats = useMemo(() => {
        if (data.length === 0) return { maturity: 3.8, completion: 78.0, readiness: 91.0 };
        const sumMaturity = data.reduce((acc, curr) => acc + Number(curr.maturityScore || 0), 0);
        const sumCompletion = data.reduce((acc, curr) => acc + Number(curr.transformationCompletionPercent || 0), 0);
        const sumReadiness = data.reduce((acc, curr) => acc + Number(curr.readinessGateScore || 0), 0);
        return {
            maturity: sumMaturity / data.length,
            completion: sumCompletion / data.length,
            readiness: sumReadiness / data.length
        };
    }, [data]);

    const metrics = [
        { label: 'Wave Rollout', value: `${stats.completion.toFixed(1)}%` },
        { label: 'Readiness Gate', value: `${Math.round(stats.readiness)}/100` },
        { label: 'Maturity Score', value: `${stats.maturity.toFixed(1)}/5.0` }
    ];

    return (
        <BaseCard
            title="Transformation Progress"
            description="Track digital transformation rollouts, readiness gates, and organizational maturity."
            icon={Sparkles}
            theme="from-purple-500/10 to-indigo-500/5 hover:border-purple-500/30 text-purple-600"
            textColor="text-purple-600"
            metrics={metrics}
            onClick={() => onTabChange?.('ai-monitor')}
        />
    );
}
