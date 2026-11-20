
# ![Coy Discover](assets/android-chrome-192x192.png) Coy Discover

> A swipe-based **Discover** tab built for the Coy SDE intern assignment.
> **Stack:** React (Vite) + Tailwind CSS v4 + Node/Express + MongoDB Atlas (Mongoose).

The tab bar has a blank **Home** tab and the **Discover** tab. Inside Discover you can switch between **Swipe** and **Matches**.

---

## Run locally

### 1. MongoDB Atlas

1. Create a free **M0** cluster on <https://cloud.mongodb.com>
2. **Database Access:** add a database user (username and password)
3. **Network Access:** add your IP (or `0.0.0.0/0` for a demo)
4. **Connect → Drivers:** copy the connection string

### 2. Server

```bash
cd server
cp .env.example .env        # paste your MONGODB_URI
npm install
npm run seed                # inserts 30 profiles, 10 of them already like you
npm run dev                 # http://localhost:5000
```

### 3. Client

```bash
cd client
npm install
npm run dev
```

Open it in a phone-sized window (or Chrome DevTools device mode) to try the drag gesture. On desktop use the buttons or the left/right arrow keys.

---

## Project structure (Server)

```bash
server/
   ├── config/
   │   └── db.js                  # connectDB() + Swipe.init()
   ├── models/
   │   ├── Profile.js             # name, age, photo, bio, city, interests, likedMe
   │   ├── Swipe.js               # profile (unique), action, timestamps
   │   └── index.js               # barrel export
   ├── routes/
   │   ├── health.routes.js       # GET  /health
   │   ├── feed.routes.js         # GET  /feed
   │   ├── swipe.routes.js        # POST /swipe
   │   ├── matches.routes.js      # GET  /matches
   │   ├── reset.routes.js        # POST /reset  (dev-only)
   │   └── index.js               # aggregates all routers
   ├── middleware/
   │   ├── requestLogger.js       # dev: colored multi-line · prod: JSON line
   │   └── errorHandler.js        # central 500 handler
   ├── utils/
   │   └── serializers.js         # PUBLIC_FIELDS, toPublic()
   ├── seed.js                     # inserts 30 profiles, 10 of them pre-liked
   ├── .env.example
   ├── package.json
   ├── app.js                     # builds Express app (exported, no listen)
   └── server.js                  # entry point (connectDB + listen)

```

## API

| Method | Path       | File                       | Description                                                                           |
| ------ | ---------- | -------------------------- | ------------------------------------------------------------------------------------- |
| GET    | `/health`  | `routes/health.routes.js`  | Liveness check — `{ ok: true }`                                                       |
| GET    | `/feed`    | `routes/feed.routes.js`    | Profiles not swiped on yet                                                            |
| POST   | `/swipe`   | `routes/swipe.routes.js`   | Body `{ profileId, action: "like" \| "pass" }`. Returns `{ action, match, profile? }` |
| GET    | `/matches` | `routes/matches.routes.js` | Mutual matches only                                                                   |
| POST   | `/reset`   | `routes/reset.routes.js`   | Deletes all swipes. **Disabled when `NODE_ENV=production`**                           |

All routes are also served under `/api/...` (used by the Vite dev proxy).

---

## How the privacy promise is protected

The core promise of Coy is that **nobody learns who liked them unless it is mutual**.

- The `likedMe` field on `Profile` is declared `select: false`, so **no query returns it unless it is asked for explicitly**. `/feed` never selects it.
- `/swipe` only returns `match: true` when the user liked the profile **and** the profile liked the user. A pass, or a like on someone who has not liked you, returns the same `match: false` — the caller cannot tell the two apart.
- `/matches` filters to mutual likes and strips `likedMe` before responding.
- A profile can only be swiped once: `Swipe.profile` has a unique index, so even two racing requests cannot create duplicates. Repeating a swipe returns the first result and never overwrites it. `/feed` excludes swiped profiles, so they never come back after a reload.

### Why these choices hold up

