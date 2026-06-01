export interface EnvelopeConfig {
    color: string;
    waxSeal: string;
  }
  
  export interface HeaderBlock {
    coupleNames: string;
    welcomeText: string;
    coverPhoto: string;
  }
  
  export interface DressCodeBlock {
    style: 'Formal' | 'Semi-Formal' | 'Casual' | 'Custom';
    description: string;
  }
  
  export interface ItineraryItem {
    hora: string;
    actividad: string;
  }
  
  export interface CountdownBlock {
    enabled: boolean;
    message: string;
  }
  
  export interface TemplateEstilos {
    theme: string;
    typography: string;
    musicUrl: string;
    envelope: EnvelopeConfig;
  }
  
  export interface TemplateBloques {
    header: HeaderBlock;
    dressCode: DressCodeBlock;
    itinerary: ItineraryItem[];
    countdown: CountdownBlock;
  }
  
  // Este es el objeto global que salvaremos en la base de datos
  export interface InvitationTemplateState {
    estilos: TemplateEstilos;
    bloques: TemplateBloques;
  }

  export interface Asistente {
    id?: string;
    nombreCompleto: string;
    asiste: boolean;
    menuSeleccionado?: string;
    restricciones?: string;
  }
  
  export interface InvitadoPrincipal {
    id: string;
    eventId: string;
    codigoAcceso: string;
    nombreFamilia: string;
    pasesTotales: number;
    statusRSVP: 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';
    fechaConfirmacion?: string;
    observaciones?: string;
    asistentes?: Asistente[];
    createdAt: string;
    telefono: string;
  }