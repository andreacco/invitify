'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { syncAuthSession } from '@/lib/auth/client';

/**
 * Capa cliente: redirige si no hay sesión.
 * La verificación de correo la resuelve el layout servidor (DB) + proxy.ts.
 */
export default function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      const loginUrl = `/auth/login?callbackUrl=${encodeURIComponent(pathname || '/dashboard')}`;
      router.replace(loginUrl);
      return;
    }

    if (status === 'authenticated' && !syncedRef.current) {
      syncedRef.current = true;
      void syncAuthSession(update);
    }
  }, [status, router, pathname, update]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-500">Validando acceso...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-xs text-zinc-500">Redirigiendo...</p>
      </div>
    );
  }

  return <>{children}</>;
}
