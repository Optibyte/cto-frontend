'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Puzzle, ArrowUpRight, Github, Database } from 'lucide-react';

const INTEGRATIONS = [
    {
        id: 'jira',
        name: 'Jira Software',
        description: 'Sync tickets, sprints, and cycle time metrics automatically.',
        status: 'disconnected',
        icon: Database,
        color: 'text-blue-500 bg-blue-500/10',
    },
    {
        id: 'github',
        name: 'GitHub',
        description: 'Track PR velocity, code review times, and deployment frequency.',
        status: 'connected',
        icon: Github,
        color: 'text-purple-500 bg-purple-500/10',
    },
];

export default function IntegrationsPage() {
    return (
        <div className="space-y-6 fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                <p className="text-muted-foreground">
                    Connect your tools to automate data collection
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {INTEGRATIONS.map((app) => (
                    <Card key={app.id} className="group hover:-translate-y-1 transition-all duration-300 border-border/50 shadow-md hover:shadow-xl hover:border-primary/20">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div className={`p-3 rounded-xl ${app.color}`}>
                                <app.icon className="h-6 w-6" />
                            </div>
                            {app.status === 'connected' ? (
                                <Badge variant="outline" className="rounded-full bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1">
                                    Connected
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="rounded-full px-3 py-1 bg-secondary/50">
                                    Available
                                </Badge>
                            )}
                        </CardHeader>
                        <CardContent className="pt-4 space-y-2">
                            <CardTitle className="text-xl">{app.name}</CardTitle>
                            <CardDescription className="line-clamp-2">
                                {app.description}
                            </CardDescription>
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant={app.status === 'connected' ? "outline" : "default"}
                                className="w-full rounded-xl gap-2 font-medium"
                            >
                                {app.status === 'connected' ? 'Configure' : 'Connect'}
                                <ArrowUpRight className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                <Card className="border-dashed border-2 border-border/50 bg-secondary/10 flex flex-col justify-center items-center text-center p-8 hover:bg-secondary/20 transition-colors cursor-pointer group">
                    <div className="p-4 rounded-full bg-secondary/20 mb-4 group-hover:scale-110 transition-transform">
                        <Puzzle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg">More Coming Soon</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                        We are adding support for GitLab, Bitbucket, and Linear.
                    </p>
                </Card>
            </div>
        </div>
    );
}
