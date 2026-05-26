'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Copy, QrCode, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ClienteQrModalProps {
  clienteId: string;
  clienteNombre: string;
  onClose: () => void;
}

export function ClienteQrModal({ clienteId, clienteNombre, onClose }: ClienteQrModalProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function generate(regenerate = false) {
    setLoading(true);
    try {
      const res = await fetch('/api/clientes/portal-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId, regenerate }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUrl(data.url);
      if (regenerate) toast.success('Link regenerado — el anterior ya no funciona');
    } catch {
      toast.error('No se pudo generar el QR');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  function copyLink() {
    if (!url) return;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado');
  }

  const qrSrc = url ? `/api/portal/qr?data=${encodeURIComponent(url)}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-orange-500" />
              Portal del cliente
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{clienteNombre}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Generando QR...</p>
          ) : url ? (
            <>
              <div className="flex justify-center rounded-xl border bg-white p-4">
                {qrSrc && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrSrc} alt={`QR portal ${clienteNombre}`} width={280} height={280} />
                )}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                El cliente escanea el QR y ve sus vehículos. Puede agregar acceso directo en su celular.
              </p>
              <div className="flex gap-2">
                <InputReadonly value={url} />
                <Button variant="outline" size="icon" onClick={copyLink} title="Copiar link">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => generate(true)}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerar link (invalida el anterior)
              </Button>
            </>
          ) : (
            <p className="py-4 text-center text-sm text-red-400">Error al generar. Intentá de nuevo.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InputReadonly({ value }: { value: string }) {
  return (
    <input
      readOnly
      value={value}
      className="flex h-9 w-full min-w-0 rounded-md border border-input bg-muted/50 px-3 text-xs text-muted-foreground"
    />
  );
}
