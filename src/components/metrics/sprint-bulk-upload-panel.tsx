'use client';

import * as XLSX from 'xlsx';
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRole, useDataFence } from '@/contexts/role-context';
import { useTeams } from '@/hooks/use-teams';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Download, X, Loader2, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { sprintMetricsAPI } from '@/lib/api/client';
import { useSprintMetrics } from '@/hooks/use-metrics';

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
    'team_id', 'team_name', 'sprint_number', 'sprint_name', 'sprint_date', 'throughput_points', 'quality_score',
    'velocity_points', 'done_to_said_ratio', 'technical_debt_index', 'user_stories_delivered'
];

const SAMPLE_DATA = [
    {
        team_id: 'TEAM-001',
        team_name: 'Alpha Team',
        sprint_number: 'S-01',
        sprint_date: '2024-01-15',
        sprint_name: 'Sprint-1',
        throughput_points: 32.2,
        quality_score: 92.8,
        velocity_points: 55.2,
        done_to_said_ratio: 1.02,
        technical_debt_index: 14.6,
        user_stories_delivered: 10
    }
];

interface SprintBulkUploadPanelProps {
    availableTeams?: { id: string; name: string }[];
}

interface GridRow {
    id: string;
    team_id: string;
    team_name: string;
    sprint_number: string;
    sprint_date: string;
    sprint_name: string;
    throughput_points: string;
    quality_score: string;
    velocity_points: string;
    done_to_said_ratio: string;
    technical_debt_index: string;
    user_stories_delivered: string;
}

