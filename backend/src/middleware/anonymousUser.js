const { randomUUID } = require('crypto');
const env = require('../config/env');

const COOKIE = 'cv_uid';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// No login: each browser gets a random, signed, httpOnly cookie id that owns its wishlist.
// Signed => the client can't guess or forge another user's id.
module.exports = function anonymousUser(req, res, next) {
  let id = req.signedCookies?.[COOKIE];
  if (!id || !UUID.test(id)) {
    id = randomUUID();
    res.cookie(COOKIE, id, {
      httpOnly: true,
      signed: true,
      secure: env.isProd,
      sameSite: env.isProd ? 'none' : 'lax', // 'none' needed when frontend and API are on different domains
      maxAge: 2 * 365 * 24 * 60 * 60 * 1000,
    });
  }
  req.userId = id;
  next();
};
