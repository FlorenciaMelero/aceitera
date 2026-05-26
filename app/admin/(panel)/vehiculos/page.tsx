'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Vehiculo, Cliente } from '@/types';

const empty = { clienteId: '', patente: '', marca: '', modelo: '', anio: 2020, kmActual: 0, kmProximoService: 0, aceiteRecomendado: '' };

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    fetch('/api/clientes?type=vehiculos').then((r) => r.json()).then(setVehiculos);
    fetch('/api/clientes').then((r) => r.json()).then(setClientes);
  };
  useEffect(() => { load(); }, []);

  const clienteMap = Object.fromEntries(clientes.map((c) => [c.id, c.nombre]));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/clientes', {
      method: editId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, entity: 'vehiculo', id: editId }),
    });
    if (res.ok) {
      toast.success('Vehículo guardado');
      setShowForm(false);
      load();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Vehículos</h2>
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm(empty); }}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo vehículo
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editId ? 'Editar' : 'Nuevo'} vehículo</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <Label>Cliente</Label>
                <Select value={form.clienteId} onValueChange={(v) => setForm({ ...form, clienteId: v })} required>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {[
                ['patente', 'Patente'],
                ['marca', 'Marca'],
                ['modelo', 'Modelo'],
                ['aceiteRecomendado', 'Aceite recomendado'],
              ].map(([k, l]) => (
                <div key={k} className="space-y-1">
                  <Label>{l}</Label>
                  <Input value={String(form[k as keyof typeof form] ?? '')} onChange={(e) => setForm({ ...form, [k]: e.target.value })} required={k === 'patente'} />
                </div>
              ))}
              {[
                ['anio', 'Año'],
                ['kmActual', 'Km actual'],
                ['kmProximoService', 'Km próximo service'],
              ].map(([k, l]) => (
                <div key={k} className="space-y-1">
                  <Label>{l}</Label>
                  <Input type="number" value={form[k as keyof typeof form] as number} onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} />
                </div>
              ))}
              <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
                <Button type="submit">Guardar</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left">Patente</th>
                <th className="p-3 text-left">Cliente</th>
                <th className="p-3 text-left">Vehículo</th>
                <th className="p-3 text-right">Km</th>
                <th className="p-3 text-right">Próx. service</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v) => (
                <tr key={v.id} className="border-b">
                  <td className="p-3 font-bold">{v.patente}</td>
                  <td className="p-3">{clienteMap[v.clienteId] || '-'}</td>
                  <td className="p-3">{v.marca} {v.modelo} {v.anio ? `(${v.anio})` : ''}</td>
                  <td className="p-3 text-right">{v.kmActual?.toLocaleString() || '-'}</td>
                  <td className="p-3 text-right">{v.kmProximoService?.toLocaleString() || '-'}</td>
                  <td className="p-3">
                    <Button size="sm" variant="outline" onClick={() => { setForm({ clienteId: v.clienteId, patente: v.patente, marca: v.marca || '', modelo: v.modelo || '', anio: v.anio || 2020, kmActual: v.kmActual || 0, kmProximoService: v.kmProximoService || 0, aceiteRecomendado: v.aceiteRecomendado || '' }); setEditId(v.id); setShowForm(true); }}>Editar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
