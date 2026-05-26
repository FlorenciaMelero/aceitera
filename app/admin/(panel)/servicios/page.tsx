'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import type { PlantillaPM, Producto, Combo } from '@/types';

export default function ServiciosPage() {
  const [plantillas, setPlantillas] = useState<PlantillaPM[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showComboForm, setShowComboForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [items, setItems] = useState<{ productoId: string; cantidad: number }[]>([]);
  const [prodId, setProdId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [comboForm, setComboForm] = useState({ nombre: '', descripcion: '', precio: 0, productoIds: [] as string[] });

  const load = () => {
    fetch('/api/ordenes?type=plantillas').then((r) => r.json()).then(setPlantillas);
    fetch('/api/dashboard?type=combos').then((r) => r.json()).then(setCombos);
    fetch('/api/productos').then((r) => r.json()).then(setProductos);
  };
  useEffect(() => { load(); }, []);

  const prodMap = Object.fromEntries(productos.map((p) => [p.id, p.nombre]));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/ordenes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'plantilla', nombre, descripcion, items }),
    });
    toast.success('Plantilla PM guardada');
    setShowForm(false);
    setNombre('');
    setItems([]);
    load();
  }

  async function saveCombo(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/dashboard', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'combo', ...comboForm }),
    });
    toast.success('Combo guardado');
    setShowComboForm(false);
    setComboForm({ nombre: '', descripcion: '', precio: 0, productoIds: [] });
    load();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Servicios y paquetes</h2>

      <Tabs defaultValue="pm">
        <TabsList>
          <TabsTrigger value="pm">Plantillas PM</TabsTrigger>
          <TabsTrigger value="combos">Combos / paquetes</TabsTrigger>
        </TabsList>

        <TabsContent value="pm" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowForm(true)}><Plus className="mr-2 h-4 w-4" /> Nueva plantilla</Button>
          </div>

          {showForm && (
            <Card>
              <CardHeader><CardTitle>Nueva plantilla PM</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={save} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1"><Label>Nombre</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} required /></div>
                    <div className="space-y-1"><Label>Descripción</Label><Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} /></div>
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="space-y-1">
                      <Label>Producto</Label>
                      <Select value={prodId} onValueChange={setProdId}>
                        <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                        <SelectContent>{productos.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1"><Label>Cant.</Label><Input type="number" className="w-20" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} /></div>
                    <Button type="button" variant="outline" onClick={() => { if (prodId) { setItems([...items, { productoId: prodId, cantidad }]); setProdId(''); } }}>Agregar</Button>
                  </div>
                  <ul className="text-sm">{items.map((it, i) => <li key={i}>{prodMap[it.productoId]} x{it.cantidad}</li>)}</ul>
                  <Button type="submit">Guardar plantilla</Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {plantillas.map((p) => (
              <Card key={p.id}>
                <CardHeader><CardTitle>{p.nombre}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{p.descripcion}</p>
                  <ul className="text-sm space-y-1">
                    {p.items.map((it) => (
                      <li key={it.id}>{prodMap[it.productoId] || it.productoId} — {it.cantidad} u.</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="combos" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowComboForm(true)}><Plus className="mr-2 h-4 w-4" /> Nuevo combo</Button>
          </div>

          {showComboForm && (
            <Card>
              <CardHeader><CardTitle>Nuevo combo</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={saveCombo} className="space-y-4 max-w-lg">
                  <div className="space-y-1"><Label>Nombre</Label><Input value={comboForm.nombre} onChange={(e) => setComboForm({ ...comboForm, nombre: e.target.value })} required /></div>
                  <div className="space-y-1"><Label>Descripción</Label><Input value={comboForm.descripcion} onChange={(e) => setComboForm({ ...comboForm, descripcion: e.target.value })} /></div>
                  <div className="space-y-1"><Label>Precio</Label><Input type="number" value={comboForm.precio} onChange={(e) => setComboForm({ ...comboForm, precio: Number(e.target.value) })} /></div>
                  <div className="space-y-1">
                    <Label>Productos incluidos</Label>
                    <Select onValueChange={(v) => setComboForm({
                      ...comboForm,
                      productoIds: comboForm.productoIds.includes(v)
                        ? comboForm.productoIds
                        : [...comboForm.productoIds, v],
                    })}>
                      <SelectTrigger><SelectValue placeholder="Agregar producto" /></SelectTrigger>
                      <SelectContent>{productos.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}</SelectContent>
                    </Select>
                    <ul className="text-sm mt-2">{comboForm.productoIds.map((id) => <li key={id}>{prodMap[id]}</li>)}</ul>
                  </div>
                  <Button type="submit">Guardar combo</Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {combos.map((c) => (
              <Card key={c.id}>
                <CardHeader><CardTitle>{c.nombre}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{c.descripcion}</p>
                  <p className="font-bold text-brand">{formatCurrency(c.precio)}</p>
                  <ul className="text-sm mt-2 space-y-1">
                    {c.productoIds.map((id) => <li key={id}>{prodMap[id] || id}</li>)}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