export function SprintBulkUploadPanel({ availableTeams = [] }: SprintBulkUploadPanelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const [uploadMode, setUploadMode] = useState<'grid' | 'file'>('grid');
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<UploadResult | null>(null);
    const [showErrors, setShowErrors] = useState(false);

    const { role, user } = useRole();
    const fence = useDataFence();
    const { data: dbTeams = [] } = useTeams();

    const filteredTeams = useMemo(() => {
        const teams = dbTeams as any[];
        
        // 1. Super admin / Org / Market / Account: see all teams
        const isAdmin = ['CTO', 'SUPERADMIN', 'ORG', 'MARKET', 'ACCOUNT'].includes(role);
        if (isAdmin) {
            return teams;
        }

        // 2. Project Manager: see all teams under projects they manage
        if (role === 'PROJECT_MANAGER') {
            if (!fence.allowedProjectIds) return teams;
            return teams.filter(t => fence.allowedProjectIds?.includes(t.projectId));
        }

        // 3. Team Lead / Team Manager: see only their assigned teams
        if (['TEAM_LEAD', 'TEAM', 'MEMBER'].includes(role)) {
            if (!fence.allowedTeamIds) return teams;
            return teams.filter(t => fence.allowedTeamIds?.includes(t.id));
        }

        return teams;
    }, [dbTeams, role, fence]);

    // Pre-select if there is exactly 1 team available, or pre-select Team Lead's team by default
    useEffect(() => {
        if (filteredTeams.length === 1 && !selectedTeamId) {
            setSelectedTeamId(filteredTeams[0].id);
        } else if (filteredTeams.length > 1 && ['TEAM_LEAD', 'TEAM', 'MEMBER'].includes(role) && !selectedTeamId) {
            const currentUserId = user?.id || user?.user?.id;
            const myTeam = filteredTeams.find(t => t.teamLeadId === currentUserId || t.managerId === currentUserId);
            if (myTeam) {
                setSelectedTeamId(myTeam.id);
            } else {
                setSelectedTeamId(filteredTeams[0].id);
            }
        }
    }, [filteredTeams, selectedTeamId, role, user]);

    const { data: allSprintMetrics = [] } = useSprintMetrics();

    const getNextSprintDetails = useCallback((teamId: string, sprintDateStr: string) => {
        if (!teamId) return { sprint_number: 'S-01', sprint_name: 'Sprint - 1' };
        const targetDate = sprintDateStr ? new Date(sprintDateStr).getTime() : Date.now();

        // Filter sprints for this team
        const teamSprints = (allSprintMetrics as any[])
            .filter((sm: any) => sm.teamId === teamId && sm.sprintDate)
            // Filter sprints that occurred on or before the selected date
            .filter((sm: any) => new Date(sm.sprintDate).getTime() < targetDate)
            // Sort by date descending to find the closest previous sprint
            .sort((a: any, b: any) => new Date(b.sprintDate).getTime() - new Date(a.sprintDate).getTime());

        const lastSprintNumber = teamSprints[0]?.sprintNumber || 0;
        const nextSprintNumber = lastSprintNumber + 1;

        return {
            sprint_number: `S-${nextSprintNumber < 10 ? '0' + nextSprintNumber : nextSprintNumber}`,
            sprint_name: `Sprint - ${nextSprintNumber}`
        };
    }, [allSprintMetrics]);

    // Interactive Grid row states
    const createEmptyRow = useCallback((): GridRow => {
        const targetTeamId = selectedTeamId || (filteredTeams[0]?.id ?? '');
        const targetDate = new Date().toISOString().split('T')[0];
        const sprintInfo = getNextSprintDetails(targetTeamId, targetDate);
        const match = sprintInfo.sprint_number ? sprintInfo.sprint_number.match(/\d+/) : null;
        const sprintNum = match ? parseInt(match[0], 10) : null;

        let throughput_points = '';
        let quality_score = '';
        let velocity_points = '';
        let done_to_said_ratio = '';
        let technical_debt_index = '';
        let user_stories_delivered = '';
        let sprint_date = targetDate;

        if (targetTeamId && sprintNum !== null) {
            const existingMetric = (allSprintMetrics as any[]).find(
                (sm: any) => sm.teamId === targetTeamId && sm.sprintNumber === sprintNum
            );
            if (existingMetric) {
                throughput_points = existingMetric.throughputPoints !== undefined && existingMetric.throughputPoints !== null ? String(existingMetric.throughputPoints) : '';
                quality_score = existingMetric.qualityScore !== undefined && existingMetric.qualityScore !== null ? String(existingMetric.qualityScore) : '';
                velocity_points = existingMetric.velocityPoints !== undefined && existingMetric.velocityPoints !== null ? String(existingMetric.velocityPoints) : '';
                done_to_said_ratio = existingMetric.doneToSaidRatio !== undefined && existingMetric.doneToSaidRatio !== null ? String(existingMetric.doneToSaidRatio) : '';
                technical_debt_index = existingMetric.technicalDebtIndex !== undefined && existingMetric.technicalDebtIndex !== null ? String(existingMetric.technicalDebtIndex) : '';
                user_stories_delivered = existingMetric.userStoriesDelivered !== undefined && existingMetric.userStoriesDelivered !== null ? String(existingMetric.userStoriesDelivered) : '';
                if (existingMetric.sprintDate) {
                    sprint_date = new Date(existingMetric.sprintDate).toISOString().split('T')[0];
                }
            }
        }

        return {
            id: Math.random().toString(36).substring(2, 11),
            team_id: targetTeamId,
            team_name: filteredTeams.find(t => t.id === targetTeamId)?.name ?? '',
            sprint_number: sprintInfo.sprint_number,
            sprint_date: sprint_date,
            sprint_name: sprintInfo.sprint_name,
            throughput_points,
            quality_score,
            velocity_points,
            done_to_said_ratio,
            technical_debt_index,
            user_stories_delivered
        };
    }, [filteredTeams, selectedTeamId, getNextSprintDetails, allSprintMetrics]);

    const [gridRows, setGridRows] = useState<GridRow[]>([]);

    // Sync initial grid row when teams are loaded
    useEffect(() => {
        if (filteredTeams.length > 0 && gridRows.length === 0) {
            setGridRows([createEmptyRow()]);
        }
    }, [filteredTeams, gridRows.length, createEmptyRow]);

    const addGridRow = () => {
        const lastRow = gridRows[gridRows.length - 1];
        const targetTeamId = lastRow?.team_id || (filteredTeams[0]?.id ?? '');
        const targetDate = lastRow?.sprint_date || new Date().toISOString().split('T')[0];

        const sprintInfo = getNextSprintDetails(targetTeamId, targetDate);
        let nextSprintNumber = parseInt(sprintInfo.sprint_number.match(/\d+/)?.[0] || '1', 10);

        // Find if there is already a row for the same team in our grid list, and if so, increment from the highest sprint number we have in the grid
        const sameTeamRows = gridRows.filter(r => r.team_id === targetTeamId);
        if (sameTeamRows.length > 0) {
            const maxGridSprintNum = Math.max(...sameTeamRows.map(r => parseInt(r.sprint_number.match(/\d+/)?.[0] || '0', 10)));
            nextSprintNumber = Math.max(nextSprintNumber, maxGridSprintNum + 1);
        }

        const sprintNumberStr = `S-${nextSprintNumber < 10 ? '0' + nextSprintNumber : nextSprintNumber}`;
        const sprintNameStr = `Sprint - ${nextSprintNumber}`;

        let throughput_points = '';
        let quality_score = '';
        let velocity_points = '';
        let done_to_said_ratio = '';
        let technical_debt_index = '';
        let user_stories_delivered = '';
        let sprint_date = targetDate;

        if (targetTeamId && nextSprintNumber !== null) {
            const existingMetric = (allSprintMetrics as any[]).find(
                (sm: any) => sm.teamId === targetTeamId && sm.sprintNumber === nextSprintNumber
            );
            if (existingMetric) {
                throughput_points = existingMetric.throughputPoints !== undefined && existingMetric.throughputPoints !== null ? String(existingMetric.throughputPoints) : '';
                quality_score = existingMetric.qualityScore !== undefined && existingMetric.qualityScore !== null ? String(existingMetric.qualityScore) : '';
                velocity_points = existingMetric.velocityPoints !== undefined && existingMetric.velocityPoints !== null ? String(existingMetric.velocityPoints) : '';
                done_to_said_ratio = existingMetric.doneToSaidRatio !== undefined && existingMetric.doneToSaidRatio !== null ? String(existingMetric.doneToSaidRatio) : '';
                technical_debt_index = existingMetric.technicalDebtIndex !== undefined && existingMetric.technicalDebtIndex !== null ? String(existingMetric.technicalDebtIndex) : '';
                user_stories_delivered = existingMetric.userStoriesDelivered !== undefined && existingMetric.userStoriesDelivered !== null ? String(existingMetric.userStoriesDelivered) : '';
                if (existingMetric.sprintDate) {
                    sprint_date = new Date(existingMetric.sprintDate).toISOString().split('T')[0];
                }
            }
        }

        const newRow: GridRow = {
            id: Math.random().toString(36).substring(2, 11),
            team_id: targetTeamId,
            team_name: lastRow?.team_name || (filteredTeams[0]?.name ?? ''),
            sprint_number: sprintNumberStr,
            sprint_date: sprint_date,
            sprint_name: sprintNameStr,
            throughput_points,
            quality_score,
            velocity_points,
            done_to_said_ratio,
            technical_debt_index,
            user_stories_delivered
        };
        setGridRows([...gridRows, newRow]);
    };

    const deleteGridRow = (index: number) => {
        if (gridRows.length <= 1) return;
        setGridRows(gridRows.filter((_, i) => i !== index));
    };

    const handleGridRowChange = (index: number, field: keyof GridRow, value: string) => {
        const updated = [...gridRows];
        updated[index] = { ...updated[index], [field]: value };

        // Auto-provision team_name and default sprint details if team_id changes
        if (field === 'team_id') {
            const rowTeamId = updated[index].team_id;
            const matchedTeam = filteredTeams.find(t => t.id === rowTeamId);
            if (matchedTeam) {
                updated[index].team_name = matchedTeam.name;
            }

            const rowDate = updated[index].sprint_date;
            if (rowTeamId && rowDate) {
                const sprintInfo = getNextSprintDetails(rowTeamId, rowDate);
                updated[index].sprint_number = sprintInfo.sprint_number;
                updated[index].sprint_name = sprintInfo.sprint_name;
            }
        }

        if (field === 'sprint_number') {
            const match = value ? value.match(/\d+/) : null;
            if (match) {
                const num = parseInt(match[0], 10);
                updated[index].sprint_name = `Sprint - ${num}`;
            }
        }

        // Fetch/lookup existing metrics if team_id or sprint_number changes
        if (field === 'team_id' || field === 'sprint_number') {
            const rowTeamId = updated[index].team_id;
            const rowSprintNumberStr = updated[index].sprint_number;
            const match = rowSprintNumberStr ? rowSprintNumberStr.match(/\d+/) : null;
            const sprintNum = match ? parseInt(match[0], 10) : null;

            if (rowTeamId && sprintNum !== null) {
                const existingMetric = (allSprintMetrics as any[]).find(
                    (sm: any) => sm.teamId === rowTeamId && sm.sprintNumber === sprintNum
                );

                if (existingMetric) {
                    updated[index].throughput_points = existingMetric.throughputPoints !== undefined && existingMetric.throughputPoints !== null ? String(existingMetric.throughputPoints) : '';
                    updated[index].quality_score = existingMetric.qualityScore !== undefined && existingMetric.qualityScore !== null ? String(existingMetric.qualityScore) : '';
                    updated[index].velocity_points = existingMetric.velocityPoints !== undefined && existingMetric.velocityPoints !== null ? String(existingMetric.velocityPoints) : '';
                    updated[index].done_to_said_ratio = existingMetric.doneToSaidRatio !== undefined && existingMetric.doneToSaidRatio !== null ? String(existingMetric.doneToSaidRatio) : '';
                    updated[index].technical_debt_index = existingMetric.technicalDebtIndex !== undefined && existingMetric.technicalDebtIndex !== null ? String(existingMetric.technicalDebtIndex) : '';
                    updated[index].user_stories_delivered = existingMetric.userStoriesDelivered !== undefined && existingMetric.userStoriesDelivered !== null ? String(existingMetric.userStoriesDelivered) : '';
                    
                    if (existingMetric.sprintDate) {
                        updated[index].sprint_date = new Date(existingMetric.sprintDate).toISOString().split('T')[0];
                    }
                } else {
                    updated[index].throughput_points = '';
                    updated[index].quality_score = '';
                    updated[index].velocity_points = '';
                    updated[index].done_to_said_ratio = '';
                    updated[index].technical_debt_index = '';
                    updated[index].user_stories_delivered = '';
                }
            }
        }

        setGridRows(updated);
    };

    const handleGridSave = async () => {
        // Validate inputs
        const invalidRow = gridRows.find(r => !r.team_id || !r.sprint_date || !r.sprint_name || !r.sprint_number);
        if (invalidRow) {
            toast.error('Please ensure Team, Sprint Date, Sprint No, and Sprint Name are entered for all rows.');
            return;
        }

        setIsUploading(true);
        setResult(null);
        try {
            // Generate CSV string content from grid data
            const csvRows = [TEMPLATE_HEADERS.join(',')];
            gridRows.forEach(row => {
                const line = [
                    row.team_id,
                    row.team_name,
                    row.sprint_number,
                    row.sprint_name,
                    row.sprint_date,
                    row.throughput_points || '0',
                    row.quality_score || '0',
                    row.velocity_points || '0',
                    row.done_to_said_ratio || '0',
                    row.technical_debt_index || '0',
                    row.user_stories_delivered || '0'
                ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
                csvRows.push(line);
            });

            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const file = new File([blob], 'grid_sprint_data.csv', { type: 'text/csv' });

            const res = await sprintMetricsAPI.bulkUpload(file, undefined);
            setResult(res);
            queryClient.invalidateQueries({ queryKey: ['sprint-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['sprint-analytics'] });
            queryClient.invalidateQueries({ queryKey: ['metrics'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            if (res.errors?.length === 0) {
                toast.success(`✅ ${res.processed} sprint records successfully stored in DB!`);
                setGridRows([createEmptyRow()]);
            } else {
                toast.warning(`Stored ${res.processed}/${res.total} rows. ${res.errors?.length} errors encountered.`);
            }
        } catch (err: any) {
            toast.error(err.message || 'Saving grid data failed');
        } finally {
            setIsUploading(false);
        }
    };

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
            const res = await sprintMetricsAPI.bulkUpload(selectedFile, selectedTeamId || undefined);
            setResult(res);
            queryClient.invalidateQueries({ queryKey: ['sprint-metrics'] });
            queryClient.invalidateQueries({ queryKey: ['sprint-analytics'] });
            queryClient.invalidateQueries({ queryKey: ['metrics'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
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
        
        const referenceData = filteredTeams.map(t => ({
            'Team ID': t.teamId || t.id,
            'Team Name': t.name,
            'Project Name': t.project?.name || 'Unassigned',
            'AI Enabled Status': t.aiEnabled ? 'AI Enabled' : 'Traditional'
        }));
        
        const referenceWorksheet = XLSX.utils.json_to_sheet(referenceData);
        XLSX.utils.book_append_sheet(workbook, referenceWorksheet, 'Available Teams');
        
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
                        Add and edit sprint metrics directly in the live table or upload a spreadsheet file.
                    </p>
                </div>
                {uploadMode === 'file' && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadTemplate}
                        className="rounded-xl gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary text-xs h-8"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Template
                    </Button>
                )}
            </div>

            {/* Upload Mode Selector */}
            <div className="flex border-b border-border/40">
                <button
                    onClick={() => { setUploadMode('grid'); setResult(null); }}
                    className={cn(
                        'flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2',
                        uploadMode === 'grid'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                >
                    Interactive Grid Editor
                </button>
                <button
                    onClick={() => { setUploadMode('file'); setResult(null); }}
                    className={cn(
                        'flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2',
                        uploadMode === 'file'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                >
                    Upload CSV / Excel File
                </button>
            </div>

            {uploadMode === 'grid' ? (
                /* Interactive Grid Editor Mode */
                <div className="space-y-4">
                    <div className="border border-border/40 rounded-2xl overflow-hidden bg-muted/5">
                        <div className="overflow-x-auto max-h-[380px]">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-muted/30 border-b border-border/40 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                                        <th className="p-3 min-w-[180px]">Team</th>
                                        <th className="p-3 min-w-[120px]">Sprint Date</th>
                                        <th className="p-3 min-w-[90px]">Sprint No</th>
                                        <th className="p-3 min-w-[110px]">Sprint Name</th>
                                        <th className="p-3 min-w-[80px]">Velocity</th>
                                        <th className="p-3 min-w-[90px]">Throughput</th>
                                        <th className="p-3 min-w-[90px]">Quality %</th>
                                        <th className="p-3 min-w-[90px]">Done/Said</th>
                                        <th className="p-3 min-w-[90px]">Tech Debt</th>
                                        <th className="p-3 min-w-[90px]">Stories</th>
                                        <th className="p-3 text-center w-[50px]">Act</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {gridRows.map((row, index) => (
                                        <tr key={row.id} className="hover:bg-muted/10">
                                            {/* Team Selector column */}
                                            <td className="p-2">
                                                <select
                                                    value={row.team_id}
                                                    onChange={(e) => handleGridRowChange(index, 'team_id', e.target.value)}
                                                    className="w-full h-8 pl-2 pr-8 rounded-lg bg-background border border-border/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                                >
                                                    <option value="" disabled>Select Team...</option>
                                                    {filteredTeams.map(t => (
                                                        <option key={t.id} value={t.id}>{t.name}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* Sprint Date Picker */}
                                            <td className="p-2">
                                                <input
                                                    type="date"
                                                    value={row.sprint_date}
                                                    onChange={(e) => handleGridRowChange(index, 'sprint_date', e.target.value)}
                                                    className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            </td>

                                            {/* Sprint Number Dropdown */}
                                            <td className="p-2">
                                                <select
                                                    value={row.sprint_number}
                                                    onChange={(e) => handleGridRowChange(index, 'sprint_number', e.target.value)}
                                                    className="w-full h-8 pl-2 pr-8 rounded-lg bg-background border border-border/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                                                >
                                                    <option value="" disabled>Select...</option>
                                                    {Array.from({ length: 30 }, (_, i) => i + 1).map(num => {
                                                        const val = `S-${num < 10 ? '0' + num : num}`;
                                                        return (
                                                            <option key={num} value={val}>
                                                                Sprint {num}
                                                            </option>
                                                        );
                                                    })}
                                                    {row.sprint_number && !Array.from({ length: 30 }, (_, i) => `S-${i < 9 ? '0' + (i + 1) : i + 1}`).includes(row.sprint_number) && (
                                                        <option value={row.sprint_number}>{row.sprint_number}</option>
                                                    )}
                                                </select>
                                            </td>

                                            {/* Sprint Name */}
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    value={row.sprint_name}
                                                    onChange={(e) => handleGridRowChange(index, 'sprint_name', e.target.value)}
                                                    placeholder="Sprint-1"
                                                    className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                                                />
                                            </td>

                                            {/* Velocity Points */}
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={row.velocity_points}
                                                    onChange={(e) => handleGridRowChange(index, 'velocity_points', e.target.value)}
                                                    placeholder="0"
                                                    className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-right"
                                                />
                                            </td>

                                            {/* Throughput Points */}
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={row.throughput_points}
                                                    onChange={(e) => handleGridRowChange(index, 'throughput_points', e.target.value)}
                                                    placeholder="0"
                                                    className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-right"
                                                />
                                            </td>

                                            {/* Quality Score */}
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={row.quality_score}
                                                    onChange={(e) => handleGridRowChange(index, 'quality_score', e.target.value)}
                                                    placeholder="0"
                                                    className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-right"
                                                />
                                            </td>

                                            {/* Done to Said Ratio */}
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={row.done_to_said_ratio}
                                                    onChange={(e) => handleGridRowChange(index, 'done_to_said_ratio', e.target.value)}
                                                    placeholder="1.0"
                                                    className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-right"
                                                />
                                            </td>

                                            {/* Technical Debt Index */}
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={row.technical_debt_index}
                                                    onChange={(e) => handleGridRowChange(index, 'technical_debt_index', e.target.value)}
                                                    placeholder="0"
                                                    className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-right"
                                                />
                                            </td>

                                            {/* User Stories Delivered */}
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    value={row.user_stories_delivered}
                                                    onChange={(e) => handleGridRowChange(index, 'user_stories_delivered', e.target.value)}
                                                    placeholder="0"
                                                    className="w-full h-8 px-2 rounded-lg bg-background border border-border/50 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-right"
                                                />
                                            </td>

                                            {/* Delete Row button */}
                                            <td className="p-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => deleteGridRow(index)}
                                                    disabled={gridRows.length <= 1}
                                                    className="p-1.5 rounded-md hover:bg-destructive/15 text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Grid Actions */}
                        <div className="flex items-center gap-2 p-3 bg-muted/10 border-t border-border/40">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addGridRow}
                                className="rounded-lg text-xs gap-1 border-primary/20 hover:bg-primary/5 hover:text-primary h-8"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add Row
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setGridRows([createEmptyRow()])}
                                className="rounded-lg text-xs hover:bg-destructive/5 hover:text-destructive h-8 ml-auto"
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>

                    {/* Save Button */}
                    {!result && (
                        <Button
                            className="w-full rounded-xl h-11 gap-2 text-sm font-semibold"
                            onClick={handleGridSave}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving Sprint Data to DB…
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Save Grid Data to Database
                                </>
                            )}
                        </Button>
                    )}
                </div>
            ) : (
                /* Original Spreadsheet File Upload Mode */
                <div className="space-y-4">
                    {/* Required Columns Hint */}
                    <div className="rounded-xl bg-muted/30 border border-border/40 px-4 py-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Spreadsheet Columns</p>
                        <div className="flex flex-wrap gap-1.5">
                            {TEMPLATE_HEADERS.map(col => (
                                <Badge
                                    key={col}
                                    variant="outline"
                                    className="font-mono text-[10px] rounded-md px-1.5 py-0 border-border/60 bg-background"
                                >
                                    {col}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Team Selection */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
                            Select Team {['TEAM_LEAD', 'TEAM', 'MEMBER'].includes(role) ? '(Locked to Your Team)' : '(Optional)'}
                        </label>
                        <select
                            className="w-full sm:w-[300px] h-10 px-3 py-2 rounded-xl bg-muted/20 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={selectedTeamId}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                            disabled={['TEAM_LEAD', 'TEAM', 'MEMBER'].includes(role) && filteredTeams.length <= 1}
                        >
                            {!['TEAM_LEAD', 'TEAM', 'MEMBER'].includes(role) && (
                                <option value="">Dynamic resolution (from spreadsheet columns)</option>
                            )}
                            {filteredTeams.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
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
                </div>
            )}

            {/* Result Summary (Shared) */}
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
                        {uploadMode === 'file' ? 'Upload Another File' : 'Edit New Batch'}
                    </Button>
                </div>
            )}
        </div>
    );
}
