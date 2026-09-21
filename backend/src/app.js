const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const env = require('./config/env');

const app = express();

app.set('trust proxy', 1); // behind a load balancer in production
app.disable('x-powered-by');

app.use(helmet());
app.use(cors({ origin: env.corsOrigins, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser(env.COOKIE_SECRET));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// TODO: mount /api routes (movies, wishlist)

app.use((_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }));

module.exports = app;
