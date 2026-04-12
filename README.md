# MSD Competency Survey (React)

Vite + React survey UI: name/phone, staged questions, results with radar charts and improvement hints, optional previous-result view, and admin dashboard.

## Setup

1. Ensure the API is running (default proxy target `http://127.0.0.1:5055` in `vite.config.js`).
2. `npm install`
3. `npm run dev` — open `http://localhost:5173`

## Production

Build static assets with `npm run build`. Serve `dist/` behind a reverse proxy that forwards `/api` to the Node server (or set `VITE_API_URL` and adjust `src/api/client.js` if you prefer a full API URL).

## Flow

- Respondents: `/` → `/survey` → wizard → `/survey/results/:id`
- Admin: `/admin/login` (username + password) → `/admin/surveys`

Phone and name are kept in `sessionStorage` during a run (`msd_survey_phone`, `msd_survey_name`).
