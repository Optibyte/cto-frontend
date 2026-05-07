'use client';

import * as XLSX from 'xlsx';
import { useRef, useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Download, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { sprintMetricsAPI } from '@/lib/api/client';

interface UploadResult {
    total: number;
    processed: number;
    errors: { row: number; team: string; error: string }[];
    provisioned?: {
        orgs: number;
        markets: number;
        accounts: number;
        projects: number;
        teams: number;
    };
}

const TEMPLATE_HEADERS = [
    'org', 'country', 'market', 'account', 'project', 'team', 'team_size',
    'project_ai_enabled', 'project_ai_tool_licenses', 'project_ai_tools_used',
    'sprint_number', 'sprint_name', 'throughput_points', 'quality_score',
    'velocity_points', 'done_to_said_ratio', 'technical_debt_index', 'user_stories_delivered'
];

const SAMPLE_DATA = [
    {
        org: 'Acme Digital Engineering',
        country: 'US',
        market: 'US-Payer',
        account: 'Aetna Health',
        project: 'Claims Mod',
        team: 'Claims Mod Team',
        team_size: 11,
        project_ai_enabled: 'YES',
        project_ai_tool_licenses: 12,
        project_ai_tools_used: 'Codex',
        sprint_number: 1,
        sprint_name: 'Sprint-1',
        throughput_points: 32.2,
        quality_score: 92.8,
        velocity_points: 55.2,
        done_to_said_ratio: 1.02,
        technical_debt_index: 14.6,
        user_stories_delivered: 10
    }
];

export function SprintBulkUploadPanel() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<UploadResult | null>(null);
    const [showErrors, setShowErrors] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => setIsDragging(false), []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) validateAndSet(file);
    }, []);

    const validateAndSet = (file: File) => {
        const valid = file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
        if (!valid) {
            toast.error('Please upload a .csv or .xlsx file');
            return;
        }
        setSelectedFile(file);
        setResult(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) validateAndSet(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        setResult(null);
        try {
            const res = await sprintMetricsAPI.bulkUpload(selectedFile);
            setResult(res);
            if (res.errors?.length === 0) {
                toast.success(`✅ ${res.processed} sprint records uploaded successfully!`);
            } else {
                toast.warning(`Uploaded ${res.processed}/${res.total} rows. ${res.errors?.length} errors found.`);
            }
        } catch (err: any) {
            toast.error(err.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClear = () => {
        setSelectedFile(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const downloadTemplate = () => {
        const worksheet = XLSX.utils.json_to_sheet(SAMPLE_DATA, { header: TEMPLATE_HEADERS });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'SprintTemplate');
        
        // Generate buffer and trigger download
        XLSX.writeFile(workbook, 'sprint_metrics_template.xlsx');
    };

    const successCount = result?.processed ?? 0;
    const errorCount = result?.errors?.length ?? 0;

    return (
        <div className="space-y-5">
            {/* Header Row */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-foreground">Bulk Sprint Data Upload</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Upload CSV / Excel — <span className="font-semibold text-primary">Teams and Projects</span> will be auto-provisioned
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                    className="rounded-xl gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary text-xs h-8"
                >
                    <Download className="h-3.5 w-3.5" />
                    Template
                </Button>
            </div>

            {/* Required Columns Hint */}
            <div className="rounded-xl bg-muted/30 border border-border/40 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Required CSV Columns</p>
                <div className="flex flex-wrap gap-1.5">
                    {[
                        'org', 'project', 'team', 'sprint_number', 'throughput_points', 
                        'quality_score', 'velocity_points', 'done_to_said_ratio', 'technical_debt_index'
                    ].map(col => (
                        <Badge
                            key={col}
                            variant="outline"
                            className="font-mono text-[10px] rounded-md px-1.5 py-0 border-border/60 bg-background"
                        >
                            {col}
                        </Badge>
                    ))}
                    <span className="text-[10px] text-muted-foreground italic px-1">+ all hierarchy fields</span>
                </div>
            </div>

            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
                className={cn(
                    'relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer',
                    isDragging
                        ? 'border-primary bg-primary/5 scale-[1.01]'
                        : selectedFile
                            ? 'border-emerald-500/40 bg-emerald-500/5 cursor-default'
                            : 'border-border/50 hover:border-primary/40 hover:bg-muted/20'
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileChange}
                />

                <div className="flex flex-col items-center justify-center py-10 px-6 text-center gap-3">
                    {selectedFile ? (
                        <>
                            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                <FileSpreadsheet className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-foreground">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                                className="absolute top-3 right-3 h-7 w-7 rounded-full bg-muted/60 hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm text-foreground">Drop your file here</p>
                                <p className="text-xs text-muted-foreground">or click to browse — .csv, .xlsx, .xls supported</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Upload Button */}
            {selectedFile && !result && (
                <Button
                    className="w-full rounded-xl h-11 gap-2 text-sm font-semibold"
                    onClick={handleUpload}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading & Processing…
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4" />
                            Upload & Store Sprint Data
                        </>
                    )}
                </Button>
            )}

            {/* Result Summary */}
            {result && (
                <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-muted/30 border border-border/40 p-3 text-center">
                            <p className="text-2xl font-black text-foreground">{result.total}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Rows</p>
                        </div>
                        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                            <p className="text-2xl font-black text-emerald-500">{successCount}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Stored</p>
                        </div>
                        <div className={cn(
                            'rounded-xl p-3 text-center border',
                            errorCount > 0
                                ? 'bg-red-500/10 border-red-500/20'
                                : 'bg-muted/30 border-border/40'
                        )}>
                            <p className={cn('text-2xl font-black', errorCount > 0 ? 'text-red-500' : 'text-muted-foreground')}>
                                {errorCount}
                            </p>
                            <p className={cn('text-[10px] font-bold uppercase tracking-wider', errorCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground')}>
                                Errors
                            </p>
                        </div>
                    </div>

                    {/* Success Banner */}
                    {errorCount === 0 && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                All {successCount} sprint records stored in the database successfully!
                            </p>
                        </div>
                    )}

                    {/* Error Details */}
                    {errorCount > 0 && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden">
                            <button
                                onClick={() => setShowErrors(v => !v)}
                                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/5 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {errorCount} row{errorCount > 1 ? 's' : ''} failed — click to review
                                </span>
                                {showErrors ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            {showErrors && (
                                <div className="border-t border-red-500/10 divide-y divide-red-500/10 max-h-48 overflow-y-auto">
                                    {result.errors.map((e, i) => (
                                        <div key={i} className="flex items-start gap-3 px-4 py-2.5">
                                            <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                                            <div className="text-xs">
                                                <span className="font-semibold text-foreground">Row {e.row}</span>
                                                {e.team && <span className="text-muted-foreground"> · {e.team}</span>}
                                                <span className="text-red-500 ml-1">— {e.error}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl h-9 text-xs"
                        onClick={handleClear}
                    >
                        Upload Another File
                    </Button>
                </div>
            )}
        </div>
    );
}
