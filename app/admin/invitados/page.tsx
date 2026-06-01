'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AdminInvitadosRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  useEffect(() => {
    if (eventId) {
      router.replace(`/dashboard/eventos/${eventId}`);
      return;
    }
    router.replace('/dashboard');
  }, [eventId, router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-xs text-zinc-500 animate-pulse">Redirigiendo...</p>
    </div>
  );
}

export default function AdminInvitadosPage() {
  return (
    <Suspense fallback={null}>
      <AdminInvitadosRedirect />
    </Suspense>
  );
}
