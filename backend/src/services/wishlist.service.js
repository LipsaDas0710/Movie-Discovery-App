const WishlistItem = require('../models/WishlistItem');
const movies = require('./movies.service');
const AppError = require('../utils/AppError');

const MAX_ITEMS = 500;

const toItem = (doc) => ({
  id: doc.movieId,
  title: doc.snapshot.title,
  year: doc.snapshot.year ?? null,
  rating: doc.snapshot.rating ?? null,
  posterUrl: doc.snapshot.posterUrl ?? null,
  addedAt: doc.addedAt,
});

async function list(userId) {
  const docs = await WishlistItem.find({ userId }).sort({ addedAt: -1 }).limit(MAX_ITEMS).lean();
  return docs.map(toItem);
}

// Idempotent: adding the same movie twice is a no-op that returns the existing item.
async function add(userId, movieId) {
  const existing = await WishlistItem.findOne({ userId, movieId }).lean();
  if (existing) return toItem(existing);

  if ((await WishlistItem.countDocuments({ userId })) >= MAX_ITEMS) {
    throw new AppError(409, 'WISHLIST_FULL', `Wishlist is limited to ${MAX_ITEMS} titles`);
  }

  // The snapshot comes from TMDB (via our cache), never from the client.
  const { value: movie } = await movies.getMovie(movieId);
  const snapshot = { title: movie.title, year: movie.year, rating: movie.rating, posterUrl: movie.posterUrl };

  try {
    const doc = await WishlistItem.findOneAndUpdate(
      { userId, movieId },
      { $setOnInsert: { userId, movieId, snapshot, addedAt: new Date() } },
      { upsert: true, returnDocument: 'after', lean: true },
    );
    return toItem(doc);
  } catch (err) {
    if (err.code === 11000) return toItem(await WishlistItem.findOne({ userId, movieId }).lean()); // lost a race
    throw err;
  }
}

async function remove(userId, movieId) {
  await WishlistItem.deleteOne({ userId, movieId });
}

module.exports = { list, add, remove };
