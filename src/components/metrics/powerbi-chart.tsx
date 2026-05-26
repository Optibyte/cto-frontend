'use client';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, ComposedChart, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { COLORS, METRICS_FIELDS, type PlotConfig } from './powerbi-engine';

export function PowerBIChart({ data, config }: { data: any[]; config: PlotConfig }) {
  if (!data?.length) return <div className="h-full flex items-center justify-center text-xs font-bold text-muted-foreground opacity-60">No data — adjust scope or filters</div>;

  const hasLegend = config.legend && config.legend !== 'none';
  let seriesKeys = hasLegend
    ? Object.keys(data[0]).filter(k => k !== 'group')
    : config.metrics.map(m => m.key);

  let baselineAvg: number | null = null;
  if (config.legend === 'aiBaseline') {
      const traditionalValues = data.map(d => Number(d['Traditional'])).filter(v => !isNaN(v));
      if (traditionalValues.length > 0) {
          baselineAvg = traditionalValues.reduce((a, b) => a + b, 0) / traditionalValues.length;
      }
      seriesKeys = seriesKeys.filter(k => k !== 'Traditional');
  }

  const getLabel = (key: string) => METRICS_FIELDS.find(f => f.id === key)?.label || key;
  const ct = config.chartType;

  // Compute SPC Limits (Average, UCL = Avg + 2σ, LCL = Avg - 2σ) for line/area charts
  let spcStats: { avg: number; std: number; ucl: number; lcl: number } | null = null;
  const targetKey = seriesKeys[0];
  if (targetKey && (ct === 'LineChart' || ct === 'AreaChart' || ct === 'ComposedChart')) {
      const values = data.map(d => Number(d[targetKey])).filter(v => !isNaN(v));
      if (values.length > 1) {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / (values.length - 1);
          const std = Math.sqrt(variance);
          const ucl = avg + 2 * std;
          const lcl = Math.max(0, avg - 2 * std);
          spcStats = { avg, std, ucl, lcl };
      }
  }

  const renderSeries = () => seriesKeys.map((key, i) => {
    const color = hasLegend ? COLORS[i % COLORS.length] : (config.metrics[i]?.color || COLORS[i % COLORS.length]);
    const label = hasLegend ? key : getLabel(key);
    const type = hasLegend ? (ct.includes('Bar') ? 'bar' : ct.includes('Area') ? 'area' : 'line') : (config.metrics[i]?.type || 'bar');
    if (type === 'bar') return <Bar key={key} dataKey={key} name={label} fill={color} radius={[4,4,0,0]} />;
    if (type === 'area') return <Area key={key} type="monotone" dataKey={key} name={label} fill={color} stroke={color} fillOpacity={0.15} />;
    return <Line key={key} type="monotone" dataKey={key} name={label} stroke={color} strokeWidth={2.5} dot={{ r: 3 }} />;
  });

  const axes = (<>
    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
    <XAxis dataKey="group" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
    <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} />
    <Legend verticalAlign="top" align="right" height={36} />
    {baselineAvg !== null && (
        <ReferenceLine y={baselineAvg} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: `Baseline (${baselineAvg.toFixed(2)})`, position: 'insideTopLeft', fill: '#3b82f6', fontSize: 12, fontWeight: 'bold' }} />
    )}
    {/* Render SPC Control Lines */}
    {spcStats !== null && (
      <>
        <ReferenceLine y={spcStats.avg} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `CL: ${spcStats.avg.toFixed(1)}`, position: 'insideTopLeft', fill: '#10b981', fontSize: 9, fontWeight: 'bold' }} />
        <ReferenceLine y={spcStats.ucl} stroke="#ef4444" strokeDasharray="2 3" strokeWidth={1.5} label={{ value: `UCL (+2σ): ${spcStats.ucl.toFixed(1)}`, position: 'insideTopRight', fill: '#ef4444', fontSize: 9, fontWeight: 'bold' }} />
        <ReferenceLine y={spcStats.lcl} stroke="#ef4444" strokeDasharray="2 3" strokeWidth={1.5} label={{ value: `LCL (-2σ): ${spcStats.lcl.toFixed(1)}`, position: 'insideBottomRight', fill: '#ef4444', fontSize: 9, fontWeight: 'bold' }} />
      </>
    )}
  </>);

  return (
    <ResponsiveContainer width="100%" height="100%">
      {ct === 'PieChart' ? (
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius="50%" outerRadius="80%" paddingAngle={4} dataKey={seriesKeys[0]} nameKey="group">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip /><Legend />
        </PieChart>
      ) : ct === 'RadarChart' ? (
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid /><PolarAngleAxis dataKey="group" tick={{ fontSize: 10, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
          {seriesKeys.map((key, i) => <Radar key={key} name={hasLegend ? key : getLabel(key)} dataKey={key} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.3} />)}
          <Legend /><Tooltip />
        </RadarChart>
      ) : ct === 'LineChart' ? (
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          {axes}{renderSeries()}
        </LineChart>
      ) : ct === 'AreaChart' ? (
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          {axes}{seriesKeys.map((key, i) => {
            const color = hasLegend ? COLORS[i % COLORS.length] : (config.metrics[i]?.color || COLORS[i % COLORS.length]);
            return <Area key={key} type="monotone" dataKey={key} name={hasLegend ? key : getLabel(key)} fill={color} stroke={color} fillOpacity={0.15} />;
          })}
        </AreaChart>
      ) : ct === 'BarChart' ? (
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          {axes}{seriesKeys.map((key, i) => {
            const color = hasLegend ? COLORS[i % COLORS.length] : (config.metrics[i]?.color || COLORS[i % COLORS.length]);
            return <Bar key={key} dataKey={key} name={hasLegend ? key : getLabel(key)} fill={color} radius={[4,4,0,0]} />;
          })}
        </BarChart>
      ) : (
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          {axes}{renderSeries()}
        </ComposedChart>
      )}
    </ResponsiveContainer>
  );
}
