'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PearlElegance from '../templates/PearlElegance';
import EnvelopeSVG from '../ui/EnvelopeSVG';

export default function EnvelopeWrapper({ invitacion }: { invitacion: any }) {
  const router = useRouter();
  
  // Extraemos la data
  const { event: evento, asistentes, paseDigital, codigoAcceso } = invitacion;
  const { template } = evento;
  const estilos = template?.estilos;
  const bloques = template?.bloques;

  // Estados de Interfaz
  const [isOpen, setIsOpen] = useState(false);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado del Formulario RSVP (Copiamos los asistentes de la BD al estado local)
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

  // Función para guardar el RSVP
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
      
      // Recargamos la página para que el Server Component vuelva a bajar los datos frescos con el QR
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
    <div className="relative min-h-screen bg-zinc-950 flex flex-col justify-center items-center overflow-hidden font-sans">
      
      {/* Contenedor central (Se adapta a móvil 100% y en PC parece un lienzo) */}
      <div className="relative w-full max-w-md md:max-w-2xl lg:max-w-3xl h-[100dvh] md:h-[85vh] md:rounded-3xl md:shadow-2xl overflow-hidden bg-[#f4f4f2]">
        
        {/* EL SOBRE DIGITAL ANIMADO */}
        <div className={`absolute inset-0 transition-all duration-700 ${isOpen ? 'z-10' : 'z-40'}`}>
          <EnvelopeSVG 
            isOpen={isOpen}
            onOpen={() => setIsOpen(true)}
            color={estilos.envelope.color || '#18181b'}
            pattern={estilos.envelope.pattern || 'none'}
            openingStyle={estilos.envelope.openingStyle || 'top'}
            sealDesign={estilos.envelope.waxSealDesign || 'monogram'}
            sealColor={estilos.envelope.waxSealColor || '#b45309'}
            coupleInitials={bloques.header.coupleNames}
          />
        </div>

        {/* LA INVITACIÓN INTERIOR (PLANTILLA) */}
        <div className={`absolute inset-0 transition-all duration-1000 ${isOpen ? 'opacity-100 z-30 pointer-events-auto delay-300' : 'opacity-0 z-0 pointer-events-none'}`}>
          <div className="w-full h-full overflow-y-auto scrollbar-none bg-[#fdfdfc] relative">
            <PearlElegance 
              evento={evento} 
              invitado={invitacion} 
              onOpenRsvp={() => setIsRsvpModalOpen(true)} 
            />
          </div>
        </div>
      </div>

      {/* =========================================
          MODAL DE CONFIRMACIÓN (RSVP & PASE DINÁMICO)
          ========================================= */}
      {isRsvpModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#fdfdfc] p-6 md:p-8 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            
            <button onClick={() => setIsRsvpModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-zinc-200 hover:bg-zinc-300 rounded-full text-zinc-600 transition-colors">
              ✕
            </button>

            {/* VISTA 1: YA CONFIRMADO -> MOSTRAR EL PASE DIGITAL */}
            {invitacion.statusRSVP === 'CONFIRMADO' && paseDigital ? (
              <div className="text-center space-y-6 py-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
                  ✓
                </div>
                <h2 className="text-2xl font-serif text-zinc-900">¡Asistencia Confirmada!</h2>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Gracias por acompañarnos. Este es tu pase digital dinámico, preséntalo en la recepción el día del evento.
                </p>
                
                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm inline-block mx-auto">
                  {/* Generamos un QR al vuelo usando una API pública rápida con el Token Seguro de tu Base de Datos */}
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${paseDigital.qrSecureToken}`} 
                    alt="Pase Dinámico QR" 
                    className="w-48 h-48 mx-auto"
                  />
                  <div className="mt-4 pt-4 border-t border-dashed border-zinc-200">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Pases Válidos</p>
                    <p className="text-xl font-mono text-zinc-800">{paseDigital.asistentesEsperados}</p>
                  </div>
                </div>

                <button onClick={() => setIsRsvpModalOpen(false)} className="w-full mt-4 bg-zinc-900 text-white py-3 rounded-xl text-xs uppercase tracking-widest font-bold">
                  Cerrar
                </button>
              </div>
            ) : 

            /* VISTA 2: FORMULARIO DE RSVP PENDIENTE */
            (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-serif text-zinc-900">Confirmación</h2>
                  <p className="text-sm text-zinc-500">Confirma la asistencia para cada miembro de tu invitación.</p>
                </div>

                <div className="space-y-4">
                  {formAsistentes.map((asistente: any, index: number) => (
                    <div key={asistente.id} className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-zinc-800">{asistente.nombreCompleto}</span>
                        <label className="flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={asistente.asiste}
                            onChange={(e) => {
                              const newAsistentes = [...formAsistentes];
                              newAsistentes[index].asiste = e.target.checked;
                              setFormAsistentes(newAsistentes);
                            }}
                          />
                          <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      {asistente.asiste && (
                        <div className="space-y-3 pt-3 border-t border-zinc-200 animate-in fade-in slide-in-from-top-2">
                          <input 
                            type="text" 
                            placeholder="Alimentación (Ej: Vegano, Sin Gluten)" 
                            value={asistente.restricciones}
                            onChange={(e) => {
                              const newAsistentes = [...formAsistentes];
                              newAsistentes[index].restricciones = e.target.value;
                              setFormAsistentes(newAsistentes);
                            }}
                            className="w-full bg-white border border-zinc-300 px-3 py-2 rounded-lg text-xs text-zinc-700 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mensaje o Felicitaciones (Opcional)</label>
                  <textarea 
                    rows={2} 
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg text-sm text-zinc-700 focus:outline-none focus:border-zinc-400"
                    placeholder="Escribe un mensaje para los anfitriones..."
                  />
                </div>

                <button 
                  onClick={handleConfirmRSVP}
                  disabled={isSubmitting}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white py-4 rounded-xl text-xs uppercase tracking-widest font-bold shadow-xl transition-all"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Confirmación'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}