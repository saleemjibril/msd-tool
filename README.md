# MSD Competency Survey (React)

Vite + React survey UI: name/phone, staged questions, results with radar charts and improvement hints, optional previous-result view, and admin dashboard.

## Setup

1. Ensure the API is running (default proxy target `http://127.0.0.1:5055` in `vite.config.js`).
2. `npm install`
3. `npm run dev` — open `http://localhost:5173`

## Production

Build static assets with `npm run build`.

**Vercel / SPA routing:** [`vercel.json`](vercel.json) rewrites unknown paths to `index.html` so direct visits and refreshes on routes like `/survey` or `/admin/login` work (React Router). Redeploy after adding it.

- **Local / same-origin proxy:** Leave `VITE_API_URL` unset. `npm run dev` proxies `/api` to the backend (see `vite.config.js`). For a static host that forwards `/api` to your API, the built app still uses relative `/api`.
- **Separate API host (e.g. Vercel + Render):** Set `VITE_API_URL` to the API **origin only** (no path, no trailing slash), e.g. `https://msd-api.onrender.com`. Requests go to `{VITE_API_URL}/api/...`. Set this in the hosting dashboard before build, or in `.env.production` locally.

## Flow

- Respondents: `/` → `/survey` → wizard → `/survey/results/:id`
- Admin: `/admin/login` (username + password) → `/admin/surveys`

Phone and name are kept in `sessionStorage` during a run (`msd_survey_phone`, `msd_survey_name`).
