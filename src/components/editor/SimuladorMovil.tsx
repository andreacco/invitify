'use client';

import { useState, useEffect } from 'react';
import { InvitationTemplateState } from '@/types/invitation';

interface Props {
  template: InvitationTemplateState;
}

export default function SimuladorMovil({ template }: Props) {
  const { estilos, bloques } = template;
  const [isOpen, setIsOpen] = useState(false);

  // Mapeo de IDs a clases reales de fondo de Tailwind según lo que se elija en el panel
  const colorMap: Record<string, string> = {
    Onyx: 'bg-zinc-900 text-zinc-400',
    Petroleum: 'bg-slate-800 text-slate-300',
    Lavender: 'bg-purple-950/90 text-purple-200',
    Burgundy: 'bg-rose-950 text-rose-200',
  };

  const currentEnvelopeColor = colorMap[estilos.envelope.color] || 'bg-zinc-900';

  // Si cambias parámetros en el panel, cerramos el sobre temporalmente para que veas los cambios estéticos externos
  useEffect(() => {
    setIsOpen(false);
  }, [estilos.envelope.color, estilos.envelope.waxSeal]);

  return (
    <div className="relative mx-auto w-[360px] h-[740px] bg-zinc-900 rounded-[48px] shadow-[0_0_0_12px_#27272a] shadow-2xl overflow-hidden border border-zinc-700/50 flex flex-col select-none">
      {/* Notch / Isla Dinámica */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-4 bg-zinc-950 rounded-full z-50" />

      {/* REVESTIMIENTO INTERACTIVO: EL SOBRE DIGITAL */}
      {!isOpen && (
        <div 
          onClick={() => setIsOpen(true)}
          className={`absolute inset-0 z-40 ${currentEnvelopeColor} flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-700 ease-in-out`}
        >
          {/* Sombra interna para dar profundidad de papel */}
          <div className="absolute inset-0 border-[16px] border-black/10 pointer-events-none" />
          
          <div className="text-center space-y-6 z-10">
            <span className="text-[10px] tracking-widest uppercase opacity-60 block">Haga clic para abrir el sobre</span>
            
            {/* Renderizado dinámico del Sello de Cera usando Tailwind puro para el relieve */}
            <div className="w-20 h-20 rounded-full bg-amber-700/90 border border-amber-600 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.2)] mx-auto flex items-center justify-center transition-transform hover:scale-105 active:scale-95 duration-200">
              <div className="w-16 h-16 rounded-full border border-dashed border-amber-500/40 flex items-center justify-center text-amber-100 font-serif text-xs text-center p-1 font-bold">
                {estilos.envelope.waxSeal === 'Lotus' && '🪷'}
                {estilos.envelope.waxSeal === 'Monogram' && 'A & J'}
                {estilos.envelope.waxSeal === 'Eucalyptus' && '🌿'}
              </div>
            </div>

            <div className="font-serif italic text-lg text-amber-100/90">
              Familia Paternina Osorio
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO INTERIOR DE LA INVITACIÓN (Aparece al abrir el sobre) */}
      <div className="flex-1 overflow-y-auto bg-white text-zinc-900 scrollbar-none flex flex-col">
        
        {/* Botón flotante para volver a cerrar el sobre si se quiere seguir editando */}
        {isOpen && (
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-8 right-6 z-30 bg-black/40 backdrop-blur-md text-white hover:bg-black/60 text-xs py-1.5 px-3 rounded-full font-medium transition-all"
          >
            ↩ Ver Sobre
          </button>
        )}

        {/* SECCIÓN 1: HEADER / PORTADA */}
        <div 
  className="relative min-h-[400px] bg-zinc-800 flex flex-col justify-end p-6 text-center bg-cover bg-center transition-all duration-500 ease-in-out"
  style={{ 
    backgroundImage: bloques.header.coverPhoto && bloques.header.coverPhoto !== '/vercel.svg'
      ? `url(${bloques.header.coverPhoto})` 
      : 'none' 
  }}
>
  {/* Si no hay foto de portada, mostramos un patrón decorativo sutil */}
  {!bloques.header.coverPhoto && (
    <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 to-zinc-900/40 opacity-50 flex items-center justify-center">
      <span className="text-zinc-700 text-xs font-light">Sin fotografía de portada</span>
    </div>
  )}

  {/* Gradiente oscuro inferior para garantizar que los nombres blancos siempre sean legibles */}
  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/40 to-transparent z-10" />
  
  <div className="relative z-20 text-white flex flex-col gap-2 mb-4">
    <h2 className="text-4xl font-serif tracking-wide text-amber-100">
      {bloques.header.coupleNames}
    </h2>
    <p className="text-xs opacity-80 italic max-w-[280px] mx-auto font-light">
      {bloques.header.welcomeText}
    </p>
  </div>
</div>

        {/* SECCIÓN 2: DRESS CODE */}
        <div className="p-8 bg-zinc-50 border-b border-zinc-100 text-center flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-600">Código de Vestimenta</span>
          <h3 className="text-lg font-semibold text-zinc-800">{bloques.dressCode.style}</h3>
          <p className="text-sm text-zinc-500 leading-relaxed font-light">{bloques.dressCode.description}</p>
        </div>

        {/* SECCIÓN 3: CUENTA REGRESIVA */}
        {bloques.countdown.enabled && (
          <div className="p-6 bg-zinc-900 text-white text-center flex flex-col gap-3">
            <p className="text-xs tracking-wider uppercase opacity-60">{bloques.countdown.message}</p>
            <div className="flex justify-center gap-4 text-center">
              <div className="bg-zinc-800 p-2 rounded-lg min-w-[50px]"><span className="text-xl font-bold block">00</span><span className="text-[10px] opacity-50">Días</span></div>
              <div className="bg-zinc-800 p-2 rounded-lg min-w-[50px]"><span className="text-xl font-bold block">00</span><span className="text-[10px] opacity-50">Horas</span></div>
              <div className="bg-zinc-800 p-2 rounded-lg min-w-[50px]"><span className="text-xl font-bold block">00</span><span className="text-[10px] opacity-50">Min</span></div>
            </div>
          </div>
        )}

        {/* SECCIÓN 4: ITINERARIO */}
        <div className="p-8 flex flex-col gap-6">
          <h4 className="text-center text-sm font-bold uppercase tracking-widest text-zinc-400">Itinerario del Evento</h4>
          <div className="flex flex-col gap-4 border-l-2 border-zinc-200 pl-4 ml-2">
            {bloques.itinerary.map((item, i) => (
              <div key={i} className="relative flex flex-col gap-1">
                <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-600 ring-4 ring-white" />
                <span className="text-xs font-bold text-purple-600">{item.hora}</span>
                <span className="text-sm font-medium text-zinc-700">{item.actividad}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}