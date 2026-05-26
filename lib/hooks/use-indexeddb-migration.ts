'use client';

import { useCallback, useState } from 'react';

type LegacyRecord = Record<string, unknown>;

interface MigrationResult {
  productos: number;
  clientes: number;
  vehiculos: number;
  skipped: boolean;
}

function openLegacyDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('aceiteraDB');
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
  });
}

function readStore<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains(storeName)) {
      resolve([]);
      return;
    }
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result as T[]);
  });
}

/** One-time import from legacy IndexedDB (aceiteraDB) into mock API. */
export function useIndexedDbMigration() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const migrate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (typeof indexedDB === 'undefined') {
        setResult({ productos: 0, clientes: 0, vehiculos: 0, skipped: true });
        return;
      }

      const db = await openLegacyDb();
      const [parts, vehicles] = await Promise.all([
        readStore<LegacyRecord>(db, 'parts'),
        readStore<LegacyRecord>(db, 'vehicles'),
      ]);
      db.close();

      if (!parts.length && !vehicles.length) {
        setResult({ productos: 0, clientes: 0, vehiculos: 0, skipped: true });
        return;
      }

      let productos = 0;
      for (const part of parts) {
        const res = await fetch('/api/productos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: String(part.name || part.nombre || 'Repuesto'),
            categoria: 'repuestos',
            unidad: 'unidades',
            precioCosto: Number(part.cost || part.precioCosto || 0),
            precioVenta: Number(part.price || part.precioVenta || 0),
            stock: Number(part.stock || 0),
            stockMinimo: Number(part.minStock || part.stockMinimo || 5),
            descripcion: String(part.description || part.descripcion || ''),
            activo: true,
          }),
        });
        if (res.ok) productos++;
      }

      let clientes = 0;
      let vehiculos = 0;
      for (const v of vehicles) {
        const clienteRes = await fetch('/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: String(v.owner || v.cliente || 'Cliente importado'),
            telefono: String(v.phone || ''),
          }),
        });
        if (!clienteRes.ok) continue;
        const cliente = await clienteRes.json();
        clientes++;

        const vehRes = await fetch('/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entity: 'vehiculo',
            clienteId: cliente.id,
            patente: String(v.plate || v.patente || 'SIN-PAT'),
            marca: String(v.brand || v.marca || ''),
            modelo: String(v.model || v.modelo || ''),
            kmActual: Number(v.km || v.kmActual || 0),
          }),
        });
        if (vehRes.ok) vehiculos++;
      }

      setResult({ productos, clientes, vehiculos, skipped: false });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de migración');
    } finally {
      setLoading(false);
    }
  }, []);

  return { migrate, loading, result, error };
}
