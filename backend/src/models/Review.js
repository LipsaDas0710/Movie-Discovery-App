const mongoose = require('mongoose');

// One review per (user, movie): posting again edits it rather than creating a duplicate.
// authorName is a snapshot so the review list renders without joining User.
const reviewSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    movieId: { type: Number, required: true },
    authorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true, versionKey: false },
);

reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });
reviewSchema.index({ movieId: 1, createdAt: -1 }); // listing a movie's reviews, newest first

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
