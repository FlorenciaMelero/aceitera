export const PORTAL_TOKEN_KEY = 'mp_portal_token';

export function savePortalToken(token: string) {
  try {
    localStorage.setItem(PORTAL_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function getPortalToken(): string | null {
  try {
    return localStorage.getItem(PORTAL_TOKEN_KEY);
  } catch {
    return null;
  }
}
