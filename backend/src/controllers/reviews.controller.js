const reviews = require('../services/reviews.service');

exports.list = async (req, res) => {
  const items = await reviews.list(req.valid.params.id);
  const viewerId = req.authUserId || null;
  res.set('Cache-Control', 'public, max-age=30');
  res.json({ items: items.map(({ userId, ...r }) => ({ ...r, mine: userId === viewerId })) });
};

exports.upsert = async (req, res) => {
  const { rating, text } = req.valid.body;
  const { userId, ...item } = await reviews.upsert(req.authUserId, req.user.displayName, req.valid.params.id, { rating, text });
  res.status(201).json({ item: { ...item, mine: true } });
};

exports.remove = async (req, res) => {
  await reviews.remove(req.authUserId, req.valid.params.id);
  res.status(204).end();
};
