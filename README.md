# Espoir Santé — NGO Website (Application 2: The API Consumer)

## 1. What this project is

This is **Application 2** in a two-application system built for an academic
design project on API-driven data sharing:

- **Application 1 — Cameroon Census Data Portal** (a separate project,
  `cameroon-census-project/`): a government/NGO-facing data platform that
  collects Cameroon census data and exposes it through a REST API, gated by
  API keys issued to registered developers/organizations.
- **Application 2 — this project (`NGO-website/`)**: a fictional NGO,
  *Espoir Santé* ("Hope Health"), that consumes Application 1's API to power
  a public-facing website. The NGO uses the census data to decide where to
  target its health, water, education and livelihoods programs across
  Cameroon's regions, departments and districts.

The project demonstrates a realistic **API consumer architecture**: a
third-party organization is issued an API key by a data provider, and must
build software around that key without exposing it to the public.

---

## 2. The core design requirement: who holds the API key

This was the central architectural constraint the project had to satisfy,
and it shaped almost every decision below:

| Role | Who | Responsibilities |
|---|---|---|
| **NGO Developer** | Espoir Santé's engineering team | Registers with the Census Data Portal, obtains an API key, writes the NGO website's backend, configures the key **server-side only**, builds the public-facing interface. |
| **NGO User (visitor)** | Anyone browsing the website | Visits the site, clicks buttons, selects filters, sees charts and tables. **Never sees, enters, or handles the API key at any point.** |

This means Application 2 could **not** be a frontend-only single-page app
that asks the visitor to paste in an API key (an earlier iteration of this
project did exactly that, and it was identified as an architectural bug —
see §7). Instead, Application 2 needed **its own backend**, whose only job
is to hold the key as a server-side secret and act as a proxy/gateway
between the public frontend and Application 1.

**Verified guarantee:** with the key removed or invalidated in the
backend's configuration, the Census Data page shows *zero* data anywhere
(stat cards, chart, table, population panel all display an explicit
"No data" state) — the site fails closed, never silently, never with stale
or fabricated numbers.

---

## 3. System architecture

```
 ┌────────────────────┐        ┌──────────────────────────┐        ┌────────────────────────┐
 │   Browser (visitor) │  HTTP  │  NGO Website Backend      │  HTTP  │  Application 1           │
 │   React SPA          │ ─────▶ │  (Express, port 4000)     │ ─────▶ │  Census Data Portal API  │
 │   never sees the key │        │  holds CENSUS_API_KEY in  │  X-API-Key header │  (Express, port 3001)   │
 │                       │ ◀───── │  .env, proxies requests   │ ◀───── │  + PostgreSQL             │
 └────────────────────┘        └──────────────────────────┘        └────────────────────────┘
```

- The **browser never talks to Application 1 directly** and never receives
  the API key in any response, header, or bundled JS. This was verified
  with an automated browser test that inspects every outgoing network
  request for the key string or an `X-API-Key` header — none were found.
- The **NGO website backend** is a thin, purpose-built proxy: it exposes a
  small REST API tailored to exactly what the frontend needs (geography
  lists, drill-down hierarchy, indicator comparisons), and internally
  translates those into authenticated calls to Application 1.
- **Application 1** distinguishes two tiers of its own API:
  - `/public/*` — geography metadata (regions, departments, districts,
    villages, indicator catalog) — no key required, by Application 1's own
    design.
  - `/protected/*` — actual indicator *values* (population, literacy rate,
    water access, etc.) — requires a valid `X-API-Key`, and is
    quota-tracked per key.

  Application 2's backend uses the key for every `/protected/*` call. This
  means geography *names* can still resolve even if the key is briefly
  invalid, but no *indicator value* ever renders without one — matching
  Application 1's own security model.

---

## 4. Repository layout

