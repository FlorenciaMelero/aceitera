'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, getStockStatus, cn } from '@/lib/utils';
import type { Producto } from '@/types';

export default function StockPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<{ id: string; productoId: string; tipo: string; cantidad: number; motivo: string; fecha: string }[]>([]);
  const [lotesPorVencer, setLotesPorVencer] = useState<{ id: string; productoId: string; cantidad: number; vencimiento?: string }[]>([]);
  const [filter, setFilter] = useState<'all' | 'bajo' | 'normal' | 'excesivo'>('all');

  useEffect(() => {
    const params = filter !== 'all' ? `?stockLevel=${filter}` : '';
    fetch(`/api/productos${params}`).then((r) => r.json()).then(setProductos);
    fetch('/api/ordenes?type=movimientos').then((r) => r.json()).then(setMovimientos);
    fetch('/api/dashboard?type=por-vencer').then((r) => r.json()).then(setLotesPorVencer);
  }, [filter]);

  const prodMap = Object.fromEntries(productos.map((p) => [p.id, p.nombre]));
  const bajo = productos.filter((p) => p.stock <= p.stockMinimo);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Stock e inventario</h2>
        <div className="flex gap-2">
          {(['all', 'bajo', 'normal', 'excesivo'] as const).map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
              {f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-red-500/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Stock bajo</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-red-400">{bajo.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total productos</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{productos.length}</p></CardContent>
        </Card>
        <Card className="border-orange-500/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Por vencer</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-orange-400">{lotesPorVencer.length}</p></CardContent>
        </Card>
      </div>

      {lotesPorVencer.length > 0 && (
        <Card className="border-orange-500/30">
          <CardHeader><CardTitle className="text-orange-400">Lotes por vencer (30 días)</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {lotesPorVencer.map((l) => (
                <li key={l.id} className="flex justify-between">
                  <span>{prodMap[l.productoId] || l.productoId}</span>
                  <span className="text-orange-400">{l.cantidad} u. — vence {l.vencimiento ? new Date(l.vencimiento).toLocaleDateString('es-AR') : '—'}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {bajo.length > 0 && (
        <Card className="border-red-500/30">
          <CardHeader><CardTitle className="text-red-400">Alertas de stock bajo — reponer</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {bajo.map((p) => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span>{p.nombre}</span>
                  <span className="text-red-400">{p.stock} / mín {p.stockMinimo}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Inventario</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left">Producto</th>
                <th className="p-3 text-right">Stock</th>
                <th className="p-3 text-right">Mínimo</th>
                <th className="p-3 text-right">Valor</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => {
                const s = getStockStatus(p.stock, p.stockMinimo);
                return (
                  <tr key={p.id} className="border-b">
                    <td className="p-3">{p.nombre}</td>
                    <td className="p-3 text-right">{p.stock}</td>
                    <td className="p-3 text-right">{p.stockMinimo}</td>
                    <td className="p-3 text-right">{formatCurrency(p.stock * p.precioCosto)}</td>
                    <td className="p-3">
                      <span className={cn('text-xs font-medium', s.level === 'bajo' ? 'text-red-400' : s.level === 'excesivo' ? 'text-blue-400' : 'text-green-400')}>
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Historial de movimientos</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Tipo</th>
                <th className="p-3 text-right">Cantidad</th>
                <th className="p-3 text-left">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.slice(0, 20).map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="p-3">{new Date(m.fecha).toLocaleString('es-AR')}</td>
                  <td className="p-3 capitalize">{m.tipo}</td>
                  <td className="p-3 text-right">{m.cantidad}</td>
                  <td className="p-3">{m.motivo}</td>
                </tr>
              ))}
              {!movimientos.length && (
                <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Sin movimientos aún</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Link href="/admin/productos">
        <Button variant="outline">Gestionar productos →</Button>
      </Link>
    </div>
  );
}
