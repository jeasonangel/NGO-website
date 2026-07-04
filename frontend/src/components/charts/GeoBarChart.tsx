import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import { categorical, chrome, ink } from '../../lib/chartColors';

export interface GeoBarDatum {
  code: string;
  name: string;
  value: number;
}

interface GeoBarChartProps {
  data: GeoBarDatum[];
  selectedCode: string;
  formatValue: (v: number) => string;
  entityLabel: string; // e.g. "region", "department", "district"
  averageLabel: string; // e.g. "National average", "Regional average"
  missingCount?: number;
}

const HIGHLIGHT = '#f0a020'; // brand accent — a selection state, not a series color

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as GeoBarDatum;
  return (
    <div className="bg-surface-card border border-ink-primary/10 rounded-lg shadow-sm px-3 py-2 text-sm">
      <p className="font-medium text-ink-primary">{d.name}</p>
      <p className="text-ink-secondary tabular-nums">{payload[0].value?.toLocaleString()}</p>
    </div>
  );
}

export default function GeoBarChart({
  data,
  selectedCode,
  formatValue,
  entityLabel,
  averageLabel,
  missingCount = 0,
}: GeoBarChartProps) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const avg = data.reduce((s, d) => s + d.value, 0) / (data.length || 1);
  const height = Math.max(220, Math.min(560, sorted.length * 34 + 40));

  if (sorted.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-ink-muted text-sm">
        No data available for this selection yet.
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 8, right: 56, left: 8, bottom: 8 }}>
          <CartesianGrid horizontal={false} stroke={chrome.gridline} />
          <XAxis
            type="number"
            tick={{ fill: ink.muted, fontSize: 12 }}
            axisLine={{ stroke: chrome.baseline }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ fill: ink.secondary, fontSize: 12 }}
            axisLine={{ stroke: chrome.baseline }}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
          <ReferenceLine
            x={avg}
            stroke={ink.muted}
            strokeDasharray="4 3"
            label={{
              value: `Avg ${formatValue(avg)}`,
              position: 'top',
              fill: ink.muted,
              fontSize: 11,
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {sorted.map((d) => (
              <Cell key={d.code} fill={d.code === selectedCode ? HIGHLIGHT : categorical.blue} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v) => formatValue(Number(v))}
              style={{ fill: ink.secondary, fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 text-xs text-ink-muted mt-1 px-1 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: HIGHLIGHT }} />
          Selected {entityLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0 border-t-2 border-dashed inline-block" style={{ borderColor: ink.muted }} />
          {averageLabel}
        </span>
        {missingCount > 0 && (
          <span>
            {missingCount} {missingCount === 1 ? 'entry' : 'entries'} excluded — no data yet
          </span>
        )}
      </div>
    </div>
  );
}
