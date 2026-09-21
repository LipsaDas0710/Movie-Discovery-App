const movies = require('../services/movies.service');

// X-Cache tells you (and the reviewer) whether a response came from cache, TMDB, or a stale fallback.
const send = (res, { value, source, data }, maxAge) => {
  res.set('X-Cache', source === 'cache' ? 'HIT' : source === 'stale' ? 'STALE' : 'MISS');
  res.set('Cache-Control', source === 'stale' ? 'no-store' : `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 5}`);
  res.json(value ?? data);
};

exports.search = async (req, res) => send(res, await movies.searchMovies(req.valid.query), 60);
exports.home = async (_req, res) => send(res, await movies.getHome(), 120);
exports.detail = async (req, res) => send(res, await movies.getMovie(req.valid.params.id), 300);
exports.genres = async (_req, res) => {
  const { data, source } = await movies.getGenres();
  send(res, { data, source }, 3600);
};
