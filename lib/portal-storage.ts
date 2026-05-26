export const PORTAL_TOKEN_COOKIE = 'mp_portal_token';
const MAX_AGE = 60 * 60 * 24 * 365; // 1 año

export function savePortalToken(token: string) {
  try {
    localStorage.setItem(PORTAL_TOKEN_COOKIE, token);
  } catch {
    // ignore
  }
  if (typeof document !== 'undefined') {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${PORTAL_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE}; SameSite=Lax${secure}`;
  }
}

export function getPortalToken(): string | null {
  try {
    const stored = localStorage.getItem(PORTAL_TOKEN_COOKIE);
    if (stored) return stored;
  } catch {
    // ignore
  }
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${PORTAL_TOKEN_COOKIE}=([^;]*)`)
  );
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}
