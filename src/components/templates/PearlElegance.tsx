'use client';

import React from 'react';
import { InvitationTemplateState } from '@/types/invitation';

interface PearlEleganceProps {
  evento: any;
  invitado: any;
  onOpenRsvp: () => void;
}

export default function PearlElegance({ evento, invitado, onOpenRsvp }: PearlEleganceProps) {
  const template: InvitationTemplateState = evento.template;
  const { bloques } = template;
  const accentColor = evento.colorPrincipal || '#d4af37'; 

  // Variables de control de visibilidad basadas en los Toggles
  const isHeaderEnabled = bloques.header?.enabled !== false;
  const isDressCodeEnabled = bloques.dressCode?.enabled !== false;
  const isItineraryEnabled = bloques.itinerary?.enabled !== false;
  
  // Garantiza que extraigamos el array correctamente, sea del formato nuevo o viejo de BD
  const itineraryItems = Array.isArray(bloques.itinerary) ? bloques.itinerary : (bloques.itinerary?.items || []);

  return (
    <div className="min-h-full bg-[#fdfdfc] text-zinc-800 font-sans p-8 flex flex-col items-center text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }} />

      <div className="relative z-10 w-full max-w-sm mx-auto space-y-12 py-10">
        
        {/* CABECERA CONDICIONAL */}
        {isHeaderEnabled && (
          <div className="space-y-6">
            <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-400">Nuestra Boda</span>
            <h1 className="text-4xl font-serif text-zinc-800 leading-tight">{bloques.header.coupleNames}</h1>
            <p className="text-sm text-zinc-500 italic">{bloques.header.welcomeText}</p>
          </div>
        )}

        {/* CÓDIGO DE VESTIMENTA CONDICIONAL */}
        {isDressCodeEnabled && (
          <div className="space-y-4 pt-8 border-t border-zinc-200">
            <h2 className="text-xl font-serif text-zinc-800">Código de Vestimenta</h2>
            <div className="w-8 h-px mx-auto" style={{ backgroundColor: accentColor }} />
            <p className="font-bold text-sm uppercase tracking-widest text-zinc-700">{bloques.dressCode.style}</p>
            <p className="text-xs text-zinc-500">{bloques.dressCode.description}</p>
          </div>
        )}

        {/* ITINERARIO CONDICIONAL */}
        {isItineraryEnabled && itineraryItems.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-zinc-200">
            <h2 className="text-xl font-serif text-zinc-800">Itinerario</h2>
            <div className="w-8 h-px mx-auto" style={{ backgroundColor: accentColor }} />
            <div className="space-y-4 mt-6">
              {itineraryItems.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-end border-b border-zinc-200/50 pb-2">
                  <span className="text-sm font-serif text-zinc-800">{item.actividad}</span>
                  <span className="text-xs font-bold tracking-widest" style={{ color: accentColor }}>{item.hora}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTÓN RSVP (Siempre visible, es el núcleo de la app) */}
        <div className="pt-12 pb-20">
          <button onClick={onOpenRsvp} className="px-8 py-3 bg-zinc-900 text-white text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-xl">
            Confirmar Asistencia
          </button>
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-8">
            Invitación exclusiva para: <br/>
            <span className="font-bold text-zinc-600 text-xs mt-1 block">{invitado?.nombreFamilia || 'Invitado Especial'}</span>
          </p>
        </div>

      </div>
    </div>
  );
}