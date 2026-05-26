'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Moon, Sun, Home } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { GlobalSearch } from '@/components/admin/global-search';

interface AdminHeaderProps {
  title: string;
  userName?: string;
}

export function AdminHeader({ title, userName }: AdminHeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="flex items-center gap-3">
        <GlobalSearch />
        <Link href="/">
          <Button variant="ghost" size="icon" title="Sitio público">
            <Home className="h-4 w-4" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        {userName && <span className="hidden text-sm text-muted-foreground sm:inline">{userName}</span>}
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Salir
        </Button>
      </div>
    </header>
  );
}
