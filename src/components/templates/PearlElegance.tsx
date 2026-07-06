'use client';

import React, { useState, useEffect } from 'react';
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

  const isHeaderEnabled = bloques.header?.enabled !== false;
  const isDressCodeEnabled = bloques.dressCode?.enabled !== false;
  const isItineraryEnabled = bloques.itinerary?.enabled !== false;
  const itineraryItems = Array.isArray(bloques.itinerary) ? bloques.itinerary : (bloques.itinerary?.items || []);

  // Estado para las partículas de escarcha mágica
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Colores solicitados: Morado, Dorado y Verde
    const colors = ['#a855f7', '#d4af37', '#10b981']; 
    
    // Generamos 45 brillitos sutiles para no recargar la pantalla
    const newParticles = Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 20 + 15}s`, // Caída muy suave y lenta (entre 15s y 35s)
      delay: `-${Math.random() * 30}s`, // Desfase para que ya estén en toda la pantalla al abrir
      size: `${Math.random() * 2 + 1.5}px`, // Tamaño muy sutil (1.5px a 3.5px)
      color: colors[Math.floor(Math.random() * colors.length)],
      twinkleDuration: `${Math.random() * 3 + 2}s`, // Velocidad del brillo
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="bg-[#fdfdfc] rounded-t-[40px] shadow-[0_-15px_40px_rgba(0,0,0,0.12)] text-zinc-800 font-sans p-8 flex flex-col items-center text-center relative overflow-hidden min-h-full">
      {/* TEXTURA BASE */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }} />

      {/* ✨ EFECTO ESCARCHA MAGICA ✨ */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <style>{`
          @keyframes fallDown {
            0% { top: -5%; opacity: 0; }
            10% { opacity: 0.65; }
            90% { opacity: 0.65; }
            100% { top: 105%; opacity: 0; }
          }
          @keyframes twinkle {
            0% { transform: scale(0.6); opacity: 0.2; }
            50% { transform: scale(1.3); opacity: 1; }
            100% { transform: scale(0.6); opacity: 0.2; }
          }
        `}</style>
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 5px ${p.color}`,
              animation: `fallDown ${p.duration} linear infinite ${p.delay}, twinkle ${p.twinkleDuration} ease-in-out infinite ${p.delay}`
            }}
          />
        ))}
      </div>

      {/* CONTENIDO PRINCIPAL (z-10 para que los textos siempre queden por encima de la escarcha) */}
      <div className="relative z-10 w-full max-w-sm mx-auto space-y-12 py-10">
        
        {isHeaderEnabled && (
          <div className="space-y-6">
            <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-400 drop-shadow-sm">Nuestra Boda</span>
            <h1 className="text-4xl font-serif text-zinc-800 leading-tight">{bloques.header.coupleNames}</h1>
            <p className="text-sm text-zinc-500 italic">{bloques.header.welcomeText}</p>
          </div>
        )}

        {isDressCodeEnabled && (
          <div className="space-y-4 pt-8 border-t border-zinc-200">
            <h2 className="text-xl font-serif text-zinc-800">Código de Vestimenta</h2>
            <div className="w-8 h-px mx-auto" style={{ backgroundColor: accentColor }} />
            <p className="font-bold text-sm uppercase tracking-widest text-zinc-700">{bloques.dressCode.style}</p>
            <p className="text-xs text-zinc-500">{bloques.dressCode.description}</p>
          </div>
        )}

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

        <div className="pt-12 pb-20">
          <button onClick={onOpenRsvp} className="px-8 py-3 bg-zinc-900 text-white text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-xl rounded-full">
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