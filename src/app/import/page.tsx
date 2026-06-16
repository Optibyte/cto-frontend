'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Upload, FileText, Database, ArrowRight, Download, 
    Users, BarChart3, CheckCircle2, AlertCircle, FileSpreadsheet,
    Shield, Briefcase, Globe, Info, Cpu, Recycle, Coins, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { adminEmployeesAPI, adminSprintMetricsAPI, adminManualMetricsAPI } from '@/lib/api/admin';
import * as XLSX from 'xlsx';
import { useTeams } from '@/hooks/use-teams';

type ImportType = 'employees' | 'metrics' | 'agent-performance' | 'assets-reuse' | 'token-cost' | 'adoption-fluency';


export default function ImportPage() {
    const { data: dbTeams = [] } = useTeams();
    const [selectedType, setSelectedType] = useState<ImportType>('metrics');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleDownloadTemplate = (type: ImportType) => {
        let headers: string[] = [];
        let sampleData: any[] = [];
        let fileName = '';
        let sheetName = '';

        if (type === 'employees') {
            headers = ['employee_id', 'employee_name', 'email', 'org', 'country', 'market', 'account', 'project', 'team', 'role', 'employment_type', 'experience_years', 'project_ai_enabled', 'project_ai_tools_used', 'primary_ai_skill', 'primary_ai_skill_proficiency'];
            sampleData = [
                {
                    employee_id: 'EMP-1001',
                    employee_name: 'John Doe',
                    email: 'john.doe@example.com',
                    org: 'Acme Corp',
                    country: 'USA',
                    market: 'US-Market',
                    account: 'Aetna',
                    project: 'Claims Mod',
                    team: 'Alpha Team',
                    role: 'Dev',
                    employment_type: 'Full-Time',
                    experience_years: 5,
                    project_ai_enabled: 'Yes',
                    project_ai_tools_used: 'Copilot, ChatGPT',
                    primary_ai_skill: 'Python',
                    primary_ai_skill_proficiency: 4
                },
                {
                    employee_id: 'EMP-1002',
                    employee_name: 'Alice Smith',
                    email: 'alice.smith@example.com',
                    org: 'Acme Corp',
                    country: 'USA',
                    market: 'US-Market',
                    account: 'Aetna',
                    project: 'Claims Mod',
                    team: 'Alpha Team',
                    role: 'Team Lead',
                    employment_type: 'Full-Time',
                    experience_years: 8,
                    project_ai_enabled: 'Yes',
                    project_ai_tools_used: 'Copilot',
                    primary_ai_skill: 'TypeScript',
                    primary_ai_skill_proficiency: 5
                }
            ];
            fileName = 'employee_bulk_import_template.xlsx';
            sheetName = 'EmployeeTemplate';
        } else if (type === 'metrics') {
            headers = ['org', 'country', 'market', 'account', 'project', 'team', 'team_size', 'project_ai_enabled', 'project_ai_tool_licenses', 'project_ai_tools_used', 'sprint_number', 'sprint_name', 'throughput_points', 'quality_score', 'velocity_points', 'done_to_said_ratio', 'technical_debt_index', 'user_stories_delivered'];
            sampleData = [{
                org: 'Acme Corp',
                country: 'USA',
                market: 'US-Market',
                account: 'Aetna',
                project: 'Claims Mod',
                team: 'Alpha Team',
                team_size: 10,
                project_ai_enabled: 'Yes',
                project_ai_tool_licenses: 12,
                project_ai_tools_used: 'Copilot',
                sprint_number: 1,
                sprint_name: 'Sprint-1',
                throughput_points: 45.5,
                quality_score: 92.0,
                velocity_points: 50.0,
                done_to_said_ratio: 0.95,
                technical_debt_index: 12.5,
                user_stories_delivered: 8
            }];
            fileName = 'sprint_metrics_bulk_import_template.xlsx';
            sheetName = 'SprintTemplate';
        } else if (type === 'agent-performance') {
            headers = ['org', 'country', 'market', 'account', 'project', 'team_name', 'team_id', 'sprint_number', 'agent_name', 'eval_pass_rate', 'hitl_acceptance_rate', 'success_rate', 'hallucination_rate', 'escaped_defects'];
            sampleData = [{
                org: 'Acme Corp',
                country: 'USA',
                market: 'US-Market',
                account: 'Aetna',
                project: 'Claims Mod',
                team_name: 'Alpha Team',
                team_id: 'team-101',
                sprint_number: 1,
                agent_name: 'CompassCoder',
                eval_pass_rate: 95.5,
                hitl_acceptance_rate: 88.0,
                success_rate: 94.0,
                hallucination_rate: 2.5,
                escaped_defects: 0
            }];
            fileName = 'agent_performance_bulk_import_template.xlsx';
            sheetName = 'AgentPerformanceTemplate';
        } else if (type === 'assets-reuse') {
            headers = ['org', 'country', 'market', 'account', 'project', 'team_name', 'team_id', 'sprint_number', 'name', 'type', 'description', 'reuse_rate', 'reuse_count', 'mcp_usage', 'template_usage', 'version_adoption_rate'];
            sampleData = [{
                org: 'Acme Corp',
                country: 'USA',
                market: 'US-Market',
                account: 'Aetna',
                project: 'Claims Mod',
                team_name: 'Alpha Team',
                team_id: 'team-101',
                sprint_number: 1,
                name: 'Claims Parser Template',
                type: 'TEMPLATE',
                description: 'Standard template for parsing claims data',
                reuse_rate: 82.4,
                reuse_count: 154,
                mcp_usage: 12,
                template_usage: 78.5,
                version_adoption_rate: 90.0
            }];
            fileName = 'assets_reuse_bulk_import_template.xlsx';
            sheetName = 'AssetsReuseTemplate';
        } else if (type === 'token-cost') {
            headers = ['org', 'country', 'market', 'account', 'project', 'team_name', 'team_id', 'sprint_number', 'provider', 'model', 'input_tokens', 'output_tokens', 'total_tokens', 'token_cost', 'cache_hit_ratio', 'cost_per_story_point', 'spend_by_client'];
            sampleData = [{
                org: 'Acme Corp',
                country: 'USA',
                market: 'US-Market',
                account: 'Aetna',
                project: 'Claims Mod',
                team_name: 'Alpha Team',
                team_id: 'team-101',
                sprint_number: 1,
                provider: 'OpenAI',
                model: 'gpt-4o',
                input_tokens: 1200000,
                output_tokens: 800000,
                total_tokens: 2000000,
                token_cost: 15.50,
                cache_hit_ratio: 34.2,
                cost_per_story_point: 0.31,
                spend_by_client: 15.50
            }];
            fileName = 'token_cost_bulk_import_template.xlsx';
            sheetName = 'TokenCostTemplate';
        } else if (type === 'adoption-fluency') {
            headers = ['org', 'country', 'market', 'account', 'project', 'team_name', 'team_id', 'sprint_number', 'total_users', 'active_users', 'daily_active_users', 'certification_percent', 'pod_coverage_percent', 'adoption_rate'];
            sampleData = [{
                org: 'Acme Corp',
                country: 'USA',
                market: 'US-Market',
                account: 'Aetna',
                project: 'Claims Mod',
                team_name: 'Alpha Team',
                team_id: 'team-101',
                sprint_number: 1,
                total_users: 12,
                active_users: 10,
                daily_active_users: 8,
                certification_percent: 75.0,
                pod_coverage_percent: 83.3,
                adoption_rate: 83.3
            }];
            fileName = 'adoption_fluency_bulk_import_template.xlsx';
            sheetName = 'AdoptionFluencyTemplate';
        }

        const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        
        // Add "Available Teams" tab
        const referenceData = dbTeams.map((t: any) => ({
            'Team ID': t.teamId || t.id,
            'Team Name': t.name,
            'Project Name': t.project?.name || 'Unassigned',
            'Account Name': t.project?.account?.name || 'Unassigned',
            'Market Name': t.project?.account?.market?.name || 'Unassigned',
            'Org Name': t.project?.account?.market?.org?.name || 'Unassigned',
        }));
        const referenceWorksheet = XLSX.utils.json_to_sheet(referenceData);
        XLSX.utils.book_append_sheet(workbook, referenceWorksheet, 'Available Teams');
        
        XLSX.writeFile(workbook, fileName);
        toast.success(`Template downloaded successfully`);
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
            let res;
            if (selectedType === 'employees') {
                res = await adminEmployeesAPI.bulkUpload(file);
            } else if (selectedType === 'metrics') {
                res = await adminSprintMetricsAPI.bulkUpload(file);
            } else {
                res = await adminManualMetricsAPI.bulkUpload(file, selectedType);
            }
            
            const successCount = selectedType === 'employees' ? (res.created + res.updated) : res.processed;
            if (successCount > 0) {
                toast.success(`✅ Successfully processed ${successCount} items`);
                setFile(null);
            } else {
                toast.success(`✅ File processed successfully`);
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
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <Shield className="h-3 w-3" />
                        Infrastructure & Intelligence
                    </p>
                    <h1 className="text-4xl font-black tracking-tighter">Data Import Center</h1>
                    <p className="text-muted-foreground font-medium">Bulk synchronize organizational assets and productivity telemetry</p>
                </div>
                <div className="flex flex-wrap gap-2 p-1.5 bg-muted/40 rounded-3xl border border-border/40 shadow-inner max-w-full">
                    {[
                        { type: 'metrics', label: 'Sprint Metrics', icon: BarChart3 },
                        { type: 'agent-performance', label: 'Agent Performance', icon: Cpu },
                        { type: 'assets-reuse', label: 'Assets & Reuse', icon: Recycle },
                        { type: 'token-cost', label: 'Tokens & Cost', icon: Coins },
                        { type: 'adoption-fluency', label: 'Adoption & Fluency', icon: Award },
                        { type: 'employees', label: 'Employee Data', icon: Users }
                    ].map(({ type, label, icon: Icon }) => (
                        <button 
                            key={type}
                            onClick={() => { setSelectedType(type as ImportType); setFile(null); }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all",
                                selectedType === type 
                                    ? "bg-background shadow-md text-primary scale-[1.02] border border-border/30" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-[1.5px] border-border/50 bg-background/50 backdrop-blur-2xl shadow-2xl overflow-hidden group">
                        <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <Upload className="h-6 w-6" />
                                    </div>
                                    Bulk {
                                        selectedType === 'employees' ? 'Employee' :
                                        selectedType === 'metrics' ? 'Sprint Metrics' :
                                        selectedType === 'agent-performance' ? 'Agent Performance' :
                                        selectedType === 'assets-reuse' ? 'Assets & Reuse' :
                                        selectedType === 'token-cost' ? 'Tokens & Cost' : 'Adoption & Fluency'
                                    } Upload
                                </CardTitle>
                                <CardDescription className="text-base font-medium">
                                    Seamlessly import your {selectedType === 'employees' ? 'workforce' : 'AI analytics'} telemetry data using our standardized template.
                                </CardDescription>
                            </div>
                            <Button 
                                variant="outline" 
                                onClick={() => handleDownloadTemplate(selectedType)}
                                className="rounded-2xl gap-2 h-12 px-6 font-black uppercase tracking-widest border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
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
                                        : selectedType === 'metrics'
                                        ? ['org', 'country', 'market', 'account', 'project', 'team', 'sprint_number']
                                        : selectedType === 'agent-performance'
                                        ? ['org', 'country', 'market', 'account', 'project', 'team_name', 'agent_name', 'sprint_number']
                                        : selectedType === 'assets-reuse'
                                        ? ['org', 'country', 'market', 'account', 'project', 'team_name', 'name', 'type']
                                        : selectedType === 'token-cost'
                                        ? ['org', 'country', 'market', 'account', 'project', 'team_name', 'provider', 'model']
                                        : ['org', 'country', 'market', 'account', 'project', 'team_name', 'total_users', 'active_users']
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
                                        : selectedType === 'metrics'
                                        ? ['quality_score', 'velocity_points', 'technical_debt']
                                        : selectedType === 'agent-performance'
                                        ? ['eval_pass_rate', 'hitl_acceptance_rate', 'success_rate', 'hallucination_rate']
                                        : selectedType === 'assets-reuse'
                                        ? ['description', 'reuse_rate', 'reuse_count', 'mcp_usage', 'template_usage']
                                        : selectedType === 'token-cost'
                                        ? ['input_tokens', 'output_tokens', 'token_cost', 'cache_hit_ratio']
                                        : ['daily_active_users', 'certification_percent', 'pod_coverage_percent', 'adoption_rate']
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
