'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getPortalToken } from '@/lib/portal-storage';

export default function PortalEntryPage() {
  const router = useRouter();
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const token = getPortalToken();
    if (token) {
      router.replace(`/portal/${token}`);
      return;
    }
    // Pequeña espera por si la cookie tarda en iOS standalone
    const timer = setTimeout(() => {
      const retry = getPortalToken();
      if (retry) router.replace(`/portal/${retry}`);
      else setMissing(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [router]);

  if (missing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center text-zinc-100">
        <p className="text-lg font-medium">Acceso no configurado</p>
        <p className="mt-2 max-w-sm text-sm text-zinc-400">
          Escaneá el código QR en MP Lubricentro para vincular tu vehículo a este acceso directo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );
}
