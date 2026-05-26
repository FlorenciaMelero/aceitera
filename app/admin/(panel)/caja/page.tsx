'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import type { CajaMovimiento, MetodoPago } from '@/types';

export default function CajaPage() {
  const [movimientos, setMovimientos] = useState<CajaMovimiento[]>([]);
  const [balance, setBalance] = useState({ ingresos: 0, egresos: 0, balance: 0 });
  const [cuentas, setCuentas] = useState<{ id: string; nombre: string; saldoCuentaCorriente: number }[]>([]);
  const [periodo, setPeriodo] = useState<'dia' | 'semana' | 'mes'>('dia');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tipo: 'ingreso' as 'ingreso' | 'egreso', monto: 0, descripcion: '', metodoPago: 'efectivo' as MetodoPago });

  const load = () => {
    fetch('/api/caja').then((r) => r.json()).then(setMovimientos);
    fetch(`/api/caja?type=balance&periodo=${periodo}`).then((r) => r.json()).then(setBalance);
    fetch('/api/caja?type=cuentas-corrientes').then((r) => r.json()).then(setCuentas);
  };
  useEffect(() => { load(); }, [periodo]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/caja', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, fecha: new Date().toISOString() }),
    });
    toast.success('Movimiento registrado');
    setShowForm(false);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <h2 className="text-2xl font-bold">Caja</h2>
        <div className="flex gap-2">
          {(['dia', 'semana', 'mes'] as const).map((p) => (
            <Button key={p} variant={periodo === p ? 'default' : 'outline'} size="sm" onClick={() => setPeriodo(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
          <Button onClick={() => setShowForm(true)}><Plus className="mr-2 h-4 w-4" /> Movimiento</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-green-400">Ingresos</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(balance.ingresos)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-red-400">Egresos</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(balance.egresos)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Balance</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(balance.balance)}</p></CardContent></Card>
      </div>

      {cuentas.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Cuentas corrientes</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {cuentas.map((c) => (
                <li key={c.id} className="flex justify-between">
                  <span>{c.nombre}</span>
                  <span className="text-red-400">{formatCurrency(c.saldoCuentaCorriente)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nuevo movimiento</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2 max-w-lg">
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as 'ingreso' | 'egreso' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingreso">Ingreso</SelectItem>
                    <SelectItem value="egreso">Egreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Monto</Label><Input type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: Number(e.target.value) })} required /></div>
              <div className="space-y-1"><Label>Descripción</Label><Input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required /></div>
              <div className="space-y-1">
                <Label>Método pago</Label>
                <Select value={form.metodoPago} onValueChange={(v) => setForm({ ...form, metodoPago: v as MetodoPago })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['efectivo', 'transferencia', 'tarjeta', 'cuenta_corriente'] as MetodoPago[]).map((m) => (
                      <SelectItem key={m} value={m}>{m.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Registrar</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Movimientos recientes</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Tipo</th>
                <th className="p-3 text-left">Descripción</th>
                <th className="p-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="p-3">{new Date(m.fecha).toLocaleString('es-AR')}</td>
                  <td className={`p-3 capitalize ${m.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>{m.tipo}</td>
                  <td className="p-3">{m.descripcion}</td>
                  <td className="p-3 text-right">{formatCurrency(m.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
