import { api } from './client';

export const fetchWishlist = () => api('/api/wishlist').then((d) => d.items);
export const addToWishlist = (movieId) => api('/api/wishlist', { method: 'POST', body: { movieId } }).then((d) => d.item);
export const removeFromWishlist = (movieId) => api(`/api/wishlist/${movieId}`, { method: 'DELETE' });
