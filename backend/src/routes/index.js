const express = require('express');
const validate = require('../middleware/validate');
const anonymousUser = require('../middleware/anonymousUser');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const requireAllowedOrigin = require('../middleware/requireAllowedOrigin');
const { writes, auth: authLimiter } = require('../middleware/rateLimit');
const s = require('../validators/schemas');
const movies = require('../controllers/movies.controller');
const wishlist = require('../controllers/wishlist.controller');
const authCtrl = require('../controllers/auth.controller');
const reviews = require('../controllers/reviews.controller');

const router = express.Router();

// Public, cacheable catalogue endpoints (no cookie is set here so CDNs can cache them).
router.get('/genres', movies.genres);
router.get('/movies/home', movies.home);
router.get('/movies', validate({ query: s.searchQuery }), movies.search);
router.get('/movies/:id', validate({ params: s.movieParams }), movies.detail);

// Reviews: anyone can read a movie's reviews; only a signed-in account can write one.
router.get('/movies/:id/reviews', validate({ params: s.movieParams }), optionalAuth, reviews.list);
router.post(
  '/movies/:id/reviews',
  writes,
  requireAllowedOrigin,
  requireAuth,
  validate({ params: s.movieParams, body: s.reviewBody }),
  reviews.upsert,
);
router.delete('/movies/:id/reviews', writes, requireAllowedOrigin, requireAuth, validate({ params: s.movieParams }), reviews.remove);

// Accounts (email + password; session is a signed httpOnly cookie).
router.post('/auth/register', authLimiter, requireAllowedOrigin, validate({ body: s.authRegister }), authCtrl.register);
router.post('/auth/login', authLimiter, requireAllowedOrigin, validate({ body: s.authLogin }), authCtrl.login);
router.post('/auth/logout', requireAllowedOrigin, authCtrl.logout);
router.get('/auth/me', optionalAuth, authCtrl.me);

// Per-user wishlist (identified by the anonymous signed cookie).
router.use('/wishlist', anonymousUser);
router.get('/wishlist', wishlist.list);
router.post('/wishlist', writes, requireAllowedOrigin, validate({ body: s.wishlistBody }), wishlist.add);
router.delete('/wishlist/:movieId', writes, requireAllowedOrigin, validate({ params: s.wishlistParams }), wishlist.remove);

module.exports = router;
