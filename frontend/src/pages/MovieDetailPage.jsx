import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchMovie } from '../api/movies.api';
import { CAST, REVIEWS, langOf } from '../api/mockData';
import MovieCard from '../components/movies/MovieCard';
import { GridSkeleton } from '../components/ui/States';
import NotFoundPage from './NotFoundPage';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { toneFor } from '../utils/format';

const BACK_LABELS = { '/': 'Browse', '/explore': 'Explore', '/wishlist': 'Wishlist' };

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user, openAuth } = useAuth();
  const wishlist = useWishlist();

  const { data, isPending, isError } = useQuery({ queryKey: ['movie', id], queryFn: () => fetchMovie(id), retry: false });

  // Reviews are UI-only (from the design mockup), kept in local state per movie.
  const [myReviews, setMyReviews] = useState({});
  const [composerOpen, setComposerOpen] = useState(false);
  const [pendingReview, setPendingReview] = useState(false);
  const [draft, setDraft] = useState({ text: '', score: 8 });

  useEffect(() => {
    if (user && pendingReview) {
      setComposerOpen(true);
      setPendingReview(false);
    }
  }, [user, pendingReview]);

  if (isPending) return <main className="page"><GridSkeleton count={6} /></main>;
  if (isError) return <NotFoundPage title="Movie not found" text="We couldn’t find that title." />;

  const { movie, similar } = data;
  const from = state?.from || '/';
  const backLabel = BACK_LABELS[from.split('?')[0]] || 'Back';
  const saved = wishlist.has(movie.id);
  const reviews = [...(myReviews[movie.id] || []), ...REVIEWS];
  const canPost = draft.text.trim().length > 0;

  const writeReview = () => {
    if (user) setComposerOpen(true);
    else {
      setPendingReview(true);
      openAuth('signin');
    }
  };
  const postReview = () => {
    if (!canPost) return;
    setMyReviews((r) => ({
      ...r,
      [movie.id]: [{ name: user, when: 'just now', score: draft.score, text: draft.text.trim() }, ...(r[movie.id] || [])],
    }));
    setComposerOpen(false);
    setDraft({ text: '', score: 8 });
  };

  const facts = [
    { k: 'Director', v: 'A. Vasquez' },
    { k: 'Language', v: langOf(movie.id) },
    { k: 'Budget', v: '$42M' },
    { k: 'Status', v: 'Released' },
  ];

  return (
    <main style={{ paddingBottom: 72 }}>
      <div className="backdrop">
        <span className="backdrop-label">backdrop · 16:9</span>
        <div className="backdrop-fade" />
        <button type="button" className="back-btn" onClick={() => navigate(from)}>← {backLabel}</button>
      </div>

      <div className="detail-wrap">
        <div className="detail-grid">
          <div className="poster detail-poster" style={{ backgroundColor: toneFor(movie.id) }} />
          <div className="detail-body">
            <div className="detail-head">
              <h1 className="detail-title">{movie.title}</h1>
              <div className="detail-meta">
                <span className="rating">★ {movie.rating.toFixed(1)}</span>
                <span>{movie.year}</span><span>·</span><span>{movie.runtime}</span><span>·</span><span>{movie.genres}</span>
              </div>
            </div>
            <p className="detail-synopsis">{movie.synopsis}</p>
            <div className="detail-actions">
              <button type="button" className={saved ? 'btn-wish-on' : 'btn-primary'} onClick={() => wishlist.toggle(movie)}>
                {saved ? '♥ In your wishlist' : '♥ Add to wishlist'}
              </button>
              <button type="button" className="btn-ghost" style={{ borderColor: 'var(--line-strong)', background: 'rgba(255,255,255,.04)' }}>▶ Trailer</button>
            </div>
            <div className="facts">
              {facts.map((f) => (
                <div className="fact" key={f.k}>
                  <span className="fact-k">{f.k}</span>
                  <span className="fact-v">{f.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="section">
          <h2 className="section-title">Cast</h2>
          <div className="cast-row hrow">
            {CAST.map((c) => (
              <div className="cast" key={c.name}>
                <div className="cast-photo" />
                <span className="cast-name">{c.name}</span>
                <span className="cast-role">{c.role}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="reviews-head">
            <h2 className="section-title">Reviews</h2>
            <span className="reviews-summary">★ {movie.rating.toFixed(1)} from 1,284 ratings</span>
            <div className="spacer" />
            <button type="button" className="btn-outline" style={{ flex: '0 0 auto' }} onClick={writeReview}>
              {user ? 'Write a review' : 'Sign in to review'}
            </button>
          </div>

          {composerOpen && user && (
            <div className="composer">
              <div className="avatar md">{user.slice(0, 1).toUpperCase()}</div>
              <div className="composer-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        aria-label={`${n} stars`}
                        className={`star-btn${n <= Math.round(draft.score / 2) ? ' on' : ''}`}
                        onClick={() => setDraft((d) => ({ ...d, score: n * 2 }))}
                      >
                        {n <= Math.round(draft.score / 2) ? '★' : '☆'}
                      </button>
                    ))}
                  </div>
                  <span className="score-label">{draft.score.toFixed(1)} / 10</span>
                </div>
                <textarea
                  className="textarea"
                  rows={4}
                  value={draft.text}
                  onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
                  placeholder="What did you think? No spoilers in the first paragraph, please."
                />
                <div className="composer-actions">
                  <button type="button" className="btn-post" disabled={!canPost} onClick={postReview}>Post review</button>
                  <button type="button" className="btn-cancel" onClick={() => { setComposerOpen(false); setDraft((d) => ({ ...d, text: '' })); }}>Cancel</button>
                  <span className="posting-as">Posting as {user}</span>
                </div>
              </div>
            </div>
          )}

          <div className="review-grid">
            {reviews.map((r, i) => (
              <article className="review" key={`${r.name}-${i}`}>
                <div className="review-head">
                  <div className="review-avatar">{r.name.slice(0, 1).toUpperCase()}</div>
                  <div className="review-who">
                    <span className="review-name">{r.name}</span>
                    <span className="review-when">{r.when}</span>
                  </div>
                  <div className="spacer" />
                  <span className="review-score">{r.score.toFixed(1)}</span>
                </div>
                <p className="review-text">{r.text}</p>
                <div className="review-actions"><span>▲ Helpful</span><span>Reply</span></div>
              </article>
            ))}
          </div>
          <button type="button" className="show-all">Show all 214 reviews</button>
        </section>

        <section className="section tight">
          <h2 className="section-title">More like this</h2>
          <div className="hscroll hrow">
            {similar.map((m) => <MovieCard key={m.id} movie={m} variant="similar" />)}
          </div>
        </section>
      </div>
    </main>
  );
}
