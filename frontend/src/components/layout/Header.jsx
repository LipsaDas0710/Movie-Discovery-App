import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import useDebounce from '../../hooks/useDebounce';

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, openAuth, signOut } = useAuth();
  const wishlist = useWishlist();

  const onExplore = pathname === '/explore';
  const urlQuery = onExplore ? params.get('q') || '' : '';
  const [value, setValue] = useState(urlQuery);
  const debounced = useDebounce(value, 300);
  const lastPushed = useRef(urlQuery);
  const inputRef = useRef(null);

  // Typing (debounced) drives the URL; the URL is the source of truth for filters.
  useEffect(() => {
    if (debounced === lastPushed.current) return;
    lastPushed.current = debounced;
    const next = new URLSearchParams(onExplore ? params : undefined);
    if (debounced) next.set('q', debounced);
    else next.delete('q');
    navigate({ pathname: '/explore', search: next.toString() }, { replace: onExplore });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // If the URL changes from elsewhere (e.g. "Clear filters"), reflect it in the box.
  useEffect(() => {
    if (onExplore && urlQuery !== lastPushed.current) {
      lastPushed.current = urlQuery;
      setValue(urlQuery);
    }
  }, [onExplore, urlQuery]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="header">
      <Link to="/" className="brand">
        <div className="brand-mark" />
        <span className="brand-name">Cineverse</span>
      </Link>
      <nav className="nav" aria-label="Primary">
        <NavLink to="/" end className="nav-link">Browse</NavLink>
        <NavLink to="/explore" className="nav-link">Explore</NavLink>
        <NavLink to="/wishlist" className="nav-link">Wishlist</NavLink>
      </nav>
      <div className="header-search">
        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search movies, people, genres"
            aria-label="Search movies"
          />
          <span className="kbd">⌘K</span>
        </div>
      </div>
      <div className="header-right">
        <button type="button" className="wish-pill" onClick={() => navigate('/wishlist')}>
          <span>♥</span>
          <span>{wishlist.items.length}</span>
        </button>
        {user ? (
          <div className="user-pill">
            <div className="avatar sm">{user.displayName.slice(0, 1).toUpperCase()}</div>
            <span className="user-name">{user.displayName}</span>
            <button type="button" className="link-btn" onClick={signOut}>Sign out</button>
          </div>
        ) : (
          <button type="button" className="signin-btn" onClick={() => openAuth('signin')}>Sign in</button>
        )}
      </div>
    </header>
  );
}
