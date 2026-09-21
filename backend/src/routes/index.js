const express = require('express');
const validate = require('../middleware/validate');
const anonymousUser = require('../middleware/anonymousUser');
const requireAllowedOrigin = require('../middleware/requireAllowedOrigin');
const { writes } = require('../middleware/rateLimit');
const s = require('../validators/schemas');
const movies = require('../controllers/movies.controller');
const wishlist = require('../controllers/wishlist.controller');

const router = express.Router();

// Public, cacheable catalogue endpoints (no cookie is set here so CDNs can cache them).
router.get('/genres', movies.genres);
router.get('/movies/home', movies.home);
router.get('/movies', validate({ query: s.searchQuery }), movies.search);
router.get('/movies/:id', validate({ params: s.movieParams }), movies.detail);

// Per-user wishlist (identified by the anonymous signed cookie).
router.use('/wishlist', anonymousUser);
router.get('/wishlist', wishlist.list);
router.post('/wishlist', writes, requireAllowedOrigin, validate({ body: s.wishlistBody }), wishlist.add);
router.delete('/wishlist/:movieId', writes, requireAllowedOrigin, validate({ params: s.wishlistParams }), wishlist.remove);

module.exports = router;
