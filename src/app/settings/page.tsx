'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Bell, Shield, Lock, Moon, Sun, Monitor, LogOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your profile and application preferences
                    </p>
                </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 rounded-xl bg-secondary/20 p-1">
                    <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Profile</TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Notifications</TabsTrigger>
                    <TabsTrigger value="appearance" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Appearance</TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-border/50 shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    Personal Information
                                </CardTitle>
                                <CardDescription>Update your personal details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input defaultValue="Admin User" className="rounded-xl border-border/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input defaultValue="admin@cto-platform.com" className="rounded-xl border-border/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bio</Label>
                                    <Input placeholder="Tell us about yourself" className="rounded-xl border-border/50" />
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end border-t border-border/30 pt-4">
                                <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30">Save Changes</Button>
                            </CardFooter>
                        </Card>

                        <Card className="border-border/50 shadow-md flex flex-col items-center justify-center text-center p-6 space-y-4">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-secondary overflow-hidden border-4 border-card shadow-xl">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full shadow-md bg-card">
                                    <User className="h-4 w-4" />
                                </Button>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Admin User</h3>
                                <p className="text-muted-foreground">CTO / Engineering Manager</p>
                            </div>
                            <Badge variant="outline" className="rounded-full bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1">
                                Verified Account
                            </Badge>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="appearance">
                    <Card className="border-border/50 shadow-md">
                        <CardHeader>
                            <CardTitle>Theme Preferences</CardTitle>
                            <CardDescription>Choose how the application looks to you.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-3 gap-4">
                            <div className="cursor-pointer space-y-2">
                                <div className="h-24 rounded-xl bg-slate-100 border-2 border-primary shadow-sm flex items-center justify-center">
                                    <Sun className="h-8 w-8 text-orange-500" />
                                </div>
                                <p className="text-center font-medium">Light</p>
                            </div>
                            <div className="cursor-pointer space-y-2">
                                <div className="h-24 rounded-xl bg-slate-900 border-2 border-transparent hover:border-primary/50 shadow-sm flex items-center justify-center">
                                    <Moon className="h-8 w-8 text-blue-400" />
                                </div>
                                <p className="text-center font-medium">Dark</p>
                            </div>
                            <div className="cursor-pointer space-y-2">
                                <div className="h-24 rounded-xl bg-gradient-to-br from-slate-100 to-slate-900 border-2 border-transparent hover:border-primary/50 shadow-sm flex items-center justify-center">
                                    <Monitor className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <p className="text-center font-medium">System</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
