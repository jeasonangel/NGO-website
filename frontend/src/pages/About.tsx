import { Target, Eye, HandHeart, Database, Users2 } from 'lucide-react';

const VALUES = [
  {
    icon: Database,
    title: 'Evidence-led',
    description: 'Every program decision starts with the latest regional census indicators, not assumptions.',
  },
  {
    icon: HandHeart,
    title: 'Community-first',
    description: 'Programs are designed with the communities they serve, not imposed on them.',
  },
  {
    icon: Users2,
    title: 'Transparent',
    description: 'Our funders and partners can see the exact data behind every regional priority we set.',
  },
];

const TEAM = [
  { name: 'Amina Fouda', role: 'Executive Director' },
  { name: 'Paul Etoundi', role: 'Head of Programs' },
  { name: 'Grace Ngu', role: 'Data & Monitoring Lead' },
  { name: 'Samuel Biya', role: 'Field Operations Manager' },
];

export default function About() {
  return (
    <div>
      <section className="bg-white border-b border-ink-primary/10">
        <div className="container-page py-14">
          <p className="eyebrow mb-2">About Us</p>
          <h1 className="text-3xl md:text-4xl font-bold text-ink-primary max-w-2xl">
            A Cameroonian NGO putting national data to work for local communities.
          </h1>
          <p className="mt-4 text-ink-secondary max-w-2xl leading-relaxed">
            Espoir Santé was founded to close the gap between where help is sent and
            where it's needed most. We pair fieldwork with the Cameroon Census Data
            Portal's regional indicators so every clinic, borehole and classroom we
            fund goes where the numbers say it matters most.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid md:grid-cols-2 gap-8">
          <div className="card">
            <div className="p-2.5 rounded-lg bg-ngo-primary-light w-fit mb-3">
              <Target className="w-5 h-5 text-ngo-primary" />
            </div>
            <p className="font-semibold text-ink-primary mb-1">Our Mission</p>
            <p className="text-sm text-ink-secondary leading-relaxed">
              To improve health, education and living standards in Cameroon's
              under-served regions by directing resources using transparent,
              up-to-date census data.
            </p>
          </div>
          <div className="card">
            <div className="p-2.5 rounded-lg bg-ngo-primary-light w-fit mb-3">
              <Eye className="w-5 h-5 text-ngo-primary" />
            </div>
            <p className="font-semibold text-ink-primary mb-1">Our Vision</p>
            <p className="text-sm text-ink-secondary leading-relaxed">
              A Cameroon where every region has equitable access to clean water,
              quality education and basic healthcare — measured, not assumed.
            </p>
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-page">
          <p className="eyebrow mb-2">What guides us</p>
          <h2 className="text-2xl font-bold text-ink-primary mb-6">Our Values</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="card">
                <div className="p-2.5 rounded-lg bg-ngo-primary-light w-fit mb-3">
                  <v.icon className="w-5 h-5 text-ngo-primary" />
                </div>
                <p className="font-semibold text-ink-primary mb-1">{v.title}</p>
                <p className="text-sm text-ink-secondary leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-page">
          <p className="eyebrow mb-2">Our people</p>
          <h2 className="text-2xl font-bold text-ink-primary mb-6">Leadership Team</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM.map((t) => (
              <div key={t.name} className="card text-center">
                <div className="w-14 h-14 rounded-full bg-ngo-primary-light text-ngo-primary font-bold flex items-center justify-center mx-auto mb-3">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <p className="font-semibold text-ink-primary">{t.name}</p>
                <p className="text-sm text-ink-muted">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
