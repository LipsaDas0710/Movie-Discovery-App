export function GridSkeleton({ count = 12, className = '' }) {
  return (
    <div className={`grid results ${className}`} aria-busy="true" aria-label="Loading movies">
      {Array.from({ length: count }, (_, i) => (
        <div className="skeleton" key={i}>
          <div className="sk-poster" />
          <div className="sk-line" />
          <div className="sk-line short" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state-box error" role="alert">
      <span className="state-title">We couldn’t reach the catalogue</span>
      <span className="state-text">{error?.message || 'The movie service didn’t respond.'} Your wishlist is saved and nothing was lost.</span>
      <button type="button" className="btn-primary" onClick={onRetry} style={{ marginTop: 4 }}>Retry</button>
      {error?.status !== undefined && <span className="state-code">error {error.status || 'offline'}{error.code ? ` · ${error.code}` : ''}</span>}
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="state-box empty">
      <span className="state-title">{title}</span>
      <span className="state-text" style={{ maxWidth: 380 }}>
        Try a different spelling, or loosen a filter — genre and language are both narrowing this.
      </span>
      <div className="state-actions">{children}</div>
    </div>
  );
}
