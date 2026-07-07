'use client';

import React, { useState, useEffect } from 'react';
import { InvitationTemplateState, ItineraryItem } from '@/types/invitation';

interface PearlEleganceProps {
  evento: any;
  invitado: any;
  onOpenRsvp: () => void;
}

export default function PearlElegance({ evento, invitado, onOpenRsvp }: PearlEleganceProps) {
  const template: InvitationTemplateState = evento.template;
  const { bloques } = template;
  const accentColor = evento.colorPrincipal || '#d4af37'; 

  // Controladores de visualización por bloque
  const isHeaderEnabled = bloques.header?.enabled !== false;
  const isCountdownEnabled = bloques.countdown?.enabled !== false;
  const isLocationEnabled = bloques.venues?.enabled !== false;
  const isDressCodeEnabled = bloques.dressCode?.enabled !== false;
  const isItineraryEnabled = bloques.itinerary?.enabled !== false;
  const isParentsEnabled = bloques.parents?.enabled !== false;
  const isMenuEnabled = bloques.menu?.enabled !== false;
  const isClosingEnabled = bloques.closingMessage?.enabled !== false;
  const isRsvpDetailsEnabled = bloques.rsvpDetails?.enabled !== false;
  const isGiftsEnabled = bloques.gifts?.enabled !== false;

  const itineraryItems = bloques.itinerary?.items || [];
  const venues = bloques.venues?.items || [];

  // Lógica del Countdown Real
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!bloques.dateTime?.date) return;
    const targetDate = new Date(`${bloques.dateTime.date}T${bloques.dateTime.time || '00:00'}`).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [bloques.dateTime?.date, bloques.dateTime?.time]);

  // Partículas
  const [particles, setParticles] = useState<any[]>([]);
  useEffect(() => {
    const colors = ['#a855f7', '#d4af37', '#10b981', '#fdf8f6']; 
    const newParticles = Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 10 + 10}s`, 
      delay: `-${Math.random() * 20}s`, 
      size: `${Math.random() * 3 + 1}px`, 
      color: colors[Math.floor(Math.random() * colors.length)],
      twinkleDuration: `${Math.random() * 2 + 1.5}s`, 
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="bg-[#fdfdfc] rounded-t-[40px] shadow-[0_-15px_40px_rgba(0,0,0,0.12)] text-zinc-800 font-sans p-8 flex flex-col items-center text-center relative overflow-hidden min-h-full">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }} />
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <style>{`@keyframes fallDown { 0% { top: -5%; } 100% { top: 105%; } } @keyframes twinkle { 0% { transform: scale(0.5); opacity: 0.2; } 50% { transform: scale(1.5); opacity: 1; } 100% { transform: scale(0.5); opacity: 0.2; } }`}</style>
        {particles.map(p => <div key={p.id} className="absolute rounded-full" style={{ left: p.left, width: p.size, height: p.size, backgroundColor: p.color, boxShadow: `0 0 6px 1px ${p.color}`, animation: `fallDown ${p.duration} linear infinite ${p.delay}, twinkle ${p.twinkleDuration} ease-in-out infinite ${p.delay}` }} />)}
      </div>

      <div className="relative z-10 w-full max-w-sm mx-auto space-y-12 py-10">
        
        {/* ENCABEZADO Y NOMBRES */}
        {isHeaderEnabled && (
          <div className="space-y-6">
            <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-400">{bloques.header?.welcomeText || 'Nuestra Boda'}</span>
            <h1 className="text-4xl font-serif text-zinc-800 leading-tight">{bloques.header?.coupleNames}</h1>
            {(bloques.header?.subtitle1 || bloques.header?.subtitle2) && (
              <div className="text-xs text-zinc-500 italic space-y-1">
                {bloques.header.subtitle1 && <p>{bloques.header.subtitle1}</p>}
                {bloques.header.subtitle2 && <p>{bloques.header.subtitle2}</p>}
              </div>
            )}
          </div>
        )}

        {/* PADRES Y PADRINOS */}
        {isParentsEnabled && (bloques.parents?.brideParents || bloques.parents?.groomParents) && (
          <div className="space-y-4 pt-8 border-t border-zinc-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{bloques.parents.description || 'Con la bendición de nuestros padres'}</p>
            {bloques.parents.brideParents && <p className="text-sm font-serif text-zinc-700">{bloques.parents.brideParents}</p>}
            {bloques.parents.brideParents && bloques.parents.groomParents && <span className="text-xs text-zinc-400">&</span>}
            {bloques.parents.groomParents && <p className="text-sm font-serif text-zinc-700">{bloques.parents.groomParents}</p>}
          </div>
        )}

        {/* CUENTA REGRESIVA REAL */}
        {isCountdownEnabled && (
          <div className="space-y-4 pt-8 border-t border-zinc-200">
             <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{bloques.countdown?.message || 'Faltan'}</p>
             <div className="flex justify-center gap-6 text-zinc-700">
                <div className="text-center"><span className="text-3xl font-light">{timeLeft.days}</span><p className="text-[9px] uppercase tracking-widest mt-1">Días</p></div>
                <div className="text-center"><span className="text-3xl font-light">{timeLeft.hours}</span><p className="text-[9px] uppercase tracking-widest mt-1">Hrs</p></div>
                <div className="text-center"><span className="text-3xl font-light">{timeLeft.minutes}</span><p className="text-[9px] uppercase tracking-widest mt-1">Min</p></div>
                <div className="text-center"><span className="text-3xl font-light">{timeLeft.seconds}</span><p className="text-[9px] uppercase tracking-widest mt-1">Seg</p></div>
             </div>
             {bloques.dateTime?.showAddToCalendar !== false && (
               <button className="mt-4 px-4 py-2 border border-zinc-300 rounded-full text-[10px] uppercase tracking-widest text-zinc-600 hover:bg-zinc-100 transition-colors">Añadir al Calendario</button>
             )}
          </div>
        )}

        {/* UBICACIONES (VENUES) */}
        {isLocationEnabled && venues.length > 0 && (
          <div className="space-y-8 pt-8 border-t border-zinc-200">
             <h2 className="text-xl font-serif text-zinc-800">Ubicaciones</h2>
             <div className="w-8 h-px mx-auto" style={{ backgroundColor: accentColor }} />
             {venues.map((venue, idx) => venue.enabled && (
               <div key={idx} className="space-y-2">
                 {venue.photoUrl && <img src={venue.photoUrl} alt={venue.name} className="w-full h-32 object-cover rounded-xl mb-4 shadow-md" />}
                 <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-700">{venue.name}</h3>
                 <p className="text-xs text-zinc-500 leading-relaxed">{venue.address} <br/> {venue.cityState}</p>
                 {venue.mapLink && (
                   <a href={venue.mapLink} target="_blank" rel="noreferrer" className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest text-white bg-zinc-800 px-4 py-2 rounded-full">Ver en Mapa</a>
                 )}
               </div>
             ))}
          </div>
        )}

        {/* DRESS CODE */}
        {isDressCodeEnabled && (
          <div className="space-y-4 pt-8 border-t border-zinc-200">
            <h2 className="text-xl font-serif text-zinc-800">Código de Vestimenta</h2>
            <div className="w-8 h-px mx-auto" style={{ backgroundColor: accentColor }} />
            <p className="font-bold text-sm uppercase tracking-widest text-zinc-700">{bloques.dressCode?.style}</p>
            <p className="text-xs text-zinc-500">{bloques.dressCode?.description}</p>
          </div>
        )}

        {/* ITINERARIO VISUAL */}
        {isItineraryEnabled && itineraryItems.length > 0 && (
          <div className="space-y-6 pt-8 border-t border-zinc-200">
            <h2 className="text-xl font-serif text-zinc-800">Itinerario</h2>
            <div className="w-8 h-px mx-auto" style={{ backgroundColor: accentColor }} />
            <div className="space-y-6 mt-6">
              {itineraryItems.map((item: ItineraryItem, i: number) => (
                <div key={i} className="flex flex-col items-center pb-4">
                  {item.photoUrl && <img src={item.photoUrl} className="w-full h-24 object-cover rounded-xl mb-3 shadow-sm" alt={item.actividad} />}
                  <span className="text-xs font-bold tracking-widest mb-1" style={{ color: accentColor }}>{item.hora}</span>
                  <span className="text-sm font-serif text-zinc-800">{item.actividad}</span>
                  {item.ubicacion && <span className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest">{item.ubicacion}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MENU */}
        {isMenuEnabled && bloques.menu?.description && (
          <div className="space-y-4 pt-8 border-t border-zinc-200">
             <h2 className="text-xl font-serif text-zinc-800">Menú</h2>
             <div className="w-8 h-px mx-auto" style={{ backgroundColor: accentColor }} />
             <p className="text-xs text-zinc-500 whitespace-pre-wrap">{bloques.menu.description}</p>
          </div>
        )}

        {/* REGALOS */}
        {isGiftsEnabled && bloques.gifts?.message && (
          <div className="space-y-4 pt-8 border-t border-zinc-200">
             <h2 className="text-xl font-serif text-zinc-800">Mesa de Regalos</h2>
             <div className="w-8 h-px mx-auto" style={{ backgroundColor: accentColor }} />
             <div className="text-3xl py-2">🎁</div>
             <p className="text-xs text-zinc-500 whitespace-pre-wrap">{bloques.gifts.message}</p>
          </div>
        )}

        {/* CIERRE Y RSVP */}
        <div className="pt-12 pb-20">
          {isClosingEnabled && <p className="text-sm font-serif italic text-zinc-600 mb-10">{bloques.closingMessage?.message}</p>}
          
          <button onClick={onOpenRsvp} className="px-8 py-3 bg-zinc-900 text-white text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-xl rounded-full w-full max-w-[250px]">
            Confirmar Asistencia
          </button>
          
          {isRsvpDetailsEnabled && (
            <div className="mt-6 space-y-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                {bloques.rsvpDetails?.rsvpByText || 'Confirmar antes del:'} <span className="font-bold">{bloques.rsvpDetails?.deadlineDate}</span>
              </p>
              {bloques.rsvpDetails?.contactPhone && (
                <a href={`tel:${bloques.rsvpDetails.contactPhone}`} className="inline-block text-[10px] text-zinc-500 border border-zinc-300 px-4 py-2 rounded-full uppercase tracking-widest hover:bg-zinc-100 transition-colors">
                  📞 Llamar para más detalles
                </a>
              )}
            </div>
          )}

          <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-12">
            Invitación para: <br/>
            <span className="font-bold text-zinc-600 text-xs mt-1 block">{invitado?.nombreFamilia || 'Invitado Especial'}</span>
          </p>
        </div>
      </div>
    </div>
  );
}