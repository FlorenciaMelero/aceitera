'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function GlobalSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{
    clientes: { id: string; nombre: string }[];
    productos: { id: string; nombre: string }[];
    ordenes: { id: string; numero: number }[];
  } | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (q.length < 2) {
      setResults(null);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/dashboard?type=search&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
      setOpen(true);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="relative hidden md:block">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Buscar..."
        className="w-56 pl-9"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        onFocus={() => q.length >= 2 && setOpen(true)}
      />
      {open && results && (
        <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border bg-popover p-2 shadow-lg">
          {results.clientes.map((c) => (
            <button
              key={c.id}
              className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
              onMouseDown={() => router.push('/admin/clientes')}
            >
              Cliente: {c.nombre}
            </button>
          ))}
          {results.productos.map((p) => (
            <button
              key={p.id}
              className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
              onMouseDown={() => router.push('/admin/productos')}
            >
              Producto: {p.nombre}
            </button>
          ))}
          {results.ordenes.map((o) => (
            <button
              key={o.id}
              className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
              onMouseDown={() => router.push('/admin/ordenes')}
            >
              OT #{o.numero}
            </button>
          ))}
          {!results.clientes.length && !results.productos.length && !results.ordenes.length && (
            <p className="px-2 py-1 text-sm text-muted-foreground">Sin resultados</p>
          )}
        </div>
      )}
    </div>
  );
}
