import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('es-AR').format(new Date(value));
}

export function calcMargen(precioCosto: number, precioVenta: number) {
  if (precioCosto <= 0) return 0;
  return ((precioVenta - precioCosto) / precioCosto) * 100;
}

export function getStockStatus(stock: number, stockMinimo: number): import('@/types').StockStatus {
  if (stock <= stockMinimo) return { level: 'bajo', label: 'Stock bajo' };
  if (stock > stockMinimo * 3) return { level: 'excesivo', label: 'Stock excesivo' };
  return { level: 'normal', label: 'Stock normal' };
}

export function generateId(prefix = '') {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Token largo e impredecible para el portal público del cliente */
export function generatePortalToken(): string {
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getPortalBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  // URL estable de producción — NO usar VERCEL_URL (cada deploy tiene URL protegida)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, '')}`;
  }
  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_URL) {
    // Fallback: alias conocido del proyecto
    const host = process.env.VERCEL_URL;
    if (!host.includes('-git-') && !/-[a-z0-9]{8,}-/.test(host)) {
      return `https://${host}`;
    }
  }
  if (process.env.VERCEL_URL && process.env.VERCEL_ENV !== 'production') {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

export function buildPortalUrl(token: string): string {
  return `${getPortalBaseUrl()}/portal/${token}`;
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hashPasswordSync(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash;
  }
  return Math.abs(hash).toString(16);
}
