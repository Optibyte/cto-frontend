'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, TrendingUp, Calendar, ArrowRight, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRole } from '@/contexts/role-context';
import { marketsAPI, adminAccountsAPI, adminProjectsAPI, adminTeamsAPI } from '@/lib/api/admin';
import { DateRangeFilter } from '@/components/filters/date-range-filter';
import { toast } from 'sonner';
import { jiraMetricsAPI } from '@/lib/api/jira-metrics';
import { useAppSelector } from '@/redux/store';

export default function ReportsPage() {
    const { role } = useRole();

    // Dynamic Filter states
    const [marketId, setMarketId] = useState('all');
    const [accountId, setAccountId] = useState('all');
    const [projectId, setProjectId] = useState('all');
    const [teamId, setTeamId] = useState('all');
    const [isDownloading, setIsDownloading] = useState(false);
    
    // Date Range state from redux
    const { dateRange } = useAppSelector((s) => s.dashboard);

    const [dynamicMarkets, setDynamicMarkets] = useState<any[]>([]);
    const [dynamicAccounts, setDynamicAccounts] = useState<any[]>([]);
    const [dynamicProjects, setDynamicProjects] = useState<any[]>([]);
    const [dynamicTeams, setDynamicTeams] = useState<any[]>([]);

    useEffect(() => {
        async function fetchDropdowns() {
            try {
                const [m, a, p, t] = await Promise.all([
                    marketsAPI.getAll().catch(() => []),
                    adminAccountsAPI.getAll().catch(() => []),
                    adminProjectsAPI.getAll().catch(() => []),
                    adminTeamsAPI.getAll().catch(() => [])
                ]);
                setDynamicMarkets(m || []);
                setDynamicAccounts(a || []);
                setDynamicProjects(p || []);
                setDynamicTeams(t || []);
            } catch (e) {
                console.error("Failed to fetch dropdowns:", e);
            }
        }
        fetchDropdowns();
    }, []);

    const accounts = dynamicAccounts.filter(a => marketId === 'all' || a.marketId === marketId);
    const projects = accountId === 'all' ? dynamicProjects : dynamicProjects.filter(p => !p.accountId || p.accountId === accountId);
    const teams = projectId === 'all' ? dynamicTeams : dynamicTeams.filter(t => !t.projectId || t.projectId === projectId);

    const handleDownloadExcel = async () => {
        setIsDownloading(true);
        toast.info("Generating Excel document...", { id: "excel-download" });
        try {
            const data = await jiraMetricsAPI.getMetrics({
                days: 30, // generic fallback if range missing
                marketId,
                accountId,
                projectId,
                teamId,
                start: dateRange?.from,
                end: dateRange?.to
            });

            if (!data || !data.detailedMetrics) {
                toast.error("No metrics returned from server", { id: "excel-download" });
                setIsDownloading(false);
                return;
            }

            // Create CSV Content
            const headers = ["Metric Name", "Type", "Value", "UoM", "Target", "Trend"];
            const rows = data.detailedMetrics.map((m: any) => [
                `"${m.name.replace(/"/g, '""')}"`,
                `"${m.type}"`,
                `"${m.value}"`,
                `"${m.uom}"`,
                `"${m.target}"`,
                `"${m.trend}"`
            ]);
            
            const csvContent = [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join("\n");
            
            // Trigger Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `CTO_Report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Excel generation complete! Starting download.", { id: "excel-download" });
        } catch (error) {
            console.error("Failed to generate excel report", error);
            toast.error("Error generating report", { id: "excel-download" });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between mt-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports Center</h1>
                    <p className="text-muted-foreground mt-1">
                        Select scope below and extract Excel reports.
                    </p>
                </div>
            </div>

            {/* ── Filters & Download Bar ──────────────────────────────────── */}
            <Card className="border-border/40 shadow-sm bg-muted/10">
                <CardContent className="p-4 flex flex-wrap items-center gap-3">
                    {(role === 'ORG') && (
                        <div className="space-y-1.5 flex-1 min-w-[150px]">
                            <label className="text-xs font-semibold text-muted-foreground">Market</label>
                            <Select value={marketId} onValueChange={(v) => { setMarketId(v); setAccountId('all'); setProjectId('all'); setTeamId('all'); }}>
                                <SelectTrigger className="w-full h-10 rounded-xl bg-background">
                                    <SelectValue placeholder="All Markets" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Markets</SelectItem>
                                    {dynamicMarkets.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {(role === 'ORG' || role === 'MARKET') && (
                        <div className="space-y-1.5 flex-1 min-w-[150px]">
                            <label className="text-xs font-semibold text-muted-foreground">Account</label>
                            <Select value={accountId} onValueChange={(v) => { setAccountId(v); setProjectId('all'); setTeamId('all'); }}>
                                <SelectTrigger className="w-full h-10 rounded-xl bg-background">
                                    <SelectValue placeholder="All Accounts" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Accounts</SelectItem>
                                    {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {(role === 'ORG' || role === 'MARKET' || role === 'ACCOUNT') && (
                        <div className="space-y-1.5 flex-1 min-w-[150px]">
                            <label className="text-xs font-semibold text-muted-foreground">Project</label>
                            <Select value={projectId} onValueChange={(v) => { setProjectId(v); setTeamId('all'); }}>
                                <SelectTrigger className="w-full h-10 rounded-xl bg-background">
                                    <SelectValue placeholder="All Projects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {role !== 'TEAM' && (
                        <div className="space-y-1.5 flex-1 min-w-[150px]">
                            <label className="text-xs font-semibold text-muted-foreground">Team</label>
                            <Select value={teamId} onValueChange={setTeamId}>
                                <SelectTrigger className="w-full h-10 rounded-xl bg-background">
                                    <SelectValue placeholder="All Teams" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Teams</SelectItem>
                                    {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-1.5 flex-1 min-w-[200px]">
                        <label className="text-xs font-semibold text-muted-foreground mr-2">Date Range</label>
                        <div className="w-full">
                            <DateRangeFilter />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="relative flex flex-col items-center justify-center p-16 text-center border overflow-hidden border-border/40 rounded-3xl bg-black/40 backdrop-blur-3xl shadow-2xl mt-8">
                {/* Decorative glowing blobs */}
                <div className="absolute top-0 -left-10 w-48 h-48 bg-green-500/20 rounded-full mix-blend-screen filter blur-[80px] opacity-60 animate-blob" />
                <div className="absolute top-0 -right-10 w-48 h-48 bg-emerald-500/20 rounded-full mix-blend-screen filter blur-[80px] opacity-60 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-10 left-20 w-48 h-48 bg-teal-500/20 rounded-full mix-blend-screen filter blur-[80px] opacity-60 animate-blob animation-delay-4000" />
                
                <div className="z-10 flex flex-col items-center">
                    <div className="p-5 rounded-2xl bg-green-500/10 mb-6 ring-1 ring-green-500/30">
                        <Table className="h-10 w-10 text-green-400" />
                    </div>
                    
                    <h3 className="text-3xl font-black mb-3 tracking-tight text-white drop-shadow-md">Ready to Export</h3>
                    
                    <p className="text-slate-300 max-w-lg text-lg mb-8 drop-shadow-sm font-medium">
                        Select your desired Market, Account, Project, and Team context above. Click the button below to generate a consolidated Excel report of all key performance metrics.
                    </p>

                    <Button 
                        onClick={handleDownloadExcel}
                        disabled={isDownloading}
                        className="group h-14 px-8 rounded-2xl shadow-[0_0_30px_rgba(22,163,74,0.4)] hover:shadow-[0_0_40px_rgba(22,163,74,0.6)] bg-green-600 hover:bg-green-500 gap-3 transition-all duration-300 text-white font-bold text-lg whitespace-nowrap"
                    >
                        {isDownloading ? (
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            <Download className="h-6 w-6 group-hover:-translate-y-1 transition-transform" />
                        )}
                        {isDownloading ? "Generating..." : "Download Excel Report"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
