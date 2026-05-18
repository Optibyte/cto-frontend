// Power BI Engine — Types, Constants & Pivot Logic
// Data flows from PostgreSQL → backend findAll() → this engine → Recharts

export const COLORS = ['#8b5cf6', '#d946ef', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#a855f7', '#6366f1'];

export const HIERARCHY_LEVELS = [
  { id: 'org', label: 'Organisation', path: (r: any) => r.team?.account_rel?.org?.name },
  { id: 'country', label: 'Country', path: (r: any) => r.team?.account_rel?.market?.country },
  { id: 'market', label: 'Market', path: (r: any) => r.team?.account_rel?.market?.name },
  { id: 'account', label: 'Account', path: (r: any) => r.team?.account_rel?.name },
  { id: 'project', label: 'Project', path: (r: any) => r.team?.project?.name },
  { id: 'team', label: 'Team', path: (r: any) => r.team?.name },
] as const;

export const X_AXIS_OPTIONS = [
  { id: 'sprintNumber', label: 'Sprint Number' },
  ...HIERARCHY_LEVELS,
  { id: 'aiEnabled', label: 'AI vs Traditional' },
  { id: 'aiBaseline', label: 'AI with Baseline' },
];

export const METRICS_FIELDS = [
  { id: 'throughputPoints', label: 'Throughput Points', defaultAgg: 'sum' as const },
  { id: 'velocityPoints', label: 'Velocity Points', defaultAgg: 'sum' as const },
  { id: 'userStoriesDelivered', label: 'User Stories', defaultAgg: 'sum' as const },
  { id: 'qualityScore', label: 'Quality Score (%)', defaultAgg: 'avg' as const },
  { id: 'doneToSaidRatio', label: 'Done-to-Said Ratio', defaultAgg: 'avg' as const },
  { id: 'technicalDebtIndex', label: 'Tech Debt Index', defaultAgg: 'avg' as const },
];

export const CHART_TYPES = [
  { id: 'BarChart', label: 'Bar Chart' },
  { id: 'LineChart', label: 'Line Chart' },
  { id: 'AreaChart', label: 'Area Chart' },
  { id: 'ComposedChart', label: 'Composed' },
  { id: 'PieChart', label: 'Pie / Donut' },
  { id: 'RadarChart', label: 'Radar Chart' },
];

export type MetricConfig = { key: string; agg: 'sum' | 'avg'; color: string; type: string };

export type PlotConfig = {
  id: string;
  title: string;
  subtitle: string;
  dataSource: 'team_productivity' | 'manual_metrics';
  // Hierarchical scope — cascading filters (empty = all)
  scopeOrgs: string[];
  scopeMarkets: string[];
  scopeAccounts: string[];
  scopeProjects: string[];
  scopeTeams: string[];
  aiFilter: 'all' | 'ai' | 'non-ai';
  sprintRange: [number, number];
  // Plot config
  xAxis: string;
  legend: string; // 'none' or a dimension id
  chartType: string;
  metrics: MetricConfig[];
  span: number; // 1, 2, or 3 columns
};

// Extract unique values from raw data for a hierarchy level
export function extractHierarchy(rawData: any[]) {
  const orgs = new Set<string>();
  const markets = new Set<string>();
  const accounts = new Set<string>();
  const projects = new Set<string>();
  const teams = new Set<string>();
  rawData.forEach(r => {
    const o = r.team?.account_rel?.org?.name; if (o) orgs.add(o);
    const m = r.team?.account_rel?.market?.name; if (m) markets.add(m);
    const a = r.team?.account_rel?.name; if (a) accounts.add(a);
    const p = r.team?.project?.name; if (p) projects.add(p);
    const t = r.team?.name; if (t) teams.add(t);
  });
  return {
    orgs: [...orgs].sort(), markets: [...markets].sort(),
    accounts: [...accounts].sort(), projects: [...projects].sort(),
    teams: [...teams].sort(),
  };
}

// Cascading filter: given selected orgs, return only markets under those orgs, etc.
export function cascadeOptions(rawData: any[], scope: Partial<PlotConfig>) {
  let filtered = rawData;
  if (scope.scopeOrgs?.length) filtered = filtered.filter(r => scope.scopeOrgs!.includes(r.team?.account_rel?.org?.name));
  const markets = [...new Set(filtered.map(r => r.team?.account_rel?.market?.name).filter(Boolean))].sort();

  if (scope.scopeMarkets?.length) filtered = filtered.filter(r => scope.scopeMarkets!.includes(r.team?.account_rel?.market?.name));
  const accounts = [...new Set(filtered.map(r => r.team?.account_rel?.name).filter(Boolean))].sort();

  if (scope.scopeAccounts?.length) filtered = filtered.filter(r => scope.scopeAccounts!.includes(r.team?.account_rel?.name));
  const projects = [...new Set(filtered.map(r => r.team?.project?.name).filter(Boolean))].sort();

  if (scope.scopeProjects?.length) filtered = filtered.filter(r => scope.scopeProjects!.includes(r.team?.project?.name));
  const teams = [...new Set(filtered.map(r => r.team?.name).filter(Boolean))].sort();

  return { markets, accounts, projects, teams };
}

// Get dimension value from a row
// Get dimension value from a row based on data source
function getDimValue(row: any, dim: string, dataSource: string): string {
  if (dataSource === 'manual_metrics') {
    switch (dim) {
      case 'sprintNumber': return `Period ${row.period || row.sprint || 1}`;
      case 'org': return row.org || 'Unknown';
      case 'country': return row.country || 'Unknown';
      case 'market': return row.market || 'Unknown';
      case 'account': return row.account || 'Unknown';
      case 'project': return row.project || 'Unknown';
      case 'team': return row.team || 'Unknown';
      case 'aiBaseline':
      case 'aiEnabled': return row.aiEnabled ? 'AI-Enabled' : 'Traditional';
      default: return 'All';
    }
  }

  // team_productivity structure
  switch (dim) {
    case 'sprintNumber': return `Sprint ${row.sprintNumber}`;
    case 'org': return row.team?.account_rel?.org?.name || row.org || 'Unknown';
    case 'country': return row.team?.account_rel?.market?.country || row.country || 'Unknown';
    case 'market': return row.team?.account_rel?.market?.name || row.market || 'Unknown';
    case 'account': return row.team?.account_rel?.name || row.account || 'Unknown';
    case 'project': return row.team?.project?.name || row.project || 'Unknown';
    case 'team': return row.team?.name || row.teamName || 'Unknown';
    case 'aiBaseline':
    case 'aiEnabled': return row.team?.project?.aiEnabled ? 'AI-Enabled' : 'Traditional';
    default: return 'All';
  }
}

// The main pivot engine
export function pivotData(rawData: any[], config: PlotConfig): any[] {
  if (!rawData?.length) return [];

  // 1. Apply scope filters
  let data = rawData;
  const isManual = config.dataSource === 'manual_metrics';

  if (isManual) {
    if (config.scopeOrgs?.length) data = data.filter(r => config.scopeOrgs.includes(r.org));
    if (config.scopeMarkets?.length) data = data.filter(r => config.scopeMarkets.includes(r.market));
    if (config.scopeAccounts?.length) data = data.filter(r => config.scopeAccounts.includes(r.account));
    if (config.scopeProjects?.length) data = data.filter(r => config.scopeProjects.includes(r.project));
    if (config.scopeTeams?.length) data = data.filter(r => config.scopeTeams.includes(r.team));
    if (config.aiFilter === 'ai') data = data.filter(r => r.aiEnabled);
    if (config.aiFilter === 'non-ai') data = data.filter(r => !r.aiEnabled);
  } else {
    if (config.scopeOrgs?.length) data = data.filter(r => config.scopeOrgs.includes(r.team?.account_rel?.org?.name));
    if (config.scopeMarkets?.length) data = data.filter(r => config.scopeMarkets.includes(r.team?.account_rel?.market?.name));
    if (config.scopeAccounts?.length) data = data.filter(r => config.scopeAccounts.includes(r.team?.account_rel?.name));
    if (config.scopeProjects?.length) data = data.filter(r => config.scopeProjects.includes(r.team?.project?.name));
    if (config.scopeTeams?.length) data = data.filter(r => config.scopeTeams.includes(r.team?.name));
    if (config.aiFilter === 'ai') data = data.filter(r => r.team?.project?.aiEnabled);
    if (config.aiFilter === 'non-ai') data = data.filter(r => !r.team?.project?.aiEnabled);
    if (config.sprintRange) data = data.filter(r => r.sprintNumber >= config.sprintRange[0] && r.sprintNumber <= config.sprintRange[1]);
  }

  if (!data.length) return [];

  const groups: Record<string, any> = {};
  const hasLegend = config.legend && config.legend !== 'none';

  data.forEach(row => {
    const xKey = getDimValue(row, config.xAxis, config.dataSource);
    if (!groups[xKey]) {
      const sortKey = config.xAxis === 'sprintNumber' 
        ? (isManual ? (row.period || row.sprint || 0) : row.sprintNumber) 
        : xKey;
      groups[xKey] = { group: xKey, _sortKey: sortKey, _counts: {}, _totals: {} };
    }
    const g = groups[xKey];

    if (hasLegend) {
      const lKey = getDimValue(row, config.legend, config.dataSource);
      const m = config.metrics[0];
      if (m) {
        if (!g._totals[lKey]) { g._totals[lKey] = 0; g._counts[lKey] = 0; }
        g._totals[lKey] += Number(row[m.key] || 0);
        g._counts[lKey]++;
      }
    } else {
      config.metrics.forEach(m => {
        if (!g._totals[m.key]) { g._totals[m.key] = 0; g._counts[m.key] = 0; }
        g._totals[m.key] += Number(row[m.key] || 0);
        g._counts[m.key]++;
      });
    }
  });

  // Finalize aggregations
  return Object.values(groups)
    .sort((a: any, b: any) => {
      if (config.xAxis === 'sprintNumber') return (a._sortKey || 0) - (b._sortKey || 0);
      return String(a._sortKey).localeCompare(String(b._sortKey));
    })
    .map((g: any) => {
      const result: any = { group: g.group };
      if (hasLegend) {
        const m = config.metrics[0];
        Object.keys(g._totals).forEach(lKey => {
          result[lKey] = m?.agg === 'avg' ? g._totals[lKey] / g._counts[lKey] : g._totals[lKey];
        });
      } else {
        config.metrics.forEach(m => {
          result[m.key] = m.agg === 'avg' ? g._totals[m.key] / g._counts[m.key] : g._totals[m.key];
        });
      }
      return result;
    });
}

export function newPlotConfig(maxSprint: number): PlotConfig {
  return {
    id: `plot-${Date.now()}`, title: '', subtitle: '', dataSource: 'team_productivity',
    scopeOrgs: [], scopeMarkets: [], scopeAccounts: [], scopeProjects: [], scopeTeams: [],
    aiFilter: 'all', sprintRange: [1, maxSprint],
    xAxis: 'sprintNumber', legend: 'none', chartType: 'BarChart',
    metrics: [{ key: 'velocityPoints', agg: 'sum', color: COLORS[0], type: 'bar' }], span: 1,
  };
}
