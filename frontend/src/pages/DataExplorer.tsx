import { useState, useEffect, useMemo } from 'react';
import { MapPin, TrendingUp, TrendingDown, Gauge, Home as HomeIcon } from 'lucide-react';
import StatCard from '../components/StatCard';
import GeoBarChart, { GeoBarDatum } from '../components/charts/GeoBarChart';
import PopulationBreakdown from '../components/charts/PopulationBreakdown';
import { api, CENSUS_YEAR, GeoLevel, PopulationBreakdownData, Village } from '../lib/api';
import { Geography, Indicator } from '../types';

// Shape shared by everything that can appear in the level list/chart/table —
// regions, departments and districts (Geography) as well as villages
// (Village), which only carry code/name/population.
type Entity = { code: string; name: string; population?: number };

const LEVELS: { value: GeoLevel; label: string; averageLabel: string }[] = [
  { value: 'region', label: 'Regions', averageLabel: 'National average' },
  { value: 'department', label: 'Departments', averageLabel: 'Regional average' },
  { value: 'district', label: 'Districts', averageLabel: 'Departmental average' },
  { value: 'village', label: 'Villages', averageLabel: 'District average' },
];

export default function DataExplorer() {
  const [regions, setRegions] = useState<Geography[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [indicatorsError, setIndicatorsError] = useState<string | null>(null);

  const [level, setLevel] = useState<GeoLevel>('region');
  const [regionCode, setRegionCode] = useState('CE');
  const [departments, setDepartments] = useState<Geography[]>([]);
  const [departmentCode, setDepartmentCode] = useState<string>('');
  const [districts, setDistricts] = useState<Geography[]>([]);
  const [districtCode, setDistrictCode] = useState<string>('');
  const [villages, setVillages] = useState<Village[]>([]);
  const [villageCode, setVillageCode] = useState<string>('');

  const [selectedIndicator, setSelectedIndicator] = useState('POP_TOT');

  const [rawValues, setRawValues] = useState<{ code: string; value: number | null }[]>([]);
  const [population, setPopulation] = useState<PopulationBreakdownData | null>(null);
  const [populationLoading, setPopulationLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Regions + indicators — loaded once from this site's own backend.
  useEffect(() => {
    (async () => {
      try {
        const [regionsRes, indicatorsRes] = await Promise.all([api.getRegions(), api.getIndicators()]);
        setRegions(regionsRes.data.data || []);
        setIndicators(indicatorsRes.data.data || []);
      } catch {
        setIndicatorsError('Could not reach the site backend. Is it running?');
      }
    })();
  }, []);

  // Departments for the selected region — needed whenever the level drills
  // past "region", and reloaded any time the parent region changes.
  useEffect(() => {
    if (level === 'region') return;
    let cancelled = false;
    api
      .getDepartments(regionCode)
      .then((res) => {
        if (cancelled) return;
        const list = res.data.data || [];
        setDepartments(list);
        setDepartmentCode((prev) => (list.some((d) => d.code === prev) ? prev : list[0]?.code || ''));
      })
      .catch(() => !cancelled && setDepartments([]));
    return () => {
      cancelled = true;
    };
  }, [level, regionCode]);

  // Districts for the selected department — needed at district level and
  // village level (villages drill down from a district).
  useEffect(() => {
    if ((level !== 'district' && level !== 'village') || !departmentCode) return;
    let cancelled = false;
    api
      .getDistricts(departmentCode)
      .then((res) => {
        if (cancelled) return;
        const list = res.data.data || [];
        setDistricts(list);
        setDistrictCode((prev) => (list.some((d) => d.code === prev) ? prev : list[0]?.code || ''));
      })
      .catch(() => !cancelled && setDistricts([]));
    return () => {
      cancelled = true;
    };
  }, [level, departmentCode]);

  // Villages in the focused district. Shown as an informational list at
  // district level, and drillable (chartable by indicator) at village level
  // now that the upstream API returns a `code` for each village.
  useEffect(() => {
    if ((level !== 'district' && level !== 'village') || !districtCode) {
      setVillages([]);
      return;
    }
    let cancelled = false;
    api
      .getVillages(districtCode)
      .then((res) => {
        if (cancelled) return;
        const list = res.data.data || [];
        setVillages(list);
        setVillageCode((prev) => (list.some((v) => v.code === prev) ? prev : list[0]?.code || ''));
      })
      .catch(() => !cancelled && setVillages([]));
    return () => {
      cancelled = true;
    };
  }, [level, districtCode]);

  // The list of entities being compared at the current level, and which
  // one is "focused" (highlighted, shown in the stat cards & population
  // snapshot).
  const items: Entity[] = useMemo(() => {
    if (level === 'region') return regions;
    if (level === 'department') return departments;
    if (level === 'district') return districts;
    return villages;
  }, [level, regions, departments, districts, villages]);

  const focusedCode =
    level === 'region'
      ? regionCode
      : level === 'department'
      ? departmentCode
      : level === 'district'
      ? districtCode
      : villageCode;

  // Indicator value for every entity at the current level. An empty `items`
  // list is a valid state now (e.g. a district with no villages yet, or a
  // freshly-created department with no districts) — it should resolve to
  // "no data", not leave the view stuck on a loading spinner.
  useEffect(() => {
    if (items.length === 0) {
      setLoading(false);
      setError(null);
      setRawValues([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .getValues(selectedIndicator, items.map((i) => i.code), CENSUS_YEAR)
      .then((res) => {
        if (!cancelled) setRawValues(res.data.data || []);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load census data. Please try again.');
          setRawValues([]);
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // items is recomputed from level/regions/departments/districts/villages,
    // so its membership (not identity) is what should trigger a refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndicator, items.map((i) => i.code).join(',')]);

  // Population split for the focused entity (works at any level). No
  // focused entity (e.g. a district with no villages yet) is "no data",
  // not a stuck spinner.
  useEffect(() => {
    if (!focusedCode) {
      setPopulation(null);
      setPopulationLoading(false);
      return;
    }
    let cancelled = false;
    setPopulationLoading(true);
    api
      .getPopulation(focusedCode, CENSUS_YEAR)
      .then((res) => !cancelled && setPopulation(res.data.data))
      .catch(() => !cancelled && setPopulation(null))
      .finally(() => !cancelled && setPopulationLoading(false));
    return () => {
      cancelled = true;
    };
  }, [focusedCode]);

  const currentIndicator = indicators.find((i) => i.code === selectedIndicator);
  const unit = currentIndicator?.unit || '';
  const formatValue = (v: number) => (unit === '%' ? `${v.toFixed(1)}%` : Math.round(v).toLocaleString());

  const levelDef = LEVELS.find((l) => l.value === level)!;
  const entityLabel = level; // "region" | "department" | "district" — already singular

  const chartData: GeoBarDatum[] = items
    .map((i) => ({ code: i.code, name: i.name, value: rawValues.find((v) => v.code === i.code)?.value ?? null }))
    .filter((d): d is GeoBarDatum => d.value !== null);
  const missingCount = items.length - chartData.length;

  const focusedName = items.find((i) => i.code === focusedCode)?.name || focusedCode;
  const focusedValue = chartData.find((d) => d.code === focusedCode)?.value;
  const avg = chartData.length ? chartData.reduce((s, d) => s + d.value, 0) / chartData.length : null;
  const highest = chartData.length ? chartData.reduce((a, b) => (b.value > a.value ? b : a)) : null;
  const lowest = chartData.length ? chartData.reduce((a, b) => (b.value < a.value ? b : a)) : null;

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <p className="eyebrow mb-2">Census Data Explorer</p>
        <h1 className="text-3xl font-bold text-ink-primary">Explore Cameroon Census Data</h1>
        <p className="text-ink-secondary mt-2 max-w-2xl">
          Live demographic, education, housing and economic indicators, drillable
          from region all the way down to village — the same data our team uses
          to plan where our programs go next.
        </p>
      </div>

      {(error || indicatorsError) && (
        <div className="card mb-6 border-red-200 bg-red-50 text-red-700 text-sm">
          {error || indicatorsError}
        </div>
      )}

      {/* Level tabs */}
      <div className="flex gap-2 mb-6">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            onClick={() => setLevel(l.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              level === l.value
                ? 'bg-ngo-primary text-white border-ngo-primary'
                : 'bg-white text-ink-secondary border-ink-primary/15 hover:bg-black/5'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="label">Region</label>
          <select className="input" value={regionCode} onChange={(e) => setRegionCode(e.target.value)}>
            {regions.map((r) => (
              <option key={r.code} value={r.code}>{r.name}</option>
            ))}
          </select>
        </div>

        {(level === 'department' || level === 'district' || level === 'village') && (
          <div>
            <label className="label">Department</label>
            <select className="input" value={departmentCode} onChange={(e) => setDepartmentCode(e.target.value)}>
              {departments.map((d) => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

        {(level === 'district' || level === 'village') && (
          <div>
            <label className="label">District</label>
            <select className="input" value={districtCode} onChange={(e) => setDistrictCode(e.target.value)}>
              {districts.map((d) => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

        {level === 'village' && (
          <div>
            <label className="label">Village</label>
            <select className="input" value={villageCode} onChange={(e) => setVillageCode(e.target.value)}>
              {villages.map((v) => (
                <option key={v.code} value={v.code}>{v.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label">Indicator</label>
          <select
            className="input"
            value={selectedIndicator}
            onChange={(e) => setSelectedIndicator(e.target.value)}
          >
            {indicators.map((i) => (
              <option key={i.code} value={i.code}>
                {i.name} ({i.unit})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Census Year</label>
          <div className="input bg-black/5 text-ink-muted cursor-default">{CENSUS_YEAR}</div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label={focusedName}
          value={loading ? '…' : focusedValue !== undefined ? formatValue(focusedValue) : 'No data'}
          icon={MapPin}
          loading={loading}
        />
        <StatCard
          label={levelDef.averageLabel}
          value={loading ? '…' : avg !== null ? formatValue(avg) : 'No data'}
          icon={Gauge}
          loading={loading}
        />
        <StatCard
          label={`Highest ${entityLabel}`}
          value={loading ? '…' : highest ? highest.name : 'No data'}
          sub={highest ? formatValue(highest.value) : undefined}
          icon={TrendingUp}
          loading={loading}
        />
        <StatCard
          label={`Lowest ${entityLabel}`}
          value={loading ? '…' : lowest ? lowest.name : 'No data'}
          sub={lowest ? formatValue(lowest.value) : undefined}
          icon={TrendingDown}
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="card lg:col-span-2">
          <p className="text-sm font-semibold text-ink-primary mb-1">
            {currentIndicator?.name || selectedIndicator} by {levelDef.label.replace(/s$/, '')}
          </p>
          <p className="text-xs text-ink-muted mb-3">
            {focusedName} highlighted against the {levelDef.averageLabel.toLowerCase()}.
          </p>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-ink-muted text-sm">
              Loading chart…
            </div>
          ) : (
            <GeoBarChart
              data={chartData}
              selectedCode={focusedCode}
              formatValue={formatValue}
              entityLabel={entityLabel}
              averageLabel={levelDef.averageLabel}
              missingCount={missingCount}
            />
          )}
        </div>
        <div className="card flex flex-col gap-4">
          {population ? (
            <PopulationBreakdown
              regionName={focusedName}
              male={population.POP_MALE}
              female={population.POP_FEMALE}
              urban={population.POP_URBAN}
              rural={population.POP_RURAL}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-ink-muted text-sm min-h-[200px]">
              {populationLoading ? 'Loading snapshot…' : 'No population data available.'}
            </div>
          )}

          {level === 'district' && villages.length > 0 && (
            <div className="border-t border-ink-primary/10 pt-3">
              <p className="text-xs font-semibold text-ink-primary mb-2 flex items-center gap-1.5">
                <HomeIcon className="w-3.5 h-3.5" /> Villages in {focusedName}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {villages.map((v) => (
                  <button
                    key={v.code}
                    onClick={() => {
                      setVillageCode(v.code);
                      setLevel('village');
                    }}
                    className="badge bg-black/5 text-ink-secondary hover:bg-black/10 transition-colors"
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/[0.03]">
              <tr>
                <th className="text-left p-3 text-ink-muted text-xs uppercase font-medium">
                  {levelDef.label.replace(/s$/, '')}
                </th>
                <th className="text-right p-3 text-ink-muted text-xs uppercase font-medium">
                  {currentIndicator?.name || selectedIndicator}
                </th>
                <th className="text-left p-3 text-ink-muted text-xs uppercase font-medium">Unit</th>
                <th className="text-left p-3 text-ink-muted text-xs uppercase font-medium">Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-primary/5">
              {items.map((item) => {
                const v = rawValues.find((r) => r.code === item.code)?.value ?? null;
                return (
                  <tr
                    key={item.code}
                    className={`hover:bg-black/[0.02] transition-colors ${item.code === focusedCode ? 'bg-ngo-primary-light/40' : ''}`}
                  >
                    <td className="p-3 font-medium text-ink-primary">{item.name}</td>
                    <td className="p-3 text-right font-mono tabular-nums text-ink-primary">
                      {v === null ? <span className="text-ink-muted italic">No data</span> : formatValue(v)}
                    </td>
                    <td className="p-3 text-ink-muted text-xs">{unit}</td>
                    <td className="p-3 text-ink-muted">{CENSUS_YEAR}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-ink-primary/5 flex justify-between items-center text-xs text-ink-muted">
          <span>Showing {items.length} {levelDef.label.toLowerCase()}</span>
          <span className="text-ngo-primary">Powered by Cameroon Census Data Portal</span>
        </div>
      </div>
    </div>
  );
}
