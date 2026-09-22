const auth = require('../services/auth.service');
const env = require('../config/env');
const { COOKIE } = require('../middleware/auth');

const cookieOpts = {
  httpOnly: true,
  signed: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'none' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

exports.register = async (req, res) => {
  const { email, password, displayName } = req.valid.body;
  const user = await auth.register(email, password, displayName);
  res.cookie(COOKIE, user.id, cookieOpts);
  res.status(201).json({ user });
};

exports.login = async (req, res) => {
  const { email, password } = req.valid.body;
  const user = await auth.login(email, password);
  res.cookie(COOKIE, user.id, cookieOpts);
  res.json({ user });
};

exports.logout = async (_req, res) => {
  res.clearCookie(COOKIE);
  res.status(204).end();
};

exports.me = async (req, res) => {
  res.set('Cache-Control', 'private, no-store');
  res.json({ user: req.user || null });
};
