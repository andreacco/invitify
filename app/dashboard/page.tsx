'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type DashboardEvento = {
  id: string;
  titulo: string;
  tipo: string;
  fecha: string;
  ubicacionRecepcion: string;
  esOwner?: boolean;
  esColaborador?: boolean;
  rolEnEvento?: string;
  _count?: { invitados: number };
};

export default function DashboardGlobalPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [eventos, setEventos] = useState<DashboardEvento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await fetch('/api/event/list');
        if (res.ok) {
          const data = await res.json();
          setEventos(data.eventos || []);
        }
      } catch (error) {
        console.error('Error listando eventos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">
              ¡Hola, {session?.user?.name || 'Creador'}! 👋
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Gestiona tus celebraciones y diseña invitaciones digitales.
            </p>
          </div>

          {eventos.length > 0 && (
            <Link
              href="/dashboard/nuevo-evento"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 self-start sm:self-auto"
            >
              <span>➕</span> Nuevo Evento
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-zinc-500 animate-pulse">
            Sincronizando panel de control...
          </div>
        ) : eventos.length === 0 ? (
          <div className="border border-zinc-800/80 bg-zinc-900/20 rounded-2xl p-10 text-center space-y-6 max-w-xl mx-auto my-10 backdrop-blur-sm">
            <div className="w-14 h-14 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center text-xl mx-auto">
              ✨
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-zinc-200 tracking-wide uppercase">
                Comienza tu aventura
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                Aún no tienes eventos activos. Crea tu primera experiencia digital.
              </p>
            </div>
            <Link
              href="/dashboard/nuevo-evento"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-600/10"
            >
              🚀 Crear mi primer evento
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventos.map((evt) => (
              <article
                key={evt.id}
                className="bg-zinc-900/40 border border-zinc-800/80 hover:border-purple-500/40 rounded-2xl p-5 transition-all flex flex-col justify-between space-y-4 hover:shadow-xl group"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/dashboard/eventos/${evt.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      router.push(`/dashboard/eventos/${evt.id}`);
                    }
                  }}
                  className="space-y-3 cursor-pointer"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 bg-purple-600/10 px-2 py-0.5 rounded-full border border-purple-500/10">
                          {evt.tipo}
                        </span>
                        {evt.esColaborador && evt.rolEnEvento && (
                          <span className="text-[10px] text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded-full">
                            {evt.rolEnEvento}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-zinc-100 group-hover:text-purple-400 transition-colors mt-2">
                        {evt.titulo}
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-zinc-500 shrink-0">
                      {new Date(evt.fecha).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 truncate">📍 {evt.ubicacionRecepcion}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/60">
                  <Link
                    href={`/dashboard/eventos/${evt.id}/invitacion`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold bg-purple-600/15 text-purple-300 border border-purple-500/25 hover:bg-purple-600/25 hover:text-purple-200 transition-all"
                  >
                    🎨 Diseñar invitación
                  </Link>
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/eventos/${evt.id}`)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-all ml-auto"
                  >
                    Administrar →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
