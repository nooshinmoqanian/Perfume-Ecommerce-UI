const AUTH_KEY = "auth_token";

export const getAuthToken = () => {
  try {
    return localStorage.getItem(AUTH_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token) => {
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

export const clearAuthToken = () => setAuthToken(null);
