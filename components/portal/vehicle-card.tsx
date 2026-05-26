import type { PortalData, PortalVehiculo } from '@/types';
import { formatDate } from '@/lib/utils';
import { ESTADO_OT_LABELS, SERVICE_STATUS_LABELS } from '@/lib/portal-utils';
import { Car, Droplets, Gauge } from 'lucide-react';

const STATUS_STYLES = {
  ok: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  proximo: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  vencido: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export function VehicleCard({ vehiculo }: { vehiculo: PortalVehiculo }) {
  const titulo = [vehiculo.marca, vehiculo.modelo].filter(Boolean).join(' ') || 'Vehículo';

  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-orange-400" />
            <h3 className="font-bold tracking-wide text-white">{vehiculo.patente}</h3>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            {titulo}
            {vehiculo.anio ? ` · ${vehiculo.anio}` : ''}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[vehiculo.serviceStatus]}`}
        >
          {SERVICE_STATUS_LABELS[vehiculo.serviceStatus]}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-zinc-950/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Gauge className="h-3.5 w-3.5" />
            Km actual
          </div>
          <p className="mt-1 text-lg font-semibold text-white">
            {vehiculo.kmActual?.toLocaleString('es-AR') ?? '—'}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-950/60 p-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Gauge className="h-3.5 w-3.5" />
            Próximo service
          </div>
          <p className="mt-1 text-lg font-semibold text-white">
            {vehiculo.kmProximoService?.toLocaleString('es-AR') ?? '—'}
          </p>
        </div>
      </div>

      {vehiculo.kmRestantes != null && (
        <p className="mt-3 text-sm text-zinc-400">
          {vehiculo.kmRestantes <= 0
            ? `Service vencido hace ${Math.abs(vehiculo.kmRestantes).toLocaleString('es-AR')} km`
            : `Faltan ${vehiculo.kmRestantes.toLocaleString('es-AR')} km para el próximo service`}
        </p>
      )}

      {vehiculo.aceiteRecomendado && (
        <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
          <Droplets className="h-4 w-4 text-orange-400" />
          Aceite recomendado: <span className="text-zinc-200">{vehiculo.aceiteRecomendado}</span>
        </div>
      )}

      {vehiculo.historial.length > 0 && (
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Últimos services
          </p>
          <ul className="space-y-2">
            {vehiculo.historial.map((h) => (
              <li key={`${h.numero}-${h.fecha}`} className="flex justify-between text-sm">
                <span className="text-zinc-300">
                  OT #{h.numero}
                  {h.kmIngreso ? ` · ${h.kmIngreso.toLocaleString('es-AR')} km` : ''}
                </span>
                <span className="text-zinc-500">{formatDate(h.fecha)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export function PendingOrders({ ordenes }: { ordenes: PortalData['ordenesPendientes'] }) {
  if (!ordenes.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-white">En taller ahora</h2>
      {ordenes.map((o) => (
        <div key={o.numero} className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <div className="flex justify-between">
            <div>
              <p className="font-medium text-white">OT #{o.numero}</p>
              <p className="text-sm text-zinc-400">{o.patente}</p>
            </div>
            <span className="text-sm text-blue-400">{ESTADO_OT_LABELS[o.estado] ?? o.estado}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
