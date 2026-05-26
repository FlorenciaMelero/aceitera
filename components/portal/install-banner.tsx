'use client';

import { useEffect, useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { savePortalToken } from '@/lib/portal-storage';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    const dismissed = localStorage.getItem('portal-install-dismissed');
    if (dismissed) return;
    setVisible(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    localStorage.setItem('portal-install-dismissed', '1');
    setVisible(false);
  }

  async function installAndroid() {
    if (!deferredPrompt) return;
    // Guardar token del URL actual para que /portal funcione al abrir el acceso directo
    const match = window.location.pathname.match(/^\/portal\/([^/]+)/);
    if (match?.[1]) savePortalToken(match[1]);
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }

  if (!visible || isStandalone()) return null;

  return (
    <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/20">
            <Smartphone className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Agregá acceso directo</p>
            <p className="mt-1 text-sm text-zinc-400">
              Instalá la app en tu celular para ver tus vehículos con un toque.
            </p>
          </div>
        </div>
        <button type="button" onClick={dismiss} className="text-zinc-500 hover:text-zinc-300" aria-label="Cerrar">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {deferredPrompt && (
          <Button size="sm" onClick={installAndroid} className="bg-orange-500 hover:bg-orange-600">
            <Download className="mr-2 h-4 w-4" />
            Instalar app
          </Button>
        )}
        {isIOS() && (
          <Button size="sm" variant="outline" onClick={() => setShowIOSHelp(!showIOSHelp)} className="border-zinc-700">
            <Share className="mr-2 h-4 w-4" />
            Cómo en iPhone
          </Button>
        )}
        {!deferredPrompt && !isIOS() && (
          <p className="text-sm text-zinc-400">
            Tocá el menú del navegador → <strong className="text-zinc-200">Agregar a pantalla de inicio</strong>
          </p>
        )}
      </div>

      {showIOSHelp && (
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-zinc-400">
          <li>Tocá el botón <strong className="text-zinc-200">Compartir</strong> (cuadrado con flecha)</li>
          <li>Elegí <strong className="text-zinc-200">Agregar a inicio</strong></li>
          <li>Confirmá con <strong className="text-zinc-200">Agregar</strong></li>
        </ol>
      )}
    </div>
  );
}
