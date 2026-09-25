import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginApi } from '../services/api';
import { AuthContextValue, AuthUser } from '../types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_KEY = 'eisslacr_auth';
const BACKEND_OIDC_URL = import.meta.env.VITE_BACKEND_OIDC_URL || '/IsomReportingServices';
const authMode = import.meta.env.VITE_AUTH_MODE || '';
const isLocalMode = authMode === 'test';

// Demo mode: no Spring Boot backend available, so the app runs with a
// pre-authenticated sample user and the screens fall back to sample data.
const isDemoMode = import.meta.env.VITE_DEMO_AUTH !== 'false';
const demoUser: AuthUser = {
  attuid: 'js8381',
  token: 'demo-token',
  adminAccess: 'Y',
  isAdmin: true,
  appAccess: ['ISOM', 'BVOIP_CPUC', 'BVOIP_ADMIN'],
  firstName: 'Jay',
  lastName: 'Shah',
};

const safeParse = (value: string | null, fallback: AuthUser | null): AuthUser | null => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const loadSessionUser = (): AuthUser | null => {
  const user = safeParse(sessionStorage.getItem(SESSION_KEY), null);
  if (!user || !user.attuid) return null;
  if (!user.token) {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
  return user;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(loadSessionUser);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check backend OIDC session on mount (non-local mode)
  useEffect(() => {
    const checkSession = async (options?: { redirectOnUnauthenticated?: boolean; onAuthenticated?: () => void; onUnauthenticated?: () => void }) => {
      const { redirectOnUnauthenticated = true, onAuthenticated, onUnauthenticated } = options || {};

      try {
        const res = await fetch(`${BACKEND_OIDC_URL}/api/auth/session`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.authenticated) {
          const sessionUser: AuthUser = {
            attuid: data.userId,
            token: data.token || '',
            adminAccess: data.adminAccess || 'N',
            isAdmin: data.adminAccess === 'Y',
            appAccess: data.appAccess || ['ISOM'],
            firstName: data.firstName,
            lastName: data.lastName,
          };
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
          setUser(sessionUser);
          setIsAuthenticated(true);
          onAuthenticated?.();
        } else {
          setIsAuthenticated(false);
          setUser(null);
          if (onUnauthenticated) {
            onUnauthenticated();
          } else if (redirectOnUnauthenticated) {
            window.location.href = `${BACKEND_OIDC_URL}/api/auth/oidc-login`;
          }
        }
      } catch {
        setIsAuthenticated(false);
        setUser(null);
        if (onUnauthenticated) {
          onUnauthenticated();
        } else if (redirectOnUnauthenticated) {
          window.location.href = `${BACKEND_OIDC_URL}/api/auth/oidc-login`;
        }
      } finally {
        setLoading(false);
      }
    };

    const initAuth = () => {
      if (isDemoMode) {
        setUser(demoUser);
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      const logoutFlag = localStorage.getItem('logged_out');
      if (logoutFlag === 'true') {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        localStorage.removeItem('logged_out');
        return;
      }

      // Keep logged out page static to avoid immediate re-login redirects.
      const path = window.location.pathname;
      const isUserNotAuthenticatedPage = path.endsWith('/usernotauthenticated');
      const isUserLoggedOutPage = path.endsWith('/userloggedout');

      if (isUserLoggedOutPage) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      if (!isLocalMode) {
        if (isUserNotAuthenticatedPage) {
          checkSession({
            redirectOnUnauthenticated: false,
            onAuthenticated: () => {
              sessionStorage.removeItem('oidc_auth_attempt');
              window.location.replace(`${BACKEND_OIDC_URL}/`);
            },
            onUnauthenticated: () => {
              // Redirect to OIDC login once so user can re-authenticate after gaining access.
              // Use a timestamp flag to prevent infinite loops when still unauthorized.
              const lastAttempt = sessionStorage.getItem('oidc_auth_attempt');
              const now = Date.now();
              if (lastAttempt && (now - parseInt(lastAttempt, 10)) < 60000) {
                sessionStorage.removeItem('oidc_auth_attempt');
                return;
              }
              sessionStorage.setItem('oidc_auth_attempt', String(now));
              window.location.href = `${BACKEND_OIDC_URL}/api/auth/oidc-login`;
            },
          });
          return;
        }

        checkSession();
      } else {
        // In local mode, use the existing session-based login
        const existingUser = loadSessionUser();
        if (existingUser) {
          setUser(existingUser);
          setIsAuthenticated(true);
          if (isUserNotAuthenticatedPage) {
            window.location.replace(`${BACKEND_OIDC_URL}/`);
            return;
          }
        }
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Local login (for development only)
  const login = async (attuid: string): Promise<AuthUser> => {
    if (isDemoMode) {
      const nextUser = { ...demoUser, attuid };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
      setIsAuthenticated(true);
      return nextUser;
    }

    const data = await loginApi(attuid);
    const nextUser: AuthUser = {
      attuid: data.attuid,
      token: data.token,
      adminAccess: data.adminAccess,
      isAdmin: data.adminAccess === 'Y',
      appAccess: data.appAccess || ['ISOM'],
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    setIsAuthenticated(true);
    return nextUser;
  };

  const logout = async () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
    setIsAuthenticated(false);

    if (isDemoMode) {
      window.location.assign('/userloggedout');
      return;
    }

    if (!isLocalMode) {
      localStorage.setItem('logged_out', 'true');
      window.location.href = `${BACKEND_OIDC_URL}/api/auth/logout`;
    }
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: isLocalMode || isDemoMode ? Boolean(user) : isAuthenticated,
    isLoading: loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
