'use client';

import { useState, useEffect } from 'react';
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
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [eventTitle, setEventTitle] = useState<string | null>(null);

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
            setTemplate({
              estilos: saved.estilos,
              bloques: saved.bloques,
            });
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

  const handleGuardarDiseno = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/event/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          estilos: template.estilos,
          bloques: template.bloques,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar');
      }

      alert('¡Diseño guardado con éxito! 🎉');
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : 'Hubo un problema al guardar el diseño.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-500">Cargando estudio creativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href={`/dashboard/eventos/${eventId}`}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors shrink-0"
          >
            ← Volver al evento
          </Link>
          <div className="h-4 w-px bg-zinc-800 shrink-0" />
          <div className="min-w-0">
            <h1 className="font-semibold text-sm tracking-wide text-zinc-200 truncate">
              Editor de Invitación
            </h1>
            {eventTitle && (
              <p className="text-[10px] text-zinc-500 truncate">{eventTitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/dashboard/eventos/${eventId}`}
            className="hidden sm:inline-flex px-3 py-2 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 transition-all"
          >
            👥 Invitados
          </Link>
          <button
            type="button"
            onClick={() => void handleGuardarDiseno()}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-600/10 disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden min-h-0">
        <section className="w-full md:w-[450px] border-r border-zinc-800 bg-zinc-900 overflow-y-auto flex flex-col shrink-0">
          <PanelEdicion template={template} setTemplate={setTemplate} />
        </section>

        <section className="flex-1 bg-zinc-950 flex items-center justify-center p-8 overflow-y-auto">
          <SimuladorMovil template={template} />
        </section>
      </main>
    </div>
  );
}
