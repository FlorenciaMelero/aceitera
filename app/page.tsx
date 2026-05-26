import Link from 'next/link';
import { Wrench, Phone, MapPin, Droplets, Settings } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-white">
      <header className="border-b border-orange-500/20 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 font-black text-black">
              MP
            </div>
            <div>
              <h1 className="text-xl font-bold">MP Lubricentro</h1>
              <p className="text-sm text-zinc-400">Córdoba, Argentina</p>
            </div>
          </div>
          <Link href="/admin/login" className="text-sm text-zinc-500 hover:text-orange-400">
            Acceso staff
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16">
        <section className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl">
            Tu lubricentro de confianza en Córdoba
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Cambio de aceite, filtros, mantenimiento y repuestos. Atención profesional para tu vehículo.
          </p>
        </section>

        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Droplets, title: 'Cambio de aceite', desc: 'Aceites sintéticos y minerales de primera calidad.' },
            { icon: Wrench, title: 'Mantenimiento', desc: 'Service completo, filtros, líquidos y diagnóstico.' },
            { icon: Settings, title: 'Repuestos', desc: 'Piezas y accesorios para todo tipo de vehículos.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <Icon className="mb-4 h-8 w-8 text-orange-500" />
              <h3 className="mb-2 text-lg font-bold">{title}</h3>
              <p className="text-sm text-zinc-400">{desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-orange-500/20 bg-zinc-900/80 p-8">
          <h3 className="mb-6 text-2xl font-bold">Contacto</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium">Dirección</p>
                <p className="text-zinc-400">Eduardo Sosa 2188, Barrio Santa Isabel 1ª Sección, Córdoba</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium">Teléfono</p>
                <a href="tel:+543512079348" className="text-orange-400 hover:underline">
                  351 207 9348
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
        MP Lubricentro — Gestión local para Córdoba, Argentina
      </footer>
    </div>
  );
}
