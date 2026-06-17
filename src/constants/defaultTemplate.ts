import { InvitationTemplateState } from '@/types/invitation';

export const DEFAULT_TEMPLATE: InvitationTemplateState = {
  estilos: {
    theme: 'Provencal Lavender',
    typography: 'Tangerine',
    musicUrl: '',
    envelope: {
      color: '#18181b',
      pattern: 'none',
      openingStyle: 'top',
      waxSealDesign: 'monogram',
      waxSealColor: '#b45309'
    }
  },
  bloques: {
    header: {
      enabled: true,
      coupleNames: 'Andrea & Jose',
      welcomeText: '¡Hola! Así es como funciona nuestro software...',
      coverPhoto: '/vercel.svg'
    },
    dressCode: {
      enabled: true,
      style: 'Formal',
      description: 'Traje largo para las damas y traje oscuro para los caballeros.'
    },
    itinerary: {
      enabled: true,
      items: [
        { hora: '19:00', actividad: 'Ceremonia Eclesiástica' },
        { hora: '20:30', actividad: 'Recepción y Fiesta' }
      ]
    },
    countdown: {
      enabled: true,
      message: 'The countdown is on!'
    }
  }
};