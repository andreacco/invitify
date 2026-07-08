  export interface EnvelopeConfig {
    color: string;
    pattern: 'none' | 'floral' | 'botanical' | 'wheat' | 'real'; 
    openingStyle: 'top' | 'middle' | 'left' | 'right' | 'vertical'; // 👈 NUEVO
    waxSealDesign: 'lotus' | 'monogram' | 'eucalyptus' | 'rose' | 'blank' | 'shield' | 'custom'; // 👈 NUEVO
    waxSealColor: string;
  }

export interface HeaderBlock {
  enabled?: boolean;
  coverPhoto?: string;
  coupleNames?: string;
  welcomeText?: string;
  subtitle1?: string;
  subtitle2?: string;
  showGuestName?: boolean; // 👈 NUEVO: Para el saludo
}

export interface RsvpFormBlock {
  enabled?: boolean;
  askDietary?: boolean;
  askAccommodation?: boolean;
  askEvents?: boolean;
  askTransportation?: boolean;
  askSong?: boolean;
  askChildren?: boolean;
}

export interface DateTimeBlock {
  enabled?: boolean;
  date?: string;
  time?: string;
  timeFormat?: '12h' | '24h';
  showAddToCalendar?: boolean;
}

export interface VenueItem {
  id: string;
  name: string;
  address: string;
  cityState: string;
  mapLink: string;
  photoUrl?: string;
  enabled?: boolean;
}

export interface VenuesBlock {
  enabled?: boolean;
  items?: VenueItem[];
}

export interface ItineraryItem {
  id?: string;
  hora: string;
  actividad: string;
  ubicacion?: string;
  photoUrl?: string;
}

export interface ItineraryBlock {
  enabled?: boolean;
  items?: ItineraryItem[];
}

export interface ParentsBlock {
  enabled?: boolean;
  brideParents?: string;
  groomParents?: string;
  description?: string;
}

export interface DressCodeBlock {
  enabled?: boolean;
  style?: string;
  description?: string;
}

export interface CountdownBlock {
  enabled?: boolean;
  message?: string;
}

export interface MenuBlock {
  enabled?: boolean;
  description?: string;
}

export interface ClosingMessageBlock {
  enabled?: boolean;
  message?: string;
}

export interface RsvpDetailsBlock {
  enabled?: boolean;
  rsvpByText?: string;
  deadlineDate?: string;
  contactPhone?: string;
}

export interface GiftsBlock {
  enabled?: boolean;
  message?: string;
}

export interface MusicBlock {
  mp3Url?: string;
}

export interface TemplateBloques {
  header: HeaderBlock;
  rsvpForm?: RsvpFormBlock;
  dateTime?: DateTimeBlock;
  venues?: VenuesBlock;
  itinerary: ItineraryBlock;
  parents?: ParentsBlock;
  dressCode: DressCodeBlock;
  countdown: CountdownBlock;
  menu?: MenuBlock;
  closingMessage?: ClosingMessageBlock;
  rsvpDetails?: RsvpDetailsBlock;
  gifts?: GiftsBlock;
  music?: MusicBlock; // 👈 NUEVO
}

export interface InvitationTemplateState {
  estilos: any;
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