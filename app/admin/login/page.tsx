'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MODAL_TIMEOUT_MS = 10000;

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(MODAL_TIMEOUT_MS / 1000);
  const [started, setStarted] = useState(false);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const markStarted = () => {
    if (started) return;
    setStarted(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (started) return;

    intervalRef.current = setInterval(() => {
      setCountdown((s) => Math.max(0, s - 1));
    }, 1000);

    timerRef.current = setTimeout(() => {
      if (!started) setVisible(false);
    }, MODAL_TIMEOUT_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [started]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    markStarted();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Error al ingresar');
        return;
      }
      toast.success(`Bienvenido, ${data.user.nombre.split(' ')[0]}`);
      const from = searchParams.get('from') || '/admin/dashboard';
      router.push(from);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!visible) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4">
        <p className="text-muted-foreground">El acceso administrador se cerró automáticamente.</p>
        <div className="flex gap-3">
          <Button onClick={() => { setVisible(true); setCountdown(10); setStarted(false); }}>
            Acceso administrador
          </Button>
          <Link href="/">
            <Button variant="outline">Volver al sitio</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black/90 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="mb-2 rounded-lg bg-orange-500/10 px-3 py-2 text-center text-sm font-medium text-orange-400">
            {started
              ? 'Completá tus datos para ingresar como administrador'
              : `Se cierra automáticamente en ${countdown} s si no completás el acceso`}
          </p>
          <CardTitle>Acceso administrador</CardTitle>
          <CardDescription>Solo personal autorizado. Credenciales demo: admin@lubricentro.local / Admin123!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" onFocus={markStarted} onInput={markStarted}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lubricentro.local"
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar como admin'}
            </Button>
            <Link href="/" className="block text-center text-sm text-muted-foreground hover:text-brand">
              ← Volver al sitio público
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
