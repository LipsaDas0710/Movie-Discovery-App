import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchMovie } from '../api/movies.api';
import { fetchReviews, postReview } from '../api/reviews.api';
import { langName } from '../api/filters';
import MovieCard from '../components/movies/MovieCard';
import { ErrorState, GridSkeleton } from '../components/ui/States';
import Poster from '../components/ui/Poster';
import NotFoundPage from './NotFoundPage';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { formatMoney, formatRating, formatRuntime, timeAgo } from '../utils/format';

const BACK_LABELS = { '/': 'Browse', '/explore': 'Explore', '/wishlist': 'Wishlist' };

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user, openAuth } = useAuth();
  const wishlist = useWishlist();
  const qc = useQueryClient();

  const { data, error, isPending, isError, refetch } = useQuery({
    queryKey: ['movie', id],
    queryFn: ({ signal }) => fetchMovie(id, signal),
    retry: false,
  });

  // Reviews live in MongoDB: anyone can read a movie's reviews, only a signed-in
  // account can write one. Posting merges the new one into the already-fetched list.
  const { data: reviews = [], isPending: reviewsPending } = useQuery({
    queryKey: ['reviews', id],
    queryFn: ({ signal }) => fetchReviews(id, signal),
  });
  const reviewMutation = useMutation({
    mutationFn: ({ rating, text }) => postReview(id, { rating, text }),
    onSuccess: (item) => {
      qc.setQueryData(['reviews', id], (old = []) => [item, ...old.filter((r) => !r.mine)]);
      setComposerOpen(false);
      setDraft({ text: '', score: 8 });
    },
  });

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
  if (isError && error.status === 404) return <NotFoundPage title="Movie not found" text="We couldn’t find that title." />;
  if (isError && error.status === 400) return <NotFoundPage title="Movie not found" text="That link doesn’t look right." />;
  if (isError) return <main className="page"><ErrorState error={error} onRetry={refetch} /></main>;

  const movie = data;
  const similar = data.similar;
  const from = state?.from || '/';
  const backLabel = BACK_LABELS[from.split('?')[0]] || 'Back';
  const saved = wishlist.has(movie.id);
  const canPost = draft.text.trim().length > 0 && !reviewMutation.isPending;

  const writeReview = () => {
    if (user) setComposerOpen(true);
    else {
      setPendingReview(true);
      openAuth('signin');
    }
  };
  const submitReview = () => {
    if (!canPost) return;
    reviewMutation.mutate({ rating: draft.score, text: draft.text.trim() });
  };

  const facts = [
    { k: 'Director', v: movie.director },
    { k: 'Language', v: movie.language && langName(movie.language) },
    { k: 'Budget', v: formatMoney(movie.budget) },
    { k: 'Status', v: movie.status },
  ].filter((f) => f.v);
  const runtime = formatRuntime(movie.runtimeMinutes);

  return (
    <main style={{ paddingBottom: 72 }}>
      <div
        className={`backdrop${movie.backdropUrl ? ' has-img' : ''}`}
        style={movie.backdropUrl ? { backgroundImage: `url(${movie.backdropUrl})` } : undefined}
      >
        {!movie.backdropUrl && <span className="backdrop-label">no backdrop</span>}
        <div className="backdrop-fade" />
        <button type="button" className="back-btn" onClick={() => navigate(from)}>← {backLabel}</button>
      </div>

      <div className="detail-wrap">
        <div className="detail-grid">
          <Poster movie={movie} className="detail-poster" />
          <div className="detail-body">
            <div className="detail-head">
              <h1 className="detail-title">{movie.title}</h1>
              <div className="detail-meta">
                {movie.rating != null && <span className="rating">★ {formatRating(movie.rating)}</span>}
                {[movie.year, runtime, movie.genres.join(', ')].filter(Boolean).map((t, i) => (
                  <span key={i}>{i > 0 ? `· ${t}` : t}</span>
                ))}
              </div>
            </div>
            {movie.tagline && <p className="detail-synopsis" style={{ fontStyle: 'italic', opacity: 0.7 }}>{movie.tagline}</p>}
            <p className="detail-synopsis">{movie.synopsis || 'No synopsis available yet.'}</p>
            <div className="detail-actions">
              <button type="button" className={saved ? 'btn-wish-on' : 'btn-primary'} onClick={() => wishlist.toggle(movie)}>
                {saved ? '♥ In your wishlist' : '♥ Add to wishlist'}
              </button>
              <button type="button" className="btn-ghost" style={{ borderColor: 'var(--line-strong)', background: 'rgba(255,255,255,.04)' }}>▶ Trailer</button>
            </div>
            {facts.length > 0 && (
              <div className="facts">
                {facts.map((f) => (
                  <div className="fact" key={f.k}>
                    <span className="fact-k">{f.k}</span>
                    <span className="fact-v">{f.v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {movie.cast.length > 0 && (
          <section className="section">
            <h2 className="section-title">Cast</h2>
            <div className="cast-row hrow">
              {movie.cast.map((c) => (
                <div className="cast" key={c.id}>
                  <div className="cast-photo">{c.photoUrl && <img src={c.photoUrl} alt={c.name} loading="lazy" />}</div>
                  <span className="cast-name">{c.name}</span>
                  <span className="cast-role">{c.character}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="section">
          <div className="reviews-head">
            <h2 className="section-title">Reviews</h2>
            {movie.rating != null && (
              <span className="reviews-summary">
                ★ {formatRating(movie.rating)} from {movie.voteCount.toLocaleString()} TMDB ratings
                {reviews.length > 0 && ` · ${reviews.length} review${reviews.length === 1 ? '' : 's'} here`}
              </span>
            )}
            <div className="spacer" />
            <button type="button" className="btn-outline" style={{ flex: '0 0 auto' }} onClick={writeReview}>
              {user ? 'Write a review' : 'Sign in to review'}
            </button>
          </div>

          {composerOpen && user && (
            <div className="composer">
              <div className="avatar md">{user.displayName.slice(0, 1).toUpperCase()}</div>
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
                {reviewMutation.isError && <p className="form-error" role="alert">{reviewMutation.error.message}</p>}
                <div className="composer-actions">
                  <button type="button" className="btn-post" disabled={!canPost} onClick={submitReview}>
                    {reviewMutation.isPending ? 'Posting…' : 'Post review'}
                  </button>
                  <button type="button" className="btn-cancel" onClick={() => { setComposerOpen(false); setDraft((d) => ({ ...d, text: '' })); }}>Cancel</button>
                  <span className="posting-as">Posting as {user.displayName}</span>
                </div>
              </div>
            </div>
          )}

          {reviewsPending ? (
            <p className="review-empty">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="review-empty">No reviews yet — be the first to write one.</p>
          ) : (
            <div className="review-grid">
              {reviews.map((r) => (
                <article className="review" key={r.id}>
                  <div className="review-head">
                    <div className="review-avatar">{r.authorName.slice(0, 1).toUpperCase()}</div>
                    <div className="review-who">
                      <span className="review-name">
                        {r.authorName}
                        {r.mine && <span className="mine-tag"> · you</span>}
                      </span>
                      <span className="review-when">{timeAgo(r.createdAt)}</span>
                    </div>
                    <div className="spacer" />
                    <span className="review-score">{r.rating.toFixed(1)}</span>
                  </div>
                  <p className="review-text">{r.text}</p>
                  <div className="review-actions"><span>▲ Helpful</span><span>Reply</span></div>
                </article>
              ))}
            </div>
          )}
        </section>

        {similar.length > 0 && (
          <section className="section tight">
            <h2 className="section-title">More like this</h2>
            <div className="hscroll hrow">
              {similar.map((m) => <MovieCard key={m.id} movie={m} variant="similar" />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
