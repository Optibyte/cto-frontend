'use client';

import { useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AnalyticsDashboard } from '@/components/metrics/analytics-dashboard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Lock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMetricsDashboard } from './layout';

export function MetricsDashboardView() {
    const router = useRouter();
    const pathname = usePathname();

    const {
        filters,
        updateFilter,
        clearFilters,
        apiFilters,
        scopeLabel,
        visibleFilters
    } = useMetricsDashboard();

    const activeTab = useMemo(() => {
        if (pathname.endsWith('/executive-view')) return 'executive-view';
        if (pathname.endsWith('/delivery-view')) return 'delivery-view';
        if (pathname.endsWith('/transformation-progress')) return 'ai-monitor';
        if (pathname.endsWith('/productivity-flow')) return 'consolidated';
        if (pathname.endsWith('/adoption-fluency')) return 'adoption-details';
        if (pathname.endsWith('/assets-reuse')) return 'assets-details';
        if (pathname.endsWith('/tokens-cost')) return 'tokens-details';
        if (pathname.endsWith('/agent-performance')) return 'agent-details';
        return 'ai-governance'; // Default /metrics-dashboard
    }, [pathname]);

    const setActiveTab = (tab: string) => {
        switch (tab) {
            case 'executive-view':
                router.push('/metrics-dashboard/executive-view');
                break;
            case 'delivery-view':
                router.push('/metrics-dashboard/delivery-view');
                break;
            case 'ai-monitor':
                router.push('/metrics-dashboard/transformation-progress');
                break;
            case 'consolidated':
                router.push('/metrics-dashboard/productivity-flow');
                break;
            case 'adoption-details':
                router.push('/metrics-dashboard/adoption-fluency');
                break;
            case 'assets-details':
                router.push('/metrics-dashboard/assets-reuse');
                break;
            case 'tokens-details':
                router.push('/metrics-dashboard/tokens-cost');
                break;
            case 'agent-details':
                router.push('/metrics-dashboard/agent-performance');
                break;
            case 'ai-governance':
            default:
                router.push('/metrics-dashboard');
                break;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-6 pb-6 border-b border-border/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gradient">
                            Dashboard
                        </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {/* Executive View */}
                        <button
                            onClick={() => setActiveTab('executive-view')}
                            className={cn(
                                "flex items-center justify-center text-center px-4 py-2.5 rounded-2xl transition-all duration-300 w-full sm:w-[180px] h-12 cursor-pointer shadow-md select-none border-2",
                                activeTab === 'executive-view'
                                    ? "bg-blue-600 border-white text-white shadow-blue-500/25 scale-[1.03]"
                                    : "bg-blue-700/95 border-transparent text-blue-100 hover:bg-blue-600 hover:text-white"
                            )}
                        >
                            <span className="text-xs font-black tracking-tight uppercase">
                                Executive View
                            </span>
                        </button>

                        {/* Delivery View */}
                        <button
                            onClick={() => setActiveTab('delivery-view')}
                            className={cn(
                                "flex items-center justify-center text-center px-4 py-2.5 rounded-2xl transition-all duration-300 w-full sm:w-[180px] h-12 cursor-pointer shadow-md select-none border-2",
                                activeTab === 'delivery-view'
                                    ? "bg-blue-600 border-white text-white shadow-blue-500/25 scale-[1.03]"
                                    : "bg-blue-700/95 border-transparent text-blue-100 hover:bg-blue-600 hover:text-white"
                            )}
                        >
                            <span className="text-xs font-black tracking-tight uppercase">
                                Delivery View
                            </span>
                        </button>

                        {/* Engineering View */}
                        <button
                            onClick={() => setActiveTab('ai-governance')}
                            className={cn(
                                "flex items-center justify-center text-center px-4 py-2.5 rounded-2xl transition-all duration-300 w-full sm:w-[180px] h-12 cursor-pointer shadow-md select-none border-2",
                                ['ai-governance', 'adoption-details', 'assets-details', 'tokens-details', 'agent-details', 'consolidated', 'ai-monitor'].includes(activeTab)
                                    ? "bg-blue-600 border-white text-white shadow-blue-500/25 scale-[1.03]"
                                    : "bg-blue-700/95 border-transparent text-blue-100 hover:bg-blue-600 hover:text-white"
                            )}
                        >
                            <span className="text-xs font-black tracking-tight uppercase">
                                Engineering View
                            </span>
                        </button>
                    </div>
                </div>

                {/* Scope badge for restricted users */}
                {scopeLabel && (
                    <div className="flex items-center gap-2">
                        <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20 gap-1.5 px-3 py-1 text-sm font-semibold">
                            <Lock className="h-3.5 w-3.5" />
                            {scopeLabel}
                        </Badge>
                    </div>
                )}

                {/* Filters Region */}
                {activeTab !== 'ai-governance' && (
                    <div className="flex flex-wrap items-center gap-4 p-3 rounded-2xl border border-border/10 shadow-sm filters-card">
                        <div className="flex items-center gap-2 mr-2 opacity-50">
                            <Filter className="w-5 h-5" />
                        </div>

                        {visibleFilters.map(({ key, label, options, locked, lockedValue }) => (
                            <div key={key} className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70 ml-1 flex items-center gap-1">
                                    {label}
                                    {locked && <Lock className="h-2.5 w-2.5 text-violet-400" />}
                                </span>
                                {locked ? (
                                    <div className="w-full rounded-xl bg-background/50 border border-border/50 h-10 px-3 flex items-center justify-between text-xs font-bold text-foreground opacity-75 cursor-not-allowed select-none">
                                        <span className="truncate">{lockedValue || 'Locked'}</span>
                                        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                    </div>
                                ) : (
                                    <Select value={filters[key as keyof typeof filters]} onValueChange={(val) => updateFilter(key, val)}>
                                        <SelectTrigger className="w-full rounded-xl bg-background/50 border-border/50 h-10 font-bold shadow-sm text-xs">
                                            <SelectValue placeholder={`All ${label}s`} />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-border/50 shadow-2xl max-h-[300px]">
                                            <SelectItem value="all" className="font-bold text-xs">All {label}s</SelectItem>
                                            {(options as string[]).map((opt: string) => (
                                                <SelectItem key={opt} value={opt} className="font-bold text-xs">{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        ))}

                        {/* Date Range Selector */}
                        <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70 ml-1">
                                Date Range
                            </span>
                            <Select value={filters.dateRange} onValueChange={(val) => updateFilter('dateRange', val)}>
                                <SelectTrigger className="w-full rounded-xl bg-background/50 border-border/50 h-10 font-bold shadow-sm text-xs">
                                    <SelectValue placeholder="All Dates" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
                                    <SelectItem value="all" className="font-bold text-xs">All Dates</SelectItem>
                                    <SelectItem value="30d" className="font-bold text-xs">Last 30 Days</SelectItem>
                                    <SelectItem value="90d" className="font-bold text-xs">Last 90 Days</SelectItem>
                                    <SelectItem value="custom" className="font-bold text-xs">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Custom Date Picker Inputs */}
                        {filters.dateRange === 'custom' && (
                            <>
                                <div className="flex flex-col gap-1.5 flex-1 min-w-[130px] animate-in fade-in slide-in-from-top-1 duration-200">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70 ml-1">
                                        Start Date
                                    </span>
                                    <input
                                        type="date"
                                        className="w-full rounded-xl bg-background border border-border/50 h-10 px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                        value={filters.startDate}
                                        onChange={(e) => updateFilter('startDate', e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 flex-1 min-w-[130px] animate-in fade-in slide-in-from-top-1 duration-200">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70 ml-1">
                                        End Date
                                    </span>
                                    <input
                                        type="date"
                                        className="w-full rounded-xl bg-background border border-border/50 h-10 px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                        value={filters.endDate}
                                        onChange={(e) => updateFilter('endDate', e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        <Button variant="ghost" onClick={clearFilters} className="mt-5 h-10 rounded-xl text-xs font-bold hover:bg-red-500/10 hover:text-red-500 transition-colors">
                            Clear
                        </Button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                <AnalyticsDashboard
                    filters={apiFilters}
                    activeTab={activeTab}
                    onActiveTabChange={setActiveTab}
                />
            </div>
        </div>
    );
}
export default MetricsDashboardView;
