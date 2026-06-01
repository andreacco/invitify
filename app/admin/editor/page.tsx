'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AdminEditorRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  useEffect(() => {
    if (eventId) {
      router.replace(`/dashboard/eventos/${eventId}/invitacion`);
      return;
    }
    router.replace('/dashboard');
  }, [eventId, router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-xs text-zinc-500 animate-pulse">Redirigiendo al editor...</p>
    </div>
  );
}

export default function AdminEditorPage() {
  return (
    <Suspense fallback={null}>
      <AdminEditorRedirect />
    </Suspense>
  );
}
