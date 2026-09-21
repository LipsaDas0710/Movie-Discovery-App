import { api } from './client';

// GET /api/movies?q&genre&language&sort&page
export const fetchMovies = ({ q, genre, lang, sort, page, signal }) =>
  api('/api/movies', { params: { q, genre, language: lang, sort, page }, signal });

// GET /api/movies/home
export const fetchHome = () => api('/api/movies/home');

// GET /api/movies/:id
export const fetchMovie = (id, signal) => api(`/api/movies/${id}`, { signal });

// GET /api/genres
export const fetchGenres = () => api('/api/genres');
