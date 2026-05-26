'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/lib/utils';
import type { OrdenTrabajo, Cliente, Vehiculo, Producto, PlantillaPM, EstadoOT } from '@/types';

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [plantillas, setPlantillas] = useState<PlantillaPM[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    clienteId: '',
    vehiculoId: '',
    kmIngreso: 0,
    observaciones: '',
    notasInternas: '',
    fotoUrl: '',
    fotos: [] as string[],
    plantillaId: '',
    productoId: '',
    cantidad: 1,
    items: [] as { productoId: string; cantidad: number; precioUnitario: number }[],
  });

  const load = () => {
    fetch('/api/ordenes').then((r) => r.json()).then(setOrdenes);
    fetch('/api/clientes').then((r) => r.json()).then(setClientes);
    fetch('/api/clientes?type=vehiculos').then((r) => r.json()).then(setVehiculos);
    fetch('/api/productos').then((r) => r.json()).then(setProductos);
    fetch('/api/ordenes?type=plantillas').then((r) => r.json()).then(setPlantillas);
  };
  useEffect(() => { load(); }, []);

  const vehiculosCliente = vehiculos.filter((v) => v.clienteId === form.clienteId);
  const clienteMap = Object.fromEntries(clientes.map((c) => [c.id, c.nombre]));
  const vehiculoMap = Object.fromEntries(vehiculos.map((v) => [v.id, v.patente]));

  function addItem() {
    const prod = productos.find((p) => p.id === form.productoId);
    if (!prod) return;
    setForm({
      ...form,
      items: [...form.items, { productoId: prod.id, cantidad: form.cantidad, precioUnitario: prod.precioVenta }],
      productoId: '',
      cantidad: 1,
    });
  }

  async function createOT(confirmarStock = false) {
    const res = await fetch('/api/ordenes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        fotos: form.fotos,
        notasInternas: form.notasInternas,
        servicios: [],
        confirmarStock,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.errors?.length) {
        const ok = confirm(`Stock insuficiente:\n${data.errors.join('\n')}\n\n¿Confirmar igualmente?`);
        if (ok) return createOT(true);
      } else toast.error('Error al crear OT');
      return;
    }
    toast.success(`OT #${data.ot?.numero} creada — stock descontado`);
    setShowForm(false);
    load();
  }

  async function addFotoOT(otId: string, url: string) {
    const ot = ordenes.find((o) => o.id === otId);
    const fotos = [...(ot?.fotos || []), url];
    await fetch('/api/ordenes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: otId, fotos }),
    });
    toast.success('Foto agregada');
    load();
  }

  async function cambiarEstado(id: string, estado: EstadoOT) {
    await fetch('/api/ordenes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado }),
    });
    toast.success(`Estado: ${estado}`);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Órdenes de trabajo</h2>
        <Button onClick={() => setShowForm(true)}><Plus className="mr-2 h-4 w-4" /> Nueva OT</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nueva orden de trabajo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <Label>Cliente</Label>
                <Select value={form.clienteId} onValueChange={(v) => setForm({ ...form, clienteId: v, vehiculoId: '' })}>
                  <SelectTrigger><SelectValue placeholder="Cliente" /></SelectTrigger>
                  <SelectContent>{clientes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Vehículo</Label>
                <Select value={form.vehiculoId} onValueChange={(v) => setForm({ ...form, vehiculoId: v })}>
                  <SelectTrigger><SelectValue placeholder="Vehículo" /></SelectTrigger>
                  <SelectContent>{vehiculosCliente.map((v) => <SelectItem key={v.id} value={v.id}>{v.patente}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Plantilla PM</Label>
                <Select value={form.plantillaId} onValueChange={(v) => setForm({ ...form, plantillaId: v })}>
                  <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                  <SelectContent>{plantillas.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Km ingreso</Label>
                <Input type="number" value={form.kmIngreso} onChange={(e) => setForm({ ...form, kmIngreso: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Observaciones</Label>
              <Textarea value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Notas internas</Label>
              <Textarea value={form.notasInternas} onChange={(e) => setForm({ ...form, notasInternas: e.target.value })} />
            </div>
            <div className="flex flex-wrap gap-2 items-end">
              <div className="space-y-1 flex-1 min-w-[200px]">
                <Label>URL foto (mock Storage)</Label>
                <Input placeholder="https://..." value={form.fotoUrl} onChange={(e) => setForm({ ...form, fotoUrl: e.target.value })} />
              </div>
              <Button type="button" variant="outline" onClick={() => {
                if (!form.fotoUrl) return;
                setForm({ ...form, fotos: [...form.fotos, form.fotoUrl], fotoUrl: '' });
              }}>Agregar foto</Button>
            </div>
            {form.fotos.length > 0 && (
              <ul className="text-xs text-muted-foreground space-y-1">
                {form.fotos.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            )}
            <div className="flex flex-wrap gap-2 items-end">
              <div className="space-y-1">
                <Label>Producto</Label>
                <Select value={form.productoId} onValueChange={(v) => setForm({ ...form, productoId: v })}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Producto" /></SelectTrigger>
                  <SelectContent>{productos.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Cant.</Label>
                <Input type="number" className="w-20" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })} />
              </div>
              <Button type="button" variant="outline" onClick={addItem}>Agregar producto</Button>
            </div>
            {form.items.length > 0 && (
              <ul className="text-sm space-y-1">
                {form.items.map((item, i) => {
                  const p = productos.find((pr) => pr.id === item.productoId);
                  return <li key={i}>{p?.nombre} x{item.cantidad} — {formatCurrency(item.precioUnitario * item.cantidad)}</li>;
                })}
              </ul>
            )}
            <div className="flex gap-2">
              <Button onClick={() => createOT()}>Confirmar OT (descontar stock)</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left">OT #</th>
                <th className="p-3 text-left">Cliente</th>
                <th className="p-3 text-left">Patente</th>
                <th className="p-3 text-left">Estado</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3">Fotos</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((ot) => (
                <tr key={ot.id} className="border-b">
                  <td className="p-3 font-bold">#{ot.numero}</td>
                  <td className="p-3">{clienteMap[ot.clienteId]}</td>
                  <td className="p-3">{vehiculoMap[ot.vehiculoId]}</td>
                  <td className="p-3 capitalize">{ot.estado.replace('_', ' ')}</td>
                  <td className="p-3 text-right">{formatCurrency(ot.total)}</td>
                  <td className="p-3 text-xs">
                    {(ot.fotos?.length || 0) > 0 ? (
                      <span>{ot.fotos!.length} foto(s)</span>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => {
                        const url = prompt('URL de foto (mock):');
                        if (url) addFotoOT(ot.id, url);
                      }}>+ foto</Button>
                    )}
                  </td>
                  <td className="p-3">
                    <Select value={ot.estado} onValueChange={(v) => cambiarEstado(ot.id, v as EstadoOT)}>
                      <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(['pendiente', 'en_proceso', 'terminado', 'entregado'] as EstadoOT[]).map((e) => (
                          <SelectItem key={e} value={e}>{e.replace('_', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
              {!ordenes.length && <tr><td colSpan={7} className="p-4 text-center text-muted-foreground">No hay órdenes</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
