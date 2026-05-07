'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Upload, FileText, Database, ArrowRight, Download, 
    Users, BarChart3, CheckCircle2, AlertCircle, FileSpreadsheet,
    Shield, Briefcase, Globe, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { adminEmployeesAPI, adminSprintMetricsAPI } from '@/lib/api/admin';

type ImportType = 'employees' | 'metrics';

export default function ImportPage() {
    const [selectedType, setSelectedType] = useState<ImportType>('metrics');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleDownloadTemplate = (type: ImportType) => {
        let headers: string[] = [];
        let sampleRow: string[] = [];
        let fileName = '';

        if (type === 'employees') {
            headers = ['employee_id', 'employee_name', 'email', 'org', 'country', 'market', 'account', 'project', 'team', 'role', 'employment_type', 'experience_years', 'project_ai_enabled', 'project_ai_tools_used', 'primary_ai_skill', 'primary_ai_skill_proficiency'];
            sampleRow = ['EMP-1001', 'John Doe', 'john.doe@example.com', 'Acme Corp', 'USA', 'US-Market', 'Aetna', 'Claims Mod', 'Alpha Team', 'Dev', 'Full-Time', '5', 'Yes', 'Copilot, ChatGPT', 'Python', '4'];
            fileName = 'employee_bulk_import_template.csv';
        } else {
            headers = ['org', 'country', 'market', 'account', 'project', 'team', 'team_size', 'project_ai_enabled', 'project_ai_tool_licenses', 'project_ai_tools_used', 'sprint_number', 'sprint_name', 'throughput_points', 'quality_score', 'velocity_points', 'done_to_said_ratio', 'technical_debt_index', 'user_stories_delivered'];
            sampleRow = ['Acme Corp', 'USA', 'US-Market', 'Aetna', 'Claims Mod', 'Alpha Team', '10', 'Yes', '12', 'Copilot', '1', 'Sprint-1', '45.5', '92.0', '50.0', '0.95', '12.5', '8'];
            fileName = 'sprint_metrics_bulk_import_template.csv';
        }

        const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${type === 'employees' ? 'Employee' : 'Metrics'} template downloaded`);
    };

    const handleFile = (f: File) => {
        if (!f.name.match(/\.(xlsx|xls|csv)$/i)) {
            toast.error('Only .xlsx, .xls or .csv files are supported');
            return;
        }
        setFile(f);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const api = selectedType === 'employees' ? adminEmployeesAPI : adminSprintMetricsAPI;
            const res = await api.bulkUpload(file);
            
            const successCount = selectedType === 'employees' ? (res.created + res.updated) : res.processed;
            if (successCount > 0) {
                toast.success(`✅ Successfully processed ${successCount} items`);
                setFile(null);
            }
            if (res.errors?.length) {
                toast.warning(`⚠️ ${res.errors.length} rows had errors. Check console for details.`);
                console.error('Import Errors:', res.errors);
            }
        } catch (err: any) {
            toast.error(`Upload failed: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <Shield className="h-3 w-3" />
                        Infrastructure & Intelligence
                    </p>
                    <h1 className="text-4xl font-black tracking-tighter">Data Import Center</h1>
                    <p className="text-muted-foreground font-medium">Bulk synchronize organizational assets and productivity telemetry</p>
                </div>
                <div className="flex p-1 bg-muted/50 rounded-2xl border border-border/50 shadow-inner">
                    <button 
                        onClick={() => { setSelectedType('metrics'); setFile(null); }}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            selectedType === 'metrics' ? "bg-background shadow-lg text-primary scale-[1.02]" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <BarChart3 className="h-4 w-4" />
                        Sprint Metrics
                    </button>
                    <button 
                        onClick={() => { setSelectedType('employees'); setFile(null); }}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            selectedType === 'employees' ? "bg-background shadow-lg text-primary scale-[1.02]" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Users className="h-4 w-4" />
                        Employee Data
                    </button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-[1.5px] border-border/50 bg-background/50 backdrop-blur-2xl shadow-2xl overflow-hidden group">
                        <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-xl bg-primary/10 text-primary",
                                        selectedType === 'employees' && "bg-violet-500/10 text-violet-500"
                                    )}>
                                        <Upload className="h-6 w-6" />
                                    </div>
                                    Bulk {selectedType === 'employees' ? 'Employee' : 'Metrics'} Upload
                                </CardTitle>
                                <CardDescription className="text-base font-medium">
                                    Seamlessly import your {selectedType === 'employees' ? 'workforce' : 'telemetry'} data using our standardized template.
                                </CardDescription>
                            </div>
                            <Button 
                                variant="outline" 
                                onClick={() => handleDownloadTemplate(selectedType)}
                                className={cn(
                                    "rounded-2xl gap-2 h-12 px-6 font-black uppercase tracking-widest border-primary/20 hover:bg-primary/5 hover:text-primary transition-all",
                                    selectedType === 'employees' && "border-violet-500/20 hover:bg-violet-500/5 hover:text-violet-500"
                                )}
                            >
                                <Download className="h-4 w-4" /> Template
                            </Button>
                        </CardHeader>
                        <CardContent className="p-10 pt-6 space-y-6">
                            <div 
                                className={cn(
                                    "relative rounded-[2rem] border-[3px] border-dashed transition-all duration-500 flex flex-col items-center justify-center p-12 text-center",
                                    dragOver ? "border-primary bg-primary/5 scale-[0.99]" : "border-border/50 hover:border-primary/30 hover:bg-muted/30",
                                    file ? "border-emerald-500/50 bg-emerald-500/5" : ""
                                )}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
                                onClick={() => document.getElementById('file-upload')?.click()}
                            >
                                <input 
                                    id="file-upload" 
                                    type="file" 
                                    className="hidden" 
                                    accept=".csv,.xlsx,.xls"
                                    onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                                />
                                
                                {file ? (
                                    <div className="space-y-4 animate-in zoom-in duration-300">
                                        <div className="h-20 w-20 rounded-3xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                                            <FileSpreadsheet className="h-10 w-10" />
                                        </div>
                                        <div>
                                            <p className="text-xl font-black text-foreground">{file.name}</p>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB · Ready for Synchronization</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                            Change File
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500 border border-border/50">
                                            <FileText className="h-10 w-10 text-muted-foreground/40" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xl font-black">Drop CSV or Excel file here</p>
                                            <p className="text-sm font-medium text-muted-foreground">Maximum file size: 10MB · Recommended format: CSV</p>
                                        </div>
                                        <Button size="lg" className="rounded-2xl px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                                            Select File
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-4 pt-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Format Check</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Schema Valid</span>
                                    </div>
                                </div>
                                <Button 
                                    size="lg" 
                                    disabled={!file || uploading}
                                    onClick={handleUpload}
                                    className="rounded-2xl px-12 font-black uppercase tracking-widest min-w-[200px]"
                                >
                                    {uploading ? "Processing..." : "Start Import"}
                                    {!uploading && <ArrowRight className="ml-2 h-4 w-4" />}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="rounded-[2rem] border-border/50 bg-background/50 backdrop-blur-xl p-8 space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <Info className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">System Integrity</h3>
                            <p className="text-sm text-muted-foreground font-medium">
                                Data is validated against organizational hierarchy. Missing teams or projects will be auto-provisioned to ensure continuity.
                            </p>
                        </Card>
                        <Card className="rounded-[2rem] border-border/50 bg-background/50 backdrop-blur-xl p-8 space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                <Database className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Data Sovereignty</h3>
                            <p className="text-sm text-muted-foreground font-medium">
                                All imports are audited and versioned. You can roll back or adjust specific telemetry points through the audit logs.
                            </p>
                        </Card>
                    </div>
                </div>

                <div className="space-y-8">
                    <Card className="rounded-[2.5rem] border-border/50 bg-background/50 backdrop-blur-2xl shadow-xl overflow-hidden h-full">
                        <CardHeader className="p-8">
                            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                                <Info className="h-5 w-5 text-primary" />
                                Field Specifications
                            </CardTitle>
                            <CardDescription className="font-medium">Mandatory and optional headers</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Required Columns</p>
                                <div className="flex flex-wrap gap-2">
                                    {(selectedType === 'employees' 
                                        ? ['employee_id', 'employee_name', 'email', 'org', 'country', 'role']
                                        : ['org', 'country', 'market', 'account', 'project', 'team', 'sprint_number']
                                    ).map((col) => (
                                        <Badge key={col} variant="secondary" className="rounded-full px-3 py-1 bg-primary/10 text-primary border-primary/20 font-bold font-mono text-[10px]">
                                            {col}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Optional Intelligence</p>
                                <div className="flex flex-wrap gap-2">
                                    {(selectedType === 'employees'
                                        ? ['project_ai_enabled', 'primary_ai_skill', 'proficiency']
                                        : ['quality_score', 'velocity_points', 'technical_debt']
                                    ).map((col) => (
                                        <Badge key={col} variant="outline" className="rounded-full px-3 py-1 font-bold font-mono text-[10px] opacity-70">
                                            {col}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl bg-muted/50 border border-border/50 space-y-3">
                                <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                    <Globe className="h-3 w-3" />
                                    Import Logic
                                </p>
                                <ul className="space-y-2">
                                    {[
                                        'Incremental sync (updates existing)',
                                        'Automatic role normalization',
                                        'Hierarchy-aware data binding',
                                        'Real-time analytics recalculation'
                                    ].map((item, i) => (
                                        <li key={i} className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                            <div className="h-1 w-1 rounded-full bg-primary" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
