# Music Playlist Manager

A full-stack web application for creating and managing music playlists. Built with React, Express.js, and PostgreSQL, with JWT-based authentication and Docker support. Users can register, create playlists, search real songs via the iTunes API, add and remove songs, reorder via drag-and-drop, mark favourites, and view personalized stats — all backed by a relational database.

---

## Quick Start (Docker )

The fastest way to run the project. Requires only Docker and Docker Compose.

```bash
git clone https://github.com/Anushka666666/music-playlist-manager.git
cd music-playlist-manager
docker-compose up --build
```

Then open **http://localhost** in your browser.

That's it — no Node.js, PostgreSQL, or manual setup needed. Docker handles everything.

---

## Manual Setup (without Docker)

### Prerequisites
- Node.js v18+
- PostgreSQL v14+

### 1. Database setup
```bash
sudo -u postgres psql
CREATE DATABASE playlist_manager;
\q

sudo -u postgres psql -d playlist_manager -f server/setup.sql
sudo -u postgres psql -d playlist_manager -f docker-init.sql
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run in two terminals
```bash
# Terminal 1 — Backend
npm run server

# Terminal 2 — Frontend
npm run dev
```

Open **http://localhost:5173**

---

## Features

| Feature | Description |
|---|---|
| 🔐 User authentication | Register and login with JWT tokens (bcrypt-hashed passwords) |
| 🎵 Playlist management | Create, delete, and filter playlists |
| 🔍 iTunes song search | Real-time song search using the iTunes Search API |
| ➕ Add/remove songs | Add search results to any playlist with duplicate detection |
| ▶ Song preview | Play 30-second previews directly from each song |
| ⠿ Drag-and-drop reorder | Reorder songs within a playlist (persisted to DB) |
| ⭐ Favourite songs | Mark songs as favourites across playlists |
| 📊 Stats dashboard | View total songs, top artists, biggest playlists, favourites |
| 🔎 Search/filter | Filter playlists by name or song title/artist |

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19 + Vite | Component-based UI, fast dev server, optimized build |
| Backend | Node.js + Express.js | REST API server |
| Database | PostgreSQL 16 | Relational data storage with foreign keys, indexes |
| Auth | JWT + bcryptjs | Secure stateless authentication, password hashing |
| External API | iTunes Search API | Real song data (no API key required) |
| UI extras | @dnd-kit | Accessible drag-and-drop reordering |
| Containerization | Docker + Docker Compose | One-command setup |
| Web server | Nginx | Production frontend serving + API proxying |

---

## REST API Endpoints

All `/playlists` and `/songs` endpoints require a JWT in the `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Authenticate, returns JWT |
| GET | `/api/playlists` | Get current user's playlists with songs |
| POST | `/api/playlists` | Create new playlist |
| DELETE | `/api/playlists/:id` | Delete playlist (cascades to songs) |
| POST | `/api/playlists/:id/songs` | Add song to playlist |
| DELETE | `/api/playlists/:playlistId/songs/:songId` | Remove song |
| PUT | `/api/playlists/:id/songs/reorder` | Reorder songs (transactional) |
| PATCH | `/api/songs/:id/favourite` | Toggle favourite |

---

## Project Structure

```
music-playlist-manager/
├── docker-compose.yml          # Docker orchestration
├── Dockerfile                  # Backend image
├── Dockerfile.client           # Frontend image (nginx)
├── nginx.conf                  # Nginx routing + API proxy
├── docker-init.sql             # Users + auth tables
├── schema.sql                  # Reference SQL schema
├── README.md
├── package.json
├── index.html
├── vite.config.js
├── server/
│   ├── index.js                # Express entry point
│   ├── db.js                   # PostgreSQL pool
│   ├── setup.sql               # Initial table creation
│   ├── middleware/
│   │   └── auth.js             # JWT verification middleware
│   └── routes/
│       ├── auth.js             # Register + login
│       ├── playlists.js        # Playlist + song CRUD
│       └── songs.js            # Favourite toggle
└── src/
    ├── main.jsx
    ├── App.jsx                 # Root component, state, auth flow
    ├── App.css
    ├── components/
    │   ├── LoginPage.jsx
    │   ├── PlaylistPanel.jsx
    │   ├── SongPanel.jsx
    │   ├── SongCard.jsx
    │   └── StatsPage.jsx
    └── utils/
        └── api.js              # Backend API client
```

---

## Assumptions

- The app is scoped for individual users — each registered user sees only their own playlists.
- The iTunes Search API is free and doesn't require an API key. Rate limits may apply for heavy usage.
- Passwords are hashed using bcrypt (10 rounds) and never stored in plain text.
- JWTs expire after 7 days. Frontend handles expiry by clearing storage and prompting re-login.
- For evaluation, Docker is the recommended setup path — it eliminates environment-specific issues.
- The default `JWT_SECRET` in `docker-compose.yml` is for local development only and should be changed in production.

---

## AI Tools Used

During the development of this project, I used **Claude (by Anthropic)** as my primary AI-assisted development tool. Claude helped me plan the application architecture — including the choice of a three-layer structure (React frontend, Express REST API, PostgreSQL database) — and iteratively scaffold each component, API route, and database schema. I used it conversationally: describing what I wanted to build, reviewing the generated code, asking clarifying questions about unfamiliar concepts (React hooks, Express middleware, PostgreSQL transactions, JWT flows), and making the architectural decisions myself.

The main challenge was scoping the project appropriately. Claude helped me weigh tradeoffs at each step — for example, choosing PostgreSQL over localStorage to demonstrate database design, then later containerizing with Docker so that evaluation requires only one command (`docker-compose up`). Debugging was also a key part of the process: when port conflicts, missing database columns, or Docker networking issues came up, I used Claude to interpret error messages and apply targeted fixes rather than trial-and-error. AI-assisted development substantially accelerated boilerplate and scaffolding, freeing me to focus on understanding the code I was shipping.
