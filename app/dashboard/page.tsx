'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function DashboardGlobalPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'eventos' | 'editor'>('eventos');

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await fetch('/api/event/list'); // API que devuelve los eventos donde participa el usuario
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
      {/* Luces de fondo estilo Invitify */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* HEADER PRINCIPAL */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">
              ¡Hola, {session?.user?.name || 'Creador'}! 👋
            </h1>
            <p className="text-xs text-zinc-400 mt-1">Gestiona tus celebraciones y diseña pases digitales.</p>
          </div>

          {/* BOTÓN SUPERIOR DE CREACIÓN (Siempre visible si ya tiene eventos) */}
          {eventos.length > 0 && (
            <Link
              href="/dashboard/nuevo-evento"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 self-start sm:self-auto"
            >
              <span>➕</span> Nuevo Evento
            </Link>
          )}
        </div>

        {/* MENÚ DE PESTAÑAS (Eventos vs Editor de Invitaciones General) */}
        <div className="flex border-b border-zinc-800/60 max-w-xs">
          <button
            onClick={() => setActiveTab('eventos')}
            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
              activeTab === 'eventos'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            🎉 Mis Eventos
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
              activeTab === 'editor'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            🎨 Editor de Plantillas
          </button>
        </div>

        {/* CONTENIDO DINÁMICO DE PESTAÑAS */}
        {loading ? (
          <div className="py-20 text-center text-xs text-zinc-500 animate-pulse">Sincronizando panel de control...</div>
        ) : (
          <>
            {/* PESTAÑA 1: MIS EVENTOS */}
            {activeTab === 'eventos' && (
              <>
                {eventos.length === 0 ? (
                  /* 💻 EMPTY STATE PREMIUM */
                  <div className="border border-zinc-800/80 bg-zinc-900/20 rounded-2xl p-10 text-center space-y-6 max-w-xl mx-auto my-10 backdrop-blur-sm">
                    <div className="w-14 h-14 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center text-xl mx-auto">
                      ✨
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-bold text-zinc-200 tracking-wide uppercase">Comienza tu aventura</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                        Aún no tienes eventos activos ni invitaciones como colaborador. ¡Diseña tu primera experiencia digital ahora mismo!
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
                  /* 📇 LISTADO DE EVENTOS EXISTENTES */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventos.map((evt) => (
                      <div 
                        key={evt.id}
                        onClick={() => router.push(`/dashboard/eventos/${evt.id}`)}
                        className="bg-zinc-900/40 border border-zinc-800/80 hover:border-purple-500/40 rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-xl group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 bg-purple-600/10 px-2 py-0.5 rounded-full border border-purple-500/10">
                              {evt.tipo}
                            </span>
                            <h3 className="text-sm font-bold text-zinc-100 group-hover:text-purple-400 transition-colors mt-2">{evt.titulo}</h3>
                          </div>
                          <span className="text-xs font-mono text-zinc-500">{new Date(evt.fecha).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400">
                          <span>📍 {evt.ubicacionRecepcion}</span>
                          <span className="font-semibold text-purple-400 group-hover:underline">Administrar →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* PESTAÑA 2: EDITOR DE INVITACIONES GENERAL PARA EL USUARIO */}
            {activeTab === 'editor' && (
              <div className="border border-zinc-800/80 bg-zinc-900/10 rounded-2xl p-8 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-200">Estudio Creativo de Sobres</h3>
                    <p className="text-[11px] text-zinc-400">Personaliza fuentes, músicas y colores globales de tus plantillas de Invitify.</p>
                  </div>
                </div>
                
                {/* Contenedor temporal del Mock del Editor */}
                <div className="h-64 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center bg-zinc-950/40 text-center p-4">
                  <span className="text-2xl mb-2">🎨</span>
                  <p className="text-xs text-zinc-400 font-medium">Próximamente: Canvas Interactivo de Diseño</p>
                  <p className="text-[10px] text-zinc-500 max-w-xs mt-1">Aquí los novios y organizadores configurarán el look & feel interactivo de las invitaciones antes de asignarlas.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}