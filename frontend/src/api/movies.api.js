import { MOVIES, langOf } from './mockData';

export const PAGE_SIZE = 12;

const delay = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

const sorters = {
  Popular: (a, b) => b.pop - a.pop,
  'Top rated': (a, b) => b.rating - a.rating,
  Newest: (a, b) => b.year - a.year,
  'A–Z': (a, b) => a.title.localeCompare(b.title),
};

// GET /api/movies?q&genre&lang&sort&page  (mocked; swap body for a real fetch later)
export async function fetchMovies({ q = '', genre = 'All', lang = 'Any language', sort = 'Popular', page = 1, signal }) {
  await delay(700, signal);
  if (q.toLowerCase().includes('fail')) throw new Error('Simulated upstream failure');

  const needle = q.trim().toLowerCase();
  const all = MOVIES.filter(
    (m) =>
      (genre === 'All' || m.genres.includes(genre)) &&
      (lang === 'Any language' || langOf(m.id) === lang) &&
      (!needle || m.title.toLowerCase().includes(needle)),
  ).sort(sorters[sort] || sorters.Popular);

  const start = (page - 1) * PAGE_SIZE;
  return {
    results: all.slice(start, start + PAGE_SIZE),
    page,
    totalPages: Math.max(1, Math.ceil(all.length / PAGE_SIZE)),
    totalResults: all.length,
  };
}

// GET /api/movies/home
export async function fetchHome() {
  const byPop = [...MOVIES].sort(sorters.Popular);
  return {
    featured: byPop[0],
    rows: [
      { title: 'Trending this week', items: byPop.slice(0, 8) },
      { title: `Because you saved ${byPop[0].title}`, items: MOVIES.filter((m) => /Sci-Fi|Thriller|Mystery/.test(m.genres)).slice(0, 8) },
      { title: 'Top rated of the decade', items: [...MOVIES].sort(sorters['Top rated']).slice(0, 8) },
    ],
  };
}

// GET /api/movies/:id
export async function fetchMovie(id) {
  const movie = MOVIES.find((m) => m.id === Number(id));
  if (!movie) throw new Error('Movie not found');
  return { movie, similar: MOVIES.filter((m) => m.id !== movie.id).slice(0, 8) };
}
