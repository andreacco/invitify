'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ResumenTab from './ResumenTab';
import InvitadosTab from './InvitadosTab';
import ConfigTab from './ConfigTab';
import { signOut } from 'next-auth/react';

export default function EventoDashboardPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('resumen');
  const [evento, setEvento] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar la información del evento desde la API
  useEffect(() => {
    async function fetchEventoData() {
      try {
        const res = await fetch(`/api/event/${id}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'No se pudo cargar el evento.');
        
        setEvento(data.evento);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchEventoData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        ⚠️ {error || 'Evento no encontrado.'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10 relative overflow-hidden">
      {/* Luz ambiental de fondo */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER DEL EVENTO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-purple-600/10 text-purple-400 border border-purple-500/20 rounded-full text-[10px] font-bold tracking-wider uppercase">
                {evento.tipo}
              </span>
              <span className="text-xs text-zinc-500">ID: {evento.slug}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-100">{evento.titulo}</h1>
            <Link
              href={`/dashboard/eventos/${id}/invitacion`}
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-600/10 w-fit"
            >
              🎨 Diseñar invitación
            </Link>
          </div>
          
          {/* Menú de Pestañas (Tabs Nav) */}
          <div className="flex bg-zinc-900/60 backdrop-blur-md p-1 border border-zinc-800 rounded-xl self-start md:self-auto">
            {[
              { id: 'resumen', label: '📊 Resumen' },
              { id: 'invitados', label: '👥 Invitados' },
              { id: 'config', label: '⚙️ Configuración' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === tab.id ? 'bg-purple-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* 🚪 BOTÓN DE CERRAR SESIÓN PREMIUM */}
          <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-3 py-2 bg-zinc-900 hover:bg-rose-950/30 border border-zinc-800 hover:border-rose-900/50 text-zinc-400 hover:text-rose-400 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              title="Cerrar Sesión"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>

        {/* CONTENIDO DE LAS PESTAÑAS */}
        <div className="animate-in fade-in duration-200">
          {activeTab === 'resumen' && <ResumenTab evento={evento} />}
          {activeTab === 'invitados' && <InvitadosTab eventoId={evento.id} />}
          {activeTab === 'config' && <ConfigTab evento={evento} setEvento={setEvento} />}
        </div>

      </div>
    </div>
  );
}