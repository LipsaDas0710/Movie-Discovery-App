const tmdb = require('./tmdb.client'); // call as tmdb.get(...) so tests can stub it
const cache = require('./cache.service');
const { toSummary, toDetail, toBackdropSummary } = require('../mappers/movie.mapper');

const TTL = {
  list: 5 * 60_000,
  home: 10 * 60_000,
  detail: 60 * 60_000,
  genres: 24 * 60 * 60_000,
};
const MAX_TMDB_PAGE = 500; // TMDB refuses pages beyond 500

const SORT_MAP = {
  popularity: 'popularity.desc',
  rating: 'vote_average.desc',
  newest: 'primary_release_date.desc',
  title: 'original_title.asc',
};

async function getGenres() {
  const { value, source } = await cache.getOrFetch('genres', TTL.genres, async () => {
    const data = await tmdb.get('/genre/movie/list', { language: 'en-US' });
    return (data.genres || []).map((g) => ({ id: g.id, name: g.name }));
  });
  return { data: value, source };
}

async function genreMap() {
  try {
    const { data } = await getGenres();
    return new Map(data.map((g) => [g.id, g.name]));
  } catch {
    return new Map(); // genre names are decoration; never fail a request over them
  }
}

const inPageSorters = {
  popularity: (a, b) => b.popularity - a.popularity,
  rating: (a, b) => (b.rating ?? -1) - (a.rating ?? -1),
  newest: (a, b) => (b.year ?? 0) - (a.year ?? 0),
  title: (a, b) => a.title.localeCompare(b.title),
};

async function searchMovies({ q, genre, language, sort, page }) {
  const normalized = { q: q.toLowerCase(), genre, language, sort, page };
  const key = `search:${JSON.stringify(normalized)}`;

  return cache.getOrFetch(key, TTL.list, async () => {
    const genres = await genreMap();
    let data;

    if (normalized.q) {
      // TMDB's text search has no genre/language/sort options, so these are applied to the returned page.
      data = await tmdb.get('/search/movie', { query: q, page, include_adult: false });
    } else {
      const params = { page, sort_by: SORT_MAP[sort], include_adult: false };
      if (genre) params.with_genres = genre;
      if (language) params.with_original_language = language;
      if (sort === 'rating') params['vote_count.gte'] = 300; // avoid 10/10 films with 3 votes
      if (sort === 'newest') {
        params['primary_release_date.lte'] = new Date().toISOString().slice(0, 10);
        params['vote_count.gte'] = 20;
      }
      data = await tmdb.get('/discover/movie', params);
    }

    let results = (data.results || []).map((m) => ({ ...toSummary(m, genres), _genreIds: m.genre_ids || [] }));
    if (normalized.q) {
      if (genre) results = results.filter((m) => m._genreIds.includes(genre));
      if (language) results = results.filter((m) => m.language === language);
      results.sort(inPageSorters[sort]);
    }
    results.forEach((m) => delete m._genreIds);

    return {
      results,
      page: data.page || page,
      totalPages: Math.min(data.total_pages || 1, MAX_TMDB_PAGE),
      totalResults: data.total_results || 0,
    };
  });
}

async function getHome() {
  return cache.getOrFetch('home', TTL.home, async () => {
    const [genres, trending, topRated, nowPlaying] = await Promise.all([
      genreMap(),
      tmdb.get('/trending/movie/week'),
      tmdb.get('/movie/top_rated', { page: 1 }),
      tmdb.get('/movie/now_playing', { page: 1 }),
    ]);
    const list = (d) => (d.results || []).slice(0, 12).map((m) => toSummary(m, genres));
    const featuredRaw = (trending.results || []).find((m) => m.overview && m.backdrop_path) || (trending.results || [])[0];

    return {
      featured: featuredRaw ? toBackdropSummary(featuredRaw, genres) : null,
      rows: [
        { title: 'Trending this week', items: list(trending) },
        { title: 'Now in cinemas', items: list(nowPlaying) },
        { title: 'Top rated of all time', items: list(topRated) },
      ].filter((r) => r.items.length > 0),
    };
  });
}

async function getMovie(id) {
  return cache.getOrFetch(`movie:${id}`, TTL.detail, async () => {
    const [genres, data] = await Promise.all([
      genreMap(),
      tmdb.get(`/movie/${id}`, { append_to_response: 'credits,recommendations' }), // one call instead of three
    ]);
    return toDetail(data, genres);
  });
}

module.exports = { searchMovies, getHome, getMovie, getGenres };
