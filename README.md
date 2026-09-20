# HackColab

HackColab is a React/Vite frontend backed by an Express API and PostgreSQL via Prisma. There is no mock-data mode: every screen loads and mutates persisted data through `/api`.

## Run locally

1. Set `DATABASE_URL`, `JWT_SECRET`, and (for uploads) the AWS S3 variables in `backend/.env`. Set `VITE_API_BASE_URL` in `frontend/.env` if the API is not at `http://localhost:5000/api`.
2. In one terminal, run `cd backend; npm install; npx prisma migrate deploy; npm start`.
3. In another terminal, run `cd frontend; npm install; npm run dev`.
4. Create an account, then create a hackathon. Its primary team is created at the same time; the dashboard, tasks, calendar, Git, files, and submission screens use that persisted workspace.

The API resolves its configuration from `backend/.env` when launched from `backend/`.

## Data flow

- Authentication: `/api/auth`
- Hackathons and teams: `/api/hackathons`, `/api/teams`
- Tasks, deadlines, submissions, and uploads: team/hackathon API resources
- Repository, pull-request, and conflict data: repository API resources synchronized from GitHub

All frontend network access is centralized in `frontend/src/services/`; UI components do not import mock datasets.

## Team membership

Team leadership is scoped to each team, not to a user globally. A lead can add an
existing account, remove non-lead members, delete their team, or invite a new email
address. Pending invitations are accepted automatically when that email signs up.
