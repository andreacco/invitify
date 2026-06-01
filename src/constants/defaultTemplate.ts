import { InvitationTemplateState } from '@/types/invitation';

export const DEFAULT_TEMPLATE: InvitationTemplateState = {
  estilos: {
    theme: 'Provencal Lavender',
    typography: 'Tangerine',
    musicUrl: '',
    envelope: {
      color: 'Onyx',
      waxSeal: 'Lotus'
    }
  },
  bloques: {
    header: {
      coupleNames: 'Andrea & Jose',
      welcomeText: '¡Hola! Así es como funciona nuestro de software...',
      coverPhoto: '/vercel.svg' // Placeholder temporal
    },
    dressCode: {
      style: 'Formal',
      description: 'Traje largo para las damas y traje oscuro para los caballeros.'
    },
    itinerary: [
      { hora: '19:00', actividad: 'Ceremonia Eclesiástica' },
      { hora: '20:30', actividad: 'Recepción y Fiesta' }
    ],
    countdown: {
      enabled: true,
      message: 'The countdown is on!'
    }
  }
};