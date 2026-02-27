# HealthSync — Insurance Comparison Platform

A production-ready, fully deterministic, rule-based insurance comparison platform for Canadian health insurance plans. Built with Node.js, Express, PostgreSQL (Sequelize ORM), and React (Vite + TypeScript + TailwindCSS).

> **No AI. No ML. No LLMs. No prediction models.** Pure deterministic filtering and database-driven calculations only.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  React + TypeScript + TailwindCSS + Vite                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   Home   │ │ Discover │ │ Compare  │ │Simulator │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                      │                                      │
│              axios → │ /api/*                                │
│                      ▼                                      │
├─────────────────────────────────────────────────────────────┤
│                        BACKEND                              │
│  Node.js + Express + Sequelize ORM                          │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────┐        │
│  │  Routes  │→│ Controllers  │→│    Services       │        │
│  │ /api/*   │ │              │ │ comparisonService │        │
│  └──────────┘ └──────────────┘ └──────────────────┘        │
│       │              │                    │                  │
│  ┌────┴────┐  ┌──────┴──────┐     ┌──────┴──────┐          │
│  │Validate │  │Error Handler│     │  Sequelize   │          │
│  │  Input  │  │  Middleware  │     │    Models    │          │
│  └─────────┘  └─────────────┘     └──────┬──────┘          │
│                                          │                  │
├──────────────────────────────────────────┼──────────────────┤
│                    DATABASE              │                  │
│  PostgreSQL                              ▼                  │
│  ┌────────────┐  ┌─────────────────┐  ┌──────────────┐     │
│  │ providers  │←─│ insurance_plans  │─→│plan_provinces│     │
│  └────────────┘  └────────┬────────┘  └──────────────┘     │
│                           │                                 │
│                  ┌────────┼────────┐                        │
│                  ▼                 ▼                        │
│          ┌─────────────┐  ┌──────────────────┐             │
│          │ plan_addons  │  │pricing_modifiers │             │
│          └─────────────┘  └──────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
healthsync/
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useInsuranceEngine.ts  # Core data hook (fetches from API)
│   │   ├── lib/
│   │   │   ├── api.ts         # API client (axios)
│   │   │   └── data.ts        # Type definitions & constants
│   │   ├── pages/             # Route pages
│   │   │   ├── Home.tsx
│   │   │   ├── Discovery.tsx
│   │   │   ├── Compare.tsx
│   │   │   └── Simulator.tsx
│   │   └── App.tsx
│   └── index.html
├── server/                    # Backend (Express + Sequelize)
│   ├── config/
│   │   └── database.ts        # PostgreSQL connection config
│   ├── controllers/
│   │   └── compareController.ts
│   ├── middleware/
│   │   ├── validation.ts      # Input validation (express-validator)
│   │   └── errorHandler.ts    # Global error handling
│   ├── models/
│   │   ├── Provider.ts
│   │   ├── InsurancePlan.ts
│   │   ├── PlanProvince.ts
│   │   ├── PlanAddon.ts
│   │   ├── PricingModifier.ts
│   │   └── index.ts           # Model associations
│   ├── routes/
│   │   └── api.ts             # API route definitions
│   ├── seeders/
│   │   └── seed.ts            # Database seed with 20 realistic plans
│   ├── services/
│   │   └── comparisonService.ts  # Core comparison engine
│   └── index.ts               # Server entry point
├── .env.example               # Environment variable template
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Database Schema

### `providers`
| Column        | Type         | Description              |
|---------------|--------------|--------------------------|
| id            | INTEGER (PK) | Auto-increment           |
| name          | VARCHAR(200) | Provider company name    |
| website       | VARCHAR(500) | Provider website URL     |
| contact_email | VARCHAR(200) | Contact email            |
| logo_color    | VARCHAR(7)   | Hex color for UI         |

### `insurance_plans`
| Column                  | Type          | Description                        |
|-------------------------|---------------|------------------------------------|
| id                      | INTEGER (PK)  | Auto-increment                     |
| provider_id             | INTEGER (FK)  | References providers.id            |
| plan_name               | VARCHAR(200)  | Plan display name                  |
| coverage_type           | VARCHAR(50)   | health, dental, travel, etc.       |
| base_price              | DECIMAL(10,2) | Monthly base price before modifiers|
| min_age / max_age       | INTEGER       | Age eligibility range              |
| smoker_allowed          | BOOLEAN       | Whether smokers can enroll         |
| coverage_limit          | DECIMAL(12,2) | Maximum coverage amount            |
| plan_type               | VARCHAR(20)   | individual, couple, family         |
| family_option           | BOOLEAN       | Family plan available              |
| deductible              | DECIMAL(10,2) | Annual deductible                  |
| drug_coverage_pct       | INTEGER       | Drug coverage percentage           |
| drug_annual_cap         | DECIMAL(10,2) | Annual drug cap                    |
| drug_deductible         | DECIMAL(10,2) | Drug-specific deductible           |
| dental_basic_pct        | INTEGER       | Basic dental coverage %            |
| dental_major_pct        | INTEGER       | Major dental coverage %            |
| dental_annual_limit     | DECIMAL(10,2) | Annual dental limit                |
| dental_orthodontic_limit| DECIMAL(10,2) | Orthodontic lifetime limit         |
| vision_exam_amount      | DECIMAL(10,2) | Eye exam coverage                  |
| vision_eyewear_amount   | DECIMAL(10,2) | Eyewear allowance                  |
| vision_frequency        | VARCHAR(50)   | e.g., "every 24 months"            |
| massage_per_visit       | DECIMAL(10,2) | Per-visit massage coverage         |
| massage_annual_max      | DECIMAL(10,2) | Annual massage maximum             |
| massage_visit_limit     | INTEGER       | Max visits per year                |
| chiro_per_visit         | DECIMAL(10,2) | Per-visit chiropractic coverage    |
| chiro_annual_max        | DECIMAL(10,2) | Annual chiropractic maximum        |
| chiro_visit_limit       | INTEGER       | Max visits per year                |
| physio_per_visit        | DECIMAL(10,2) | Per-visit physiotherapy coverage   |
| physio_annual_max       | DECIMAL(10,2) | Annual physiotherapy maximum       |
| physio_visit_limit      | INTEGER       | Max visits per year                |
| rating                  | DECIMAL(2,1)  | Plan rating (1.0–5.0)             |
| highlights              | TEXT[]        | Array of highlight strings         |

### `plan_provinces` (many-to-many)
| Column        | Type         | Description              |
|---------------|--------------|--------------------------|
| id            | INTEGER (PK) | Auto-increment           |
| plan_id       | INTEGER (FK) | References insurance_plans.id |
| province_code | VARCHAR(2)   | e.g., ON, BC, QC        |
| province_name | VARCHAR(100) | Full province name       |

### `plan_addons`
| Column      | Type          | Description              |
|-------------|---------------|--------------------------|
| id          | INTEGER (PK)  | Auto-increment           |
| plan_id     | INTEGER (FK)  | References insurance_plans.id |
| addon_name  | VARCHAR(100)  | e.g., vision, prescription |
| addon_price | DECIMAL(10,2) | Monthly addon cost       |
| description | TEXT          | Addon description        |

### `pricing_modifiers`
| Column          | Type          | Description                        |
|-----------------|---------------|------------------------------------|
| id              | INTEGER (PK)  | Auto-increment                     |
| plan_id         | INTEGER (FK)  | References insurance_plans.id      |
| modifier_name   | VARCHAR(100)  | e.g., "Young Adult (18-25)"        |
| age_min / age_max | INTEGER     | Age range for this modifier        |
| modifier_type   | ENUM          | "flat" or "percentage"             |
| modifier_value  | DECIMAL(10,2) | Dollar amount or percentage        |
| condition_key   | VARCHAR(50)   | "age" or "smoker"                  |
| condition_value | VARCHAR(50)   | "range" or "yes"                   |

---

## API Specification

### `GET /api/health`
Health check endpoint.

### `GET /api/provinces`
Returns list of supported Canadian provinces.

### `GET /api/plans`
Returns all plans with full details for frontend browsing.

### `POST /api/compare` — Core Comparison Engine

**Request Body:**
```json
{
  "age": 35,
  "gender": "male",
  "province": "ON",
  "smoking_status": "non-smoker",
  "budget_min": 50,
  "budget_max": 200,
  "coverage_type": "health",
  "plan_type": "individual",
  "addons": ["vision", "prescription"]
}
```

**Response:**
```json
{
  "count": 10,
  "filters_applied": {
    "age": 35,
    "province": "ON",
    "smoking_status": "non-smoker",
    "coverage_type": "health",
    "plan_type": "individual",
    "budget_range": { "min": 50, "max": 200 },
    "requested_addons": ["vision", "prescription"]
  },
  "results": [
    {
      "plan_id": 10,
      "plan_name": "ExtendaPlan Basic",
      "provider": "GMS",
      "monthly_price": 132.00,
      "annual_price": 1584.00,
      "base_price": 72,
      "age_modifier": 25,
      "smoker_modifier": 0,
      "addon_total": 35,
      "coverage_type": "health",
      "coverage_limit": "$50,000",
      "deductible": 200,
      "drug_coverage": { "percentage": 70, "annual_cap": 3000, "deductible": 100 },
      "dental_coverage": { "basic_percentage": 60, "major_percentage": 0, "annual_limit": 750, "orthodontic_limit": 0 },
      "vision_coverage": { "exam_amount": 50, "eyewear_amount": 100, "frequency": "every 24 months" },
      "paramedical": {
        "massage": { "per_visit": 35, "annual_max": 250, "visit_limit": 8 },
        "chiropractic": { "per_visit": 30, "annual_max": 250, "visit_limit": 8 },
        "physiotherapy": { "per_visit": 35, "annual_max": 250, "visit_limit": 8 }
      },
      "highlights": ["No waiting period", "Simple claims"],
      "included_addons": [{ "name": "vision", "price": 15 }, { "name": "prescription", "price": 20 }],
      "rating": 2.8
    }
  ]
}
```

---

## Pricing Formula

All pricing is **deterministic** and **database-driven**:

```
final_price = base_price + age_modifier + smoker_modifier + sum(selected_addons)
```

| Factor         | Source                    | Logic                                |
|----------------|---------------------------|--------------------------------------|
| base_price     | `insurance_plans.base_price` | Fixed per plan                      |
| age_modifier   | `pricing_modifiers` table | Flat $ or % of base, matched by age range |
| smoker_modifier| `pricing_modifiers` table | 20% of base_price if smoker          |
| addon costs    | `plan_addons` table       | Fixed $ per addon per plan           |

**Age Modifier Ranges (per plan):**
| Age Range | Modifier |
|-----------|----------|
| 18–25     | +$10     |
| 26–40     | +$25     |
| 41–55     | +$50     |
| 56–65     | +$85     |

---

## Filtering Logic (Strict Business Rules)

When `POST /compare` is called, the backend applies these filters **in order**:

1. **Province filter** — Remove plans not available in user's province
2. **Age filter** — Remove plans where user's age is outside `min_age`–`max_age`
3. **Smoking filter** — If user is a smoker, remove plans where `smoker_allowed = false`
4. **Coverage type filter** — Match `coverage_type` if specified
5. **Plan type filter** — Match `plan_type` (individual/couple/family) if specified
6. **Price calculation** — Apply modifiers from database
7. **Add-on application** — Add selected addon costs if compatible
8. **Budget filter** — Remove plans exceeding `budget_max` **after** price calculation
9. **Sort** — Return results sorted by `monthly_price` ASC

---

## What Was Removed

| Removed Component | Location | Replacement |
|---|---|---|
| `parseIntent.ts` | `client/src/lib/` | Deleted entirely — was AI/NLP intent parser |
| AI-based `useInsuranceEngine` | `client/src/hooks/` | Rewritten to fetch from backend API |
| Hardcoded plan arrays | `client/src/lib/data.ts` | Replaced with type definitions only; data from DB |
| "AI-Powered" copy | `client/src/pages/Home.tsx` | Updated to "Rule-Based Engine" language |
| "AI finds your match" | `client/src/pages/Discovery.tsx` | Rewritten with structured filter UI |
| `HealthSync AI` title | `client/index.html` | Changed to `HealthSync — Insurance Comparison Platform` |

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- pnpm

### Setup

```bash
# 1. Clone the project
git clone <repo-url> && cd healthsync

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 4. Create database
createdb healthsync

# 5. Seed the database
pnpm seed

# 6. Start backend (port 3001)
pnpm dev:server

# 7. Start frontend (port 3000, proxies /api to backend)
pnpm dev
```

---

## Deployment

### Backend → Render

1. Create a **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `pnpm start`
   - **Environment:** Node
4. Create a **PostgreSQL** database on Render
5. Set environment variables:
   ```
   DATABASE_URL=<Render Internal Database URL>
   PORT=3001
   NODE_ENV=production
   CORS_ORIGINS=https://your-app.netlify.app
   ```
6. After deployment, seed the database:
   ```bash
   # Run seed via Render Shell or locally with the Render DATABASE_URL
   DATABASE_URL=<external-url> npx tsx server/seeders/seed.ts
   ```

### Frontend → Netlify

1. Create a new site on [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Configure:
   - **Base directory:** (leave empty)
   - **Build command:** `pnpm install && pnpm run build:client`
   - **Publish directory:** `dist/public`
4. Set environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com
   ```
5. Add a `_redirects` file in `client/public/`:
   ```
   /*    /index.html   200
   ```

### Alternative: Build Commands

```bash
# Build frontend only (for Netlify)
npx vite build

# Build backend only (for Render)
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Build both
pnpm build
```

---

## Security

- **Helmet** — HTTP security headers
- **CORS** — Configurable allowed origins
- **Rate limiting** — 100 requests per 15 minutes per IP
- **Input validation** — All POST body fields validated via express-validator
- **No secrets in frontend** — API keys and DB credentials are server-side only
- **No pricing logic in client** — All calculations happen on the backend

---

## Seed Data

The database is seeded with **20 realistic Canadian insurance plans** from **10 providers**:

| Provider | Plans |
|---|---|
| Blue Cross | Essential Care, Enhanced Family Shield |
| Manulife | FlexCare Health, Premium Family Plus |
| Canada Life | Core Health Plan, Complete Coverage |
| Sun Life | My Health Starter, Health Advantage Plus, Elite Comprehensive |
| GMS | ExtendaPlan Basic, ExtendaPlan Enhanced |
| Desjardins | Assurance Essentielle, Protection Complète |
| iA Financial | Value Health, Complete Health Plus |
| GreenShield | GSC Starter, GSC Health Plus |
| Equitable Life | HealthConnex Basic, HealthConnex Comprehensive |
| SSQ Insurance | SSQ Individuel Santé |

Each plan includes:
- Province availability (144 associations across 13 provinces/territories)
- 3–5 optional add-ons (81 total)
- 5 pricing modifiers per plan (4 age brackets + 1 smoker surcharge = 100 total)

---

## License

MIT
