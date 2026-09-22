import { api } from './client';

export const fetchReviews = (movieId, signal) => api(`/api/movies/${movieId}/reviews`, { signal }).then((d) => d.items);
export const postReview = (movieId, { rating, text }) =>
  api(`/api/movies/${movieId}/reviews`, { method: 'POST', body: { rating, text } }).then((d) => d.item);
