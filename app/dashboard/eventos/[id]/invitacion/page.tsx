'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DEFAULT_TEMPLATE } from '@/constants/defaultTemplate';
import { InvitationTemplateState } from '@/types/invitation';
import PanelEdicion from '@/components/editor/PanelEdicion';
import SimuladorMovil from '@/components/editor/SimuladorMovil';

export default function InvitacionEditorPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [template, setTemplate] = useState<InvitationTemplateState>(DEFAULT_TEMPLATE);
  const [isLoading, setIsLoading] = useState(true);
  const [eventTitle, setEventTitle] = useState<string | null>(null);
  
  // Estados para el Autoguardado
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const isFirstLoad = useRef(true);

  // 1. CARGA INICIAL
  useEffect(() => {
    if (!eventId) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const [eventRes, templateRes] = await Promise.all([
          fetch(`/api/event/${eventId}`),
          fetch(`/api/event/template?eventId=${encodeURIComponent(eventId)}`),
        ]);

        if (eventRes.ok) {
          const eventData = await eventRes.json();
          setEventTitle(eventData.evento?.titulo ?? null);
        }

        if (templateRes.ok) {
          const { template: saved } = await templateRes.json();
          if (saved?.estilos && saved?.bloques) {
            
            // 🛡️ Migración al vuelo: Si el itinerario viejo era un Array, lo convertimos a Objeto
            if (Array.isArray(saved.bloques.itinerary)) {
              saved.bloques.itinerary = { enabled: true, items: saved.bloques.itinerary };
            }

            setTemplate({ estilos: saved.estilos, bloques: saved.bloques });
          }
        }
      } catch (error) {
        console.error('Error cargando editor:', error);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [eventId]);

  // 2. MAGIA DEL AUTOGUARDADO (Debounce de 1.5 segundos)
  useEffect(() => {
    // Evitamos guardar en el montaje inicial
    if (isFirstLoad.current) {
      if (!isLoading) isFirstLoad.current = false;
      return;
    }

    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/event/template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, estilos: template.estilos, bloques: template.bloques }),
        });
        if (!response.ok) throw new Error('Error al autoguardar');
        setSaveStatus('saved');
      } catch (error) {
        console.error(error);
        setSaveStatus('error');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [template, eventId, isLoading]);

  if (isLoading) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-500">Cargando estudio creativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      <header className="h-16 shrink-0 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-4 min-w-0">
          <Link href={`/dashboard/eventos/${eventId}`} className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors shrink-0">
            ← Volver al evento
          </Link>
          <div className="h-4 w-px bg-zinc-800 shrink-0" />
          <div className="min-w-0">
            <h1 className="font-semibold text-sm tracking-wide text-zinc-200 truncate">Editor de Invitación</h1>
            {eventTitle && <p className="text-[10px] text-zinc-500 truncate">{eventTitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Indicador de Autoguardado */}
          <div className="text-[11px] font-medium hidden sm:flex items-center gap-1.5">
            {saveStatus === 'saving' && <span className="text-amber-400 animate-pulse">⏳ Guardando cambios...</span>}
            {saveStatus === 'saved' && <span className="text-emerald-400">✨ Guardado automático</span>}
            {saveStatus === 'error' && <span className="text-rose-400">⚠️ Error al guardar</span>}
          </div>
          <Link href={`/dashboard/eventos/${eventId}`} className="hidden sm:inline-flex px-3 py-2 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 transition-all">
            👥 Invitados
          </Link>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        <section className="w-full md:w-[450px] h-full border-r border-zinc-800 bg-zinc-900 flex flex-col shrink-0 z-20 overflow-hidden">
          <PanelEdicion template={template} setTemplate={setTemplate} />
        </section>

        <section className="hidden md:flex flex-1 h-full bg-zinc-950 items-center justify-center overflow-hidden relative z-10 p-4">
          <div className="transform scale-[0.80] xl:scale-100 origin-center transition-transform duration-300">
            <SimuladorMovil template={template} />
          </div>
        </section>
      </main>
    </div>
  );
}