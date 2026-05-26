'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Users,
  Car,
  ClipboardList,
  Wrench,
  Truck,
  Wallet,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/stock', label: 'Stock', icon: Warehouse },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/vehiculos', label: 'Vehículos', icon: Car },
  { href: '/admin/ordenes', label: 'Órdenes', icon: ClipboardList },
  { href: '/admin/servicios', label: 'Plantillas PM', icon: Wrench },
  { href: '/admin/proveedores', label: 'Proveedores', icon: Truck },
  { href: '/admin/caja', label: 'Caja', icon: Wallet },
  { href: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center gap-3 border-b border-border p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand font-black text-black">
          MP
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold leading-tight">MP Lubricentro</p>
            <p className="text-xs text-muted-foreground">Panel admin</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-brand text-black'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
            title={label}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
