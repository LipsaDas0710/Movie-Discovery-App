const mongoose = require('mongoose');

// One document per (user, movie). We keep only a small snapshot of the movie so the
// wishlist renders without a TMDB call; full movie data stays in TMDB + the cache.
const wishlistItemSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    movieId: { type: Number, required: true },
    snapshot: {
      title: { type: String, required: true },
      year: Number,
      rating: Number,
      posterUrl: String,
    },
    addedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

wishlistItemSchema.index({ userId: 1, movieId: 1 }, { unique: true }); // idempotent add, fast delete/lookup
wishlistItemSchema.index({ userId: 1, addedAt: -1 }); // listing newest first

module.exports = mongoose.models.WishlistItem || mongoose.model('WishlistItem', wishlistItemSchema);
