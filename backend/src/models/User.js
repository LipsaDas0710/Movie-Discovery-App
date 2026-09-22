const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, trim: true, maxlength: 40 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
