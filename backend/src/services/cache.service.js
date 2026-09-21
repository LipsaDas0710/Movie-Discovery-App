const { LRUCache } = require('lru-cache');
const logger = require('../utils/logger');

// Two tiers: `fresh` honours the TTL; `stale` keeps the last good value so we can still
// answer when TMDB is down. In-memory per instance — swap for Redis to share across instances.
const fresh = new LRUCache({ max: 2000 });
const stale = new LRUCache({ max: 2000 });
const inflight = new Map(); // key -> Promise, so identical concurrent requests hit TMDB once

/**
 * @returns {Promise<{value: any, source: 'cache'|'origin'|'stale'}>}
 */
function getOrFetch(key, ttlMs, fetcher) {
  const hit = fresh.get(key);
  if (hit !== undefined) return Promise.resolve({ value: hit, source: 'cache' });

  if (inflight.has(key)) return inflight.get(key);

  const promise = (async () => {
    try {
      const value = await fetcher();
      fresh.set(key, value, { ttl: ttlMs });
      stale.set(key, value);
      return { value, source: 'origin' };
    } catch (err) {
      const old = stale.get(key);
      if (old !== undefined && err.code !== 'NOT_FOUND') {
        logger.warn({ key, err: err.message }, 'Serving stale cache after upstream failure');
        return { value: old, source: 'stale' };
      }
      throw err;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}

const clear = () => {
  fresh.clear();
  stale.clear();
  inflight.clear();
};

module.exports = { getOrFetch, clear };
