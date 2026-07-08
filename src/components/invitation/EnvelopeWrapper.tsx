'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PearlElegance from '../templates/PearlElegance';
import EnvelopeSVG from '../ui/EnvelopeSVG';

export default function EnvelopeWrapper({ invitacion }: { invitacion: any }) {
  const router = useRouter();
  
  const { event: evento, asistentes, codigoAcceso } = invitacion;
  const { template } = evento;
  const estilos = template?.estilos;
  const bloques = template?.bloques;

  const [isOpen, setIsOpen] = useState(false);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
  
  // 🚀 ESTADO Y REFERENCIA NATIVA PARA LA MÚSICA (Sin librerías pesadas)
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mp3Url = bloques?.music?.mp3Url;

  const [isSubmitting, setIsSubmitting] = useState<false | 'loading' | 'success' | 'editing'>(false);
  const portadaImagen = bloques?.header?.coverPhoto || evento?.portadaUrl || "/cover-oval.png";

  const [formAsistentes, setFormAsistentes] = useState(
    asistentes.map((a: any) => ({
      id: a.id,
      nombreCompleto: a.nombreCompleto,
      asiste: a.asiste || false,
      menuSeleccionado: a.menuSeleccionado || '',
      restricciones: a.restricciones || '',
      cancionSugerida: a.cancionSugerida || '',
    }))
  );
  
  const [observaciones, setObservaciones] = useState(invitacion.observaciones || '');

  const handleConfirmRSVP = async () => {
    if (invitacion.statusRSVP === 'CONFIRMADO' && formAsistentes[0]?.asiste === false) {
      const seguro = window.confirm("¿Estás seguro? ¿Te vas a perder este gran evento? 😢");
      if (!seguro) return;
    }

    setIsSubmitting('loading');
    try {
      const res = await fetch(`/api/rsvp/${codigoAcceso}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuestasAsistentes: formAsistentes, observaciones }),
      });

      if (!res.ok) throw new Error('Error al enviar la confirmación');
      setIsSubmitting('success');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Hubo un error al confirmar. Intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  // 🚀 FUNCIÓN ANTI-BUG PARA PAUSAR/REPRODUCIR
  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error("Autoplay bloqueado:", err));
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#f4f4f2] font-sans @container">
      
      {/* 1. PORTADA ORIGINAL INTACTA */}
      <div className={`absolute z-10 transition-all duration-[1200ms] ease-[cubic-bezier(0.87,0,0.13,1)] overflow-hidden ${
        isOpen 
          ? 'top-0 left-0 w-full h-[45%] @md:h-[55%] translate-x-0 translate-y-0 rounded-none opacity-100' 
          : 'top-1/2 left-[42%] @md:left-1/2 w-[220px] @md:w-[320px] h-[320px] @md:h-[460px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] opacity-90 shadow-2xl'
      }`}>
        <img src={portadaImagen} alt="Portada" className="w-full h-full object-cover transition-transform duration-[2000ms] scale-105" />
        <div className={`absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-[#fdfdfc] via-[#fdfdfc]/80 to-transparent transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* 2. SVG DEL SOBRE */}
      <div className={`absolute inset-0 transition-all duration-1000 ${isOpen ? 'z-0 opacity-0 pointer-events-none delay-700' : 'z-20 opacity-100'}`}>
        <EnvelopeSVG 
          isOpen={isOpen}
          onOpen={() => {
            setIsOpen(true);
            // Reproducir música automáticamente si el navegador lo permite
            if (mp3Url && audioRef.current) {
              audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
            }
          }}
          color={estilos?.envelope?.color || '#18181b'}
          pattern={estilos?.envelope?.pattern || 'none'}
          openingStyle={estilos?.envelope?.openingStyle || 'vertical'}
          sealDesign={estilos?.envelope?.waxSealDesign || 'custom'}
          sealColor={estilos?.envelope?.waxSealColor || '#b45309'}
          coupleInitials={bloques?.header?.coupleNames}
        />
      </div>

      {/* 3. CONTENIDO DE LA INVITACIÓN SCROLLABLE */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isOpen ? 'opacity-100 z-30 pointer-events-auto delay-500' : 'opacity-0 z-0 pointer-events-none'}`}>
        <div className="w-full h-full overflow-y-auto scrollbar-none relative bg-transparent flex flex-col">
          <button 
            onClick={() => {
              setIsOpen(false);
              if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
            }} 
            className="absolute top-4 right-4 z-50 bg-black/40 backdrop-blur-md text-white hover:bg-black/60 text-[10px] uppercase tracking-widest py-2 px-4 rounded-full font-medium transition-all shadow-lg"
          >
            ↩ Cerrar
          </button>
          
          <div className="shrink-0 h-[40%] @md:h-[50%]" />
          
          <div className="shrink-0 w-full relative z-10 flex-1"> 
            <PearlElegance evento={evento} invitado={invitacion} onOpenRsvp={() => setIsRsvpModalOpen(true)} />
          </div>
        </div>
      </div>

      {/* ================= MODAL RSVP ================= */}
      {isRsvpModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-[#fdfdfc] p-8 rounded-3xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-none">
              
              {isSubmitting === 'success' ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center animate-in zoom-in-95 duration-300">
                  <div className="text-5xl mb-2">
                    {formAsistentes[0]?.asiste ? '🎉' : '🤍'}
                  </div>
                  <h3 className="text-xl font-serif text-zinc-800 px-4">
                    {formAsistentes[0]?.asiste 
                      ? '¡Qué emoción! Sabíamos que no te lo perderías ✨'
                      : 'Lamentamos mucho que no nos acompañes. Tu respuesta ha sido guardada.'}
                  </h3>
                  <button onClick={() => setIsRsvpModalOpen(false)} className="mt-6 px-8 py-3 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all">
                    Volver a la invitación
                  </button>
                </div>
              ) : 

              isSubmitting === 'loading' ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-300">
                  <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
                  <p className="text-sm font-medium text-zinc-500">Procesando respuesta...</p>
                </div>
              ) : 

              (invitacion.statusRSVP !== 'PENDIENTE' && isSubmitting !== 'editing') ? (
                <div className="text-center space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-2xl font-serif text-zinc-800">Ya has respondido</h2>
                  <p className="text-sm text-zinc-600">
                    Actualmente registraste tu asistencia como: <br/>
                    <strong className={`text-lg mt-2 inline-block ${invitacion.statusRSVP === 'CONFIRMADO' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {invitacion.statusRSVP === 'CONFIRMADO' ? '¡Sí asistiré!' : 'No podré asistir'}
                    </strong>
                  </p>
                  <div className="pt-4 flex flex-col gap-3">
                    <button onClick={() => setIsSubmitting('editing')} className="w-full py-4 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:bg-zinc-800">
                      Cambiar mi respuesta
                    </button>
                    <button onClick={() => setIsRsvpModalOpen(false)} className="w-full py-3 bg-transparent text-zinc-400 rounded-xl text-xs font-bold transition-all hover:text-zinc-600">
                      Cerrar ventana
                    </button>
                  </div>
                </div>
              ) :

              (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-zinc-800">¿Nos acompaña?</h2>
                    <p className="text-xs text-zinc-500 mt-2">Pase exclusivo para <br/><span className="font-bold text-zinc-800 text-sm">{invitacion?.nombreFamilia}</span></p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setFormAsistentes((prev: any[]) => prev.map((a: any) => ({ ...a, asiste: true })))} className={`py-4 rounded-2xl border-2 font-medium flex flex-col items-center gap-1 transition-all ${formAsistentes[0]?.asiste === true ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-zinc-200 bg-white text-zinc-600 hover:border-emerald-200'}`}>
                      <span className="text-xl">Sí</span>
                      <span className="text-[10px] uppercase tracking-wider">Acepto con gusto</span>
                    </button>
                    <button onClick={() => setFormAsistentes((prev: any[]) => prev.map((a: any) => ({ ...a, asiste: false })))} className={`py-4 rounded-2xl border-2 font-medium flex flex-col items-center gap-1 transition-all ${formAsistentes[0]?.asiste === false ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-zinc-200 bg-white text-zinc-600 hover:border-rose-200'}`}>
                      <span className="text-xl">No</span>
                      <span className="text-[10px] uppercase tracking-wider">Declino con pesar</span>
                    </button>
                  </div>

                  {formAsistentes[0]?.asiste === true && (
                    <div className="space-y-5 animate-in slide-in-from-bottom-2 fade-in duration-300">
                      {bloques?.rsvpForm?.askDietary && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Restricciones alimentarias</label>
                          <input type="text" placeholder="Ej. Vegetariano, sin gluten..." value={formAsistentes[0]?.restricciones || ''} onChange={(e) => setFormAsistentes((prev: any) => { const n = [...prev]; n[0].restricciones = e.target.value; return n; })} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-400" />
                        </div>
                      )}
                      {bloques?.rsvpForm?.askSong && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Sugerencia de Canción</label>
                          <input type="text" placeholder="¿Qué canción te haría bailar?" value={formAsistentes[0]?.cancionSugerida || ''} onChange={(e) => setFormAsistentes((prev: any) => { const n = [...prev]; n[0].cancionSugerida = e.target.value; return n; })} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-400" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Un mensaje para nosotros</label>
                        <textarea placeholder="Déjanos tus buenos deseos (Opcional)" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm min-h-[80px] focus:outline-none focus:border-zinc-400" />
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex flex-col gap-3">
                    <button onClick={handleConfirmRSVP} disabled={formAsistentes[0]?.asiste === undefined || formAsistentes[0]?.asiste === null} className="w-full py-4 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-30 hover:bg-zinc-800">
                      Confirmar y Enviar
                    </button>
                    <button onClick={() => setIsRsvpModalOpen(false)} className="w-full py-3 bg-transparent text-zinc-400 rounded-xl text-xs font-bold transition-all hover:text-zinc-600">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* ================= CONTROLES DE MÚSICA ================= */}
      {isOpen && mp3Url && (
        <button 
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-black/40 backdrop-blur-md border border-white/10 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:bg-black/60 hover:scale-105 animate-in zoom-in duration-500 delay-1000"
          title={isPlaying ? "Silenciar" : "Reproducir"}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
              <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 opacity-60">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-1.72 1.72-1.72-1.72Z" />
            </svg>
          )}
        </button>
      )}

      {/* AUDIO NATIVO OCULTO */}
      {mp3Url && <audio ref={audioRef} src={mp3Url} loop preload="auto" className="hidden" />}
    </div>
  );
}