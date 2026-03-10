'use client';

import { Pencil, Calculator, PlusCircle, Database } from 'lucide-react';
import { ManualMetricsTab } from '@/components/metrics/manual-metrics-tab';
import { CalculatedMetricsTab } from '@/components/metrics/calculated-metrics-tab';
import { AddMetricForm } from '@/components/metrics/add-metric-form';
import { GlobalFilter } from '@/components/filters/global-filter';
// import { JiraAnalyticsTab } from '@/components/metrics/jira-analytics-tab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TAB_TRIGGER_CLS = `
    rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200
    data-[state=active]:bg-primary data-[state=active]:text-white
    data-[state=active]:shadow-[0_0_20px_rgba(139,92,246,0.3)]
    hover:bg-muted/50 gap-2.5
`;

export default function MetricsPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1 pb-4 border-b border-border/10">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gradient">
                        Metrics Explorer
                    </h1>

                </div>
                <p className="text-muted-foreground text-lg">
                    View, manage, and analyze team performance metrics across all sources
                </p>
            </div>

            {/* Tabbed Interface */}
            <Tabs defaultValue="jira" className="space-y-8">
                <div className="sticky top-0 z-10 py-4 bg-background/80 backdrop-blur-md -mx-4 px-4 overflow-x-auto no-scrollbar">
                    <TabsList className="inline-flex h-12 items-center justify-start rounded-2xl bg-muted/30 p-1.5 gap-2 border border-border/50 shadow-inner w-max min-w-full">

                        {/* <TabsTrigger value="jira" className={TAB_TRIGGER_CLS}>
                            <Database className="h-4 w-4" />
                            Jira Analytics
                        </TabsTrigger> */}

                        <TabsTrigger value="manual" className={TAB_TRIGGER_CLS}>
                            <Pencil className="h-4 w-4" />
                            Manual Metrics
                        </TabsTrigger>

                        {/* <TabsTrigger value="calculated" className={TAB_TRIGGER_CLS}>
                            <Calculator className="h-4 w-4" />
                            Calculated
                        </TabsTrigger> */}

                        <TabsTrigger value="add-metric" className={TAB_TRIGGER_CLS}>
                            <PlusCircle className="h-4 w-4" />
                            Add Metrics
                        </TabsTrigger>

                    </TabsList>
                </div>
{/* 
                <TabsContent value="jira" className="mt-0">
                    <JiraAnalyticsTab />
                </TabsContent> */}

                <TabsContent value="manual" className="mt-0">
                    <ManualMetricsTab />
                </TabsContent>

                <TabsContent value="calculated" className="mt-0">
                    <CalculatedMetricsTab />
                </TabsContent>

                <TabsContent value="add-metric" className="mt-0">
                    <AddMetricForm />
                </TabsContent>
            </Tabs>
        </div>
    );
}
