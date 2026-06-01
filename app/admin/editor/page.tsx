'use client';

import { useState } from 'react';
import { DEFAULT_TEMPLATE } from '@/constants/defaultTemplate';
import { InvitationTemplateState } from '@/types/invitation';
import Link from 'next/link';

// Componentes que crearemos a continuación
import PanelEdicion from '@/components/editor/PanelEdicion';
import SimuladorMovil from '@/components/editor/SimuladorMovil';

export default function EditorPage() {
  // Estado único y centralizado que maneja TODA la invitación en tiempo real
  const [template, setTemplate] = useState<InvitationTemplateState>(DEFAULT_TEMPLATE);
  const [isSaving, setIsSaving] = useState(false);

  // ID de prueba de tu evento (mañana lo jalaremos de la sesión o la URL)
  const eventId = "boda-andrea-jose-2026"; 

  // Función para guardar los cambios en la base de datos a través de la API
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

      if (!response.ok) throw new Error('Error al salvar');
      
      alert('¡Diseño guardado con éxito en Supabase! 🎉');
    } catch (error) {
      console.error(error);
      alert('Hubo un problema al guardar el diseño.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Barra de Herramientas Superior al estilo Saventify */}
      <header className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
  <div className="flex items-center gap-6">
    <h1 className="font-semibold text-lg tracking-wide text-zinc-200">
      Invitify Admin
    </h1>
    {/* SELECTOR DE PESTAÑAS DE ALTO NIVEL */}
    <nav className="flex items-center gap-1 bg-zinc-950 p-1 border border-zinc-800 rounded-lg text-xs">
      <span className="px-3 py-1.5 rounded-md bg-purple-600/10 text-purple-400 border border-purple-500/20 font-medium">
        🎨 Modo Editor
      </span>
      <Link 
        href="/admin/invitados" 
        className="px-3 py-1.5 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        👥 Invitados & RSVP
      </Link>
    </nav>
  </div>
  
  <div className="flex items-center gap-3">
    <button 
      onClick={handleGuardarDiseno}
      disabled={isSaving}
      className="px-5 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white transition-all shadow-lg shadow-purple-600/10 disabled:opacity-50 flex items-center gap-2"
    >
      {isSaving ? 'Guardando...' : 'Guardar Cambios'}
    </button>
  </div>
</header>

      {/* Espacio de Trabajo Principal Dividido */}
      <main className="flex-1 flex overflow-hidden h-[calc(screen-16)]">
        
        {/* Mitad Izquierda: El Panel de Configuración (Scrollable) */}
        <section className="w-full md:w-[450px] border-r border-zinc-800 bg-zinc-900 overflow-y-auto flex flex-col">
          <PanelEdicion template={template} setTemplate={setTemplate} />
        </section>

        {/* Mitad Derecha: El Simulador de Smartphone (Centrado en pantalla) */}
        <section className="flex-1 bg-zinc-950 flex items-center justify-center p-8 overflow-y-auto pattern-grid">
          <SimuladorMovil template={template} />
        </section>

      </main>
    </div>
  );
}