```
NGO-website/
├── backend/                 # Application 2's own backend (the key holder)
│   ├── src/
│   │   ├── config.ts        # loads .env, throws at startup if the key is missing
│   │   ├── censusClient.ts  # axios instance pre-configured with the API key
│   │   ├── app.ts           # Express app: middleware, routes, error handling
│   │   ├── server.ts        # entrypoint
│   │   └── routes/data.ts   # the proxy endpoints (see §5)
│   ├── .env                 # PORT, CENSUS_API_URL, CENSUS_API_KEY, etc. (not committed)
│   └── .env.example
└── frontend/                 # Public-facing React site (no key anywhere in here)
    ├── src/
    │   ├── main.tsx, App.tsx        # router + layout
    │   ├── pages/
    │   │   ├── Home.tsx             # hero, live "Cameroon at a glance" stats, program preview
    │   │   ├── About.tsx            # mission/vision/values (static)
    │   │   ├── Programs.tsx         # 4 programs, each backed by a live national indicator average
    │   │   ├── DataExplorer.tsx     # the main data product — see §6
    │   │   └── Contact.tsx          # contact form (static)
    │   ├── components/
    │   │   ├── Header.tsx, Footer.tsx, StatCard.tsx
    │   │   └── charts/
    │   │       ├── GeoBarChart.tsx        # region/department/district comparison bar chart
    │   │       └── PopulationBreakdown.tsx # gender & urban/rural donut charts
    │   └── lib/
    │       ├── api.ts           # typed client for the NGO backend (never calls Application 1)
    │       └── chartColors.ts   # validated, colorblind-safe chart palette
    └── .env.example
```

---

## 5. Application 2 backend API (what the frontend actually calls)

All routes are mounted under `/api` on `http://localhost:4000`.

