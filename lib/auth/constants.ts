export const COOKIE_NAME = 'mp_admin_session';
export const SESSION_DURATION = 60 * 60 * 8;

export function getJwtSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET || 'mp-lubricentro-dev-secret-change-in-production'
  );
}
