'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, FlaskConical } from 'lucide-react';

const CATEGORY_COLORS: Record<string, { bg: string; border: string; badge: string; icon: string }> = {
    'Productivity':       { bg: 'from-violet-500/10 to-violet-500/5',   border: 'border-violet-500/20', badge: 'bg-violet-500/15 text-violet-500',  icon: 'text-violet-500' },
    'Project Management': { bg: 'from-sky-500/10 to-sky-500/5',         border: 'border-sky-500/20',    badge: 'bg-sky-500/15 text-sky-500',        icon: 'text-sky-500' },
    'Quality & Defects':  { bg: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-500/20',badge: 'bg-emerald-500/15 text-emerald-500', icon: 'text-emerald-500' },
    'CI / CD':            { bg: 'from-amber-500/10 to-amber-500/5',     border: 'border-amber-500/20',  badge: 'bg-amber-500/15 text-amber-500',    icon: 'text-amber-500' },
};

const RAG: Record<string, { bar: string; text: string; bg: string; label: string }> = {
    green: { bar: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'On Target' },
    amber: { bar: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/30',     label: 'At Risk'   },
    red:   { bar: 'bg-red-500',     text: 'text-red-500',     bg: 'bg-red-500/10 border-red-500/30',         label: 'Off Target'},
};

function progressPercent(numericValue: number, direction: string, target: string): number {
    // Parse first number from target string like "> 30" or "< 5%" or "80–90%"
    const nums = target.match(/[\d.]+/g)?.map(Number) ?? [100];
    if (direction === 'up')    return Math.min(100, (numericValue / nums[0]) * 100);
    if (direction === 'down')  return Math.min(100, nums[0] > 0 ? (1 - numericValue / (nums[0] * 2)) * 100 : 100);
    if (direction === 'range') return Math.min(100, (numericValue / (nums[1] ?? nums[0])) * 100);
    return 50;
}

function KpiCard({ item }: { item: any }) {
    const rag  = RAG[item.status] ?? RAG.red;
    const cat  = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS['Productivity'];
    const pct  = Math.max(0, progressPercent(item.numericValue, item.direction, item.target));
    const Dir  = item.direction === 'up' ? TrendingUp : item.direction === 'down' ? TrendingDown : Minus;

    return (
        <div className={cn(
            'relative rounded-3xl border bg-gradient-to-br p-6 flex flex-col gap-4',
            'hover:-translate-y-1 hover:shadow-xl transition-all duration-300',
            cat.bg, cat.border
        )}>
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{item.category}</p>
                    <h4 className="text-sm font-black leading-snug truncate">{item.name}</h4>
                </div>
                <span className={cn('text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0', rag.bg)}>
                    {rag.label}
                </span>
            </div>

            {/* Value */}
            <div className="flex items-end justify-between">
                <div>
                    <span className={cn('text-4xl font-black tracking-tighter', rag.text)}>{item.value}</span>
                    <span className="text-xs text-muted-foreground/50 font-bold ml-1.5">{item.uom}</span>
                </div>
                <div className={cn('p-2.5 rounded-2xl', cat.badge, 'bg-opacity-20')}>
                    <Dir className={cn('h-5 w-5', cat.icon)} />
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
                <div
                    className={cn('h-full rounded-full transition-all duration-700', rag.bar)}
                    style={{ width: `${pct}%` }}
                />
            </div>

            {/* Formula + target */}
            <div className="border-t border-border/20 pt-3 space-y-1">
                <p className="text-[10px] italic text-muted-foreground/50 leading-relaxed line-clamp-2">
                    <FlaskConical className="inline h-3 w-3 mr-1 opacity-60" />{item.formula}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                    Target: <span className="text-muted-foreground/70">{item.target}</span>
                </p>
            </div>
        </div>
    );
}

const CATEGORIES = ['Productivity', 'Project Management', 'Quality & Defects', 'CI / CD'];

export function SprintKPIPanel({ metrics }: { metrics: any[] }) {
    const kpis = useMemo(() => {
        if (!metrics || metrics.length === 0) return [];

        const n = metrics.length;
        const avg = (getter: (r: any) => number) =>
            metrics.reduce((s, r) => s + (Number(getter(r)) || 0), 0) / n;

        const throughput    = avg(r => r.throughputPoints);
        const velocityPP    = avg(r => r.velocityPoints);
        const doneToSaid    = avg(r => r.doneToSaidRatio);
        const quality       = avg(r => r.qualityScore);
        const techDebt      = avg(r => r.technicalDebtIndex);
        const capUtil       = avg(r => r.capacityUtilization || 0); // If capacity utilization doesn't exist, we fallback
        const defectDensity = avg(r => r.defectDensity || 0);
        const defectLeakage = avg(r => r.defectLeakage || 0);
        const buildSuccess  = avg(r => r.buildSuccessRate || 0);
        const deployFail    = avg(r => r.deployFailureRate || 0);
        const stories       = avg(r => r.userStoriesDelivered);
        const productivity  = capUtil > 0 ? capUtil / 100 : Math.min(1, throughput / 100);

        const rag = (v: number, t: number, dir: 'up' | 'down' | 'range', t2?: number) => {
            if (dir === 'up')    return v >= t ? 'green' : v >= t * 0.85 ? 'amber' : 'red';
            if (dir === 'down')  return v <= t ? 'green' : v <= t * 1.15 ? 'amber' : 'red';
            return (v >= t && v <= (t2 ?? t * 1.125)) ? 'green' : v >= t * 0.9 ? 'amber' : 'red';
        };

        return [
            { category: 'Productivity',       name: 'Productivity',               formula: 'Story points delivered / Available Capacity',             uom: 'Ratio',        value: productivity.toFixed(2),          numericValue: productivity,  target: '> 0.8',   status: rag(productivity, 0.8, 'up'),          direction: 'up'   },
            { category: 'Productivity',       name: 'Sprint Velocity',            formula: 'Total story points delivered',                            uom: 'Story Points', value: throughput.toFixed(1),            numericValue: throughput,    target: '> 30',    status: rag(throughput, 30, 'up'),             direction: 'up'   },
            { category: 'Productivity',       name: 'Sprint Velocity per Person', formula: 'Story points delivered / Number of contributors',         uom: 'SP / Person',  value: velocityPP.toFixed(1),            numericValue: velocityPP,    target: '> 5',     status: rag(velocityPP, 5, 'up'),              direction: 'up'   },
            { category: 'Project Management', name: 'Done to Said Ratio',         formula: 'Story points delivered / Story points planned',           uom: '%',            value: `${doneToSaid.toFixed(1)}%`,      numericValue: doneToSaid,    target: '> 90%',   status: rag(doneToSaid, 90, 'up'),             direction: 'up'   },
            { category: 'Project Management', name: 'Delivery Commitment',        formula: 'Delivered user stories / Planned user stories × 100',    uom: 'Stories',      value: `${stories.toFixed(0)} stories`,  numericValue: quality,       target: '> 85%',   status: rag(quality, 85, 'up'),                direction: 'up'   },
            { category: 'Project Management', name: 'Resource Utilization',       formula: '(Actual effort hours / Capacity hours) × 100',           uom: '%',            value: `${capUtil.toFixed(1)}%`,         numericValue: capUtil,       target: '80–90%',  status: rag(capUtil, 80, 'range', 90),         direction: 'range'},
            { category: 'Quality & Defects',  name: 'Quality Score',              formula: '(Passed test cases / Total test cases) × 100',           uom: '%',            value: `${quality.toFixed(1)}%`,         numericValue: quality,       target: '> 85%',   status: rag(quality, 85, 'up'),                direction: 'up'   },
            { category: 'Quality & Defects',  name: 'Defect Density (SP)',        formula: '(QA Defects + Review Comments) / Total Story Points',    uom: 'Defects/SP',   value: defectDensity.toFixed(2),         numericValue: defectDensity, target: '< 0.5',   status: rag(defectDensity, 0.5, 'down'),       direction: 'down' },
            { category: 'Quality & Defects',  name: 'Defect Leakage to Client',   formula: '(Client defects / Total defects) × 100',                uom: '%',            value: `${defectLeakage.toFixed(1)}%`,   numericValue: defectLeakage, target: '< 5%',    status: rag(defectLeakage, 5, 'down'),         direction: 'down' },
            { category: 'Quality & Defects',  name: 'Technical Debt Index',       formula: '(Debt hours added − resolved) / Capacity hours',        uom: 'Index',        value: techDebt.toFixed(1),              numericValue: techDebt,      target: '< 20',    status: rag(techDebt, 20, 'down'),             direction: 'down' },
            { category: 'CI / CD',            name: 'Build Success Rate',         formula: '(Successful builds / Total builds) × 100',              uom: '%',            value: `${buildSuccess.toFixed(1)}%`,    numericValue: buildSuccess,  target: '> 90%',   status: rag(buildSuccess, 90, 'up'),           direction: 'up'   },
            { category: 'CI / CD',            name: 'Deployment Failure Rate',    formula: '(Failed deployments / Total deployments) × 100',        uom: '%',            value: `${deployFail.toFixed(1)}%`,      numericValue: deployFail,    target: '< 10%',   status: rag(deployFail, 10, 'down'),           direction: 'down' },
        ];
    }, [metrics]);

    if (!metrics || metrics.length === 0 || kpis.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 opacity-40 gap-3">
                <FlaskConical className="h-12 w-12" />
                <p className="font-black text-sm uppercase tracking-widest">No sprint data available</p>
                <p className="text-xs text-muted-foreground">Upload sprint metrics CSV or adjust filters to see calculated KPIs</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {CATEGORIES.map(cat => {
                const items = kpis.filter(k => k.category === cat);
                if (items.length === 0) return null;
                const color = CATEGORY_COLORS[cat];

                return (
                    <div key={cat}>
                        <div className="flex items-center gap-3 mb-4">
                            <span className={cn('text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border', color.badge, color.border)}>
                                {cat}
                            </span>
                            <div className="flex-1 h-px bg-border/20" />
                            <span className="text-[10px] font-bold text-muted-foreground/40">{items.length} metrics</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {items.map(item => <KpiCard key={item.name} item={item} />)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
