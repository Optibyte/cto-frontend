'use client';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, ComposedChart, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { COLORS, METRICS_FIELDS, type PlotConfig } from './powerbi-engine';

export function PowerBIChart({ data, config }: { data: any[]; config: PlotConfig }) {
  if (!data?.length) return <div className="h-full flex items-center justify-center text-xs font-bold text-muted-foreground opacity-60">No data — adjust scope or filters</div>;

  const hasLegend = config.legend && config.legend !== 'none';
  const seriesKeys = hasLegend
    ? Object.keys(data[0]).filter(k => k !== 'group')
    : config.metrics.map(m => m.key);

  const getLabel = (key: string) => METRICS_FIELDS.find(f => f.id === key)?.label || key;
  const ct = config.chartType;

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
