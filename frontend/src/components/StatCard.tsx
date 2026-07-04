import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  sub?: string;
  loading?: boolean;
}

export default function StatCard({ label, value, icon: Icon, sub, loading }: StatCardProps) {
  return (
    <div className="card p-5 flex items-start gap-3">
      <div className="p-2.5 rounded-lg bg-ngo-primary-light shrink-0">
        <Icon className="w-5 h-5 text-ngo-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="text-xl font-bold text-ink-primary tabular-nums truncate" title={value}>
          {loading ? '—' : value}
        </p>
        {sub && <p className="text-xs text-ink-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
