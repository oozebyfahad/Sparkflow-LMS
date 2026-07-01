# Sparkflow LMS — Lead Management System

A full-stack lead management dashboard built for digital marketing agencies.

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** SQLite (better-sqlite3) — no setup needed, file-based

## Project Structure

```
sparkflow-lms/
├── client/          # React frontend (Vite)
├── server/          # Express backend
├── package.json     # Root — runs both with concurrently
└── README.md
```

## Quick Start

### Step 1 — Install dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

Or run all at once:

```bash
npm run install:all
```

### Step 2 — Start development servers

```bash
npm run dev
```

This starts:
- **Backend** → `http://localhost:5000`
- **Frontend** → `http://localhost:3000`

The client proxies `/api` requests to the server automatically.

## Features

| Page | Description |
|------|-------------|
| **Dashboard** | KPI cards, pipeline funnel, recent activity feed |
| **Lead Tracker** | Full table with inline editing, filters, add/delete |
| **Audit Checklist** | Per-lead audit scoring for Website, Social, Branding, Video |
| **Cold Call Script** | Step-by-step call guide with objection handlers |
| **Email Templates** | 4 templates with copy-to-clipboard and variable highlighting |
| **Follow-Up Queue** | Overdue & due-today leads with quick actions |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | All leads |
| GET | `/api/leads/:id` | Single lead |
| POST | `/api/leads` | Create lead |
| PUT | `/api/leads/:id` | Update lead (partial update) |
| DELETE | `/api/leads/:id` | Delete lead |
| GET | `/api/dashboard` | KPI + pipeline + activity data |
| GET | `/api/followups` | Overdue/today follow-ups |

## Database

SQLite file is auto-created at `server/sparkflow.db` on first run.
10 sample leads are seeded automatically when the DB is empty.
No setup, no migrations needed.
