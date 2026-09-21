const env = require('./config/env');
const app = require('./app');
const { connectDB, mongoose } = require('./config/db');
const logger = require('./utils/logger');

async function start() {
  await connectDB();
  logger.info('MongoDB connected');

  const server = app.listen(env.PORT, () => logger.info(`API listening on :${env.PORT}`));

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  logger.error(err, 'Failed to start');
  process.exit(1);
});
