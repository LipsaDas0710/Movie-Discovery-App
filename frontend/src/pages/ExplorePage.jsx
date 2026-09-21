import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GENRES, LANG_OPTS, SORTS } from '../api/mockData';
import useMovieSearch from '../hooks/useMovieSearch';
import MovieCard from '../components/movies/MovieCard';
import { EmptyState, ErrorState, GridSkeleton } from '../components/ui/States';

const DEFAULTS = { genre: 'All', lang: 'Any language', sort: 'Popular' };

export default function ExplorePage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      q: params.get('q') || '',
      genre: params.get('genre') || DEFAULTS.genre,
      lang: params.get('lang') || DEFAULTS.lang,
      sort: params.get('sort') || DEFAULTS.sort,
    }),
    [params],
  );

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === DEFAULTS[key]) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };
  const clearFilters = () => setParams({}, { replace: true });

  const search = useMovieSearch(filters);
  const { data, isPending, isError, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = search;

  const movies = data?.pages.flatMap((p) => p.results) ?? [];
  const total = data?.pages[0]?.totalResults ?? 0;
  const showEmpty = !isPending && !isError && total === 0;
  const showResults = !isPending && !isError && total > 0;

  const resultLine = isPending
    ? 'Searching…'
    : `${total} titles${filters.q ? ` matching "${filters.q}"` : ''}${filters.genre !== 'All' ? ` in ${filters.genre}` : ''}${
        filters.lang !== 'Any language' ? ` · ${filters.lang}` : ''
      } · sorted by ${filters.sort.toLowerCase()}`;

  return (
    <main className="page">
      <h1 className="page-title">Explore</h1>
      <p className="page-sub" aria-live="polite">{isError ? 'Something went wrong' : resultLine}</p>

      <div className="filters">
        <div className="filter-row hrow">
          {GENRES.map((g) => (
            <button type="button" key={g} className={`chip${filters.genre === g ? ' on' : ''}`} onClick={() => setFilter('genre', g)}>{g}</button>
          ))}
        </div>
        <div className="filter-row divided hrow">
          {LANG_OPTS.map((l) => (
            <button type="button" key={l} className={`chip${filters.lang === l ? ' on' : ''}`} onClick={() => setFilter('lang', l)}>{l}</button>
          ))}
        </div>
        <div className="filter-row divided sort">
          <span className="sort-label">SORT</span>
          {SORTS.map((s) => (
            <button type="button" key={s} className={`sort-btn${filters.sort === s ? ' on' : ''}`} onClick={() => setFilter('sort', s)}>{s}</button>
          ))}
        </div>
      </div>

      {isPending && <GridSkeleton className="d-comfortable" />}
      {isError && <ErrorState onRetry={refetch} />}
      {showEmpty && (
        <EmptyState title={filters.q ? `No matches for “${filters.q}”` : 'Nothing matches these filters'}>
          <button type="button" className="btn-outline" onClick={clearFilters}>Clear filters</button>
          <button type="button" className="btn-outline" onClick={() => navigate('/')}>Browse trending</button>
        </EmptyState>
      )}
      {showResults && (
        <div className="grid d-comfortable results">
          {movies.map((m) => <MovieCard key={m.id} movie={m} />)}
        </div>
      )}

      <div className="footer-line">
        {showResults && hasNextPage && !isFetchingNextPage && (
          <button type="button" className="load-more" onClick={() => fetchNextPage()}>Load more</button>
        )}
        {showResults && !hasNextPage && <span className="end">You’ve reached the end of these results</span>}
        {showResults && <span className="count">showing {movies.length} of {total}</span>}
        {(isPending || isFetchingNextPage) && (
          <div className="loading-line">
            <div className="spinner" />
            <span>Fetching page {isPending ? 1 : data.pages.length + 1}…</span>
          </div>
        )}
      </div>
    </main>
  );
}
