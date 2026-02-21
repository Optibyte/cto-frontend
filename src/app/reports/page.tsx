'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const REPORTS = [
    {
        id: 1,
        title: 'Weekly Team Velocity',
        description: 'Comprehensive analysis of sprint velocity across all engineering teams.',
        lastGenerated: 'Today, 9:00 AM',
        type: 'Automated',
        icon: TrendingUp,
        color: 'text-purple-500 bg-purple-500/10',
    },
    {
        id: 2,
        title: 'SLA Breach Summary',
        description: 'Detailed list of all SLA breaches and at-risk metrics for the past month.',
        lastGenerated: 'Yesterday',
        type: 'On-Demand',
        icon: AlertTriangle,
        color: 'text-red-500 bg-red-500/10',
    },
    {
        id: 3,
        title: 'Q1 Performance Review',
        description: 'Quarterly aggregate of all key performance indicators (KPIs).',
        lastGenerated: 'Apr 1st',
        type: 'Quarterly',
        icon: FileText,
        color: 'text-blue-500 bg-blue-500/10',
    },
];

import { AlertTriangle } from 'lucide-react';

export default function ReportsPage() {
    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports Center</h1>
                    <p className="text-muted-foreground">
                        Access and generate performance insights
                    </p>
                </div>
                <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 gap-2">
                    <FileText className="h-4 w-4" />
                    New Report
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {REPORTS.map((report) => (
                    <Card key={report.id} className="group hover:-translate-y-1 transition-all duration-300 border-border/50 shadow-md hover:shadow-xl hover:border-primary/20">
                        <CardHeader className="space-y-1">
                            <div className="flex items-center justify-between">
                                <div className={`p-2 rounded-xl ${report.color} mb-2`}>
                                    <report.icon className="h-6 w-6" />
                                </div>
                                <Badge variant="outline" className="rounded-full bg-secondary/50 border-secondary px-3">
                                    {report.type}
                                </Badge>
                            </div>
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">{report.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                                {report.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm text-muted-foreground gap-2">
                                <Calendar className="h-4 w-4" />
                                Generated: {report.lastGenerated}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2">
                            <Button variant="outline" className="w-full rounded-xl gap-2 hover:bg-primary/5 hover:border-primary/30 group-hover:text-primary transition-all">
                                <Download className="h-4 w-4" />
                                Download PDF
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                <Card className="flex flex-col items-center justify-center text-center p-6 border-dashed border-2 border-border/50 bg-secondary/5 hover:bg-secondary/10 transition-colors cursor-pointer group">
                    <div className="p-4 rounded-full bg-primary/10 mb-4 group-hover:scale-110 transition-transform">
                        <ArrowRight className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Create Custom Report</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                        Build a custom report from over 50+ available metrics and dimensions.
                    </p>
                </Card>
            </div>
        </div>
    );
}
