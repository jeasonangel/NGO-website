import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Zap, GraduationCap, Wallet, ArrowRight, TrendingDown } from 'lucide-react';
import { api, CENSUS_YEAR } from '../lib/api';
import { Geography } from '../types';

interface ProgramDef {
  icon: typeof Droplets;
  title: string;
  description: string;
  indicatorCode: string;
  indicatorLabel: string;
}

const PROGRAM_DEFS: ProgramDef[] = [
  {
    icon: Droplets,
    title: 'Clean Water & Sanitation',
    description:
      'We fund boreholes and community water points, starting with the regions where access to clean water is lowest.',
    indicatorCode: 'WATER_ACCESS',
    indicatorLabel: 'Access to Clean Water',
  },
  {
    icon: Zap,
    title: 'Rural Electrification',
    description:
      'Off-grid and mini-grid power projects for the villages and regions furthest from the national electricity network.',
    indicatorCode: 'ELECTRICITY_ACCESS',
    indicatorLabel: 'Access to Electricity',
  },
  {
    icon: GraduationCap,
    title: 'Education Access',
    description:
      'Scholarships, school infrastructure and teacher support aimed at closing regional literacy and enrollment gaps.',
    indicatorCode: 'LIT_RATE',
    indicatorLabel: 'Literacy Rate',
  },
  {
    icon: Wallet,
    title: 'Livelihoods & Employment',
    description:
      'Vocational training and micro-grants for communities in regions with the weakest employment rates.',
    indicatorCode: 'EMPLOYMENT',
    indicatorLabel: 'Employment Rate',
  },
];

interface ProgramStats {
  national: number;
  priorityRegion: string;
  priorityValue: number;
}

export default function Programs() {
  const [regions, setRegions] = useState<Geography[]>([]);
  const [stats, setStats] = useState<Record<string, ProgramStats>>({});

  useEffect(() => {
    (async () => {
      const regionsRes = await api.getRegions().catch(() => null);
      const regionList = regionsRes?.data.data || [];
      setRegions(regionList);
      if (regionList.length === 0) return;

      await Promise.all(
        PROGRAM_DEFS.map(async (program) => {
          try {
            const values = (
              await api.getValues(program.indicatorCode, regionList.map((r) => r.code), CENSUS_YEAR)
            ).data.data;
            const results = regionList
              .map((r) => ({ name: r.name, value: values.find((v) => v.code === r.code)?.value ?? null }))
              .filter((r): r is { name: string; value: number } => r.value !== null);
            if (results.length === 0) return;
            const national = results.reduce((s, d) => s + d.value, 0) / results.length;
            const priority = results.reduce((a, b) => (b.value < a.value ? b : a));
            setStats((prev) => ({
              ...prev,
              [program.indicatorCode]: { national, priorityRegion: priority.name, priorityValue: priority.value },
            }));
          } catch {
            // leave this program's stats unset — card falls back to a loading dash
          }
        })
      );
    })();
  }, []);

  return (
    <div>
      <section className="bg-white border-b border-ink-primary/10">
        <div className="container-page py-14">
          <p className="eyebrow mb-2">Our Programs</p>
          <h1 className="text-3xl md:text-4xl font-bold text-ink-primary max-w-2xl">
            Four programs, prioritized by the numbers.
          </h1>
          <p className="mt-4 text-ink-secondary max-w-2xl leading-relaxed">
            Each program below is paired with the live regional indicator we use to
            decide where it goes next — pulled straight from the Cameroon Census
            Data Portal's public dataset.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid md:grid-cols-2 gap-6">
          {PROGRAM_DEFS.map((program) => {
            const s = stats[program.indicatorCode];
            return (
              <div key={program.title} className="card">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="p-2.5 rounded-lg bg-ngo-primary-light w-fit">
                    <program.icon className="w-5 h-5 text-ngo-primary" />
                  </div>
                  {s && (
                    <span className="badge bg-black/5 text-ink-secondary tabular-nums" title={program.indicatorLabel}>
                      Nat'l avg {program.indicatorLabel}: {s.national.toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="font-semibold text-ink-primary mb-1">{program.title}</p>
                <p className="text-sm text-ink-secondary leading-relaxed mb-4">{program.description}</p>

                <div className="border-t border-ink-primary/10 pt-3">
                  {s ? (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingDown className="w-4 h-4 text-ngo-accent-dark shrink-0" />
                      <span className="text-ink-secondary">
                        Current priority region:{' '}
                        <span className="font-semibold text-ink-primary">{s.priorityRegion}</span>{' '}
                        <span className="tabular-nums">({s.priorityValue.toFixed(1)}%)</span>
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-ink-muted">Loading regional priority…</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-page">
          <div className="card bg-ngo-primary-dark border-none text-white flex flex-col md:flex-row items-center justify-between gap-6 py-10">
            <div>
              <h3 className="text-xl font-bold">See the full regional breakdown</h3>
              <p className="text-white/80 mt-1">
                Every indicator behind these programs, across all {regions.length || 10} regions.
              </p>
            </div>
            <Link to="/data" className="btn-accent whitespace-nowrap">
              Open Data Explorer <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
