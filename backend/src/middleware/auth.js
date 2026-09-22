const User = require('../models/User');
const AppError = require('../utils/AppError');

const COOKIE = 'cv_session';

async function lookup(req) {
  const userId = req.signedCookies?.[COOKIE];
  if (!userId) return null;
  // Confirm the account still exists (it may have been deleted since the cookie was set).
  const user = await User.findById(userId).lean().catch(() => null);
  return user ? { id: userId, email: user.email, displayName: user.displayName } : null;
}

// Blocks the request unless a valid session cookie is present.
async function requireAuth(req, _res, next) {
  const user = await lookup(req);
  if (!user) return next(new AppError(401, 'AUTH_REQUIRED', 'Sign in to do that'));
  req.authUserId = user.id;
  req.user = user;
  next();
}

// Never blocks; attaches req.user/req.authUserId when a valid session cookie is present.
async function optionalAuth(req, _res, next) {
  const user = await lookup(req);
  if (user) {
    req.authUserId = user.id;
    req.user = user;
  }
  next();
}

module.exports = { requireAuth, optionalAuth, COOKIE };
