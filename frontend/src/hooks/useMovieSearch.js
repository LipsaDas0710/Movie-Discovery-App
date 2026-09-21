import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchMovies } from '../api/movies.api';

// New filters => new query key => React Query cancels the stale request via `signal`.
export default function useMovieSearch(filters) {
  return useInfiniteQuery({
    queryKey: ['movies', filters],
    queryFn: ({ pageParam, signal }) => fetchMovies({ ...filters, page: pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
    retry: false,
  });
}
