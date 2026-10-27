# Visa Atlas

Visa Atlas is an interactive web experience for exploring official immigration
statistics and work-visa information by destination country. The current
repository contains the React client, shared OpenAPI-generated types, local
geographic data, and the specifications that define the public API.

The MVP is public and does not require authentication. Its initial data scope is
Brazilian citizenship (`BRA`) and work-related travel (`WORK`). Visa Atlas is an
information and exploration tool; it does not assess personal eligibility or
submit visa applications.

## Highlights

- Interactive 3D globe powered by MapLibre GL JS
- Searchable global country catalog with an accessible list fallback
- Keyboard navigation and reduced-motion support
- Country details, source attribution, data availability, and historical series
- Clear distinction between unavailable, suppressed, estimated, revised, and
  confirmed-zero observations
- Runtime validation of API responses against the expected data shapes
- Responsive country panel on desktop and mobile

Only the selected country is highlighted in green (`#30D883`); all other
countries remain gray. Countries without statistics are still selectable so the
interface can explain their availability status.

## Screenshots

### Country statistics

![Canada country statistics displayed on the Visa Atlas globe](<images/Screenshot 2026-10-27 at 00.42.16.png>)

### Historical series

![France historical series displayed on the Visa Atlas globe](<images/Screenshot 2026-10-27 at 00.44.36.png>)

### Global map

![Visa Atlas global map and filters](<images/Screenshot 2026-10-27 at 00.44.54.png>)

## Technology

- React 19 and TypeScript (strict mode)
- Vite 8
- MapLibre GL JS
- TanStack Query
- Vitest and Testing Library
- Playwright
- OpenAPI 3.1 and `openapi-typescript`
- npm workspaces

## Repository structure

```text
.
├── apps/
│   └── web/                 React/Vite frontend
├── packages/
│   ├── contracts/           Types generated from the OpenAPI contract
│   └── geo/                 Country catalog and local map geometry
├── specs/
│   ├── 001-shared-api-contract/
│   ├── 002-visa-atlas-backend/
│   ├── 003-interactive-globe-frontend/
│   └── 004-global-coverage-expansion/
└── .specify/                Project constitution and Spec Kit assets
```

This repository currently implements the frontend. The browser consumes the
Visa Atlas REST API and never queries government or statistical providers
directly. A compatible backend must implement the contract in
[`specs/001-shared-api-contract/contracts/openapi.yaml`](specs/001-shared-api-contract/contracts/openapi.yaml).

## Requirements

- Node.js 22 or newer
- npm (the lockfile uses npm lockfile version 3)
- A compatible Visa Atlas API for live data and integration tests

## Getting started

Install dependencies and generate the TypeScript contract:

```bash
npm install
npm run contracts:generate
```

Start the development server:

```bash
npm run dev
```

The application is served at `http://localhost:4173`. By default, Vite proxies
requests under `/api` to `http://localhost:3000`.

To use a backend at another address:

```bash
VITE_API_PROXY_TARGET=http://127.0.0.1:3001 npm run dev
```

## Configuration

| Variable                | Used by            | Default                 | Description                            |
| ----------------------- | ------------------ | ----------------------- | -------------------------------------- |
| `VITE_API_PROXY_TARGET` | Development server | `http://localhost:3000` | Backend target for Vite's `/api` proxy |
| `VITE_API_BASE_URL`     | Browser build      | `/api/v1`               | Public base URL used by the API client |

Variables prefixed with `VITE_` are included in client-side builds and must not
contain secrets.

For a production build, configure `VITE_API_BASE_URL` when the API is not
available at the same origin under `/api/v1`:

```bash
VITE_API_BASE_URL=https://api.example.com/api/v1 npm run build
```

## API contract

The OpenAPI document is the source of truth for frontend/backend integration.
It defines five REST endpoints:

| Method | Path                           | Purpose                                           |
| ------ | ------------------------------ | ------------------------------------------------- |
| `GET`  | `/filters/defaults`            | Return the published default filter set           |
| `GET`  | `/countries`                   | Search and paginate the country catalog           |
| `GET`  | `/stats/map`                   | Return comparable map statistics and availability |
| `GET`  | `/countries/{iso3}`            | Return aggregated country details                 |
| `GET`  | `/countries/{iso3}/timeseries` | Return a country's published historical series    |

After changing the contract with frontend/backend agreement, regenerate the
shared TypeScript definitions:

```bash
npm run contracts:generate
```

Do not edit `packages/contracts/src/generated/api.ts` by hand.

## Available scripts

Run these commands from the repository root:

| Command                      | Description                                             |
| ---------------------------- | ------------------------------------------------------- |
| `npm run dev`                | Start the frontend development server                   |
| `npm run build`              | Type-check and create a production build                |
| `npm run format:check`       | Check formatting with Prettier                          |
| `npm run lint`               | Run ESLint with zero warnings allowed                   |
| `npm run typecheck`          | Run the TypeScript compiler without emitting files      |
| `npm test`                   | Run unit and component tests once                       |
| `npm run test:e2e`           | Run deterministic browser tests with synthetic fixtures |
| `npm run test:e2e:real`      | Run browser integration tests against a real API        |
| `npm run contracts:generate` | Regenerate TypeScript types from OpenAPI                |

An official-data integration suite is also available from the web workspace:

```bash
npm run test:e2e:official --workspace @visa-atlas/web
```

It expects a locally published official release with at least two periods at
`http://127.0.0.1:3000`.

## Testing

Run the standard quality checks:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

The unit/component and standard end-to-end suites use clearly labeled synthetic
fixtures for deterministic UI validation. These fixtures are test-only and must
not be shipped as production data.

The real API suite does not intercept API routes. Start a compatible backend at
`http://127.0.0.1:3001`, or provide another target, and run:

```bash
VITE_API_PROXY_TARGET=http://127.0.0.1:3001 npm run test:e2e:real
```

## Data integrity

Visa Atlas treats immigration metrics as distinct statistical concepts. In
particular, Eurostat first residence permits must not be presented as consular
work visas. Every published value must retain its metric, unit, period,
citizenship, purpose, destination, primary source, release, and availability
status.

A value of `0` means the source confirmed zero. Missing, unavailable, or
suppressed data uses `null` with an explicit status. Grant volumes must not be
interpreted as a person's probability of approval.

## Maps, data, and attribution

- Map rendering: MapLibre GL JS (BSD-3-Clause)
- Boundaries: Natural Earth 1:110m Admin 0 Countries (public domain)
- Country catalog: derived from `mledoze/countries` 5.1.0 (ODbL-1.0), with
  Brazilian Portuguese names materialized from CLDR 48
- Tiles: no external tile provider is used; the globe uses a local background
  and versioned GeoJSON

The UI includes Natural Earth attribution. See
[`packages/geo/README.md`](packages/geo/README.md) for details about the bundled
geographic assets.

## Contributing

Before changing code, read [`AGENTS.md`](AGENTS.md) and
[`.specify/memory/constitution.md`](.specify/memory/constitution.md). Keep the
frontend in `apps/web`, derive shared contracts from the OpenAPI document, and
include appropriate tests for behavioral changes. Any public contract or metric
interpretation change requires coordinated frontend/backend review.
