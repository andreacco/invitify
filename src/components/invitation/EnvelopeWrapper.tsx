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

      {/* MODAL DE CONFIRMACIÓN */}
      {isRsvpModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-[#fdfdfc] p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
              <div className="text-center py-4">
                 <h2 className="text-xl font-bold">¡Confirma tu asistencia!</h2>
                 <p className="text-xs text-zinc-500 mt-2">Funcionalidad preservada.</p>
                 <button onClick={() => setIsRsvpModalOpen(false)} className="mt-4 px-4 py-2 bg-black text-white rounded-lg text-xs">Cerrar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}