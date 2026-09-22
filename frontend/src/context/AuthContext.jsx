import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMe, loginUser, logoutUser, registerUser } from '../api/auth.api';

const AuthContext = createContext(null);

// Real accounts: email + password, verified server-side; the session is an httpOnly
// cookie the backend sets, so the frontend just asks "who am I" via /api/auth/me.
export function AuthProvider({ children }) {
  const qc = useQueryClient();
  const { data: user = null } = useQuery({ queryKey: ['auth', 'me'], queryFn: fetchMe, staleTime: 5 * 60_000, retry: false });
  const [modal, setModal] = useState({ open: false, mode: 'signin', error: '' });

  const openAuth = useCallback((mode = 'signin') => setModal({ open: true, mode, error: '' }), []);
  const closeAuth = useCallback(() => setModal((m) => ({ ...m, open: false })), []);
  const setMode = useCallback((mode) => setModal((m) => ({ ...m, mode, error: '' })), []);

  const onAuthed = useCallback(
    (nextUser) => {
      qc.setQueryData(['auth', 'me'], nextUser);
      setModal((m) => ({ ...m, open: false, error: '' }));
    },
    [qc],
  );
  const onFailed = useCallback((err) => setModal((m) => ({ ...m, error: err.message || 'Something went wrong' })), []);

  const registerMutation = useMutation({
    mutationFn: ({ email, password, name }) => registerUser(email, password, name),
    onSuccess: onAuthed,
    onError: onFailed,
  });
  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => loginUser(email, password),
    onSuccess: onAuthed,
    onError: onFailed,
  });
  const logoutMutation = useMutation({ mutationFn: logoutUser, onSuccess: () => qc.setQueryData(['auth', 'me'], null) });

  const submit = useCallback(
    ({ name, email, pass }) => {
      if (modal.mode === 'signup') registerMutation.mutate({ email, password: pass, name });
      else loginMutation.mutate({ email, password: pass });
    },
    [modal.mode, registerMutation, loginMutation],
  );

  const value = useMemo(
    () => ({
      user,
      modal,
      openAuth,
      closeAuth,
      setMode,
      submit,
      pending: registerMutation.isPending || loginMutation.isPending,
      signOut: () => logoutMutation.mutate(),
    }),
    [user, modal, openAuth, closeAuth, setMode, submit, registerMutation.isPending, loginMutation.isPending, logoutMutation],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
