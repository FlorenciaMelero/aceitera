'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Configuracion } from '@/types';
import { useIndexedDbMigration } from '@/lib/hooks/use-indexeddb-migration';

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [usuarios, setUsuarios] = useState<{ id: string; nombre: string; email: string; rol: string }[]>([]);
  const [categorias, setCategorias] = useState<{ id: string; nombre: string; tipo: string }[]>([]);
  const [nuevaCat, setNuevaCat] = useState('');
  const { migrate, loading: migrating, result: migrationResult, error: migrationError } = useIndexedDbMigration();

  useEffect(() => {
    fetch('/api/dashboard?type=config').then((r) => r.json()).then(setConfig);
    fetch('/api/dashboard?type=usuarios').then((r) => r.json()).then(setUsuarios);
    fetch('/api/dashboard?type=categorias').then((r) => r.json()).then(setCategorias);
  }, []);

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    await fetch('/api/dashboard', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
    toast.success('Configuración guardada');
  }

  async function addCategoria(tipo: 'categoria' | 'marca') {
    if (!nuevaCat) return;
    await fetch('/api/dashboard', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'categoria', nombre: nuevaCat, tipo }) });
    setNuevaCat('');
    fetch('/api/dashboard?type=categorias').then((r) => r.json()).then(setCategorias);
    toast.success('Agregado');
  }

  if (!config) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Configuración</h2>

      <Tabs defaultValue="negocio">
        <TabsList>
          <TabsTrigger value="negocio">Negocio</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="categorias">Categorías y marcas</TabsTrigger>
          <TabsTrigger value="migracion">Migración legacy</TabsTrigger>
        </TabsList>

        <TabsContent value="negocio" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Datos del lubricentro</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={saveConfig} className="grid gap-4 sm:grid-cols-2 max-w-2xl">
                {(['nombreNegocio', 'direccion', 'telefono', 'cuit'] as const).map((f) => (
                  <div key={f} className="space-y-1">
                    <Label className="capitalize">{f.replace(/([A-Z])/g, ' $1')}</Label>
                    <Input value={config[f] || ''} onChange={(e) => setConfig({ ...config, [f]: e.target.value })} />
                  </div>
                ))}
                <div className="space-y-1">
                  <Label>IVA (%)</Label>
                  <Input type="number" value={config.iva} onChange={(e) => setConfig({ ...config, iva: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label>Stock mínimo global</Label>
                  <Input type="number" value={config.stockMinimoGlobal} onChange={(e) => setConfig({ ...config, stockMinimoGlobal: Number(e.target.value) })} />
                </div>
                <div className="sm:col-span-2"><Button type="submit">Guardar</Button></div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Técnicos y operarios</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="p-2 text-left">Nombre</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Rol</th></tr></thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id} className="border-b"><td className="p-2">{u.nombre}</td><td className="p-2">{u.email}</td><td className="p-2 capitalize">{u.rol}</td></tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Categorías y marcas</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Nueva categoría o marca" value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)} />
                <Button type="button" onClick={() => addCategoria('categoria')}>+ Categoría</Button>
                <Button type="button" variant="outline" onClick={() => addCategoria('marca')}>+ Marca</Button>
              </div>
              <ul className="text-sm space-y-1">
                {categorias.map((c) => <li key={c.id}>{c.tipo}: {c.nombre}</li>)}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="migracion" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Importar desde IndexedDB (proyecto HTML anterior)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Si tenés datos en el navegador del sitio anterior (aceiteraDB), podés importarlos una vez al mock store.
              </p>
              <Button type="button" onClick={migrate} disabled={migrating}>
                {migrating ? 'Importando…' : 'Importar datos legacy'}
              </Button>
              {migrationError && <p className="text-sm text-red-400">{migrationError}</p>}
              {migrationResult && (
                <p className="text-sm">
                  {migrationResult.skipped
                    ? 'No se encontraron datos legacy en este navegador.'
                    : `Importados: ${migrationResult.productos} productos, ${migrationResult.clientes} clientes, ${migrationResult.vehiculos} vehículos.`}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
