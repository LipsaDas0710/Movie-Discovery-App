import { useNavigate, useLocation } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { metaLine } from '../../utils/format';
import Poster from '../ui/Poster';

// variant: 'row' (home carousels) | 'grid' (explore / wishlist) | 'similar' (detail page, no heart)
export default function MovieCard({ movie, variant = 'grid' }) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const wishlist = useWishlist();
  const saved = wishlist.has(movie.id);

  const open = () => navigate(`/movie/${movie.id}`, { state: { from: pathname + search } });

  return (
    <div
      className={`card ${variant}`}
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => e.key === 'Enter' && open()}
    >
      <Poster movie={movie}>
        {variant !== 'similar' && (
          <button
            type="button"
            className={`heart${saved ? ' on' : ''}`}
            aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={saved}
            onClick={(e) => {
              e.stopPropagation();
              wishlist.toggle(movie);
            }}
          >
            ♥
          </button>
        )}
      </Poster>
      <div className="card-info">
        <span className="card-title" title={movie.title}>{movie.title}</span>
        <span className="card-meta">{metaLine(movie)}</span>
      </div>
    </div>
  );
}
