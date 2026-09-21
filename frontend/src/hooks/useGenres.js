import { useQuery } from '@tanstack/react-query';
import { fetchGenres } from '../api/movies.api';

// Genres barely change, so cache them for the whole session. Returns [] until loaded.
export default function useGenres() {
  const { data } = useQuery({ queryKey: ['genres'], queryFn: fetchGenres, staleTime: Infinity });
  return data || [];
}
