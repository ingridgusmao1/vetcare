import {
  createContext, useContext, useEffect, useState, type ReactNode,
} from 'react';
import { authApi, type PublicUser } from '../api/auth';

// What every component that consumes this context can use.
interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;             // true while the initial /auth/me is in flight
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// `undefined` as default makes useAuth throw if used outside the provider —
// turns a silent bug into a clear error.
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On app boot, ask the backend "who am I?" — works because the JWT cookie
  // is sent automatically by axios with credentials:true.
  useEffect(() => {
    authApi.me()
      .then((u) => setUser(u))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const u = await authApi.login(email, password);
    setUser(u);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook with built-in guard — every consumer must be inside <AuthProvider>.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}