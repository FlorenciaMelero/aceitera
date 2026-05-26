'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Plus, Upload, Download, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, calcMargen, getStockStatus, cn } from '@/lib/utils';
import type { Producto, CategoriaProducto } from '@/types';

const CATEGORIAS: CategoriaProducto[] = ['aceites', 'filtros', 'liquidos', 'aditivos', 'repuestos', 'otros'];

const emptyForm = {
  nombre: '',
  categoria: 'aceites' as CategoriaProducto,
  marca: '',
  unidad: 'unidades' as Producto['unidad'],
  precioCosto: 0,
  precioVenta: 0,
  stock: 0,
  stockMinimo: 5,
  descripcion: '',
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterCat !== 'all') params.set('categoria', filterCat);
    fetch(`/api/productos?${params}`).then((r) => r.json()).then(setProductos);
  };

  useEffect(() => { load(); }, [search, filterCat]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const body = editId ? { ...form, id: editId } : form;
    const res = await fetch('/api/productos', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) {
      toast.success(editId ? 'Producto actualizado' : 'Producto creado');
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar producto?')) return;
    await fetch(`/api/productos?id=${id}`, { method: 'DELETE' });
    toast.success('Producto eliminado');
    load();
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    const res = await fetch('/api/productos/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows }),
    });
    const result = await res.json();
    toast.success(`Importados: ${result.created} creados, ${result.updated} actualizados`);
    if (result.errors?.length) toast.warning(`${result.errors.length} filas con errores`);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Productos</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.open('/api/productos/export')}>
            <Download className="mr-2 h-4 w-4" /> Exportar Excel
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Importar Excel
          </Button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
          <Button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}>
            <Plus className="mr-2 h-4 w-4" /> Agregar producto
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Categoría" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editId ? 'Editar' : 'Nuevo'} producto</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['nombre', 'Nombre', 'text'],
                ['marca', 'Marca', 'text'],
                ['precioCosto', 'Precio costo', 'number'],
                ['precioVenta', 'Precio venta', 'number'],
                ['stock', 'Stock', 'number'],
                ['stockMinimo', 'Stock mínimo', 'number'],
              ].map(([key, label, type]) => (
                <div key={key} className="space-y-1">
                  <Label>{label}</Label>
                  <Input
                    type={type}
                    value={String(form[key as keyof typeof form] ?? '')}
                    onChange={(e) => setForm({ ...form, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
                    required={key === 'nombre'}
                  />
                </div>
              ))}
              <div className="space-y-1">
                <Label>Categoría</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v as CategoriaProducto })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
                <Button type="submit">Guardar</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left">Nombre</th>
                  <th className="p-3 text-left">Categoría</th>
                  <th className="p-3 text-right">Costo</th>
                  <th className="p-3 text-right">Venta</th>
                  <th className="p-3 text-right">Margen</th>
                  <th className="p-3 text-right">Stock</th>
                  <th className="p-3 text-left">Estado</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => {
                  const status = getStockStatus(p.stock, p.stockMinimo);
                  return (
                    <tr key={p.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">{p.nombre}</td>
                      <td className="p-3 capitalize">{p.categoria}</td>
                      <td className="p-3 text-right">{formatCurrency(p.precioCosto)}</td>
                      <td className="p-3 text-right">{formatCurrency(p.precioVenta)}</td>
                      <td className="p-3 text-right">{calcMargen(p.precioCosto, p.precioVenta).toFixed(1)}%</td>
                      <td className="p-3 text-right">{p.stock}</td>
                      <td className="p-3">
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          status.level === 'bajo' && 'bg-red-500/20 text-red-400',
                          status.level === 'normal' && 'bg-green-500/20 text-green-400',
                          status.level === 'excesivo' && 'bg-blue-500/20 text-blue-400'
                        )}>{status.label}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setForm({ ...emptyForm, ...p }); setEditId(p.id); setShowForm(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
