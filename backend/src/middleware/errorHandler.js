const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, _next) {
  if (err.name === 'ZodError') {
    const message = err.issues.map((i) => `${i.path.join('.') || 'input'}: ${i.message}`).join('; ');
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message } });
  }
  if (err.status && err.code) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Invalid request body' } });
  }
  logger.error({ err, path: req.path }, 'Unhandled error'); // never leak internals to the client
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
};
