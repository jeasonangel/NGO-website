import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { categorical, ink } from '../../lib/chartColors';

interface PopulationBreakdownProps {
  regionName: string;
  male: number;
  female: number;
  urban: number;
  rural: number;
}

const SLOT_1 = categorical.blue;
const SLOT_2 = categorical.aqua;

function Donut({
  title,
  segments,
}: {
  title: string;
  segments: { name: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs text-ink-muted text-center mb-1">{title}</p>
      <div className="relative h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={2}
              stroke="none"
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              labelLine={{ stroke: ink.muted, strokeWidth: 1 }}
            >
              {segments.map((s) => (
                <Cell key={s.name} fill={s.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [Number(value).toLocaleString(), name]}
              contentStyle={{
                background: '#fcfcfb',
                border: '1px solid rgba(11,11,11,0.10)',
                borderRadius: 8,
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-sm font-bold text-ink-primary tabular-nums">
              {total.toLocaleString()}
            </p>
            <p className="text-[10px] text-ink-muted">total</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PopulationBreakdown({ regionName, male, female, urban, rural }: PopulationBreakdownProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink-primary mb-3">
        Population Snapshot — {regionName}
      </p>
      <div className="flex gap-2">
        <Donut
          title="By Gender"
          segments={[
            { name: 'Male', value: male, color: SLOT_1 },
            { name: 'Female', value: female, color: SLOT_2 },
          ]}
        />
        <Donut
          title="By Settlement"
          segments={[
            { name: 'Urban', value: urban, color: SLOT_1 },
            { name: 'Rural', value: rural, color: SLOT_2 },
          ]}
        />
      </div>
    </div>
  );
}
