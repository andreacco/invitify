'use client';

import { useState, useEffect, useMemo } from 'react';
import PearlElegance from '@/components/templates/PearlElegance';

// ============================================
// TYPES
// ============================================

interface Asistente {
  id: string;
  nombreCompleto: string;
  asiste: boolean;
}

interface TemplateEstilos {
  theme: string;
  typography: string;
  musicUrl: string;
  envelope: {
    color: string;
    waxSeal: string;
  };
}

interface TemplateBloques {
  header: {
    coupleNames: string;
    welcomeText: string;
    coverPhoto: string;
  };
  dressCode: {
    style: string;
    description: string;
  };
  itinerary: Array<{ hora: string; actividad: string }>;
  countdown: {
    enabled: boolean;
    message: string;
  };
}

interface Template {
  estilos: TemplateEstilos;
  bloques: TemplateBloques;
}

interface Evento {
  id: string;
  titulo: string;
  fecha: string;
  colorPrincipal: string | null;
  coloresSecundarios: string[];
  ubicacionCeremonia: string | null;
  ubicacionRecepcion: string;
  mapUrlCeremonia: string | null;
  mapUrlRecepcion: string | null;
  configMostrarMapaCeremonia: boolean;
  configMostrarMapaRecepcion: boolean;
  template: Template | null;
}

interface Invitado {
  id: string;
  nombreFamilia: string;
  pasesTotales: number;
  statusRSVP: string;
  asistentes: Asistente[];
  event: Evento;
}

interface EnvelopeWrapperProps {
  invitado: Invitado;
  evento: Evento;
}

// ============================================
// ENVELOPE COLOR MAP
// ============================================

const envelopeColorMap: Record<string, { bg: string; text: string; border: string }> = {
  Onyx:      { bg: 'bg-zinc-900',        text: 'text-zinc-400', border: 'border-zinc-700/30' },
  Petroleum: { bg: 'bg-slate-800',        text: 'text-slate-300', border: 'border-slate-600/30' },
  Lavender:  { bg: 'bg-purple-950/90',    text: 'text-purple-200', border: 'border-purple-700/30' },
  Burgundy:  { bg: 'bg-rose-950',         text: 'text-rose-200', border: 'border-rose-700/30' },
  Pearl:     { bg: 'bg-[#fdfdfc]',        text: 'text-zinc-800', border: 'border-zinc-200/80' }, // <-- ESTE ES EL NUEVO
};

// ============================================
// WAX SEAL CONTENT
// ============================================

