import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchHome } from '../api/movies.api';
import useGenres from '../hooks/useGenres';
import Poster from '../components/ui/Poster';
import MovieCard from '../components/movies/MovieCard';
import { useWishlist } from '../context/WishlistContext';
import { GridSkeleton, ErrorState } from '../components/ui/States';
import { formatRating } from '../utils/format';

export default function BrowsePage() {
  const navigate = useNavigate();
  const wishlist = useWishlist();
  const genres = useGenres();
  const { data, error, isPending, isError, refetch } = useQuery({ queryKey: ['home'], queryFn: fetchHome });

  if (isPending) return <main className="page"><GridSkeleton count={6} /></main>;
  if (isError) return <main className="page"><ErrorState error={error} onRetry={refetch} /></main>;

  const { featured, rows } = data;
  const saved = featured ? wishlist.has(featured.id) : false;

  return (
    <main className="page">
      {featured && (
      <section className="hero">
        <div className="hero-stripes" />
        {featured.backdropUrl && <div className="hero-bg" style={{ backgroundImage: `url(${featured.backdropUrl})` }} />}
        <div className="hero-copy">
          <span className="eyebrow">Featured today</span>
          <h1 className="hero-title">{featured.title}</h1>
          <div className="meta-row">
            {featured.rating != null && <span className="rating">★ {formatRating(featured.rating)}</span>}
            {featured.year && <span>{featured.year}</span>}
            {featured.genres.length > 0 && <><span>·</span><span>{featured.genres.slice(0, 3).join(', ')}</span></>}
          </div>
          <p className="hero-synopsis">{featured.synopsis}</p>
          <div className="hero-actions">
            <button type="button" className="btn-primary glow" onClick={() => navigate(`/movie/${featured.id}`, { state: { from: '/' } })}>
              View details
            </button>
            <button type="button" className="btn-ghost" onClick={() => wishlist.toggle(featured)}>
              {saved ? '♥ In your wishlist' : '♥ Add to wishlist'}
            </button>
          </div>
        </div>
        <Poster movie={featured} className="hero-poster" />
      </section>
      )}

      <div className="chips-wrap">
        <button type="button" className="chip" onClick={() => navigate('/explore')}>All</button>
        {genres.map((g) => (
          <button type="button" key={g.id} className="chip" onClick={() => navigate(`/explore?genre=${g.id}`)}>
            {g.name}
          </button>
        ))}
      </div>

      {rows.map((row) => (
        <section className="row-section" key={row.title}>
          <div className="row-head">
            <h2 className="row-title">{row.title}</h2>
            <button type="button" className="see-all" onClick={() => navigate('/explore')}>See all →</button>
          </div>
          <div className="hscroll hrow">
            {row.items.map((m) => <MovieCard key={m.id} movie={m} variant="row" />)}
          </div>
        </section>
      ))}
    </main>
  );
}
