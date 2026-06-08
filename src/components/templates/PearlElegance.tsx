'use client';
import { InvitationTemplateState } from '@/types/invitation';
import { DEFAULT_TEMPLATE } from '@/constants/defaultTemplate'; // <-- 1. IMPORTA EL FALLBACK

interface PearlEleganceProps {
  evento: any;
  invitado: any;
  onOpenRsvp: () => void;
}

export default function PearlElegance({ evento, invitado, onOpenRsvp }: PearlEleganceProps) {
  // 🛡️ 2. EL FIX: Si evento.template es null, usa DEFAULT_TEMPLATE
  const template: InvitationTemplateState = evento.template || DEFAULT_TEMPLATE;
  const { bloques } = template;
  
  const accentColor = evento.colorPrincipal || '#d4af37'; // Dorado por defecto

  return (
    <div className="min-h-screen bg-[#f4f4f2] text-zinc-800 font-sans selection:bg-amber-200">
      {/* Contenedor Responsivo: Full en móvil, centrado como carta en PC */}
      <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto bg-[#fdfdfc] min-h-screen shadow-2xl relative overflow-hidden">
        
        {/* Textura sutil de papel de acuarela (ruido visual) */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }} />

        {/* 1. SECCIÓN: PORTADA Y NOMBRES */}
        <section className="relative min-h-[70vh] flex flex-col items-center justify-center p-10 text-center border-b border-zinc-200/60">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 flex flex-col items-center gap-6">
            <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-400">Nuestra Boda</span>
            
            {/* Iniciales estilo Sello */}
            <div className="w-16 h-16 rounded-full border border-zinc-300 flex items-center justify-center mb-4">
              <span className="font-serif text-xl" style={{ color: accentColor }}>
                {bloques.header.coupleNames.split(' ').map(n => n[0]).join('')}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif text-zinc-800 leading-tight">
              {bloques.header.coupleNames}
            </h1>
            
            <p className="text-sm text-zinc-500 italic max-w-sm leading-relaxed mt-4">
              {bloques.header.welcomeText || "Queremos que seas parte de uno de los días más felices de nuestras vidas."}
            </p>
          </div>
        </section>

        {/* 2. SECCIÓN: FECHA Y LUGAR (CEREMONIA) */}
        <section className="py-20 px-10 text-center flex flex-col items-center gap-8 border-b border-zinc-200/60">
          <div className="space-y-4 animate-in fade-in duration-1000 delay-300">
            <h2 className="text-2xl font-serif text-zinc-800">Ceremonia</h2>
            <div className="w-10 h-px mx-auto" style={{ backgroundColor: accentColor }} />
            
            <div className="text-sm text-zinc-600 space-y-2 uppercase tracking-widest mt-6">
              <p className="font-bold text-zinc-800">{new Date(evento.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <p>2:30 PM</p>
            </div>
            
            <div className="mt-6">
              <p className="font-serif text-lg text-zinc-800">{evento.ubicacionCeremonia || 'Iglesia Principal'}</p>
              {evento.configMostrarMapaCeremonia && evento.mapUrlCeremonia && (
                <a href={evento.mapUrlCeremonia} target="_blank" rel="noreferrer" className="inline-block mt-4 text-[10px] uppercase tracking-widest font-bold border-b border-zinc-300 pb-1 hover:text-zinc-500 transition-colors" style={{ color: accentColor }}>
                  Ver mapa
                </a>
              )}
            </div>
          </div>
        </section>

        {/* 3. SECCIÓN: RECEPCIÓN Y DRESS CODE */}
        <section className="py-20 px-10 text-center flex flex-col items-center gap-12 border-b border-zinc-200/60 bg-zinc-50/50">
          
          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-zinc-800">Recepción</h2>
            <div className="w-10 h-px mx-auto" style={{ backgroundColor: accentColor }} />
            
            <div className="text-sm text-zinc-600 space-y-2 uppercase tracking-widest mt-6">
              <p>5:00 PM</p>
            </div>
            
            <div className="mt-6">
              <p className="font-serif text-lg text-zinc-800">{evento.ubicacionRecepcion}</p>
              {evento.configMostrarMapaRecepcion && evento.mapUrlRecepcion && (
                <a href={evento.mapUrlRecepcion} target="_blank" rel="noreferrer" className="inline-block mt-4 text-[10px] uppercase tracking-widest font-bold border-b border-zinc-300 pb-1 hover:text-zinc-500 transition-colors" style={{ color: accentColor }}>
                  Ver mapa
                </a>
              )}
            </div>
          </div>

          <div className="w-full max-w-xs p-6 border border-zinc-200 bg-white">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-2">Código de Vestimenta</p>
            <p className="font-serif text-lg text-zinc-800">{bloques.dressCode.style}</p>
            <p className="text-xs text-zinc-500 mt-2">{bloques.dressCode.description}</p>
          </div>
          
        </section>

        {/* 4. SECCIÓN: ITINERARIO */}
        {bloques.itinerary && bloques.itinerary.length > 0 && (
          <section className="py-20 px-10 text-center flex flex-col items-center gap-8 border-b border-zinc-200/60">
            <h2 className="text-2xl font-serif text-zinc-800">Itinerario</h2>
            <div className="w-10 h-px mx-auto" style={{ backgroundColor: accentColor }} />
            
            <div className="w-full max-w-sm mt-6 space-y-8">
              {bloques.itinerary.map((item, i) => (
                <div key={i} className="flex justify-between items-end border-b border-zinc-200/50 pb-2">
                  <span className="text-sm font-serif text-zinc-800">{item.actividad}</span>
                  <span className="text-xs font-bold tracking-widest" style={{ color: accentColor }}>{item.hora}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. SECCIÓN: CIERRE Y RSVP */}
        <section className="py-24 px-10 text-center flex flex-col items-center gap-8">
          <p className="font-serif text-2xl text-zinc-800 italic">
            "Te esperamos para celebrar nuestro amor"
          </p>
          
          <button
            onClick={onOpenRsvp}
            className="mt-8 px-8 py-4 bg-zinc-900 text-white text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors duration-300 shadow-xl"
          >
            Confirmar Asistencia
          </button>
          
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-12">
            Invitación exclusiva para: <br/>
            <span className="font-bold text-zinc-600 text-xs mt-1 block">{invitado.nombreFamilia}</span>
          </p>
        </section>

      </div>
    </div>
  );
}