// Runs with Node's built-in test runner: `npm test`. TMDB is stubbed; no network or DB needed.
process.env.TMDB_API_KEY = 'test-key';
process.env.MONGODB_URI = 'mongodb://localhost/test';
process.env.COOKIE_SECRET = '0123456789abcdef0123';
process.env.NODE_ENV = 'test';

const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../src/app');
const tmdb = require('../src/services/tmdb.client');
const cache = require('../src/services/cache.service');
const AppError = require('../src/utils/AppError');
const { toSummary, toDetail } = require('../src/mappers/movie.mapper');

let calls;
const GENRES = { genres: [{ id: 18, name: 'Drama' }, { id: 878, name: 'Science Fiction' }] };
const movie = (id, extra = {}) => ({
  id, title: `Movie ${id}`, release_date: '2024-05-01', vote_average: 7.46, vote_count: 100,
  poster_path: '/p.jpg', genre_ids: [18], original_language: 'en', popularity: id, ...extra,
});

beforeEach(() => {
  cache.clear();
  calls = [];
  tmdb.get = async (path, params) => {
    calls.push(path);
    if (path === '/genre/movie/list') return GENRES;
    if (path === '/discover/movie') return { page: params.page, total_pages: 900, total_results: 18000, results: [movie(1), movie(2)] };
    if (path === '/search/movie') return { page: 1, total_pages: 1, total_results: 2, results: [movie(1, { genre_ids: [878] }), movie(2)] };
    if (path === '/movie/404') throw new AppError(404, 'NOT_FOUND', 'Resource not found');
    if (path.startsWith('/movie/')) {
      return { id: 5, title: 'Five', overview: 'x', genres: [{ id: 18, name: 'Drama' }], credits: { cast: [{ id: 1, name: 'A', character: 'B' }], crew: [{ job: 'Director', name: 'D' }] }, recommendations: { results: [movie(9)] } };
    }
    throw new Error(`unstubbed ${path}`);
  };
});

test('mapper survives missing/odd TMDB fields', () => {
  const s = toSummary({ id: 1, vote_count: 0, release_date: '' });
  assert.equal(s.title, 'Untitled');
  assert.equal(s.year, null);
  assert.equal(s.rating, null);
  assert.equal(s.posterUrl, null);
  const d = toDetail({ id: 2 });
  assert.deepEqual(d.cast, []);
  assert.equal(d.director, null);
});

test('GET /api/movies maps results, clamps totalPages to 500', async () => {
  const res = await request(app).get('/api/movies?page=2&sort=rating').expect(200);
  assert.equal(res.body.results[0].rating, 7.5);
  assert.deepEqual(res.body.results[0].genres, ['Drama']);
  assert.equal(res.body.totalPages, 500);
  assert.equal(res.headers['x-cache'], 'MISS');
});

test('repeated identical request is served from cache', async () => {
  await request(app).get('/api/movies?page=1').expect(200);
  const before = calls.length;
  const res = await request(app).get('/api/movies?page=1').expect(200);
  assert.equal(res.headers['x-cache'], 'HIT');
  assert.equal(calls.length, before);
});

test('concurrent identical requests hit TMDB once', async () => {
  await Promise.all([1, 2, 3, 4, 5].map(() => request(app).get('/api/movies?page=3').expect(200)));
  assert.equal(calls.filter((c) => c === '/discover/movie').length, 1);
});

test('text search applies genre filter to the page', async () => {
  const res = await request(app).get('/api/movies?q=Dune&genre=878').expect(200);
  assert.equal(res.body.results.length, 1);
  assert.equal(res.body.results[0].id, 1);
});

test('invalid input is rejected with 400', async () => {
  await request(app).get('/api/movies?page=0').expect(400);
  await request(app).get('/api/movies?page=501').expect(400);
  await request(app).get('/api/movies?sort=evil').expect(400);
  await request(app).get('/api/movies/abc').expect(400);
});

test('movie detail returns cast, director, similar; unknown id is 404', async () => {
  const res = await request(app).get('/api/movies/5').expect(200);
  assert.equal(res.body.director, 'D');
  assert.equal(res.body.cast[0].name, 'A');
  assert.equal(res.body.similar[0].id, 9);
  await request(app).get('/api/movies/404').expect(404);
});

test('serves the last good value when TMDB fails after the TTL expired', async () => {
  await cache.getOrFetch('k', 1, async () => 'good'); // 1ms TTL
  await new Promise((r) => setTimeout(r, 10));
  const out = await cache.getOrFetch('k', 1000, async () => {
    throw new AppError(503, 'UPSTREAM_UNAVAILABLE', 'down');
  });
  assert.equal(out.source, 'stale');
  assert.equal(out.value, 'good');
});

test('a 404 is never masked by stale data', async () => {
  await cache.getOrFetch('gone', 1, async () => 'old');
  await new Promise((r) => setTimeout(r, 10));
  await assert.rejects(
    cache.getOrFetch('gone', 1000, async () => { throw new AppError(404, 'NOT_FOUND', 'x'); }),
    { code: 'NOT_FOUND' },
  );
});

test('upstream outage with nothing cached returns a clean 503', async () => {
  tmdb.get = async () => { throw new AppError(503, 'UPSTREAM_UNAVAILABLE', 'Movie service is temporarily unavailable'); };
  const res = await request(app).get('/api/movies?page=7').expect(503);
  assert.equal(res.body.error.code, 'UPSTREAM_UNAVAILABLE');
});

test('wishlist writes reject foreign origins (CSRF guard)', async () => {
  await request(app).post('/api/wishlist').set('Origin', 'https://evil.example').send({ movieId: 1 }).expect(403);
});

test('wishlist validates body', async () => {
  await request(app).post('/api/wishlist').send({ movieId: 'nope' }).expect(400);
});

test('unknown route returns JSON 404', async () => {
  const res = await request(app).get('/api/nope').expect(404);
  assert.equal(res.body.error.code, 'NOT_FOUND');
});
