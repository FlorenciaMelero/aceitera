'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default function ReportesPage() {
  const [kpis, setKpis] = useState<Record<string, number>>({});
  const [charts, setCharts] = useState<Record<string, unknown[]>>({});
  const [audit, setAudit] = useState<{ accion: string; entidad: string; fecha: string; detalle?: string }[]>([]);

  useEffect(() => {
    fetch('/api/dashboard?type=kpis').then((r) => r.json()).then(setKpis);
    fetch('/api/dashboard?type=charts').then((r) => r.json()).then(setCharts);
    fetch('/api/dashboard?type=audit').then((r) => r.json()).then(setAudit);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reportes</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">OTs del mes</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{kpis.otsMes ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Ingresos del mes</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(kpis.ingresosMes ?? 0)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Stock bajo</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-400">{kpis.stockBajo ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Por vencer</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-orange-400">{kpis.porVencer ?? 0}</p></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top servicios</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {((charts.serviciosTop as { nombre: string; cantidad: number }[]) || []).map((s) => (
                <li key={s.nombre} className="flex justify-between"><span>{s.nombre}</span><span className="font-medium">{s.cantidad}</span></li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top productos usados</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {((charts.productosTop as { nombre: string; cantidad: number }[]) || []).map((p) => (
                <li key={p.nombre} className="flex justify-between"><span>{p.nombre}</span><span className="font-medium">{p.cantidad} u.</span></li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Log de acciones admin</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Acción</th>
                <th className="p-3 text-left">Entidad</th>
                <th className="p-3 text-left">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((log) => (
                <tr key={log.fecha + log.accion} className="border-b">
                  <td className="p-3">{new Date(log.fecha).toLocaleString('es-AR')}</td>
                  <td className="p-3">{log.accion}</td>
                  <td className="p-3">{log.entidad}</td>
                  <td className="p-3 text-muted-foreground">{log.detalle || '-'}</td>
                </tr>
              ))}
              {!audit.length && <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Sin registros</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
