'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { TransformationCard } from './ai-governance-cards/transformation-card';
import { ProductivityCard } from './ai-governance-cards/productivity-card';
import { AdoptionCard } from './ai-governance-cards/adoption-card';
import { AssetsCard } from './ai-governance-cards/assets-card';
import { TokensCard } from './ai-governance-cards/tokens-card';
import { AgentPerformanceCard } from './ai-governance-cards/agent-performance-card';

interface AiGovernanceCardsProps {
    data: {
        kpiFacts?: any[];
        transformationProgress?: any[];
        adoptionFluency?: any[];
        assetRegistry?: any[];
        tokenCostMetrics?: any[];
        agentPerformance?: any[];
        agentUsage?: any[];
        financeMetrics?: any[];
    } | null;
    isLoading?: boolean;
    rawMetricsData?: any[];
    onTabChange?: (tab: string) => void;
}

export function AiGovernanceCards({ data, isLoading, rawMetricsData = [], onTabChange }: AiGovernanceCardsProps) {
    if (isLoading || !data) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="rounded-[2rem] h-[220px] border border-border/40 bg-background/30" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            <TransformationCard data={data.transformationProgress} onTabChange={onTabChange} />
            <ProductivityCard rawMetricsData={rawMetricsData} onTabChange={onTabChange} />
            <AdoptionCard data={data.adoptionFluency} onTabChange={onTabChange} />
            <AssetsCard data={data.assetRegistry} onTabChange={onTabChange} />
            <TokensCard data={data.tokenCostMetrics} onTabChange={onTabChange} />
            <AgentPerformanceCard data={data.agentPerformance} onTabChange={onTabChange} />
        </div>
    );
}
