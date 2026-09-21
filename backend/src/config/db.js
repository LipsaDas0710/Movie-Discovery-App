const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  await mongoose.connect(env.MONGODB_URI, {
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 10000,
  });
}

module.exports = { connectDB, mongoose };
