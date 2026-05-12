import { api } from '../lib/api';

// Shapes shared with the backend. Ideally lives in a shared package; for a
// small project we duplicate them here (DRY-violation accepted for simplicity).
export interface PublicUser {
  reference_user: number;
  email: string;
  role: 'administrateur' | 'veterinaire' | 'assistant';
  is_active: boolean;
  created_at: string;       // ISO string after JSON serialization
  updated_at: string;
}

export const authApi = {
  // POST /api/auth/login → returns the public user, sets cookie automatically.
  login: async (email: string, password: string): Promise<PublicUser> => {
    const { data } = await api.post<PublicUser>('/auth/login', { email, password });
    return data;
  },

  // POST /api/auth/logout — clears the cookie server-side.
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // GET /api/auth/me — returns null if not logged in (handled by interceptor).
  me: async (): Promise<PublicUser | null> => {
    try {
      const { data } = await api.get<PublicUser>('/auth/me');
      return data;
    } catch {
      // Any error (401, network) is treated as "not logged in" — the UI
      // will redirect via interceptor or show the login form.
      return null;
    }
  },
};