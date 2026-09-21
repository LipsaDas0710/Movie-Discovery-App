import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchHome } from '../api/movies.api';
import { GENRES } from '../api/mockData';
import MovieCard from '../components/movies/MovieCard';
import { useWishlist } from '../context/WishlistContext';
import { GridSkeleton, ErrorState } from '../components/ui/States';
import { toneFor } from '../utils/format';

export default function BrowsePage() {
  const navigate = useNavigate();
  const wishlist = useWishlist();
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ['home'], queryFn: fetchHome });

  if (isPending) return <main className="page"><GridSkeleton count={6} /></main>;
  if (isError) return <main className="page"><ErrorState onRetry={refetch} /></main>;

  const { featured, rows } = data;
  const saved = wishlist.has(featured.id);

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-stripes" />
        <div className="hero-copy">
          <span className="eyebrow">Featured today</span>
          <h1 className="hero-title">{featured.title}</h1>
          <div className="meta-row">
            <span className="rating">★ {featured.rating.toFixed(1)}</span>
            <span>{featured.year}</span><span>·</span><span>{featured.runtime}</span><span>·</span><span>{featured.genres}</span>
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
        <div className="poster hero-poster" style={{ backgroundColor: toneFor(featured.id) }}>
          <span className="poster-label">poster · 2:3</span>
        </div>
      </section>

      <div className="chips-wrap">
        {GENRES.map((g) => (
          <button
            type="button"
            key={g}
            className="chip"
            onClick={() => navigate(g === 'All' ? '/explore' : `/explore?genre=${encodeURIComponent(g)}`)}
          >
            {g}
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
