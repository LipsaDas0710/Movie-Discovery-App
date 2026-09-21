import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const WishlistContext = createContext(null);
const KEY = 'cineverse.wishlist';

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};

// Stores a small snapshot per movie (id/title/year/rating) so the wishlist renders without refetching.
// TODO: replace localStorage with /api/wishlist once the backend is built.
export function WishlistProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  const has = useCallback((id) => items.some((m) => m.id === id), [items]);
  const toggle = useCallback((movie) => {
    setItems((prev) =>
      prev.some((m) => m.id === movie.id)
        ? prev.filter((m) => m.id !== movie.id)
        : [...prev, { id: movie.id, title: movie.title, year: movie.year, rating: movie.rating }],
    );
  }, []);

  const value = useMemo(() => ({ items, has, toggle }), [items, has, toggle]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
