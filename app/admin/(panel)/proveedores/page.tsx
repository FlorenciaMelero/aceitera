'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { Proveedor } from '@/types';

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [sugerencias, setSugerencias] = useState<{ producto: { nombre: string }; cantidadSugerida: number; proveedor?: Proveedor }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ razonSocial: '', cuit: '', contacto: '', telefono: '', email: '', condicionPago: '' });

  const load = () => {
    fetch('/api/caja?type=proveedores').then((r) => r.json()).then(setProveedores);
    fetch('/api/caja?type=sugerencias-compra').then((r) => r.json()).then(setSugerencias);
  };
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/caja', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, entity: 'proveedor' }) });
    toast.success('Proveedor creado');
    setShowForm(false);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Proveedores</h2>
        <Button onClick={() => setShowForm(true)}><Plus className="mr-2 h-4 w-4" /> Nuevo proveedor</Button>
      </div>

      {sugerencias.length > 0 && (
        <Card className="border-orange-500/30">
          <CardHeader><CardTitle className="text-orange-400">Sugerencias de compra (stock bajo)</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {sugerencias.map((s, i) => (
                <li key={i} className="flex justify-between">
                  <span>{s.producto.nombre} — reponer {s.cantidadSugerida} u.</span>
                  <span className="text-muted-foreground">{s.proveedor?.razonSocial || 'Sin proveedor'}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nuevo proveedor</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              {(['razonSocial', 'cuit', 'contacto', 'telefono', 'email', 'condicionPago'] as const).map((f) => (
                <div key={f} className="space-y-1">
                  <Label className="capitalize">{f.replace(/([A-Z])/g, ' $1')}</Label>
                  <Input value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} required={f === 'razonSocial'} />
                </div>
              ))}
              <div className="sm:col-span-2"><Button type="submit">Guardar</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left">Razón social</th>
                <th className="p-3 text-left">CUIT</th>
                <th className="p-3 text-left">Contacto</th>
                <th className="p-3 text-left">Condición pago</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-3 font-medium">{p.razonSocial}</td>
                  <td className="p-3">{p.cuit || '-'}</td>
                  <td className="p-3">{p.contacto} {p.telefono && `· ${p.telefono}`}</td>
                  <td className="p-3">{p.condicionPago || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
