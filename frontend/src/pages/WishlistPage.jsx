import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import MovieCard from '../components/movies/MovieCard';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { items } = useWishlist();

  return (
    <main className="page">
      <h1 className="page-title">Wishlist</h1>
      <p className="page-sub" style={{ marginBottom: 24 }}>
        {items.length ? `${items.length} saved titles · kept on this device` : 'Saved titles live here'}
      </p>

      {items.length > 0 ? (
        <div className="grid d-comfortable">
          {items.map((m) => <MovieCard key={m.id} movie={m} />)}
        </div>
      ) : (
        <div className="state-box empty wish-empty">
          <div className="empty-icon">♥</div>
          <span className="state-title">Nothing saved yet</span>
          <span className="state-text">Tap the heart on any poster and it stays here — on this device, even after you close the app.</span>
          <button type="button" className="btn-primary" style={{ marginTop: 6 }} onClick={() => navigate('/')}>Start browsing</button>
        </div>
      )}
    </main>
  );
}
