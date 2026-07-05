import dotenv from 'dotenv';
dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),

  censusApiUrl: process.env.CENSUS_API_URL || 'https://census-portal-production.up.railway.app/api/v1',
  censusApiKey: required('CENSUS_API_KEY'),
  censusYear: parseInt(process.env.CENSUS_YEAR || '2026', 10),

  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim()),
};
