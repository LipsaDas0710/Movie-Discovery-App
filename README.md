# Cineverse — Movie Discovery App

A React + Node.js + MongoDB Atlas movie discovery app backed by TMDB. Users can search, filter, sort, and browse movies, save a persistent wishlist, and sign in to write reviews that everyone else can see.

- `frontend/` — React (Vite) client
- `backend/` — Express API: wraps TMDB (caching, retries, rate-limit protection), owns accounts, wishlists, and reviews in MongoDB

## Setup

Requires Node 20+.

1. Get a TMDB **API Read Access Token** (themoviedb.org → Settings → API) and a MongoDB Atlas connection string (a free cluster is enough).
2. Backend:
   ```
   cd backend
   cp .env.example .env   # fill in TMDB_API_KEY, MONGODB_URI, COOKIE_SECRET
   npm install
   npm test               # 21 tests, no network/DB needed — TMDB and Mongo are stubbed
   npm run dev             # http://localhost:5000/health should show {"status":"ok","db":true}
   ```
3. Frontend:
   ```
   cd frontend
   npm install
   npm run dev             # http://localhost:5173 (Vite proxies /api to the backend)
   ```
4. In MongoDB Atlas, add your IP under Network Access, and make sure your connection string includes a database name (e.g. `.../cineverse?...`) — an empty path silently defaults to a database literally called `test`.

No login is required to browse, search, or build a wishlist. Signing in (email + password) is only needed to write a review.

## Approach

The brief asked for a client that never talks to TMDB directly, so the backend is a real API of its own, not a thin proxy: it validates every input, owns caching and retry logic, and is the only thing holding the TMDB key. The frontend only ever talks to `/api/*`.

Build order was backend-first: TMDB client → mapper (TMDB's shape is not our shape) → cache → routes → tests, then the frontend was wired to the real API once it existed, replacing an initial mock data layer used to get the UI built and pixel-matched to the supplied design early.

Search, filters, sort, and pagination all live in the URL (`/explore?q=&genre=&language=&sort=&page=`), not component state, so the back button, a shared link, and a reload all restore the same view.

## Decisions

- **Two-tier caching + request coalescing.** Each TMDB response is cached with a TTL (lists 5 min, movie detail 1 hour, genres 24 hours) and identical concurrent requests are merged into a single upstream call, so a burst of the same search only hits TMDB once. A second "stale" cache is kept alongside the fresh one specifically to serve if TMDB is down.
- **Retry, timeout, and circuit breaker on the TMDB client.** Requests retry with backoff and honour `Retry-After` on 429s; after 5 consecutive failures a circuit breaker opens for 30 seconds so a TMDB outage doesn't pile up slow, doomed requests. A concurrency limiter caps in-flight TMDB calls.
- **No forced login to use the app.** The assignment doesn't require accounts, so wishlists work for anyone via an anonymous signed httpOnly cookie. Accounts (email + password, bcrypt-hashed, session cookie) were added afterwards, specifically so reviews could be attributed to a real identity rather than being anonymous or device-bound.
- **Reviews are server-owned, not client-trusted.** A review's author name is taken from the signed-in session, never from the request body. One review per person per movie — posting again edits it instead of creating a duplicate.
- **Wishlist snapshots, not live joins.** A wishlist entry stores a small snapshot (title, year, rating, poster) taken from TMDB at the moment it's added, so the wishlist page renders without a TMDB round-trip per item. The canonical movie data still lives in TMDB, not duplicated wholesale in Mongo.
- **Consistent, safe error shape.** Every failure returns `{ error: { code, message } }` — no stack traces, no internals — whether it's a validation failure, a 404, or TMDB being down.

## Assumptions

- A reviewer's own MongoDB Atlas cluster and TMDB account are used to run this, not a shared one.
- "Persistent wishlist" means per-browser (anonymous cookie), not synced across devices, since no login was required by the brief.
- TMDB's own aggregate rating (shown as "★ 7.4 from 1,284 ratings") is treated as separate from Cineverse's own reviews, since they're different data sources.
- Reviews were added as a reasonable extension once accounts existed, not because the assignment required them — noted here so it's clear which parts are core requirements versus additions built on top.

## Limitations

- **Search can't combine with genre/language/sort.** TMDB's `/search/movie` endpoint has no genre, language, or sort parameters at all — only `/discover/movie` does, and discover has no free-text search. So typing a query filters and sorts only the page of results TMDB already returned for that query; it isn't a true server-side combined filter. This is a TMDB API limitation, not a bug.
- **Cache and rate limiting are in-memory, per server instance.** Fine for one instance; running several behind a load balancer would need a shared store (Redis) instead — the codebase leaves a `REDIS_URL` slot for this but doesn't implement it.
- **No server-side session revocation.** Logging out clears the cookie client-side, but a copied/stolen session cookie would remain valid until it expires (30 days), even after logout or a password change. Fixing this properly means tracking sessions (or a token version) in the database.
- **No email verification or password reset.** Anyone can register with any email address without proving they own it; there's no flow yet to recover a forgotten password.
- **Reviews only exist where someone has posted one.** TMDB doesn't supply user reviews, so most movies legitimately show "no reviews yet" rather than pre-filled content — nothing here is faked to look more populated than it is.
- **Rate limiting is per-IP**, not per-account, so a distributed attacker could still spread login attempts across many IPs.

## AI usage

I used Claude (Anthropic's AI assistant) heavily throughout this project, as a full pair-programmer for implementation — it wrote most of the backend (TMDB client, caching/retry/circuit-breaker logic, mappers, auth, wishlist, and reviews services, validation, tests) and most of the frontend wiring (API layer, React Query hooks, pages), and ported the supplied HTML/CSS design into React components.

What I drove: the product requirements and architecture decisions (React + Node + Mongo, no Next.js, separate deployable frontend/backend folders, no forced login), matching the design exactly, deciding what to build beyond the brief (accounts + reviews) and in what order, and reviewing/testing the result — I ran the app against my own TMDB key and Atlas cluster at each stage, caught and asked for fixes on real issues along the way (a black-screen bug, a MongoDB DNS failure, a TMDB key error, an env-reload gotcha, a login timing side-channel, and the database name defaulting to `test`), and asked for a live security pass on the auth flow before trusting it.

I'm disclosing this plainly because I expect to be asked to explain any part of this code in a follow-up review or live session, and I'd rather be upfront about how it was built than overstate how much I wrote unassisted.

## Future improvements

- Move cache and rate limiting to Redis so the API can run as more than one instance.
- Add server-side session revocation (a token version per user, invalidated on logout/password change).
- Email verification and password reset.
- Merge an anonymous wishlist into an account on login, so switching from anonymous to signed-in doesn't feel like starting over.
- Let a user edit or delete their own review from the UI (the backend already supports it; it isn't wired to a button).
- A trailer link (currently a static, non-functional button in the design).
