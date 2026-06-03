'use client';
import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  ComposedChart,
  PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ReferenceArea,
} from 'recharts';
import { COLORS, METRICS_FIELDS, type PlotConfig } from './powerbi-engine';

// ─── Transformation zone label (rendered inside ReferenceArea) ────────────────
function ZoneLabel({ viewBox, text, color }: any) {
  if (!viewBox) return null;
  const { x, y, width, height } = viewBox;
  const cx = x + width / 2;
  const cy = y + Math.min(height * 0.15, 28);
  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      fill={color}
      fontSize={9}
      fontWeight="800"
      letterSpacing="0.06em"
      style={{ textTransform: 'uppercase', opacity: 0.9 }}
    >
      {text}
    </text>
  );
}

export function PowerBIChart({
  data,
  config,
  transformationSprints,
}: {
  data: any[];
  config: PlotConfig;
  transformationSprints?: { startLabel: string | null; endLabel: string | null };
}) {
  if (!data?.length)
    return (
      <div className="h-full flex items-center justify-center text-xs font-bold text-muted-foreground opacity-60">
        No data — adjust scope or filters
      </div>
    );

  const hasLegend = config.legend && config.legend !== 'none';
  
  // 1. Gather all series keys across all data points to avoid missing keys that start in later sprints
  let seriesKeys = hasLegend
    ? Array.from(new Set(data.flatMap((d) => Object.keys(d)))).filter((k) => k !== 'group')
    : config.metrics.map((m) => m.key);

  let baselineAvg: number | null = null;
  if (config.legend === 'aiBaseline') {
    const traditionalValues = data
      .map((d) => Number(d['Traditional']))
      .filter((v) => !isNaN(v));
    if (traditionalValues.length > 0) {
      baselineAvg =
        traditionalValues.reduce((a, b) => a + b, 0) / traditionalValues.length;
    }
    // Filter out control group keys that shouldn't render as separate lines
    seriesKeys = seriesKeys.filter(
      (k) => k !== 'Traditional' && k !== 'Non-Transformed' && k !== 'Unknown'
    );

    // Sort series keys to match the chronological timeline: Before -> During -> After
    const order = [
      'Before Transformation',
      'During Transformation',
      'After Transformation',
    ];
    seriesKeys.sort((a, b) => {
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }

  // 2. Connect the phase lines at boundaries to avoid visual gaps in the line chart
  let processedData = data;
  if (config.legend === 'aiBaseline') {
    processedData = data.map((d, index) => {
      const current = { ...d };
      if (current['Before Transformation'] !== undefined && index < data.length - 1) {
        const next = data[index + 1];
        if (next['During Transformation'] !== undefined) {
          current['During Transformation'] = current['Before Transformation'];
        }
      }
      if (current['During Transformation'] !== undefined && index < data.length - 1) {
        const next = data[index + 1];
        if (next['After Transformation'] !== undefined) {
          current['After Transformation'] = current['During Transformation'];
        }
      }
      return current;
    });
  }

  // Define semantic colors for transformation phases to match the premium aesthetics
  const getSeriesColor = (key: string, index: number) => {
    if (config.legend === 'aiBaseline') {
      if (key === 'Before Transformation') return '#8b5cf6'; // Purple
      if (key === 'During Transformation') return '#f59e0b'; // Amber
      if (key === 'After Transformation') return '#10b981'; // Emerald
      if (key === 'Non-Transformed') return '#3b82f6'; // Blue
      if (key === 'Traditional') return '#64748b';
    }
    return hasLegend
      ? COLORS[index % COLORS.length]
      : config.metrics[index]?.color || COLORS[index % COLORS.length];
  };

  const getLabel = (key: string) =>
    METRICS_FIELDS.find((f) => f.id === key)?.label || key;
  const ct = config.chartType;

  // Compute SPC Limits (Average, UCL = Avg + 2σ, LCL = Avg − 2σ) for line/area charts
  let spcStats: { avg: number; std: number; ucl: number; lcl: number } | null = null;
  const targetKey = seriesKeys[0];
  if (targetKey && (ct === 'LineChart' || ct === 'AreaChart' || ct === 'ComposedChart')) {
    const values = processedData.map((d) => Number(d[targetKey])).filter((v) => !isNaN(v));
    if (values.length > 1) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const variance =
        values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / (values.length - 1);
      const std = Math.sqrt(variance);
      const ucl = avg + 2 * std;
      const lcl = Math.max(0, avg - 2 * std);
      spcStats = { avg, std, ucl, lcl };
    }
  }

  const renderSeries = () =>
    seriesKeys.map((key, i) => {
      const color = getSeriesColor(key, i);
      const label = hasLegend ? key : getLabel(key);
      const type = hasLegend
        ? ct.includes('Bar')
          ? 'bar'
          : ct.includes('Area')
          ? 'area'
          : 'line'
        : config.metrics[i]?.type || 'bar';
      if (type === 'bar')
        return (
          <Bar key={key} dataKey={key} name={label} fill={color} radius={[4, 4, 0, 0]} />
        );
      if (type === 'area')
        return (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            name={label}
            fill={color}
            stroke={color}
            fillOpacity={0.15}
          />
        );
      return (
        <Line
          key={key}
          type="monotone"
          dataKey={key}
          name={label}
          stroke={color}
          strokeWidth={3}
          activeDot={{ r: 6, strokeWidth: 0 }}
          dot={{ r: 4, stroke: '#fff', strokeWidth: 1.5, fill: color }}
        />
      );
    });

  // ── Shared axes elements ────────────────────────────────────────────────────
  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.08} />
      <XAxis
        dataKey="group"
        axisLine={false}
        tickLine={false}
        tick={{ fontSize: 10, fontWeight: 700 }}
        dy={10}
      />
      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
      <Tooltip
        contentStyle={{
          borderRadius: 16,
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      />
      
      {/* SPC Control Lines */}
      {spcStats !== null && (
        <ReferenceLine
          y={spcStats.avg}
          stroke="#3b82f6"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{
            value: `Baseline: ${spcStats.avg.toFixed(1)}`,
            position: 'insideTopLeft',
            fill: '#3b82f6',
            fontSize: 9,
            fontWeight: 'bold',
          }}
        />
      )}
    </>
  );

  // ── Transformation phase overlays (vertical lines + zone shading) ───────────
  // Only rendered for LineChart with aiBaseline legend when transformation sprint
  // labels are supplied.
  const showTransformationZones =
    (ct === 'LineChart' || ct === 'AreaChart' || ct === 'ComposedChart') &&
    config.legend === 'aiBaseline' &&
    !!transformationSprints?.startLabel;

  const firstSprintLabel = processedData[0]?.group ?? null;
  const lastSprintLabel = processedData[processedData.length - 1]?.group ?? null;
  const tStart = transformationSprints?.startLabel ?? null;
  const tEnd = transformationSprints?.endLabel ?? null;

  const transformationOverlays = showTransformationZones ? (
    <>
      {/* ── Zone 1: Before Transformation ──────────────────────────── */}
      {firstSprintLabel && tStart && firstSprintLabel !== tStart && (
        <ReferenceArea
          x1={firstSprintLabel}
          x2={tStart}
          fill="#3b82f6"
          fillOpacity={0.07}
          label={
            <ZoneLabel text="Before Transformation" color="#3b82f6" />
          }
        />
      )}

      {/* ── Vertical line: Transformation Starts ───────────────────── */}
      {tStart && (
        <ReferenceLine
          x={tStart}
          stroke="#8b5cf6"
          strokeWidth={2}
          label={{
            value: '▼ Starts',
            position: 'insideTopRight',
            fill: '#8b5cf6',
            fontSize: 9,
            fontWeight: 'bold',
          }}
        />
      )}

      {/* ── Zone 2: During Transformation ──────────────────────────── */}
      {tStart && tEnd && tStart !== tEnd && (
        <ReferenceArea
          x1={tStart}
          x2={tEnd}
          fill="#8b5cf6"
          fillOpacity={0.07}
          label={
            <ZoneLabel text="During Transformation" color="#8b5cf6" />
          }
        />
      )}

      {/* ── Vertical line: Transformation Ends ─────────────────────── */}
      {tEnd && tEnd !== tStart && (
        <ReferenceLine
          x={tEnd}
          stroke="#10b981"
          strokeWidth={2}
          label={{
            value: '▼ Ends',
            position: 'insideTopRight',
            fill: '#10b981',
            fontSize: 9,
            fontWeight: 'bold',
          }}
        />
      )}

      {/* ── Zone 3: After Transformation ───────────────────────────── */}
      {tEnd && lastSprintLabel && tEnd !== lastSprintLabel && (
        <ReferenceArea
          x1={tEnd}
          x2={lastSprintLabel}
          fill="#10b981"
          fillOpacity={0.07}
          label={
            <ZoneLabel text="After Transformation" color="#10b981" />
          }
        />
      )}

      {/* If only start is known (no end date yet), shade after start as During */}
      {tStart && !tEnd && lastSprintLabel && tStart !== lastSprintLabel && (
        <ReferenceArea
          x1={tStart}
          x2={lastSprintLabel}
          fill="#8b5cf6"
          fillOpacity={0.07}
          label={
            <ZoneLabel text="During Transformation" color="#8b5cf6" />
          }
        />
      )}
    </>
  ) : null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      {ct === 'PieChart' ? (
        <PieChart>
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            innerRadius="50%"
            outerRadius="80%"
            paddingAngle={4}
            dataKey={seriesKeys[0]}
            nameKey="group"
          >
            {processedData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      ) : ct === 'RadarChart' ? (
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={processedData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="group" tick={{ fontSize: 10, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
          {seriesKeys.map((key, i) => (
            <Radar
              key={key}
              name={hasLegend ? key : getLabel(key)}
              dataKey={key}
              stroke={getSeriesColor(key, i)}
              fill={getSeriesColor(key, i)}
              fillOpacity={0.3}
            />
          ))}
          <Legend />
          <Tooltip />
        </RadarChart>
      ) : ct === 'LineChart' ? (
        <LineChart data={processedData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>{hasLegend && config.legend !== 'aiBaseline' && <Legend verticalAlign="top" align="right" height={28} />}
          {transformationOverlays}
          {axes}
          {renderSeries()}
        </LineChart>
      ) : ct === 'AreaChart' ? (
        <AreaChart data={processedData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>{hasLegend && config.legend !== 'aiBaseline' && <Legend verticalAlign="top" align="right" height={28} />} 
          {transformationOverlays}
          {axes}
          {seriesKeys.map((key, i) => {
            const color = getSeriesColor(key, i);
            return (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={hasLegend ? key : getLabel(key)}
                fill={color}
                stroke={color}
                strokeWidth={2.5}
                fillOpacity={0.18}
              />
            );
          })}
        </AreaChart>
      ) : ct === 'BarChart' ? (
        <BarChart data={processedData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>{hasLegend && config.legend !== 'aiBaseline' && <Legend verticalAlign="top" align="right" height={28} />} 
          {axes}
          {seriesKeys.map((key, i) => {
            const color = getSeriesColor(key, i);
            return (
              <Bar
                key={key}
                dataKey={key}
                name={hasLegend ? key : getLabel(key)}
                fill={color}
                radius={[4, 4, 0, 0]}
              />
            );
          })}
        </BarChart>
      ) : (
        <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>{hasLegend && config.legend !== 'aiBaseline' && <Legend verticalAlign="top" align="right" height={28} />} 
          {transformationOverlays}
          {axes}
          {renderSeries()}
        </ComposedChart>
      )}
    </ResponsiveContainer>
  );
}
