# Movie Discovery App

React + Node.js + MongoDB Atlas movie discovery app using TMDB.

- `frontend/` React (Vite) client
- `backend/` Express API: TMDB proxy, caching, wishlist

## Setup

Requires Node 20+.

1. Get a TMDB API Read Access Token (themoviedb.org -> Settings -> API) and a MongoDB Atlas connection string.
2. Backend:
   ```
   cd backend
   cp .env.example .env   # fill in values
   npm install
   npm run dev            # http://localhost:5000/health
   ```
3. Frontend:
   ```
   cd frontend
   npm install
   npm run dev            # http://localhost:5173
   ```

(Approach, decisions, assumptions, limitations, AI usage and future work sections to be completed.)
