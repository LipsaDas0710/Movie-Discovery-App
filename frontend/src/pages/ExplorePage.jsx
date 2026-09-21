import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DEFAULT_SORT, LANGS, SORTS, langName } from '../api/filters';
import useGenres from '../hooks/useGenres';
import useMovieSearch from '../hooks/useMovieSearch';
import MovieCard from '../components/movies/MovieCard';
import { EmptyState, ErrorState, GridSkeleton } from '../components/ui/States';

const DEFAULTS = { genre: '', lang: '', sort: DEFAULT_SORT };

export default function ExplorePage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const genres = useGenres();

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

  const genreName = genres.find((g) => String(g.id) === filters.genre)?.name;
  const sortLabel = SORTS.find((s) => s.value === filters.sort)?.label || 'Popular';
  const resultLine = isPending
    ? 'Searching…'
    : `${total.toLocaleString()} titles${filters.q ? ` matching "${filters.q}"` : ''}${genreName ? ` in ${genreName}` : ''}${
        filters.lang ? ` · ${langName(filters.lang)}` : ''
      } · sorted by ${sortLabel.toLowerCase()}`;

  return (
    <main className="page">
      <h1 className="page-title">Explore</h1>
      <p className="page-sub" aria-live="polite">{isError ? 'Something went wrong' : resultLine}</p>

      <div className="filters">
        <div className="filter-row hrow">
          <button type="button" className={`chip${!filters.genre ? ' on' : ''}`} onClick={() => setFilter('genre', '')}>All</button>
          {genres.map((g) => (
            <button type="button" key={g.id} className={`chip${filters.genre === String(g.id) ? ' on' : ''}`} onClick={() => setFilter('genre', String(g.id))}>{g.name}</button>
          ))}
        </div>
        <div className="filter-row divided hrow">
          <button type="button" className={`chip${!filters.lang ? ' on' : ''}`} onClick={() => setFilter('lang', '')}>Any language</button>
          {LANGS.map((l) => (
            <button type="button" key={l.value} className={`chip${filters.lang === l.value ? ' on' : ''}`} onClick={() => setFilter('lang', l.value)}>{l.label}</button>
          ))}
        </div>
        <div className="filter-row divided sort">
          <span className="sort-label">SORT</span>
          {SORTS.map((s) => (
            <button type="button" key={s.value} className={`sort-btn${filters.sort === s.value ? ' on' : ''}`} onClick={() => setFilter('sort', s.value)}>{s.label}</button>
          ))}
        </div>
      </div>

      {isPending && <GridSkeleton className="d-comfortable" />}
      {isError && <ErrorState error={search.error} onRetry={refetch} />}
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
        {showResults && <span className="count">showing {movies.length.toLocaleString()} of {total.toLocaleString()}</span>}
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
