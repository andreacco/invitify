'use client';

import { InvitationTemplateState } from '@/types/invitation';
import EnvelopeWrapper from '../invitation/EnvelopeWrapper';

interface Props {
  template: InvitationTemplateState;
}

export default function SimuladorMovil({ template }: Props) {
  // Construimos una invitación falsa (MOCK) pero compatible con el modelo real
  const mockInvitacion = {
    event: {
      fecha: '2026-08-01T15:00:00Z',
      ubicacionCeremonia: 'Catedral Principal',
      ubicacionRecepcion: 'Hacienda La Vega',
      colorPrincipal: template.estilos?.envelope?.color || '#d4af37',
      template: template 
    },
    asistentes: [],
    paseDigital: null,
    codigoAcceso: 'demo-simulador',
    observaciones: ''
  };

  return (
    <div className="relative mx-auto w-[360px] h-[740px] bg-zinc-900 rounded-[48px] shadow-[0_0_0_12px_#27272a] shadow-2xl overflow-hidden border border-zinc-700/50 flex flex-col select-none">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-4 bg-zinc-950 rounded-full z-50" />
      
      {/* ¡Renderizamos directamente el componente base de la App! */}
      <div className="w-full h-full rounded-[48px] overflow-hidden relative">
        <EnvelopeWrapper invitacion={mockInvitacion} />
      </div>
    </div>
  );
}