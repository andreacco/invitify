export interface EnvelopeConfig {
  color: string; // Color base del sobre (ej. '#1e293b' o 'bg-zinc-900')
  pattern: 'none' | 'floral' | 'botanical' | 'wheat'; // Patrón de fondo SVG
  openingStyle: 'top' | 'middle' | 'left' | 'right'; // Hacia dónde abre la solapa
  waxSealDesign: 'lotus' | 'monogram' | 'eucalyptus' | 'rose' | 'blank'; // Diseño del sello SVG
  waxSealColor: string; // Color del sello (ej. '#b45309')
}
  
¡Totalmente de acuerdo! Como CTO, considero que el Autoguardado (Auto-save) y el principio WYSIWYG (What You See Is What You Get) son innegociables en un editor premium. Si un usuario se queda sin luz o internet, perder su diseño arruina la confianza en el producto.

Además, poder apagar y encender bloques le da libertad total al usuario para armar una invitación tan sencilla o tan detallada como necesite.

Vamos a implementar esto de forma robusta. Haremos que tu base de datos migre los datos antiguos automáticamente al vuelo y aplicaremos un debounce de 1.5 segundos para que la base de datos se guarde silenciosamente mientras el usuario escribe.

Sigue estos 4 pasos exactos (copia y pega).

1️⃣ Actualizar los Tipos y el Default Template
Le enseñaremos al sistema que ahora todos los bloques tienen un "switch" de encendido/apagado.

Abre src/types/invitation.ts y actualiza las interfaces de la línea 10 a la 33 para que incluyan el enabled:

TypeScript
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