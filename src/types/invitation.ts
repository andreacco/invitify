export interface EnvelopeConfig {
  color: string; // Color base del sobre (ej. '#1e293b' o 'bg-zinc-900')
  pattern: 'none' | 'floral' | 'botanical' | 'wheat'; // Patrón de fondo SVG
  openingStyle: 'top' | 'middle' | 'left' | 'right'; // Hacia dónde abre la solapa
  waxSealDesign: 'lotus' | 'monogram' | 'eucalyptus' | 'rose' | 'blank'; // Diseño del sello SVG
  waxSealColor: string; // Color del sello (ej. '#b45309')
}
  
  export interface HeaderBlock {
    enabled?: boolean; // <-- NUEVO
    coupleNames: string;
    welcomeText: string;
    coverPhoto: string;
  }
  
  export interface DressCodeBlock {
    enabled?: boolean; // <-- NUEVO
    style: 'Formal' | 'Semi-Formal' | 'Casual' | 'Custom';
    description: string;
  }
  
  export interface ItineraryItem {
    hora: string;
    actividad: string;
  }

  // <-- NUEVA INTERFAZ PARA EL ITINERARIO -->
  export interface ItineraryBlock {
    enabled?: boolean;
    items: ItineraryItem[];
  }
  
  export interface CountdownBlock {
    enabled: boolean;
    message: string;
  }
  
  // ... (TemplateEstilos se queda igual) ...
  
  export interface TemplateEstilos {
    theme: string;
    typography: string;
    musicUrl: string;
    envelope: EnvelopeConfig;
  }
  
  export interface TemplateBloques {
    header: HeaderBlock;
    dressCode: DressCodeBlock;
    itinerary: ItineraryBlock; // <-- AHORA ES UN OBJETO, NO UN ARRAY
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