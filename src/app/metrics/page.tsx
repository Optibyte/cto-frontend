'use client';

import { Activity, Github, Layout, Pencil, Settings2, Calculator, Link2, ScrollText, PlusCircle, Edit3 } from 'lucide-react';
import { MetricTypeCard } from '@/components/metrics/metric-type-card';
import { ManualMetricsTab } from '@/components/metrics/manual-metrics-tab';
import { DynamicMetricCreation } from '@/components/metrics/dynamic-metric-creation';
import { CalculatedMetricsTab } from '@/components/metrics/calculated-metrics-tab';
import { IntegratedMetricsTab } from '@/components/metrics/integrated-metrics-tab';
import { AuditLogTab } from '@/components/metrics/audit-log-tab';
import { AddMetricForm } from '@/components/metrics/add-metric-form';
import { UpdateMetricsTab } from '@/components/metrics/update-metrics-tab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MetricsPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1 pb-4 border-b border-border/10">
                <h1 className="text-4xl font-extrabold tracking-tight text-gradient">
                    Metrics Explorer
                </h1>
                <p className="text-muted-foreground text-lg">
                    View, manage, and analyze team performance metrics across all sources
                </p>
            </div>

            {/* Overview Cards (kept commented as in original) */}
            {/* ... */}

            {/* Tabbed Interface */}
            <Tabs defaultValue="manual" className="space-y-8">
                <div className="sticky top-0 z-10 py-4 bg-background/80 backdrop-blur-md -mx-4 px-4 overflow-x-auto no-scrollbar">
                    <TabsList className="inline-flex h-12 items-center justify-start rounded-2xl bg-muted/30 p-1.5 gap-2 border border-border/50 shadow-inner w-max min-w-full">
                        <TabsTrigger
                            value="manual"
                            className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 
                                     data-[state=active]:bg-primary data-[state=active]:text-white 
                                     data-[state=active]:shadow-[0_0_20px_rgba(139,92,246,0.3)]
                                     hover:bg-muted/50 gap-2.5"
                        >
                            <Pencil className="h-4 w-4" />
                            Manual Metrics
                        </TabsTrigger>
                        <TabsTrigger
                            value="definitions"
                            className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 
                                     data-[state=active]:bg-primary data-[state=active]:text-white 
                                     data-[state=active]:shadow-[0_0_20px_rgba(139,92,246,0.3)]
                                     hover:bg-muted/50 gap-2.5"
                        >
                            <Settings2 className="h-4 w-4" />
                            Metric Definitions
                        </TabsTrigger>
                        <TabsTrigger
                            value="calculated"
                            className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 
                                     data-[state=active]:bg-primary data-[state=active]:text-white 
                                     data-[state=active]:shadow-[0_0_20px_rgba(139,92,246,0.3)]
                                     hover:bg-muted/50 gap-2.5"
                        >
                            <Calculator className="h-4 w-4" />
                            Calculated
                        </TabsTrigger>

                        <TabsTrigger
                            value="add-metric"
                            className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 
                                     data-[state=active]:bg-primary data-[state=active]:text-white 
                                     data-[state=active]:shadow-[0_0_20px_rgba(139,92,246,0.3)]
                                     hover:bg-muted/50 gap-2.5"
                        >
                            <PlusCircle className="h-4 w-4" />
                            Add Metric
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="manual" className="mt-0">
                    <ManualMetricsTab />
                </TabsContent>

                <TabsContent value="definitions" className="mt-0">
                    <DynamicMetricCreation />
                </TabsContent>

                <TabsContent value="calculated" className="mt-0">
                    <CalculatedMetricsTab />
                </TabsContent>



                <TabsContent value="add-metric" className="mt-0">
                    <AddMetricForm />
                </TabsContent>

                <TabsContent value="update-metrics" className="mt-0">
                    <UpdateMetricsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
