'use client';

import { useEffect, useState } from 'react';
import type { PortalData } from '@/types';
import { InstallBanner } from '@/components/portal/install-banner';
import { PendingOrders, VehicleCard } from '@/components/portal/vehicle-card';
import { ServiceWorkerRegister } from '@/components/portal/service-worker-register';
import { savePortalToken } from '@/lib/portal-storage';
import { MapPin, Phone, Loader2 } from 'lucide-react';

export default function PortalPage({ token }: { token: string }) {
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    savePortalToken(token);
  }, [token]);

  useEffect(() => {
    fetch(`/api/portal/${token}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Enlace no válido');
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center">
        <p className="text-lg font-medium text-white">Enlace no válido</p>
        <p className="mt-2 text-sm text-zinc-400">
          Pedile al lubricentro que genere un nuevo código QR.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100">
      <ServiceWorkerRegister />

      <header className="border-b border-zinc-800/80 bg-zinc-950/90 px-4 py-5 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 font-bold text-zinc-950">
            MP
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">{data.negocio.nombre}</p>
            <h1 className="text-lg font-bold text-white">Hola, {data.nombre}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-6 px-4 py-6 pb-10">
        <InstallBanner />

        {data.vehiculos.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center text-zinc-400">
            Todavía no hay vehículos registrados a tu nombre.
          </div>
        ) : (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Tus vehículos</h2>
            {data.vehiculos.map((v) => (
              <VehicleCard key={v.patente} vehiculo={v} />
            ))}
          </section>
        )}

        <PendingOrders ordenes={data.ordenesPendientes} />

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h2 className="font-semibold text-white">Contacto</h2>
          <div className="mt-3 space-y-2 text-sm text-zinc-400">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
              {data.negocio.direccion}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-orange-400" />
              <a href={`tel:${data.negocio.telefono.replace(/\s/g, '')}`} className="text-orange-400 hover:underline">
                {data.negocio.telefono}
              </a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
