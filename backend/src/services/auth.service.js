const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const ROUNDS = 10;
// Compared against when the email isn't registered, so a login attempt takes the same
// time either way — otherwise the response time itself would reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('no-such-account', ROUNDS);

const toPublic = (u) => ({ id: u._id.toString(), email: u.email, displayName: u.displayName });

async function register(email, password, displayName) {
  const existing = await User.findOne({ email }).lean();
  if (existing) throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, ROUNDS);
  try {
    const user = await User.create({ email, passwordHash, displayName });
    return toPublic(user);
  } catch (err) {
    if (err.code === 11000) throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
    throw err;
  }
}

async function login(email, password) {
  const user = await User.findOne({ email });
  // Always run bcrypt, even for an unknown email, and use the same error message either way,
  // so neither the response content nor its timing reveals which emails are registered.
  const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !ok) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  }
  return toPublic(user);
}

async function getById(id) {
  const user = await User.findById(id).lean().catch(() => null); // catch: malformed id, not a real error
  return user ? toPublic(user) : null;
}

module.exports = { register, login, getById };
