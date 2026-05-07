'use client';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLORS, METRICS_FIELDS, X_AXIS_OPTIONS, CHART_TYPES, extractHierarchy, cascadeOptions, type PlotConfig } from './powerbi-engine';

function ScopeChips({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  if (!options.length) return <div className="space-y-1"><span className="text-[9px] font-black uppercase text-violet-500/60">{label}</span><p className="text-[9px] text-muted-foreground italic p-2">Select parent level first</p></div>;
  return (
    <div className="space-y-1">
      <span className="text-[9px] font-black uppercase text-violet-500/60">{label} {selected.length > 0 && <Badge variant="secondary" className="ml-1 text-[8px] h-4">{selected.length}</Badge>}</span>
      <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto custom-scrollbar">
        {options.map(o => (
          <button key={o} onClick={() => onToggle(o)} className={cn("text-[9px] font-bold px-2 py-1 rounded-md border transition-all", selected.includes(o) ? "bg-violet-600 text-white border-violet-600" : "bg-background hover:bg-violet-50 border-border/40")}>{o}</button>
        ))}
      </div>
    </div>
  );
}

export function PlotEditorDialog({ isOpen, onClose, plot, onSave, maxSprint, rawData }: {
  isOpen: boolean; onClose: () => void; plot: PlotConfig; onSave: (p: PlotConfig) => void; maxSprint: number; rawData: any[];
}) {
  const [d, setD] = useState<PlotConfig>({ ...plot, metrics: plot.metrics.map(m => ({ ...m })) });
  const hier = useMemo(() => extractHierarchy(rawData), [rawData]);
  const cascaded = useMemo(() => cascadeOptions(rawData, d), [rawData, d.scopeOrgs, d.scopeMarkets, d.scopeAccounts, d.scopeProjects]);

  const toggle = (field: keyof PlotConfig, val: string) => {
    const arr = (d[field] as string[]) || [];
    const next = arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
    // Clear children when parent changes
    const updates: any = { [field]: next };
    if (field === 'scopeOrgs') { updates.scopeMarkets = []; updates.scopeAccounts = []; updates.scopeProjects = []; updates.scopeTeams = []; }
    if (field === 'scopeMarkets') { updates.scopeAccounts = []; updates.scopeProjects = []; updates.scopeTeams = []; }
    if (field === 'scopeAccounts') { updates.scopeProjects = []; updates.scopeTeams = []; }
    if (field === 'scopeProjects') { updates.scopeTeams = []; }
    setD({ ...d, ...updates });
  };

  return (
    <Dialog open={isOpen} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-[900px] rounded-3xl border-border/50 bg-background/95 backdrop-blur-3xl overflow-hidden p-0 shadow-2xl">
        <div className="p-6 pb-3 border-b border-border/10 bg-violet-500/5">
          <DialogTitle className="text-xl font-black tracking-tight">Power BI Plot Designer</DialogTitle>
          <DialogDescription className="text-xs">Configure your data source, scope, dimensions and metrics.</DialogDescription>
        </div>
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* 1. Title */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Plot Title</Label>
              <Input value={d.title} onChange={e => setD({ ...d, title: e.target.value })} placeholder="e.g. Velocity Trend by Team" className="rounded-xl h-10 font-bold" /></div>
            <div className="space-y-1"><Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Subtitle</Label>
              <Input value={d.subtitle} onChange={e => setD({ ...d, subtitle: e.target.value })} placeholder="Optional description" className="rounded-xl h-10" /></div>
          </div>

          {/* 2. Data Scope — Hierarchical cascading */}
          <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10 space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-violet-600">① Data Scope (Hierarchy Filter)</Label>
            <p className="text-[9px] text-muted-foreground -mt-1">Select at any level. Leave empty = all data. Selecting a parent narrows children.</p>
            <div className="grid grid-cols-5 gap-3">
              <ScopeChips label="Organisation" options={hier.orgs} selected={d.scopeOrgs} onToggle={v => toggle('scopeOrgs', v)} />
              <ScopeChips label="Market" options={d.scopeOrgs.length ? cascaded.markets : hier.markets} selected={d.scopeMarkets} onToggle={v => toggle('scopeMarkets', v)} />
              <ScopeChips label="Account" options={d.scopeMarkets.length ? cascaded.accounts : (d.scopeOrgs.length ? cascaded.accounts : hier.accounts)} selected={d.scopeAccounts} onToggle={v => toggle('scopeAccounts', v)} />
              <ScopeChips label="Project" options={d.scopeAccounts.length ? cascaded.projects : (d.scopeMarkets.length || d.scopeOrgs.length ? cascaded.projects : hier.projects)} selected={d.scopeProjects} onToggle={v => toggle('scopeProjects', v)} />
              <ScopeChips label="Team" options={d.scopeProjects.length ? cascaded.teams : (d.scopeAccounts.length || d.scopeMarkets.length || d.scopeOrgs.length ? cascaded.teams : hier.teams)} selected={d.scopeTeams} onToggle={v => toggle('scopeTeams', v)} />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[9px] font-black uppercase text-muted-foreground">AI Filter:</span>
              {(['all', 'ai', 'non-ai'] as const).map(v => (
                <Button key={v} size="sm" variant={d.aiFilter === v ? 'default' : 'outline'} onClick={() => setD({ ...d, aiFilter: v })} className="h-6 rounded-md text-[9px] font-black px-3">{v === 'all' ? 'All Projects' : v === 'ai' ? 'AI Only' : 'Traditional Only'}</Button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[9px] font-bold text-muted-foreground">Sprints</span>
                <Input type="number" value={d.sprintRange[0]} onChange={e => setD({ ...d, sprintRange: [parseInt(e.target.value) || 1, d.sprintRange[1]] })} className="w-14 h-7 rounded-lg text-xs font-bold text-center" />
                <span className="text-[9px]">to</span>
                <Input type="number" value={d.sprintRange[1]} onChange={e => setD({ ...d, sprintRange: [d.sprintRange[0], parseInt(e.target.value) || maxSprint] })} className="w-14 h-7 rounded-lg text-xs font-bold text-center" />
              </div>
            </div>
          </div>

          {/* 3. Plot Dimensions */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase tracking-widest text-blue-600">② X-Axis</Label>
              <Select value={d.xAxis} onValueChange={v => setD({ ...d, xAxis: v })}>
                <SelectTrigger className="rounded-xl h-10 font-bold bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>{X_AXIS_OPTIONS.map(o => <SelectItem key={o.id} value={o.id} className="font-bold text-xs">{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase tracking-widest text-blue-600">Legend / Series</Label>
              <Select value={d.legend} onValueChange={v => setD({ ...d, legend: v })}>
                <SelectTrigger className="rounded-xl h-10 font-bold bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="font-bold text-xs italic text-muted-foreground">None (multi-metric)</SelectItem>
                  {X_AXIS_OPTIONS.map(o => <SelectItem key={o.id} value={o.id} className="font-bold text-xs">{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-black uppercase tracking-widest text-blue-600">③ Chart Type</Label>
              <Select value={d.chartType} onValueChange={v => setD({ ...d, chartType: v })}>
                <SelectTrigger className="rounded-xl h-10 font-bold bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>{CHART_TYPES.map(c => <SelectItem key={c.id} value={c.id} className="font-bold text-xs">{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* 4. Metrics */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-600">④ Y-Axis Metrics</Label>
              <Button variant="outline" size="sm" className="h-7 rounded-full text-[9px] font-black border-emerald-500/30 text-emerald-600"
                onClick={() => setD({ ...d, metrics: [...d.metrics, { key: METRICS_FIELDS[0].id, agg: METRICS_FIELDS[0].defaultAgg, color: COLORS[d.metrics.length % COLORS.length], type: 'bar' }] })}>
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {d.metrics.map((m, i) => (
                <div key={i} className="flex items-center gap-2 bg-background p-2 rounded-xl border border-border/30">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                  <Select value={m.key} onValueChange={v => { const n = [...d.metrics]; n[i] = { ...n[i], key: v }; setD({ ...d, metrics: n }); }}>
                    <SelectTrigger className="flex-1 rounded-lg h-8 text-[10px] font-bold bg-transparent border-0"><SelectValue /></SelectTrigger>
                    <SelectContent>{METRICS_FIELDS.map(f => <SelectItem key={f.id} value={f.id} className="font-bold text-xs">{f.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={m.agg} onValueChange={v => { const n = [...d.metrics]; n[i] = { ...n[i], agg: v as any }; setD({ ...d, metrics: n }); }}>
                    <SelectTrigger className="w-[70px] rounded-lg h-8 text-[10px] font-bold bg-transparent border-0"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="sum" className="text-xs font-bold">Sum</SelectItem><SelectItem value="avg" className="text-xs font-bold">Avg</SelectItem></SelectContent>
                  </Select>
                  <Input type="color" value={m.color} onChange={e => { const n = [...d.metrics]; n[i] = { ...n[i], color: e.target.value }; setD({ ...d, metrics: n }); }} className="w-8 h-8 p-0.5 rounded-lg cursor-pointer border-0" />
                  <Button variant="ghost" size="icon" onClick={() => setD({ ...d, metrics: d.metrics.filter((_, j) => j !== i) })} className="h-7 w-7 text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
              {!d.metrics.length && <p className="text-[9px] text-muted-foreground italic text-center py-3">Add at least one metric</p>}
            </div>
          </div>

          {/* 5. Layout */}
          <div className="flex items-center gap-3">
            <Label className="text-[9px] font-black uppercase text-muted-foreground">Width:</Label>
            {[1, 2, 3].map(s => (
              <Button key={s} size="sm" variant={d.span === s ? 'default' : 'outline'} onClick={() => setD({ ...d, span: s })} className="h-7 rounded-md text-[9px] font-black px-4">{s === 1 ? '1/3' : s === 2 ? '2/3' : 'Full'}</Button>
            ))}
          </div>
        </div>
        <div className="p-5 bg-muted/30 border-t border-border/10 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl font-bold h-10 px-6">Cancel</Button>
          <Button onClick={() => { if (!d.title) { d.title = 'Untitled Plot'; } onSave(d); }} className="rounded-xl font-black h-10 px-8 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-600/20">Generate Plot</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
