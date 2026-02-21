'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Database, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImportPage() {
    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Import Data</h1>
                <p className="text-muted-foreground">
                    Bulk upload metrics using CSV
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-primary/20 bg-primary/5 shadow-inner">
                    <CardHeader>
                        <CardTitle className="text-primary flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            Standard CSV Format
                        </CardTitle>
                        <CardDescription>
                            Use our template to format your data
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-xl border border-dashed border-primary/30 bg-card/50 p-6 flex flex-col items-center justify-center gap-2 hover:bg-card/80 transition-colors cursor-pointer">
                            <FileText className="h-10 w-10 text-primary/50" />
                            <p className="font-medium text-sm">Drag & drop CSV file or click to browse</p>
                            <p className="text-xs text-muted-foreground">Up to 10MB</p>
                        </div>
                        <div className="flex justify-end">
                            <Button size="sm" variant="outline" className="rounded-lg gap-2">
                                Download Template <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="shadow-md border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-muted-foreground" />
                                Supported Columns
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {['Team Name', 'Timestamp', 'Metric Type', 'Value', 'Unit', 'Comments'].map((col) => (
                                    <Badge key={col} variant="secondary" className="rounded-full px-3 py-1 bg-secondary/50 font-medium">
                                        {col}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-border/50 bg-gradient-to-br from-card to-secondary/20">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                                    <Database className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Previous Imports</h4>
                                    <p className="text-sm text-muted-foreground">No recent import history found.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
