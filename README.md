# HackColab \u2014 Frontend

React + Vite frontend for the HackColab mini project (no Tailwind, no Next.js \u2014 plain CSS files per component, matching the provided UI design).

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Any email/password combination logs you in \u2014 auth is mocked (see below).

## Mock data vs. the real backend

Every page talks to `src/services/*.api.js`, never straight to mock files. Each service function checks `VITE_USE_MOCK` (in `.env`):

- `VITE_USE_MOCK=true` (default): returns realistic fake data from `src/mock/*`, with a simulated network delay so loading states are visible.
- `VITE_USE_MOCK=false`: calls the real backend at `VITE_API_BASE_URL` via the shared `apiRequest()` helper in `src/services/api.js`.

**When your teammate's backend is ready:** update `.env` with the real API URL and flip `VITE_USE_MOCK` to `false`. No page or component code needs to change \u2014 only the service files matter, and they're already wired for real `fetch` calls (auth token, JSON headers, error handling).

Expected REST shape the services already assume (align with your teammate):
- `POST /auth/login`, `POST /auth/signup` \u2192 `{ user, token }`
- `GET /dashboard/summary` \u2192 `{ stats, hackathons, recentActivity }`
- `GET /hackathons`, `GET /hackathons/:id`
- `GET /hackathons/:id/tasks`, `PATCH /tasks/:id/move`, `POST /tasks`
- `GET /calendar/events`, `GET /calendar/legend`
- `GET /hackathons/:id/repository`, `/commits`, `/conflicts`, `POST .../sync`
- `GET/PATCH /hackathons/:id/submission`, `POST /hackathons/:id/submit`
- `POST /uploads/presign` \u2192 pre-signed S3 URL for direct browser uploads

## Project structure

Follows the agreed folder layout: `components/ui` (generic building blocks), `components/layout` (shell/nav), `pages` (routed screens), `features/*` (page-specific components + local api re-exports), `services` (the only place that talks to the network), `mock` (fake data), `hooks`, `context`, `utils`.

## Deploying to AWS (trial phase)

This is a static single-page app after `npm run build` (outputs to `dist/`). Simplest trial-phase path:

1. `npm run build`
2. Create an S3 bucket, enable static website hosting (or keep it private and front it with CloudFront).
3. Upload the contents of `dist/` to the bucket.
4. Put CloudFront in front of the bucket for HTTPS + caching, with a custom error response that rewrites 404s to `/index.html` (required for React Router's client-side routes).
5. Point `VITE_API_BASE_URL` at wherever the backend ends up (API Gateway/Lambda, EC2, etc.) and rebuild before each deploy.

## Notes for your teammate (backend)

- Auth: expects a bearer token back from login/signup; the frontend stores it in `localStorage` under `hackcolab_token`.
- File uploads (demo video, pitch deck) are modeled as pre-signed S3 URLs (`upload.api.js`) so large files go straight to S3, not through the app server.
- There's no dedicated "Hackathons list vs. detail" split in the backend contract yet \u2014 `GET /hackathons` returns the list, `GET /hackathons/:id` returns one with a `team` array attached.
