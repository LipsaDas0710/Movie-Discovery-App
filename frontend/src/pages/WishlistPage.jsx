import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import MovieCard from '../components/movies/MovieCard';
import { ErrorState, GridSkeleton } from '../components/ui/States';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { items, error, isPending, isError, refetch } = useWishlist();

  if (isPending) return <main className="page"><h1 className="page-title">Wishlist</h1><GridSkeleton className="d-comfortable" /></main>;
  if (isError) return <main className="page"><h1 className="page-title">Wishlist</h1><ErrorState error={error} onRetry={refetch} /></main>;

  return (
    <main className="page">
      <h1 className="page-title">Wishlist</h1>
      <p className="page-sub" style={{ marginBottom: 24 }}>
        {items.length ? `${items.length} saved titles · kept for this browser` : 'Saved titles live here'}
      </p>

      {items.length > 0 ? (
        <div className="grid d-comfortable">
          {items.map((m) => <MovieCard key={m.id} movie={m} />)}
        </div>
      ) : (
        <div className="state-box empty wish-empty">
          <div className="empty-icon">♥</div>
          <span className="state-title">Nothing saved yet</span>
          <span className="state-text">Tap the heart on any poster and it stays here, even after you close the browser.</span>
          <button type="button" className="btn-primary" style={{ marginTop: 6 }} onClick={() => navigate('/')}>Start browsing</button>
        </div>
      )}
    </main>
  );
}
