import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPinned, BarChart3, ArrowRight, Droplets, GraduationCap, Zap, Wallet } from 'lucide-react';
import StatCard from '../components/StatCard';
import { api } from '../lib/api';
import { Geography } from '../types';

const PROGRAMS = [
  {
    icon: Droplets,
    title: 'Clean Water & Sanitation',
    description: 'Borehole and water-point projects prioritized using regional access-to-water data.',
  },
  {
    icon: Zap,
    title: 'Rural Electrification',
    description: 'Off-grid power projects targeted at regions with the lowest electricity access.',
  },
  {
    icon: GraduationCap,
    title: 'Education Access',
    description: 'Scholarships and school infrastructure aimed at closing literacy and enrollment gaps.',
  },
  {
    icon: Wallet,
    title: 'Livelihoods',
    description: 'Vocational training and micro-grants targeted at regions with weaker employment rates.',
  },
];

export default function Home() {
  const [regions, setRegions] = useState<Geography[]>([]);
  const [indicatorCount, setIndicatorCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [regionsRes, indicatorsRes] = await Promise.all([
          api.getRegions(),
          api.getIndicators(),
        ]);
        setRegions(regionsRes.data.data || []);
        setIndicatorCount((indicatorsRes.data.data || []).length);
      } catch {
        // Home page degrades gracefully — stats simply stay in a loading state.
      }
    })();
  }, []);

  const totalPopulation = regions.reduce((s, r) => s + (r.population || 0), 0);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ngo-primary-dark via-ngo-primary to-ngo-primary-dark text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 60% 70%, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="container-page relative py-20 md:py-28">
          <p className="eyebrow text-ngo-accent mb-3">Espoir Santé · Cameroon</p>
          <h1 className="text-4xl md:text-5xl font-bold max-w-2xl leading-tight">
            Programs built on evidence, not guesswork.
          </h1>
          <p className="mt-5 text-white/85 max-w-xl text-lg">
            We combine on-the-ground work with live national census data to decide
            where health, water and education programs are needed most across
            Cameroon's ten regions.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/data" className="btn-accent">
              Explore Census Data <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/programs" className="btn-secondary bg-white/10 border-white/25 text-white hover:bg-white/15">
              Our Programs
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section pt-12 md:pt-14">
        <div className="container-page">
          <p className="eyebrow mb-2">Cameroon at a glance</p>
          <h2 className="text-2xl font-bold text-ink-primary mb-6">
            Powered by the national census, updated live
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              label="Population Covered"
              value={totalPopulation ? totalPopulation.toLocaleString() : '—'}
              icon={Users}
              loading={!totalPopulation}
            />
            <StatCard
              label="Regions Monitored"
              value={regions.length ? String(regions.length) : '—'}
              icon={MapPinned}
              loading={!regions.length}
            />
            <StatCard
              label="Indicators Tracked"
              value={indicatorCount ? String(indicatorCount) : '—'}
              icon={BarChart3}
              loading={indicatorCount === null}
            />
          </div>
        </div>
      </section>

      {/* Programs preview */}
      <section className="section pt-0">
        <div className="container-page">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-2">
            <div>
              <p className="eyebrow mb-2">What we do</p>
              <h2 className="text-2xl font-bold text-ink-primary">Our Programs</h2>
            </div>
            <Link to="/programs" className="nav-link flex items-center gap-1">
              See all programs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROGRAMS.map((p) => (
              <div key={p.title} className="card">
                <div className="p-2.5 rounded-lg bg-ngo-primary-light w-fit mb-3">
                  <p.icon className="w-5 h-5 text-ngo-primary" />
                </div>
                <p className="font-semibold text-ink-primary mb-1">{p.title}</p>
                <p className="text-sm text-ink-secondary leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section pt-0">
        <div className="container-page">
          <div className="card bg-ngo-primary-dark border-none text-white flex flex-col md:flex-row items-center justify-between gap-6 py-10">
            <div>
              <h3 className="text-xl font-bold">Want to see the data behind our decisions?</h3>
              <p className="text-white/80 mt-1">
                Get an API key from the Census Data Portal and explore the same
                indicators our team uses.
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