| Concern                          | Guarantee                                                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Leaking `likedMe` via `/feed`    | Field is `select: false`; `/feed` doesn't opt in.                                                                                     |
| Timing side-channel on `/swipe`  | Both "pass" and "like, not mutual" return the same shape: `{ action, match: false }`. Only a genuine mutual like reveals the profile. |
| Duplicate swipes                 | Unique index on `Swipe.profile` + `findOneAndUpdate` with `$setOnInsert`. First write wins; races fall back to a plain `findOne`.     |
| Re-seeing swiped profiles        | `/feed` does `Swipe.distinct('profile')` and excludes those ids.                                                                      |
| `likedMe` leaking via `/matches` | Query selects `+likedMe` to filter, then `toPublic()` strips it before `res.json`.                                                    |

---

## Observability

Every request is logged by **`src/middleware/requestLogger.js`** — a zero-dependency middleware mounted before the routes in `app.js`.

### Development (`NODE_ENV` not `production`)

Colored, multi-line, full detail — enough to debug a request without opening DevTools:

```bash
INFO 2026-11-20T10:23:41.512Z POST /api/swipe 200 12.34ms
  ip: ::1  ua: Mozilla/5.0 ...
  body: { profileId: '665...', action: 'like' }
  response: { action: 'like', match: true, profile: { ... } }
```

### Production (`NODE_ENV=production`)

Single-line JSON per request — easy to ingest into Datadog / Loki / CloudWatch. **Request and response bodies are never logged in prod** (privacy + perf).

```json
{"level":"INFO","time":"2026-11-20T10:23:41.512Z","method":"POST","url":"/api/swipe","status":200,"durationMs":12.34,"ip":"203.0.113.5","userAgent":"Mozilla/5.0 ...","requestId":"a1b2c3"}
```

- Levels are derived from status code: `2xx → INFO`, `4xx → WARN`, `5xx → ERROR`.
- Timing uses `process.hrtime.bigint()` (monotonic) rather than `Date.now()`, so clock shifts don't corrupt durations.
- `res.on('finish')` fires even for aborted or errored responses, so nothing is silently missed.

---

## Scripts

| Script         | Command                 | Purpose                           |
| -------------- | ----------------------- | --------------------------------- |
| `npm start`    | `node src/server.js`    | Production start                  |
| `npm run dev`  | `nodemon src/server.js` | Dev server with auto-restart      |
| `npm run seed` | `node seed.js`          | Insert 30 profiles (10 pre-liked) |

### `.env.example`

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/coy
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

---

## Try the privacy promise yourself

1. `npm run seed` then `npm run dev`.
2. Open the client, swipe **pass** on a few profiles, then **like** one that hasn't liked you — the response is `match: false`, no profile returned.
3. Like one of the 10 profiles that pre-liked you (they're seeded with `likedMe: true`) — you'll see `match: true` and the profile in the response.
4. Open the **Matches** tab — only mutual likes appear.
5. `curl -X POST http://localhost:5000/reset` to reset and replay (dev only; 403 in production).

---

## Design notes & trade-offs

- **Two mount points (`/` and `/api`)** — the assignment specifies `/feed`, but the Vite proxy uses `/api/*`. Mounting the same router twice keeps both happy without duplicating route definitions.
- **`select: false` on `likedMe`** — defense in depth. Even if a future route forgets to strip it, the field won't come back by accident.
- **`findOneAndUpdate` + `$setOnInsert`** — makes `POST /swipe` idempotent: the first swipe wins, retries never overwrite. Combined with the unique index, this is safe under concurrent requests.
- **`app.js` vs `server.js` split** — `app.js` exports the Express app (no `listen`), which makes it trivially unit-testable with `supertest`. `server.js` handles `connectDB` + `listen` + exit-on-failure.
- **No external logger** — `requestLogger` is ~40 lines, zero dependencies, and does exactly what the assignment needs. Swapping in `pino` later is a one-file change.

---

## What I'd do next

- Swap the demo `POST /reset` for a proper migration/seed pipeline.
- Rate-limit `/swipe` and `/feed` per IP to prevent enumeration.

---

## Author

Made by Aaditya Kumar
