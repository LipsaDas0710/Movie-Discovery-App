const rateLimit = require('express-rate-limit');

const tooMany = { error: { code: 'RATE_LIMITED', message: 'Too many requests, please slow down' } };

// Per-IP. In-memory store is per instance; use a Redis store when running several instances.
const api = rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false, message: tooMany });
const writes = rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false, message: tooMany });
// Stricter: slows down password-guessing against register/login.
const auth = rateLimit({ windowMs: 15 * 60_000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false, message: tooMany });

module.exports = { api, writes, auth };
