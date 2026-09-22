import { api } from './client';

export const fetchMe = () => api('/api/auth/me').then((d) => d.user);
export const registerUser = (email, password, displayName) =>
  api('/api/auth/register', { method: 'POST', body: { email, password, displayName } }).then((d) => d.user);
export const loginUser = (email, password) => api('/api/auth/login', { method: 'POST', body: { email, password } }).then((d) => d.user);
export const logoutUser = () => api('/api/auth/logout', { method: 'POST' });
