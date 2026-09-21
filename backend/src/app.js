const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const env = require('./config/env');
const routes = require('./routes');
const { api } = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1); // behind a load balancer in production, so req.ip is the real client
app.disable('x-powered-by');

app.use(helmet());
app.use(cors({ origin: env.corsOrigins, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser(env.COOKIE_SECRET));

app.get('/health', (_req, res) => res.json({ status: 'ok', db: mongoose.connection.readyState === 1 }));

app.use('/api', api, routes);

app.use((_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }));
app.use(errorHandler);

module.exports = app;
