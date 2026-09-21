const env = require('../config/env');
const AppError = require('../utils/AppError');

// CSRF guard for state-changing requests: since the auth cookie may be SameSite=None,
// reject writes whose Origin is present but not one of our frontends.
module.exports = function requireAllowedOrigin(req, _res, next) {
  const origin = req.get('origin');
  if (origin && !env.corsOrigins.includes(origin)) {
    return next(new AppError(403, 'FORBIDDEN_ORIGIN', 'Origin not allowed'));
  }
  return next();
};
