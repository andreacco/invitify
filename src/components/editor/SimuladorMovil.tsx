'use client';

import { useState, useEffect } from 'react';
import { InvitationTemplateState } from '@/types/invitation';
import PearlElegance from '../templates/PearlElegance'
import EnvelopeSVG from '../ui/EnvelopeSVG';

interface Props {
  template: InvitationTemplateState;
}

export default function SimuladorMovil({ template }: Props) {
  const { estilos, bloques } = template;
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [
    estilos.envelope.color, 
    estilos.envelope.waxSealDesign, 
    estilos.envelope.openingStyle, 
    estilos.envelope.pattern,
    estilos.envelope.waxSealColor
  ]);

  const mockInvitado = { nombreFamilia: 'Familia Paternina Osorio' };
  const mockEvento = {
    fecha: '2026-08-01T15:00:00Z',
    ubicacionCeremonia: 'Catedral Principal',
    ubicacionRecepcion: 'Hacienda La Vega',
    colorPrincipal: '#d4af37',
    template: template 
  };

  return (
    <div className="relative mx-auto w-[360px] h-[740px] bg-zinc-900 rounded-[48px] shadow-[0_0_0_12px_#27272a] shadow-2xl overflow-hidden border border-zinc-700/50 flex flex-col select-none">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-4 bg-zinc-950 rounded-full z-50" />

      {/* COMPONENTE INTELIGENTE DEL SOBRE (Baja al fondo z-10 cuando se abre) */}
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

      {/* CONTENIDO INTERIOR (Aparece al frente z-30 después de un ligero delay) */}
      <div className={`absolute inset-0 transition-all duration-1000 ${isOpen ? 'opacity-100 z-30 pointer-events-auto delay-300' : 'opacity-0 z-0 pointer-events-none'}`}>
        <div className="w-full h-full overflow-y-auto scrollbar-none bg-[#f4f4f2] relative">
          
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-10 right-4 z-50 bg-black/30 backdrop-blur-md text-white hover:bg-black/50 text-[9px] uppercase tracking-widest py-1.5 px-3 rounded-full font-medium transition-all"
          >
            ↩ Cerrar
          </button>
          
          <PearlElegance 
            evento={mockEvento} 
            invitado={mockInvitado} 
            onOpenRsvp={() => alert('El Pop-up de confirmación se abrirá aquí.')} 
          />
        </div>
      </div>
    </div>
  );
}