function WaxSealContent({ sealType, coupleNames }: { sealType: string; coupleNames?: string }) {
  if (sealType === 'Lotus')      return <span className="text-2xl">🪷</span>;
  if (sealType === 'Eucalyptus') return <span className="text-2xl">🌿</span>;
  
  // Monogram: extract initials from couple names
  if (sealType === 'Monogram' && coupleNames) {
    const parts = coupleNames.split(/\s*[&y]\s*/i);
    const initials = parts.map(p => p.trim().charAt(0).toUpperCase()).join(' & ');
    return <span className="text-xs font-serif font-bold">{initials}</span>;
  }

  return <span className="text-2xl">💌</span>;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function EnvelopeWrapper({ invitado, evento }: EnvelopeWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false); // <-- NUEVO ESTADO
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const accentColor = evento.colorPrincipal || '#9333ea';
  const template = evento.template;
  const estilos = template?.estilos;
  const bloques = template?.bloques;

  // Envelope styling
  const envelopeStyle = estilos?.envelope?.color
    ? envelopeColorMap[estilos.envelope.color] || envelopeColorMap['Onyx']
    : envelopeColorMap['Onyx'];

  // ============================================
  // LIVE COUNTDOWN
  // ============================================
  useEffect(() => {
    const eventDate = new Date(evento.fecha);

    function calculateCountdown() {
      const now = new Date();
      const diff = eventDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [evento.fecha]);

  // ============================================
  // CLOSED STATE — THE ENVELOPE
  // ============================================
  if (!isOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
        <div
          onClick={() => setIsOpen(true)}
          className={`
            relative max-w-md w-full aspect-[3/4] rounded-3xl cursor-pointer
            ${envelopeStyle.bg} ${envelopeStyle.text}
            flex flex-col items-center justify-center p-8
            shadow-2xl shadow-black/50
            transition-all duration-700 ease-in-out
            hover:scale-[1.02] active:scale-[0.98]
            overflow-hidden select-none
          `}
        >
          {/* Paper texture border */}
          <div className={`absolute inset-0 border-[14px] border-black/10 rounded-3xl pointer-events-none`} />
          
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-gradient-radial from-white/[0.03] to-transparent pointer-events-none" />

          <div className="text-center space-y-8 z-10">
            {/* Prompt text */}
            <span className="text-[10px] tracking-[0.25em] uppercase opacity-50 block animate-pulse">
              Toque para abrir
            </span>

            {/* Wax Seal */}
            <div className="w-24 h-24 rounded-full bg-amber-700/90 border-2 border-amber-600/60 shadow-[0_6px_20px_rgba(0,0,0,0.5),inset_0_2px_6px_rgba(255,255,255,0.15)] mx-auto flex items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95">
              <div className="w-[4.5rem] h-[4.5rem] rounded-full border border-dashed border-amber-500/40 flex items-center justify-center text-amber-100">
                <WaxSealContent
                  sealType={estilos?.envelope?.waxSeal || 'Lotus'}
                  coupleNames={bloques?.header?.coupleNames}
                />
              </div>
            </div>

            {/* Guest Family Name */}
            <div className="space-y-2">
              <div className="font-serif italic text-xl text-amber-100/90 leading-tight">
                {invitado.nombreFamilia}
              </div>
              <div className="w-16 h-px bg-amber-100/20 mx-auto" />
            </div>
          </div>

          {/* Decorative bottom */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-30">
            <span className="text-[9px] tracking-[0.3em] uppercase">Invitación Exclusiva</span>
          </div>
        </div>
      </div>
    );
  }

// ============================================
  // OPEN STATE — THE INVITATION
  // ============================================
  return (
    <div className="relative">
      {/* Botón flotante para cerrar el sobre */}
      <button
        onClick={() => setIsOpen(false)}
        className="fixed top-4 right-4 z-50 bg-black/40 backdrop-blur-md text-white hover:bg-black/60 text-[10px] uppercase tracking-widest py-2 px-4 rounded-full font-medium transition-all duration-300 shadow-lg"
      >
        ↩ Cerrar
      </button>

      {/* Aquí es donde la magia ocurre: Inyectamos la plantilla web responsiva */}
      <PearlElegance 
        evento={evento} 
        invitado={invitado} 
        onOpenRsvp={() => setIsRsvpModalOpen(true)} 
      />

      {/* ========================================
          SECTION 1: COVER / HEADER
          ======================================== */}
      <div
        className="relative min-h-[500px] bg-zinc-800 flex flex-col justify-end p-8 text-center bg-cover bg-center transition-all duration-500"
        style={{
          backgroundImage:
            bloques?.header?.coverPhoto && bloques.header.coverPhoto !== '/vercel.svg'
              ? `url(${bloques.header.coverPhoto})`
              : 'none',
        }}
      >
        {/* Fallback pattern */}
        {(!bloques?.header?.coverPhoto || bloques.header.coverPhoto === '/vercel.svg') && (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border border-dashed border-zinc-700 flex items-center justify-center text-zinc-600 text-xs">
              Sin portada
            </div>
          </div>
        )}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/50 to-transparent z-10" />

        {/* Content */}
        <div className="relative z-20 text-white flex flex-col gap-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1
            className="text-5xl font-serif tracking-wide leading-tight"
            style={{ color: accentColor }}
          >
            {bloques?.header?.coupleNames || evento.titulo}
          </h1>
          <div className="w-20 h-px mx-auto" style={{ backgroundColor: accentColor }} />
          <p className="text-sm opacity-80 italic max-w-[300px] mx-auto font-light text-zinc-200">
            {bloques?.header?.welcomeText || ''}
          </p>
        </div>
      </div>

      {/* ========================================
          SECTION 2: DRESS CODE
          ======================================== */}
      {bloques?.dressCode && (
        <div className="p-8 bg-zinc-50 border-b border-zinc-100 text-center flex flex-col gap-3 animate-in fade-in duration-500">
          <span
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: accentColor }}
          >
            Código de Vestimenta
          </span>
          <h3 className="text-xl font-semibold text-zinc-800">
            {bloques.dressCode.style}
          </h3>
          <p className="text-sm text-zinc-500 leading-relaxed font-light max-w-xs mx-auto">
            {bloques.dressCode.description}
          </p>
        </div>
      )}

      {/* ========================================
          SECTION 3: COUNTDOWN
          ======================================== */}
      {bloques?.countdown?.enabled && (
        <div className="p-8 bg-zinc-900 text-white text-center flex flex-col gap-4">
          <p className="text-[10px] tracking-[0.3em] uppercase opacity-50">
            {bloques.countdown.message || 'Faltan'}
          </p>
          <div className="flex justify-center gap-3">
            {[
              { value: countdown.days, label: 'Días' },
              { value: countdown.hours, label: 'Horas' },
              { value: countdown.minutes, label: 'Min' },
              { value: countdown.seconds, label: 'Seg' },
            ].map((unit) => (
              <div
                key={unit.label}
                className="bg-zinc-800 rounded-xl p-3 min-w-[60px] shadow-inner"
              >
                <span className="text-2xl font-bold block tabular-nums" style={{ color: accentColor }}>
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider opacity-40 mt-1 block">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================
          SECTION 4: ITINERARY
          ======================================== */}
      {bloques?.itinerary && bloques.itinerary.length > 0 && (
        <div className="p-8 flex flex-col gap-6">
          <h4
            className="text-center text-sm font-bold uppercase tracking-[0.2em]"
            style={{ color: accentColor }}
          >
            Itinerario del Evento
          </h4>
          <div
            className="flex flex-col gap-5 border-l-2 pl-5 ml-3"
            style={{ borderColor: `${accentColor}30` }}
          >
            {bloques.itinerary.map((item, i) => (
              <div key={i} className="relative flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                {/* Timeline dot */}
                <div
                  className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full ring-4 ring-white"
                  style={{ backgroundColor: accentColor }}
                />
                <span className="text-xs font-bold" style={{ color: accentColor }}>
                  {item.hora}
                </span>
                <span className="text-sm font-medium text-zinc-700">
                  {item.actividad}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================
          SECTION 5: MAPS (if configured)
          ======================================== */}
      {(evento.configMostrarMapaCeremonia && evento.mapUrlCeremonia) || (evento.configMostrarMapaRecepcion && evento.mapUrlRecepcion) ? (
        <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex flex-col gap-4">
          <h4
            className="text-center text-sm font-bold uppercase tracking-[0.2em]"
            style={{ color: accentColor }}
          >
            Ubicación
          </h4>
          <div className="flex flex-col gap-3">
            {evento.configMostrarMapaCeremonia && evento.mapUrlCeremonia && (
              <a
                href={evento.mapUrlCeremonia}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 transition-all shadow-sm hover:shadow-md"
              >
                <span className="text-xl">⛪</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-700">Ceremonia</span>
                  <span className="text-[10px] text-zinc-400">{evento.ubicacionCeremonia || 'Ver en Google Maps'}</span>
                </div>
                <span className="ml-auto text-zinc-300">→</span>
              </a>
            )}
            {evento.configMostrarMapaRecepcion && evento.mapUrlRecepcion && (
              <a
                href={evento.mapUrlRecepcion}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 transition-all shadow-sm hover:shadow-md"
              >
                <span className="text-xl">🎉</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-700">Recepción</span>
                  <span className="text-[10px] text-zinc-400">{evento.ubicacionRecepcion || 'Ver en Google Maps'}</span>
                </div>
                <span className="ml-auto text-zinc-300">→</span>
              </a>
            )}
          </div>
        </div>
      ) : null}

      {/* ========================================
          SECTION 6: FOOTER & RSVP
          ======================================== */}
      <div className="p-8 bg-zinc-900 text-center flex flex-col gap-8">
        
        {/* Botón Principal RSVP */}
        <button
          onClick={() => setIsRsvpModalOpen(true)}
          className="w-full py-4 rounded-2xl text-sm font-bold text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          style={{ backgroundColor: accentColor, boxShadow: `0 10px 25px -5px ${accentColor}60` }}
        >
          Confirmar Asistencia
        </button>

        <div className="flex flex-col gap-3">
          <div className="w-12 h-px mx-auto" style={{ backgroundColor: accentColor }} />
          <p className="text-xs text-zinc-500 italic">
            Nos llena de alegría contar con tu presencia.
          </p>
          <p className="text-[10px] text-zinc-600 tracking-wider uppercase">
            Invitación creada con Invitify
          </p>
        </div>
      </div>
      {/* ========================================
          MODAL DE CONFIRMACIÓN (RSVP)
          ======================================== */}
      {isRsvpModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 relative overflow-y-auto max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-300 border border-zinc-100">
            <button 
              onClick={() => setIsRsvpModalOpen(false)} 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 transition-colors"
            >
              ✕
            </button>
            
            <div className="text-center mb-6 mt-2">
              <h2 className="text-2xl font-serif" style={{ color: accentColor }}>Confirmar Asistencia</h2>
              <p className="text-xs text-zinc-500 mt-1">Por favor, indícanos quiénes asistirán.</p>
            </div>

            <div className="space-y-4 text-sm text-zinc-500 text-center py-12 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
              <span className="text-3xl block mb-2">💌</span>
              [El Formulario de RSVP irá aquí]
              <br />
              <span className="text-xs font-semibold text-zinc-700 mt-2 block">
                Familia: {invitado.nombreFamilia}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
