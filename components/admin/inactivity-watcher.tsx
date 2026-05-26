'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const INACTIVITY_MS = 30000;
const EVENTS = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click', 'input'];

export function AdminInactivityWatcher() {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.info('Sesión cerrada por inactividad (30 s)');
    router.push('/admin/login');
    router.refresh();
  }, [router]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, INACTIVITY_MS);
  }, [logout]);

  useEffect(() => {
    resetTimer();
    EVENTS.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      EVENTS.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [resetTimer]);

  return null;
}
