import axios from 'axios';
import { Geography, Indicator } from '../types';

// This site's own backend (NGO-website/backend). It holds the Census Data
// Portal API key server-side — the browser never talks to Application 1
// directly and never sees the key.
const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api';

// Only year currently populated in the census dataset.
export const CENSUS_YEAR = 2026;

export type GeoLevel = 'region' | 'department' | 'district' | 'village';

export interface Village {
  code: string;
  name: string;
  population?: number;
}

export interface GeoValue {
  code: string;
  value: number | null;
}

export interface PopulationBreakdownData {
  POP_MALE: number;
  POP_FEMALE: number;
  POP_URBAN: number;
  POP_RURAL: number;
}

export const api = {
  getRegions: () => axios.get<{ data: Geography[] }>(`${API_BASE}/regions`),

  getDepartments: (regionCode: string) =>
    axios.get<{ data: Geography[] }>(`${API_BASE}/geo/regions/${regionCode}/departments`),

  getDistricts: (departmentCode: string) =>
    axios.get<{ data: Geography[] }>(`${API_BASE}/geo/departments/${departmentCode}/districts`),

  getVillages: (districtCode: string) =>
    axios.get<{ data: Village[] }>(`${API_BASE}/geo/districts/${districtCode}/villages`),

  getIndicators: () => axios.get<{ data: Indicator[] }>(`${API_BASE}/indicators`),

  // One indicator's value across an arbitrary set of geography codes
  // (a region's departments, a department's districts, etc).
  getValues: (indicatorCode: string, geographyCodes: string[], year: number = CENSUS_YEAR) =>
    axios.get<{ data: GeoValue[] }>(`${API_BASE}/values`, {
      params: { indicator: indicatorCode, geographies: geographyCodes.join(','), year },
    }),

  // Male/female/urban/rural split for one geography (any level).
  getPopulation: (geoCode: string, year: number = CENSUS_YEAR) =>
    axios.get<{ data: PopulationBreakdownData }>(`${API_BASE}/population/${geoCode}`, {
      params: { year },
    }),
};
