'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, Settings2, Palette, X, BarChart3, Target, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface ChartCustomization {
    xAxis: string;
    yAxis: string;
    colorScheme: string;
    showValues: boolean;
}

interface ChartCustomizerProps {
    axisOptions: string[];
    customization: ChartCustomization;
    onCustomizationChange: (c: ChartCustomization) => void;
    onDrillUp?: () => void;
    onDrillDown?: () => void;
}

const COLOR_SCHEMES = [
    { id: 'default', label: 'Default', colors: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'] },
    { id: 'ocean', label: 'Ocean', colors: ['#0ea5e9', '#06b6d4', '#14b8a6', '#2dd4bf'] },
    { id: 'sunset', label: 'Sunset', colors: ['#f43f5e', '#fb923c', '#fbbf24', '#a3e635'] },
    { id: 'forest', label: 'Forest', colors: ['#22c55e', '#16a34a', '#15803d', '#166534'] },
    { id: 'neon', label: 'Neon', colors: ['#d946ef', '#a855f7', '#6366f1', '#3b82f6'] },
];

export function ChartCustomizer({
    axisOptions,
    customization,
    onCustomizationChange,
    onDrillUp,
    onDrillDown,
}: ChartCustomizerProps) {
    const [panelOpen, setPanelOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setPanelOpen(false);
            }
        }
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    return (
        <div ref={ref} className="relative flex items-center gap-1.5">
            {/* Drill Buttons */}
            {onDrillUp && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDrillUp}
                    className="h-8 px-2.5 rounded-lg text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-all gap-1"
                >
                    <ChevronUp className="h-3.5 w-3.5" />
                    Drill Up
                </Button>
            )}
            {onDrillDown && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDrillDown}
                    className="h-8 px-2.5 rounded-lg text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-all gap-1"
                >
                    <ChevronDown className="h-3.5 w-3.5" />
                    Drill Down
                </Button>
            )}

            {/* Customize Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setPanelOpen(!panelOpen)}
                className={`h-8 px-2.5 rounded-lg text-xs font-semibold transition-all gap-1 ${panelOpen ? 'bg-primary/10 text-primary' : 'hover:bg-primary/10 hover:text-primary'}`}
            >
                <Settings2 className="h-3.5 w-3.5" />
                Customize
            </Button>

            {/* Customization Panel */}
            {panelOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-popover/95 backdrop-blur-sm border border-border/50 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                            <Settings2 className="h-4 w-4 text-primary" />
                            Configuration
                        </h4>
                        <button onClick={() => setPanelOpen(false)} className="p-1 rounded-lg hover:bg-muted/50 transition-colors">
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>

                    <Tabs defaultValue="plot" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 rounded-xl h-9 p-1 bg-muted/50 mb-4">
                            <TabsTrigger value="plot" className="rounded-lg text-[10px] font-bold uppercase tracking-wider gap-2">
                                <BarChart3 className="h-3 w-3" />
                                Plot
                            </TabsTrigger>
                            <TabsTrigger value="drill" className="rounded-lg text-[10px] font-bold uppercase tracking-wider gap-2">
                                <Target className="h-3 w-3" />
                                Drill
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="plot" className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-200">
                            {/* X Axis */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">X Axis</Label>
                                <select
                                    value={customization.xAxis}
                                    onChange={(e) => onCustomizationChange({ ...customization, xAxis: e.target.value })}
                                    className="w-full h-9 rounded-xl border border-border/50 bg-background px-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all cursor-pointer hover:border-primary/30"
                                >
                                    {axisOptions.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Y Axis */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Y Axis</Label>
                                <select
                                    value={customization.yAxis}
                                    onChange={(e) => onCustomizationChange({ ...customization, yAxis: e.target.value })}
                                    className="w-full h-9 rounded-xl border border-border/50 bg-background px-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all cursor-pointer hover:border-primary/30"
                                >
                                    {axisOptions.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Show Values Toggle */}
                            <div className="flex items-center justify-between p-2 rounded-xl bg-accent/50">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Show Data Values</Label>
                                <button
                                    onClick={() => onCustomizationChange({ ...customization, showValues: !customization.showValues })}
                                    className={`relative h-6 w-11 rounded-full transition-colors ${customization.showValues ? 'bg-primary' : 'bg-muted'}`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${customization.showValues ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>

                            {/* Color Scheme */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Palette className="h-3.5 w-3.5" />
                                    Color Palette
                                </Label>
                                <div className="grid grid-cols-1 gap-1.5">
                                    {COLOR_SCHEMES.map((scheme) => (
                                        <button
                                            key={scheme.id}
                                            onClick={() => onCustomizationChange({ ...customization, colorScheme: scheme.id })}
                                            className={`flex items-center gap-3 p-2 rounded-xl transition-all border ${customization.colorScheme === scheme.id ? 'bg-primary/5 border-primary/30 shadow-sm' : 'hover:bg-muted/50 border-transparent'}`}
                                        >
                                            <div className="flex gap-1">
                                                {scheme.colors.slice(0, 3).map((c, i) => (
                                                    <div key={i} className="h-3.5 w-3.5 rounded-full shadow-sm" style={{ backgroundColor: c }} />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{scheme.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="drill" className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Target className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <span className="text-xs font-bold">Drill Strategy</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                    Configure how data expands when drilling down. Current path:
                                    <span className="text-primary font-bold ml-1">Org {'>'} Market {'>'} Account {'>'} Project</span>
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Drill Depth</Label>
                                    <select className="w-full h-9 rounded-xl border border-border/50 bg-background px-3 text-sm outline-none cursor-not-allowed opacity-70">
                                        <option>Automatic Detection</option>
                                        <option>Strict Hierarchy</option>
                                        <option>Cross-Functional</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Drill Filter Mode</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" className="h-8 text-[10px] rounded-lg border-primary/30 bg-primary/5 text-primary font-bold">INCLUSIVE</Button>
                                        <Button variant="outline" className="h-8 text-[10px] rounded-lg border-border/50 font-bold">EXCLUSIVE</Button>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button className="w-full h-9 rounded-xl gap-2 font-bold text-xs shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all">
                                        <Filter className="h-3.5 w-3.5" />
                                        Apply Drill Logic
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    );
}
