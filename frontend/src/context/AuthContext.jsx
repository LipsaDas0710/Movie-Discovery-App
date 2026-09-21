import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

// UI-only auth from the design mockup. Real accounts are out of scope for the assignment;
// the wishlist is tied to an anonymous cookie id on the backend instead.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState({ open: false, mode: 'signin' });

  const openAuth = useCallback((mode = 'signin') => setModal({ open: true, mode }), []);
  const closeAuth = useCallback(() => setModal((m) => ({ ...m, open: false })), []);
  const setMode = useCallback((mode) => setModal((m) => ({ ...m, mode })), []);
  const signIn = useCallback(({ name, email }) => {
    setUser(name || (email ? email.split('@')[0] : 'Alex Reyes'));
    setModal((m) => ({ ...m, open: false }));
  }, []);
  const signOut = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({ user, modal, openAuth, closeAuth, setMode, signIn, signOut }),
    [user, modal, openAuth, closeAuth, setMode, signIn, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
