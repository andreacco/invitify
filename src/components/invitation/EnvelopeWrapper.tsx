'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PearlElegance from '../templates/PearlElegance';
import EnvelopeSVG from '../ui/EnvelopeSVG';

export default function EnvelopeWrapper({ invitacion }: { invitacion: any }) {
  const router = useRouter();
  
  const { event: evento, asistentes, paseDigital, codigoAcceso } = invitacion;
  const { template } = evento;
  const estilos = template?.estilos;
  const bloques = template?.bloques;

  const [isOpen, setIsOpen] = useState(false);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const portadaImagen = bloques?.header?.coverPhoto || evento?.portadaUrl || "/portada-oval.jpg";

  const [formAsistentes, setFormAsistentes] = useState(
    asistentes.map((a: any) => ({
      id: a.id,
      nombreCompleto: a.nombreCompleto,
      asiste: a.asiste || false,
      menuSeleccionado: a.menuSeleccionado || '',
      restricciones: a.restricciones || '',
    }))
  );
  const [observaciones, setObservaciones] = useState(invitacion.observaciones || '');

  const handleConfirmRSVP = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rsvp/${codigoAcceso}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respuestasAsistentes: formAsistentes,
          observaciones,
        }),
      });

      if (!res.ok) throw new Error('Error al enviar la confirmación');
      
      router.refresh();
      alert('¡Confirmación enviada con éxito!');
    } catch (error) {
      console.error(error);
      alert('Hubo un error al confirmar. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#f4f4f2] font-sans @container">
      
      {/* LA FOTO EXPANDIBLE */}
      {/* 🛠️ Ajuste: left-[42%] en móvil para dar separación de la apertura, y @md:left-1/2 en PC */}
      <div className={`absolute z-10 transition-all duration-[1200ms] ease-[cubic-bezier(0.87,0,0.13,1)] overflow-hidden ${
        isOpen 
          ? 'top-0 left-0 w-full h-[45%] @md:h-[55%] translate-x-0 translate-y-0 rounded-none opacity-100' 
          : 'top-1/2 left-[42%] @md:left-1/2 w-[220px] @md:w-[320px] h-[320px] @md:h-[460px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] opacity-90 shadow-2xl'
      }`}>
        <img src={portadaImagen} alt="Portada" className="w-full h-full object-cover transition-transform duration-[2000ms] scale-105" />
        {/* 👇 AQUÍ ESTÁ EL DEGRADADO MODIFICADO: Más bajito (h-[30%]) y pegado abajo */}
        <div className={`absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-[#fdfdfc] via-[#fdfdfc]/80 to-transparent transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      {/* EL SOBRE DIGITAL ANIMADO */}
      <div className={`absolute inset-0 transition-all duration-1000 ${isOpen ? 'z-0 opacity-0 pointer-events-none delay-700' : 'z-20 opacity-100'}`}>
        <EnvelopeSVG 
          isOpen={isOpen}
          onOpen={() => setIsOpen(true)}
          color={estilos?.envelope?.color || '#18181b'}
          pattern={estilos?.envelope?.pattern || 'none'}
          openingStyle={estilos?.envelope?.openingStyle || 'vertical'}
          sealDesign={estilos?.envelope?.waxSealDesign || 'custom'}
          sealColor={estilos?.envelope?.waxSealColor || '#b45309'}
          coupleInitials={bloques?.header?.coupleNames}
        />
      </div>

      {/* LA INVITACIÓN INTERIOR */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isOpen ? 'opacity-100 z-30 pointer-events-auto delay-500' : 'opacity-0 z-0 pointer-events-none'}`}>
        <div className="w-full h-full overflow-y-auto scrollbar-none relative bg-transparent flex flex-col">
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 z-50 bg-black/40 backdrop-blur-md text-white hover:bg-black/60 text-[10px] uppercase tracking-widest py-2 px-4 rounded-full font-medium transition-all shadow-lg">
            ↩ Cerrar
          </button>
          
          <div className="shrink-0 h-[40%] @md:h-[50%]" />
          
          <div className="shrink-0 w-full relative z-10 flex-1"> 
            <PearlElegance evento={evento} invitado={invitacion} onOpenRsvp={() => setIsRsvpModalOpen(true)} />
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN (RSVP) */}
      {isRsvpModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-[#fdfdfc] p-8 rounded-3xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-none">
              
              <div className="text-center mb-8">
                 <h2 className="text-2xl font-serif text-zinc-800">¿Nos acompaña?</h2>
                 <p className="text-xs text-zinc-500 mt-2">Pase individual exclusivo para <br/><span className="font-bold text-zinc-800 text-sm">{invitacion?.nombreFamilia}</span></p>
              </div>

              {!isSubmitting ? (
                <div className="space-y-6">
                  {/* BOTONES PRINCIPALES SÍ/NO */}
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setFormAsistentes((prev: any[]) => prev.map((a: any) => ({ ...a, asiste: true })))}
                      className={`py-4 rounded-2xl border-2 font-medium flex flex-col items-center gap-1 transition-all ${formAsistentes[0]?.asiste === true ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-zinc-200 bg-white text-zinc-600 hover:border-emerald-200'}`}
                    >
                      <span className="text-xl">Sí</span>
                      <span className="text-[10px] uppercase tracking-wider">Acepto con gusto</span>
                    </button>
                    <button 
                      onClick={() => setFormAsistentes((prev: any[]) => prev.map((a: any) => ({ ...a, asiste: false })))}
                      className={`py-4 rounded-2xl border-2 font-medium flex flex-col items-center gap-1 transition-all ${formAsistentes[0]?.asiste === false ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-zinc-200 bg-white text-zinc-600 hover:border-rose-200'}`}
                    >
                      <span className="text-xl">No</span>
                      <span className="text-[10px] uppercase tracking-wider">Declino con pesar</span>
                    </button>
                  </div>

                  {/* FORMULARIO CONDICIONAL SI ASISTE */}
                  {formAsistentes[0]?.asiste === true && (
                    <div className="space-y-5 animate-in slide-in-from-bottom-2 fade-in duration-300">
                      
                      {bloques?.rsvpForm?.askDietary && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Restricciones alimentarias</label>
                          <input 
                            type="text" 
                            placeholder="Ej. Vegetariano, sin gluten..." 
                            value={formAsistentes[0]?.restricciones || ''}
                            onChange={(e) => setFormAsistentes((prev: any) => { const n = [...prev]; n[0].restricciones = e.target.value; return n; })}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-400"
                          />
                        </div>
                      )}

                      {bloques?.rsvpForm?.askSong && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Sugerencia de Canción</label>
                          <input 
                            type="text" 
                            placeholder="¿Qué canción te haría bailar?" 
                            value={formAsistentes[0]?.cancionSugerida || ''}
                            onChange={(e) => setFormAsistentes((prev: any) => { const n = [...prev]; n[0].cancionSugerida = e.target.value; return n; })}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-400"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Un mensaje para nosotros</label>
                        <textarea 
                          placeholder="Déjanos tus buenos deseos (Opcional)" 
                          value={observaciones}
                          onChange={(e) => setObservaciones(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm min-h-[80px] focus:outline-none focus:border-zinc-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* BOTONES DE ACCIÓN FINAL */}
                  <div className="pt-4 flex flex-col gap-3">
                    <button 
                      onClick={handleConfirmRSVP} 
                      disabled={formAsistentes[0]?.asiste === undefined || formAsistentes[0]?.asiste === null}
                      className="w-full py-4 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-30 hover:bg-zinc-800"
                    >
                      Enviar Respuesta
                    </button>
                    <button 
                      onClick={() => setIsRsvpModalOpen(false)} 
                      className="w-full py-3 bg-transparent text-zinc-400 rounded-xl text-xs font-bold transition-all hover:text-zinc-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-in zoom-in duration-300">
                  <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
                  <p className="text-sm font-medium text-zinc-500">Procesando tu respuesta...</p>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}