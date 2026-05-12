import axios from 'axios';

// Centralized axios instance. Every API file imports `api` from here so we
// have one place to set base config (baseURL, credentials, interceptors).
export const api = axios.create({
  // /api is relative — Vite's proxy (dev) or Nginx (prod) handles routing.
  baseURL: '/api',

  // Send cookies on every request — without this the JWT cookie wouldn't
  // travel and every endpoint would return 401.
  withCredentials: true,

  // 10s is plenty for our API; longer requests likely indicate a problem.
  timeout: 10_000,
});

// Response interceptor: catches 401s globally so we don't sprinkle "if 401
// redirect to login" logic across every page.
api.interceptors.response.use(
  // Pass-through for successful responses.
  (response) => response,

  // Error path.
  (error) => {
    // axios attaches the response (when the server replied) to error.response.
    // No response at all = network down or server crashed.
    if (error.response?.status === 401) {
      // Avoid an infinite loop if the login endpoint itself returns 401
      // (wrong credentials should NOT redirect).
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    // Re-throw so the calling code can also handle the error if it wants.
    return Promise.reject(error);
  }
);