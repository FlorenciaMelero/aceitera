import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminHeader } from '@/components/admin/header';
import { AdminInactivityWatcher } from '@/components/admin/inactivity-watcher';
import { getSessionFromCookie, COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = await getSessionFromCookie(cookieStore.get(COOKIE_NAME)?.value);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader title="MP Lubricentro" userName={session?.nombre} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      {session && <AdminInactivityWatcher />}
    </div>
  );
}
