const wishlist = require('../services/wishlist.service');

exports.list = async (req, res) => {
  res.set('Cache-Control', 'private, no-store');
  res.json({ items: await wishlist.list(req.userId) });
};

exports.add = async (req, res) => {
  res.status(201).json({ item: await wishlist.add(req.userId, req.valid.body.movieId) });
};

exports.remove = async (req, res) => {
  await wishlist.remove(req.userId, req.valid.params.movieId);
  res.status(204).end();
};
