const { z } = require('zod');

const movieId = z.coerce.number().int().positive().max(2_000_000_000);

const searchQuery = z.object({
  q: z.string().trim().max(100).default(''),
  genre: z.coerce.number().int().positive().optional(), // TMDB genre id
  language: z.string().regex(/^[a-z]{2}$/, 'must be a 2-letter ISO code').optional(),
  sort: z.enum(['popularity', 'rating', 'newest', 'title']).default('popularity'),
  page: z.coerce.number().int().min(1).max(500).default(1),
});

const email = z.string().trim().toLowerCase().email().max(200);

module.exports = {
  searchQuery,
  movieParams: z.object({ id: movieId }),
  wishlistBody: z.object({ movieId }),
  wishlistParams: z.object({ movieId }),
  authRegister: z.object({
    email,
    password: z.string().min(8, 'must be at least 8 characters').max(200),
    displayName: z.string().trim().min(1).max(40),
  }),
  authLogin: z.object({
    email,
    password: z.string().min(1).max(200),
  }),
  reviewBody: z.object({
    rating: z.coerce.number().int().min(1).max(10),
    text: z.string().trim().min(1).max(2000),
  }),
};
