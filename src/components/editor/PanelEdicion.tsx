'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import { InvitationTemplateState, ItineraryItem, VenueItem } from '@/types/invitation';
import ImageUploader from '@/components/editor/ImageUploader';

interface PanelEdicionProps {
  template: InvitationTemplateState;
  setTemplate: Dispatch<SetStateAction<InvitationTemplateState>>;
}

export default function PanelEdicion({ template, setTemplate }: PanelEdicionProps) {
  const [activeTab, setActiveTab] = useState<'bloques' | 'sobres'>('bloques');
  const [openSection, setOpenSection] = useState<string | null>('header');
  
  // Estados para modales de edición compleja (Itinerario)
  const [editingEventIndex, setEditingEventIndex] = useState<number | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const updateBlock = (blockName: keyof typeof template.bloques, fields: any) => {
    setTemplate((prev: any) => ({
      ...prev,
      bloques: { ...prev.bloques, [blockName]: { ...prev.bloques[blockName], ...fields } }
    }));
  };

  // Funciones Itinerario (Timeline)
  const handleEventChange = (field: keyof ItineraryItem, value: string) => {
    if (editingEventIndex === null) return;
    const updated = [...(template.bloques.itinerary?.items || [])];
    updated[editingEventIndex] = { ...updated[editingEventIndex], [field]: value };
    updateBlock('itinerary', { items: updated });
  };
  
  const addEvent = () => {
    const newItems = [...(template.bloques.itinerary?.items || []), { hora: '00:00', actividad: 'Nuevo Evento' }];
    updateBlock('itinerary', { items: newItems });
    setEditingEventIndex(newItems.length - 1);
  };

  const removeEvent = (index: number) => {
    const updated = (template.bloques.itinerary?.items || []).filter((_, i) => i !== index);
    updateBlock('itinerary', { items: updated });
  };

  const moveEvent = (index: number, direction: 'up' | 'down') => {
    const items = [...(template.bloques.itinerary?.items || [])];
    if (direction === 'up' && index > 0) {
      [items[index - 1], items[index]] = [items[index], items[index - 1]];
    } else if (direction === 'down' && index < items.length - 1) {
      [items[index + 1], items[index]] = [items[index], items[index + 1]];
    }
    updateBlock('itinerary', { items });
  };

  // Funciones Direcciones (Venues)
  const addVenue = () => {
    const newVenues = [...(template.bloques.venues?.items || []), { id: Date.now().toString(), name: 'Nuevo Lugar', address: '', cityState: '', mapLink: '', enabled: true }];
    updateBlock('venues', { items: newVenues });
  };

  const updateVenue = (index: number, field: keyof VenueItem, value: any) => {
    const updated = [...(template.bloques.venues?.items || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateBlock('venues', { items: updated });
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button type="button" onClick={(e) => { e.stopPropagation(); onChange(); }} className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 shrink-0 ${checked ? 'bg-purple-600' : 'bg-zinc-700'}`}>
      <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );

  const AccordionHeader = ({ title, blockKey, isEnabled }: { title: string, blockKey: keyof typeof template.bloques, isEnabled: boolean }) => (
    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-900/50 transition-colors" onClick={() => toggleSection(blockKey)}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">{title}</h3>
      <div className="flex items-center gap-4">
        <span className="text-xs text-zinc-500">{openSection === blockKey ? '▲' : '▼'}</span>
        <ToggleSwitch checked={isEnabled} onChange={() => updateBlock(blockKey, { enabled: !isEnabled })} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100">
      <div className="flex border-b border-zinc-800 bg-zinc-900/80 sticky top-0 z-10">
        <button onClick={() => setActiveTab('bloques')} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'bloques' ? 'border-purple-500 text-purple-400 bg-purple-500/5' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}>Bloques</button>
        <button onClick={() => setActiveTab('sobres')} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'sobres' ? 'border-purple-500 text-purple-400 bg-purple-500/5' : 'border-transparent text-zinc-400 hover:text-zinc-200'}`}>Sobres</button>
      </div>

      <div className="flex-1 overflow-y-auto select-none">
        {activeTab === 'bloques' && (
          <div className="divide-y divide-zinc-800">
            
            {/* 1. NOMBRES Y PORTADA */}
            <div className={`transition-opacity duration-300 ${template.bloques.header?.enabled !== false ? 'opacity-100' : 'opacity-40'}`}>
              <AccordionHeader title="1. Nombres de la Pareja" blockKey="header" isEnabled={template.bloques.header?.enabled !== false} />
              {openSection === 'header' && (
                <div className="p-4 pt-0 space-y-4">
                  <ImageUploader currentImageUrl={template.bloques.header.coverPhoto || ''} onUploadSuccess={(url) => updateBlock('header', { coverPhoto: url })} />
                  <input type="text" placeholder="Encabezado (Ej. Nuestra Boda)" value={template.bloques.header.welcomeText || ''} onChange={(e) => updateBlock('header', { welcomeText: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm" />
                  <input type="text" placeholder="Nombres (Ej. Andrea & Jose)" value={template.bloques.header.coupleNames || ''} onChange={(e) => updateBlock('header', { coupleNames: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm" />
                  <input type="text" placeholder="Subtítulo 1" value={template.bloques.header.subtitle1 || ''} onChange={(e) => updateBlock('header', { subtitle1: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm" />
                  <input type="text" placeholder="Subtítulo 2" value={template.bloques.header.subtitle2 || ''} onChange={(e) => updateBlock('header', { subtitle2: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm" />
                </div>
              )}
            </div>

            {/* 2. RSVP FORM OPTIONS */}
            <div className={`transition-opacity duration-300 ${template.bloques.rsvpForm?.enabled !== false ? 'opacity-100' : 'opacity-40'}`}>
              <AccordionHeader title="2. Opciones de RSVP" blockKey="rsvpForm" isEnabled={template.bloques.rsvpForm?.enabled !== false} />
              {openSection === 'rsvpForm' && (
                <div className="p-4 pt-0 space-y-4">
                  {[
                    { key: 'askDietary', label: 'Restricciones alimentarias' },
                    { key: 'askAccommodation', label: 'Necesidad de alojamiento' },
                    { key: 'askEvents', label: 'Participación en eventos' },
                    { key: 'askTransportation', label: 'Necesidad de transporte' },
                    { key: 'askSong', label: 'Sugerencia de canción' },
                    { key: 'askChildren', label: 'Asistencia de niños' }
                  ].map((opt) => (
                    <div key={opt.key} className="flex justify-between items-center bg-zinc-900 p-3 rounded-lg">
                      <span className="text-xs text-zinc-300">{opt.label}</span>
                      <ToggleSwitch checked={!!(template.bloques.rsvpForm as any)?.[opt.key]} onChange={() => updateBlock('rsvpForm', { [opt.key]: !(template.bloques.rsvpForm as any)?.[opt.key] })} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. FECHA Y HORA */}
            <div className={`transition-opacity duration-300 ${template.bloques.dateTime?.enabled !== false ? 'opacity-100' : 'opacity-40'}`}>
              <AccordionHeader title="3. Fecha y Hora" blockKey="dateTime" isEnabled={template.bloques.dateTime?.enabled !== false} />
              {openSection === 'dateTime' && (
                <div className="p-4 pt-0 space-y-4">
                  <input type="date" value={template.bloques.dateTime?.date || ''} onChange={(e) => updateBlock('dateTime', { date: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm" />
                  <div className="flex gap-2">
                    <input type="time" value={template.bloques.dateTime?.time || ''} onChange={(e) => updateBlock('dateTime', { time: e.target.value })} className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm" />
                    <select value={template.bloques.dateTime?.timeFormat || '12h'} onChange={(e) => updateBlock('dateTime', { timeFormat: e.target.value })} className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm">
                      <option value="12h">12H</option>
                      <option value="24h">24H</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center bg-zinc-900 p-3 rounded-lg">
                    <span className="text-xs text-zinc-300">Botón "Añadir a Calendario"</span>
                    <ToggleSwitch checked={template.bloques.dateTime?.showAddToCalendar !== false} onChange={() => updateBlock('dateTime', { showAddToCalendar: !(template.bloques.dateTime?.showAddToCalendar !== false) })} />
                  </div>
                </div>
              )}
            </div>

            {/* 4. DIRECCIONES (VENUES) */}
            <div className={`transition-opacity duration-300 ${template.bloques.venues?.enabled !== false ? 'opacity-100' : 'opacity-40'}`}>
              <AccordionHeader title="4. Direcciones" blockKey="venues" isEnabled={template.bloques.venues?.enabled !== false} />
              {openSection === 'venues' && (
                <div className="p-4 pt-0 space-y-6">
                  {(template.bloques.venues?.items || []).map((venue, idx) => (
                    <div key={idx} className={`space-y-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg relative ${!venue.enabled ? 'opacity-50' : ''}`}>
                      <div className="flex justify-between items-center mb-2">
                        <ToggleSwitch checked={!!venue.enabled} onChange={() => updateVenue(idx, 'enabled', !venue.enabled)} />
                        <button type="button" onClick={() => { const items = [...(template.bloques.venues?.items || [])]; items.splice(idx, 1); updateBlock('venues', { items }); }} className="text-red-400 text-xs">Eliminar</button>
                      </div>
                      <input type="text" placeholder="Nombre (Ej. Salón principal)" value={venue.name} onChange={(e) => updateVenue(idx, 'name', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm" />
                      <input type="text" placeholder="Dirección" value={venue.address} onChange={(e) => updateVenue(idx, 'address', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm" />
                      <input type="text" placeholder="Ciudad y Estado" value={venue.cityState} onChange={(e) => updateVenue(idx, 'cityState', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm" />
                      <input type="text" placeholder="Link Google Maps" value={venue.mapLink} onChange={(e) => updateVenue(idx, 'mapLink', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm" />
                      <ImageUploader currentImageUrl={venue.photoUrl || ''} onUploadSuccess={(url) => updateVenue(idx, 'photoUrl', url)} />
                    </div>
                  ))}
                  <button type="button" onClick={addVenue} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-white transition-colors">+ Añadir Dirección</button>
                </div>
              )}
            </div>

            {/* 5. TIMELINE (ITINERARIO) */}
            <div className={`transition-opacity duration-300 ${template.bloques.itinerary?.enabled !== false ? 'opacity-100' : 'opacity-40'}`}>
              <AccordionHeader title="5. Timeline del Evento" blockKey="itinerary" isEnabled={template.bloques.itinerary?.enabled !== false} />
              {openSection === 'itinerary' && (
                <div className="p-4 pt-0 space-y-2">
                  {(template.bloques.itinerary?.items || []).map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-zinc-900 p-2 border border-zinc-800 rounded-lg">
                      <div className="flex flex-col gap-1">
                        <button type="button" onClick={() => moveEvent(idx, 'up')} className="text-zinc-500 hover:text-white">▲</button>
                        <button type="button" onClick={() => moveEvent(idx, 'down')} className="text-zinc-500 hover:text-white">▼</button>
                      </div>
                      <div className="flex-1 text-sm text-zinc-300">
                        <p><strong>{item.hora}</strong> - {item.actividad}</p>
                      </div>
                      <button type="button" onClick={() => setEditingEventIndex(idx)} className="text-purple-400 text-xs px-2 hover:underline">Editar</button>
                      <button type="button" onClick={() => removeEvent(idx)} className="text-red-400 text-xs font-bold px-2">✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={addEvent} className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-white transition-colors mt-4">+ Añadir Evento</button>
                </div>
              )}
            </div>

            {/* 6. PADRES Y PADRINOS */}
            <div className={`transition-opacity duration-300 ${template.bloques.parents?.enabled !== false ? 'opacity-100' : 'opacity-40'}`}>
              <AccordionHeader title="6. Padres y Padrinos" blockKey="parents" isEnabled={template.bloques.parents?.enabled !== false} />
              {openSection === 'parents' && (
                <div className="p-4 pt-0 space-y-4">
                  <input type="text" placeholder="Mensaje (Ej. Con la bendición de...)" value={template.bloques.parents?.description || ''} onChange={(e) => updateBlock('parents', { description: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm" />
                  <input type="text" placeholder="Padres de la novia" value={template.bloques.parents?.brideParents || ''} onChange={(e) => updateBlock('parents', { brideParents: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm" />
                  <input type="text" placeholder="Padres del novio" value={template.bloques.parents?.groomParents || ''} onChange={(e) => updateBlock('parents', { groomParents: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm" />
                </div>
              )}
            </div>

            {/* 7. DRESS CODE */}
            <div className={`transition-opacity duration-300 ${template.bloques.dressCode?.enabled !== false ? 'opacity-100' : 'opacity-40'}`}>
              <AccordionHeader title="7. Dress Code" blockKey="dressCode" isEnabled={template.bloques.dressCode?.enabled !== false} />
              {openSection === 'dressCode' && (
                <div className="p-4 pt-0 space-y-4">
                  <input type="text" placeholder="Estilo (Ej. Formal)" value={template.bloques.dressCode?.style || ''} onChange={(e) => updateBlock('dressCode', { style: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm" />
                  <textarea placeholder="Descripción" value={template.bloques.dressCode?.description || ''} onChange={(e) => updateBlock('dressCode', { description: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm min-h-[60px]" />
                </div>
              )}
            </div>

            {/* 8. CUENTA REGRESIVA */}
            <div className={`transition-opacity duration-300 ${template.bloques.countdown?.enabled !== false ? 'opacity-100' : 'opacity-40'}`}>
              <AccordionHeader title="8. Cuenta Regresiva" blockKey="countdown" isEnabled={template.bloques.countdown?.enabled !== false} />
              {openSection === 'countdown' && (
                <div className="p-4 pt-0 space-y-4">
                  <input type="text" placeholder="Mensaje (Ej. Ya casi llega el día)" value={template.bloques.countdown?.message || ''} onChange={(e) => updateBlock('countdown', { message: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm" />
                  <p className="text-[10px] text-zinc-500">El contador automático tomará la Fecha configurada en el paso 3.</p>
                </div>
              )}
            </div>

            {/* 9. MENU DE COMIDA */}
            <div className={`transition-opacity duration-300 ${template.bloques.menu?.enabled !== false ? 'opacity-100' : 'opacity-40'}`}>
              <AccordionHeader title="9. Menú de Comida" blockKey="menu" isEnabled={template.bloques.menu?.enabled !== false} />
              {openSection === 'menu' && (
                <div className="p-4 pt-0 space-y-4">
                  <textarea placeholder="Detalles del menú (próximamente estructura completa)" value={template.bloques.menu?.description || ''} onChange={(e) => updateBlock('menu', { description: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm min-h-[60px]" />
                </div>
              )}
            </div>

            {/* 10. MENSAJE DE CIERRE */}
            <div className={`transition-opacity duration-300 ${template.bloques.closingMessage?.enabled !== false ? 'opacity-100' : 'opacity-40'}`}>
              <AccordionHeader title="10. Mensaje de Cierre" blockKey="closingMessage" isEnabled={template.bloques.closingMessage?.enabled !== false} />
              {openSection === 'closingMessage' && (
                <div className="p-4 pt-0 space-y-4">
                  <textarea placeholder="Mensaje final (Ej. ¡Los esperamos!)" value={template.bloques.closingMessage?.message || ''} onChange={(e) => updateBlock('closingMessage', { message: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm min-h-[80px]" />
                </div>
              )}
            </div>

            {/* 11. RSVP DETALLES */}
            <div className={`transition-opacity duration-300 ${template.bloques.rsvpDetails?.enabled !== false ? 'opacity-100' : 'opacity-40'}`}>
              <AccordionHeader title="11. Detalles RSVP" blockKey="rsvpDetails" isEnabled={template.bloques.rsvpDetails?.enabled !== false} />
              {openSection === 'rsvpDetails' && (
                <div className="p-4 pt-0 space-y-4">
                  <input type="text" placeholder="Ej. Confirma antes del:" value={template.bloques.rsvpDetails?.rsvpByText || ''} onChange={(e) => updateBlock('rsvpDetails', { rsvpByText: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm" />
                  <input type="date" value={template.bloques.rsvpDetails?.deadlineDate || ''} onChange={(e) => updateBlock('rsvpDetails', { deadlineDate: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm" />
                  <input type="tel" placeholder="Teléfono para dudas" value={template.bloques.rsvpDetails?.contactPhone || ''} onChange={(e) => updateBlock('rsvpDetails', { contactPhone: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm" />
                </div>
              )}
            </div>

            {/* 12. REGALOS */}
            <div className={`transition-opacity duration-300 ${template.bloques.gifts?.enabled !== false ? 'opacity-100' : 'opacity-40'}`}>
              <AccordionHeader title="12. Mesa de Regalos" blockKey="gifts" isEnabled={template.bloques.gifts?.enabled !== false} />
              {openSection === 'gifts' && (
                <div className="p-4 pt-0 space-y-4">
                  <textarea placeholder="Condiciones y detalles (Ej. Lluvia de sobres o link a mesa de regalos)" value={template.bloques.gifts?.message || ''} onChange={(e) => updateBlock('gifts', { message: e.target.value })} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm min-h-[80px]" />
                </div>
              )}
            </div>

          </div>
        )}

        {/* CONTENIDO DE LA PESTAÑA DE SOBRES MANTENIDO INTACTO */}
        {activeTab === 'sobres' && (
          <div className="space-y-8 animate-in fade-in duration-200 pb-10 p-4">
            
            {/* 1. SELECCIÓN DEL COLOR DEL SOBRE */}
            <div className="space-y-4">
              <div className="flex flex-col">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Color del Sobre</h3>
                <p className="text-[11px] text-zinc-500 font-light mt-0.5">Elige el color exterior del empaque.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-800 shadow-md shrink-0">
                  <input
                    type="color"
                    value={template.estilos.envelope.color || '#18181b'}
                    onChange={(e) => setTemplate(prev => ({
                      ...prev, estilos: { ...prev.estilos, envelope: { ...prev.estilos.envelope, color: e.target.value } }
                    }))}
                    className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer"
                  />
                   </div>
                <input
                  type="text"
                  value={template.estilos.envelope.color || '#18181b'}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev, estilos: { ...prev.estilos, envelope: { ...prev.estilos.envelope, color: e.target.value } }
                  }))}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100 uppercase font-mono"
                  maxLength={7}
                />
              </div>
                </div>

            <hr className="border-zinc-800" />
              {/* 2. PATRÓN DE FONDO Y APERTURA */}
            <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Textura / Patrón</label>
                <select
                  value={template.estilos.envelope.pattern || 'none'}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev, estilos: { ...prev.estilos, envelope: { ...prev.estilos.envelope, pattern: e.target.value as any } }
                  }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-2 text-xs text-zinc-100"
                >
                  <option value="none">Liso (Sin textura)</option>
                  <option value="botanical">Hojas Botánicas</option>
                  <option value="floral">Puntos Florales</option>
                  <option value="wheat">Espigas de Trigo</option>
                  {/* 👇 NUEVA OPCIÓN PREMIUM 👇 */}
                  <option value="real">Patrón Real (Grabado)</option>
                </select>
              </div>
               <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Estilo de Apertura</label>
                <select
                  value={template.estilos.envelope.openingStyle || 'top'}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev, estilos: { ...prev.estilos, envelope: { ...prev.estilos.envelope, openingStyle: e.target.value as any } }
                  }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-2 text-xs text-zinc-100"
                >
                  <option value="top">Solapa Superior (Clásica)</option>
                  <option value="middle">Apertura Central</option>
                  <option value="left">Solapa Izquierda</option>
                  <option value="right">Solapa Derecha</option>
                  <option value="vertical">Apertura Vertical Asimétrica (Premium)</option>
                </select>
              </div>
               </div>

            <hr className="border-zinc-800" />
             {/* 3. SELECCIÓN DEL SELLO DE CERA */}
            <div className="space-y-4">
              <div className="flex flex-col">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Sello de Cera</h3>
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider w-24">Color del Sello:</label>
                <input
                  type="color"
                  value={template.estilos.envelope.waxSealColor || '#b45309'}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev, estilos: { ...prev.estilos, envelope: { ...prev.estilos.envelope, waxSealColor: e.target.value } }
                  }))}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                />
              </div>
               <div className="space-y-2.5">
                {[
                  { id: 'monogram', name: 'Monograma', desc: 'Iniciales clásicas entrelazadas' },
                  { id: 'shield', name: 'Escudo Heráldico', desc: 'Escudo real con iniciales' },
                  { id: 'rose', name: 'Rosa de Castilla', desc: 'Símbolo romántico clásico' },
                  { id: 'lotus', name: 'Flor de Loto', desc: 'Elegancia orgánica' },
                  { id: 'eucalyptus', name: 'Rama de Eucalipto', desc: 'Estilo botánico moderno' },
                  { id: 'blank', name: 'Liso', desc: 'Sello de cera sin relieve' },
                  { id: 'custom', name: 'Sello Original PNG', desc: 'Sello transparente cargado' }
                ].map((seal) => (
                  <button
                    key={seal.id}
                    type="button"
                    onClick={() => setTemplate(prev => ({
                      ...prev, estilos: { ...prev.estilos, envelope: { ...prev.estilos.envelope, waxSealDesign: seal.id as any } }
                    }))}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                      template.estilos.envelope.waxSealDesign === seal.id
                        ? 'border-purple-500 bg-purple-500/5 text-purple-400'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-zinc-200">{seal.name}</span>
                      <span className="text-[10px] text-zinc-500 font-light">{seal.desc}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                      template.estilos.envelope.waxSealDesign === seal.id ? 'border-purple-500 bg-purple-600' : 'border-zinc-700'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
            </div>
        )}
      </div>


      {/* MODAL PARA EDITAR EVENTO DEL TIMELINE */}
      {editingEventIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-sm border border-zinc-700 space-y-4">
            <h3 className="text-white font-bold">Editar Evento</h3>
            <div className="space-y-3">
              <input type="time" value={template.bloques.itinerary?.items?.[editingEventIndex]?.hora || ''} onChange={(e) => handleEventChange('hora', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100" />
              <input type="text" placeholder="Nombre (Ej. Ceremonia)" value={template.bloques.itinerary?.items?.[editingEventIndex]?.actividad || ''} onChange={(e) => handleEventChange('actividad', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100" />
              <input type="text" placeholder="Ubicación (Opcional)" value={template.bloques.itinerary?.items?.[editingEventIndex]?.ubicacion || ''} onChange={(e) => handleEventChange('ubicacion', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100" />
              <ImageUploader currentImageUrl={template.bloques.itinerary?.items?.[editingEventIndex]?.photoUrl || ''} onUploadSuccess={(url) => handleEventChange('photoUrl', url)} />
            </div>
            <button type="button" onClick={() => setEditingEventIndex(null)} className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded font-bold text-white transition-colors">Guardar Evento</button>
          </div>
        </div>
      )}
    </div>
  );
}