| Route | Auth needed from visitor? | What it does |
|---|---|---|
| `GET /api/regions` | No | List of Cameroon's 10 regions (proxies Application 1's public endpoint) |
| `GET /api/geo/regions/:code/departments` | No | Departments within a region |
| `GET /api/geo/departments/:code/districts` | No | Districts within a department |
| `GET /api/geo/districts/:code/villages` | No | Villages within a district, with `code`, `name` and `population` — chartable by indicator like any other geography level |
| `GET /api/indicators` | No | Catalog of the 10 census indicators (population, literacy, water access, etc.) with units and categories |
| `GET /api/values?indicator=&year=&geographies=` | No (uses backend's key internally) | One indicator's value across an arbitrary list of geography codes — powers every comparison chart and table. Returns `value: null` for any geography with no census row, instead of a misleading `0`. |
| `GET /api/value?geography=&indicator=&year=` | No (uses backend's key internally) | Single indicator value for a single geography |
| `GET /api/population/:geoCode?year=` | No (uses backend's key internally) | Male/female/urban/rural population split for any geography |

None of these routes accept or forward a key from the caller — the key is
injected server-side by `censusClient.ts` on every request to Application 1.

**Error handling:** if Application 1 rejects the configured key (`401`),
the backend logs an unmistakable developer-facing warning
(`🔑 CENSUS_API_KEY WAS REJECTED...`) distinct from a generic network
failure, while the visitor only ever sees a neutral "data unavailable"
message — no internal details are leaked to the public.

---

## 6. Frontend features

### Census Data Explorer (`/data`) — the core deliverable
- **Drill-down hierarchy**: toggle between Region / Department / District /
  Village level. Picking a region reloads its departments; picking a
  department reloads its districts; picking a district reloads its
  villages — each level's comparison chart, stat cards, table and
  population donuts re-target automatically.
- **Comparison bar chart**: the selected indicator's value across every
  entity at the current level, with the focused entity highlighted and a
  dashed reference line for the group average. Entities with no figure yet
  for the selected indicator/year are excluded from the chart and counted
  in an "N excluded — no data yet" note, rather than plotted as zero.
- **Population snapshot**: two donut charts (gender split, urban/rural
  split) for whichever region/department/district/village is focused —
  works at every level because the underlying census rows exist at every
  level.
- **Villages panel**: list of villages inside the focused district;
  clicking one jumps straight to that village at Village level.
- **Stat cards**: focused entity's value, group average, highest and
  lowest entity for the selected indicator — all with an explicit "No
  data" fallback rather than a fake zero or a stuck spinner.

### Home (`/`)
Hero section, live "Cameroon at a glance" stats (total population covered,
regions monitored, indicators tracked — pulled from the same backend, no
key needed by the visitor), and a preview of the four programs.

### Programs (`/programs`)
Four programs (Clean Water & Sanitation, Rural Electrification, Education
Access, Livelihoods & Employment), each tagged with a live national average
for its associated indicator and the current lowest-scoring ("priority")
region — a direct demonstration of data-driven program targeting.

### About (`/about`) and Contact (`/contact`)
Static organizational content (mission, vision, values, team, contact
form) rounding out the site as a believable NGO presence, not just a raw
data tool.

---

## 7. Design decisions and iteration history

This project went through a deliberate architecture correction worth
noting in a report on API-consumer design:

1. **Initial version**: a single-page React app where the *visitor* pasted
   their own API key into a UI field, stored in `localStorage`, and sent
   directly to Application 1 from the browser.
2. **Identified as wrong**: this violates the intended trust model — a
   random website visitor should never need or be able to obtain a raw API
   key; only the organization's own developers should hold it.
3. **Corrected architecture**: introduced Application 2's own backend
   (`backend/`) as a Backend-For-Frontend (BFF). The key moved into a
   server-side `.env`, `ApiKeyInput` UI and all `localStorage`
   key-handling code were deleted, and the frontend was rewritten to talk
   only to this new backend.
4. **Fail-closed verification**: the backend refuses to even start without
   `CENSUS_API_KEY` set (`config.ts` throws at boot), and was tested live
   with the key removed/corrupted to confirm the Data Explorer shows a
   consistent "No data" state everywhere rather than crashing, hanging, or
   silently serving cached/fake numbers.
5. **Scope expansion**: the Data Explorer initially only showed
   region-level data; it was expanded to drill down through Application
   1's full geography hierarchy (region → department → district, plus an
   informational village list), matching everything Application 1's API
   actually exposes.
6. **Village-level drill-down**: Application 1 fixed a bug where its
   villages endpoint omitted each village's `code`, which had made
   village-level indicator lookups impossible (they'd silently query with
   `geography=undefined`). With `code` now present, Village became a full
   level in the Data Explorer (chartable, tabulable, with its own
   population snapshot) instead of a name-only informational list. This
   also removed the one caveat noted under "Known limitations" below.

---

## 8. Tech stack

**Frontend**: React 18, TypeScript, Vite, React Router, Tailwind CSS,
Recharts (bar & donut charts, built against a validated colorblind-safe
palette), lucide-react (icons), axios.

**Backend**: Node.js, Express 5, TypeScript, axios (as the Application-1
client), helmet (HTTP security headers), cors, morgan (logging),
ts-node-dev (hot reload in development).

**Application 1 (for context, separate repo)**: Node.js, Express,
PostgreSQL, JWT-based developer accounts, bcrypt-hashed API keys, per-key
monthly quota enforcement.

---


## 9. Running the project locally

Three processes are required, in this order:

```bash
# 1. Application 1 — Census Data Portal (separate project)
cd cameroon-census-project/census-portal/backend
npm install && npm run dev      # http://localhost:3001

# 2. Application 2 backend — holds the API key
cd NGO-website/backend
cp .env.example .env            # then fill in CENSUS_API_KEY from Application 1
npm install && npm run dev      # http://localhost:4000

# 3. Application 2 frontend — the public site
cd NGO-website/frontend
npm install && npm run dev      # http://localhost:5173 (or next free port)
```

Environment variables (`NGO-website/backend/.env`):

| Variable | Purpose |
|---|---|
| `PORT` | Port this backend listens on (default `4000`) |
| `CENSUS_API_URL` | Base URL of Application 1's API |
| `CENSUS_API_KEY` | The key issued by Application 1 — **secret, server-side only, never commit this file** |
| `CENSUS_YEAR` | The census year to query (dataset currently only has one year populated: 2026) |
| `CORS_ORIGIN` | Comma-separated list of frontend origins allowed to call this backend |

---

## 10. Known limitations

- **Single census year**: the seeded dataset only has one year of data
  (2026), so year-over-year trend analysis isn't currently meaningful.
- **Incomplete data by design**: the census dataset is being filled in
  incrementally by an admin, so any geography/indicator/year combination
  can legitimately have no figure yet. `GET /protected/data` returns
  `{ data: [] }` (not an error) in that case, and every level of the Data
  Explorer — chart, table, stat cards, population snapshot — renders an
  explicit "No data" state rather than erroring or showing a blank/zero
  value.
- **Geography tree is not cached**: departments/districts/villages and the
  indicator catalog are fetched fresh on every page load (no
  `localStorage`/build-time snapshot), since an admin can add or edit
  geography and data values at any time. Within a single page session the
  frontend keeps whatever it already fetched in React state — reload the
  page to pick up admin changes made during that session.
- **Contact form** is UI-only (no backend email/storage wired up) —
  intentionally out of scope for this project's focus on the census-API
  integration.
