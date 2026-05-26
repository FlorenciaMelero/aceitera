'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, QrCode, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ClienteQrModal } from '@/components/admin/cliente-qr-modal';
import { formatCurrency } from '@/lib/utils';
import type { Cliente } from '@/types';

const empty = { nombre: '', dni: '', telefono: '', email: '', direccion: '', notas: '' };

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [qrCliente, setQrCliente] = useState<Cliente | null>(null);

  const load = () => fetch(`/api/clientes?search=${search}`).then((r) => r.json()).then(setClientes);
  useEffect(() => { load(); }, [search]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/clientes', {
      method: editId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editId ? { ...form, id: editId } : form),
    });
    if (res.ok) {
      toast.success('Cliente guardado');
      setShowForm(false);
      setEditId(null);
      setForm(empty);
      load();
    }
  }

  async function del(id: string) {
    if (!confirm('¿Eliminar cliente y sus vehículos?')) return;
    await fetch(`/api/clientes?id=${id}`, { method: 'DELETE' });
    toast.success('Cliente eliminado');
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <h2 className="text-2xl font-bold">Clientes</h2>
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm(empty); }}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo cliente
        </Button>
      </div>

      <Input placeholder="Buscar por nombre, DNI, teléfono..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editId ? 'Editar' : 'Nuevo'} cliente</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              {(['nombre', 'dni', 'telefono', 'email', 'direccion'] as const).map((f) => (
                <div key={f} className="space-y-1">
                  <Label className="capitalize">{f}</Label>
                  <Input value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} required={f === 'nombre'} />
                </div>
              ))}
              <div className="sm:col-span-2 space-y-1">
                <Label>Notas</Label>
                <Textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <Button type="submit">Guardar</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {qrCliente && (
        <ClienteQrModal
          clienteId={qrCliente.id}
          clienteNombre={qrCliente.nombre}
          onClose={() => setQrCliente(null)}
        />
      )}

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">DNI</th>
                <th className="p-3 text-left">Teléfono</th>
                <th className="p-3 text-right">Cta. cte.</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-3 font-medium">{c.nombre}</td>
                  <td className="p-3">{c.dni || '-'}</td>
                  <td className="p-3">{c.telefono || '-'}</td>
                  <td className="p-3 text-right">{c.saldoCuentaCorriente > 0 ? formatCurrency(c.saldoCuentaCorriente) : '-'}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setQrCliente(c)}
                        title="Generar QR para portal del cliente"
                      >
                        <QrCode className="mr-1 h-3.5 w-3.5" />
                        QR
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setForm({ nombre: c.nombre, dni: c.dni || '', telefono: c.telefono || '', email: c.email || '', direccion: c.direccion || '', notas: c.notas || '' }); setEditId(c.id); setShowForm(true); }}>Editar</Button>
                      <Button size="sm" variant="ghost" onClick={() => del(c.id)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
                    </div>
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
