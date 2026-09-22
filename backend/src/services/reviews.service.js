const Review = require('../models/Review');

const MAX_LIST = 200;

// Keeps userId in the internal shape so the controller can flag "mine"; it strips it before responding.
const toDto = (doc) => ({
  id: doc._id.toString(),
  movieId: doc.movieId,
  userId: doc.userId,
  authorName: doc.authorName,
  rating: doc.rating,
  text: doc.text,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

async function list(movieId) {
  const docs = await Review.find({ movieId }).sort({ createdAt: -1 }).limit(MAX_LIST).lean();
  return docs.map(toDto);
}

async function upsert(userId, authorName, movieId, { rating, text }) {
  try {
    const doc = await Review.findOneAndUpdate(
      { userId, movieId },
      { $set: { rating, text, authorName } },
      { upsert: true, returnDocument: 'after', lean: true },
    );
    return toDto(doc);
  } catch (err) {
    if (err.code === 11000) {
      // Lost a race with another request writing the same review at the same instant.
      const doc = await Review.findOneAndUpdate({ userId, movieId }, { $set: { rating, text, authorName } }, { returnDocument: 'after', lean: true });
      return toDto(doc);
    }
    throw err;
  }
}

async function remove(userId, movieId) {
  await Review.deleteOne({ userId, movieId });
}

module.exports = { list, upsert, remove };
