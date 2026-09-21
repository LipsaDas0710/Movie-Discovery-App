const pino = require('pino');

module.exports = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  base: undefined, // drop pid and hostname from every line
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token', '*.apiKey', 'err.config'],
    censor: '[redacted]',
  },
});
