import { createContext, useCallback, useContext, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addToWishlist, fetchWishlist, removeFromWishlist } from '../api/wishlist.api';

const WishlistContext = createContext(null);
const KEY = ['wishlist'];

// The wishlist lives in MongoDB, tied to an anonymous cookie. Toggling is optimistic:
// the heart flips instantly and rolls back if the server rejects it.
export function WishlistProvider({ children }) {
  const qc = useQueryClient();
  const { data: items = [], error, isPending, isError, refetch } = useQuery({ queryKey: KEY, queryFn: fetchWishlist, retry: 1 });

  const mutation = useMutation({
    mutationFn: ({ movie, saved }) => (saved ? removeFromWishlist(movie.id) : addToWishlist(movie.id)),
    onMutate: async ({ movie, saved }) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData(KEY);
      qc.setQueryData(KEY, (old = []) =>
        saved
          ? old.filter((m) => m.id !== movie.id)
          : [{ id: movie.id, title: movie.title, year: movie.year, rating: movie.rating, posterUrl: movie.posterUrl, addedAt: new Date().toISOString() }, ...old],
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(KEY, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const has = useCallback((id) => items.some((m) => m.id === id), [items]);
  const toggle = useCallback((movie) => mutation.mutate({ movie, saved: items.some((m) => m.id === movie.id) }), [mutation, items]);

  const value = useMemo(
    () => ({ items, has, toggle, error, isPending, isError, refetch }),
    [items, has, toggle, error, isPending, isError, refetch],
  );
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
