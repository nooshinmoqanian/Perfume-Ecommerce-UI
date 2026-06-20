const AUTH_KEY = "auth_token";
const USER_KEY = "auth_user";

// Kept in sync with auth-service DEV_ADMIN_TOKEN for local admin access.
export const DEV_ADMIN_TOKEN = "dev-admin-1345678";

export type AuthRole = "user" | "admin";

export type AuthUser = {
  id?: string;
  email?: string;
  role?: AuthRole;
  name?: string;
  phone?: string;
  address?: string;
};

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem(AUTH_KEY, token);
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  } catch {
    // Ignore storage errors.
  }
};

export const getAuthUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

export const setAuthUser = (user: AuthUser | null) => {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // Ignore storage errors.
  }
};

// Persist a full login session (token + the public user payload returned by auth-service).
export const setAuthSession = (token: string, user?: AuthUser | null) => {
  setAuthToken(token);
  if (user !== undefined) setAuthUser(user);
};

export const isAdmin = (): boolean => {
  if (getAuthToken() === DEV_ADMIN_TOKEN) return true;
  return getAuthUser()?.role === "admin";
};

export const clearAuthToken = () => {
  setAuthToken(null);
  setAuthUser(null);
};
