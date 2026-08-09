# NestFinder — Client

The React frontend for NestFinder. This is a Vite single-page app that talks
**directly to Supabase** for auth, data, and file storage — there is no
separate Node/Express API layer in this repo. It also calls the Flask
service in [`../ai-service`](../ai-service) for AI-powered room
recommendations.

## Tech stack

| Purpose | Library |
|---|---|
| UI framework | React 19 |
| Build tool / dev server | Vite |
| Routing | React Router 7 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Maps | Leaflet + react-leaflet + OpenStreetMap tiles |
| Icons | lucide-react |
| Backend | Supabase (`@supabase/supabase-js`) — Postgres, Auth, Storage |
| AI recommendations | Calls the local `ai-service` Flask API |
| Linting | ESLint (`eslint-plugin-react-hooks`, `eslint-plugin-tailwindcss`) |
| Formatting | Prettier + `prettier-plugin-tailwindcss` (auto-sorts class names) |

## Requirements

- Node.js 18+ and npm
- A Supabase project (URL + anon key)
- (Optional but needed for the AI Recommend page) the `ai-service` running
  locally on port 5001 — see [`../ai-service/README.md`](../ai-service/README.md)

## Setup

From the `client/` folder:

```bash
npm install
```

Create a `.env` file in `client/` (git-ignored) with:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

These are read in [`db/supabaseClient.js`](db/supabaseClient.js) to create
the shared Supabase client used everywhere in the app.

```bash
npm run dev
```

The dev server starts on **http://localhost:5173** by default.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint over the project |
| `npm run lint:fix` | Run ESLint with `--fix` |

Formatting (Tailwind class sorting, general style) runs through Prettier —
either via your editor's format-on-save, or manually with
`npx prettier --write .`. Config lives in the `"prettier"` key of
[`package.json`](package.json).

## Project structure

```
client/
├── db/
│   └── supabaseClient.js     # Shared Supabase client (reads VITE_ env vars)
├── src/
│   ├── api/                  # Thin wrappers around Supabase/AI-service calls
│   │   ├── listingsapi.js    # Listings CRUD, saved listings, notifications
│   │   ├── aiApi.js          # Calls the ai-service /recommend endpoint
│   │   ├── paymentAPI.js     # Payment proof submission/verification
│   │   └── kycApi.js         # Landlord KYC submission/review
│   ├── Context/
│   │   └── AppContext.jsx    # Global app state: auth, listings, notifications,
│   │                         # saved listings, paid radius access, recommendations
│   ├── Pages/                # Route-level views (Home, RoomDetails, AllRooms,
│   │   ├── Dashboard/        # AIRecommend, Auth, KycVerification, PaymentPage...
│   │   └── About/            # Role dashboards: Tenant, Landlord, Admin
│   ├── components/           # Reusable UI: Navbar, MapContainer, RoomCard,
│   │   ├── admin/            # payment/, kyc/, and ai-recommend/ multi-step flows
│   │   ├── ai-recommend/
│   │   ├── kyc/
│   │   └── payment/
│   ├── utils/                 # geo math, payment pricing, listing lifecycle rules,
│   │                          # Nepal locations/country codes data
│   ├── App.jsx                # Route definitions
│   └── main.jsx                # Entry point
├── eslint.config.js
├── vite.config.js
└── package.json
```

## Notes

- Routing, auth-gating (`RequireAuth`), and most cross-page state live in
  `AppContext.jsx` — check there first when tracing how data flows between
  pages.
- `getRecommendedListings` (rule-based) in `AppContext.jsx` is the fallback
  used automatically if the AI service in `ai-service/` is unreachable —
  see `getAIRecommendedListings`.
- `@` is aliased to `src/` in `vite.config.js`, so imports can use `@/...`
  instead of long relative paths.
