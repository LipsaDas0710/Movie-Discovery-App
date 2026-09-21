const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

// Accepts either a v4 "API Read Access Token" (JWT, sent as Bearer) or a v3 API key (sent as ?api_key=).
const isBearer = env.TMDB_API_KEY.startsWith('eyJ');
const http = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  timeout: 8000,
  headers: isBearer ? { Authorization: `Bearer ${env.TMDB_API_KEY}` } : {},
});
const withAuth = (params) => (isBearer ? params : { ...params, api_key: env.TMDB_API_KEY });

const MAX_RETRIES = 2;
const MAX_CONCURRENT = 20; // stay well under TMDB's ~40-50 req/s limit
const BREAKER_THRESHOLD = 5;
const BREAKER_OPEN_MS = 30_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- concurrency limiter (simple semaphore) ---
let inFlight = 0;
const waiters = [];
const acquire = () => (inFlight < MAX_CONCURRENT ? (inFlight++, Promise.resolve()) : new Promise((r) => waiters.push(r)));
const release = () => {
  const next = waiters.shift();
  if (next) next(); // hand the slot straight to the next waiter
  else inFlight--;
};

// --- circuit breaker: after repeated upstream failures, fail fast instead of piling on ---
const breaker = { failures: 0, openUntil: 0 };
const onSuccess = () => { breaker.failures = 0; };
const onFailure = () => {
  breaker.failures += 1;
  if (breaker.failures >= BREAKER_THRESHOLD) {
    breaker.openUntil = Date.now() + BREAKER_OPEN_MS;
    breaker.failures = 0;
    logger.warn('TMDB circuit breaker opened');
  }
};

const backoff = (attempt, err) => {
  const retryAfter = Number(err.response?.headers?.['retry-after']);
  if (err.response?.status === 429 && retryAfter > 0) return Math.min(retryAfter, 5) * 1000;
  return 300 * 2 ** attempt + Math.random() * 150;
};

async function request(path, params) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await http.get(path, { params: withAuth(params) });
      onSuccess();
      return res.data;
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) throw new AppError(404, 'NOT_FOUND', 'Resource not found');
      const retryable = !status || status === 429 || status >= 500; // network error, timeout, throttled, 5xx
      if (!retryable) {
        logger.error({ status, path }, 'TMDB rejected request (check TMDB_API_KEY)');
        throw new AppError(502, 'UPSTREAM_ERROR', 'Movie service rejected the request');
      }
      if (attempt >= MAX_RETRIES) {
        onFailure();
        throw new AppError(503, 'UPSTREAM_UNAVAILABLE', 'Movie service is temporarily unavailable');
      }
      await sleep(backoff(attempt, err));
    }
  }
}

// Exported as an object property so tests can stub `tmdb.get`.
async function get(path, params = {}) {
  if (Date.now() < breaker.openUntil) {
    throw new AppError(503, 'UPSTREAM_UNAVAILABLE', 'Movie service is temporarily unavailable');
  }
  await acquire();
  try {
    return await request(path, params);
  } finally {
    release();
  }
}

module.exports = { get };
