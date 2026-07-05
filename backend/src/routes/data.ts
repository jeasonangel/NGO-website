import { Router } from 'express';
import { censusClient } from '../censusClient';
import { config } from '../config';

const router = Router();

interface UpstreamGeography {
  code: string;
  name: string;
  level?: string;
  population?: number;
  area_km2?: number;
}

interface UpstreamIndicator {
  code: string;
  name: string;
  unit: string;
  category: string;
}

interface UpstreamDataRow {
  geography_code: string;
  geography_name: string;
  value: string | number;
}

const POP_CODES = ['POP_MALE', 'POP_FEMALE', 'POP_URBAN', 'POP_RURAL'] as const;

function yearParam(q: unknown): number {
  const n = Number(q);
  return Number.isFinite(n) && n > 0 ? n : config.censusYear;
}

async function fetchValue(geography: string, indicator: string, year: number): Promise<number | null> {
  const { data } = await censusClient.get<{ data: UpstreamDataRow[] }>('/protected/data', {
    params: { geography, indicator, year },
  });
  const raw = data.data?.[0]?.value;
  return raw === undefined ? null : Number(raw);
}

// ============================================================
// GET /api/regions — top of the geography hierarchy.
// (Application 1 treats geography metadata as public; only the
// indicator *values* below require the API key held in this
// backend's .env.)
// ============================================================
router.get('/regions', async (_req, res, next) => {
  try {
    const { data } = await censusClient.get<{ data: UpstreamGeography[] }>('/public/regions');
    res.json({ data: data.data });
  } catch (e) {
    next(e);
  }
});

// ============================================================
// GET /api/geo/regions/:code/departments
// GET /api/geo/departments/:code/districts
// GET /api/geo/districts/:code/villages
// Drill-down through the geography hierarchy.
// ============================================================
router.get('/geo/regions/:code/departments', async (req, res, next) => {
  try {
    const { data } = await censusClient.get<{ data: UpstreamGeography[] }>(
      `/protected/regions/${req.params.code}/departments`
    );
    res.json({ data: data.data });
  } catch (e) {
    next(e);
  }
});

router.get('/geo/departments/:code/districts', async (req, res, next) => {
  try {
    const { data } = await censusClient.get<{ data: UpstreamGeography[] }>(
      `/protected/departments/${req.params.code}/districts`
    );
    res.json({ data: data.data });
  } catch (e) {
    next(e);
  }
});

router.get('/geo/districts/:code/villages', async (req, res, next) => {
  try {
    // Application 1's public villages endpoint only returns names (no
    // code), so villages are informational here — not chartable by
    // indicator the way regions/departments/districts are.
    const { data } = await censusClient.get<{ data: { name: string }[] }>(
      `/protected/districts/${req.params.code}/villages`
    );
    res.json({ data: data.data });
  } catch (e) {
    next(e);
  }
});

// ============================================================
// GET /api/indicators
// ============================================================
router.get('/indicators', async (_req, res, next) => {
  try {
    const { data } = await censusClient.get<{ data: UpstreamIndicator[] }>('/public/indicators');
    res.json({ data: data.data });
  } catch (e) {
    next(e);
  }
});

// ============================================================
// GET /api/values?indicator=CODE&year=YYYY&geographies=CODE1,CODE2,...
// One indicator's value across an arbitrary set of geography codes
// (regions, departments or districts) — the shape the comparison
// chart and table need, computed here so the browser makes one
// request instead of N. A geography with no census row for that
// indicator/year comes back as value: null rather than a fake 0.
// ============================================================
router.get('/values', async (req, res, next) => {
  try {
    const indicator = req.query.indicator as string;
    const geographies = (req.query.geographies as string | undefined)?.split(',').filter(Boolean) || [];
    if (!indicator || geographies.length === 0) {
      return res.status(400).json({ error: 'indicator and geographies are required' });
    }
    const year = yearParam(req.query.year);

    const values = await Promise.all(
      geographies.map(async (code) => ({ code, value: await fetchValue(code, indicator, year) }))
    );

    res.json({ data: values });
  } catch (e) {
    next(e);
  }
});

// ============================================================
// GET /api/value?geography=CODE&indicator=CODE&year=YYYY
// Single indicator value for a single geography, any level.
// ============================================================
router.get('/value', async (req, res, next) => {
  try {
    const geography = req.query.geography as string;
    const indicator = req.query.indicator as string;
    if (!geography || !indicator) {
      return res.status(400).json({ error: 'geography and indicator are required' });
    }
    const year = yearParam(req.query.year);
    const value = await fetchValue(geography, indicator, year);
    res.json({ data: { value } });
  } catch (e) {
    next(e);
  }
});

// ============================================================
// GET /api/population/:geoCode?year=YYYY
// Male/female/urban/rural split for one geography (region,
// department or district — village-level census rows are sparse
// in the seed data, so this is only reliable down to district).
// ============================================================
router.get('/population/:geoCode', async (req, res, next) => {
  try {
    const { geoCode } = req.params;
    const year = yearParam(req.query.year);

    const entries = await Promise.all(
      POP_CODES.map(async (code) => [code, (await fetchValue(geoCode, code, year)) ?? 0] as const)
    );

    res.json({ data: Object.fromEntries(entries) });
  } catch (e) {
    next(e);
  }
});

export default router;
