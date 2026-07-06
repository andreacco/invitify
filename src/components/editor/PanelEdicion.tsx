'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import {
  CountdownBlock,
  DressCodeBlock,
  HeaderBlock,
  InvitationTemplateState,
  ItineraryItem,
} from '@/types/invitation';
import ImageUploader from '@/components/editor/ImageUploader';

interface PanelEdicionProps {
  template: InvitationTemplateState;
  setTemplate: Dispatch<SetStateAction<InvitationTemplateState>>;
}

export default function PanelEdicion({ template, setTemplate }: PanelEdicionProps) {
  // Estado para controlar qué pestaña está activa en el panel lateral
  const [activeTab, setActiveTab] = useState<'bloques' | 'sobres'>('bloques');

  // Funciones utilitarias para actualizar sub-estados de forma limpia
  const updateHeader = (fields: Partial<HeaderBlock>) => {
    setTemplate((prev: InvitationTemplateState) => ({
      ...prev,
      bloques: {
        ...prev.bloques,
        header: { ...prev.bloques.header, ...fields }
      }
    }));
  };

  const updateDressCode = (fields: Partial<DressCodeBlock>) => {
    setTemplate((prev: InvitationTemplateState) => ({
      ...prev,
      bloques: {
        ...prev.bloques,
        dressCode: { ...prev.bloques.dressCode, ...fields }
      }
    }));
  };

  const updateCountdown = (fields: Partial<CountdownBlock>) => {
    setTemplate((prev: InvitationTemplateState) => ({
      ...prev,
      bloques: {
        ...prev.bloques,
        countdown: { ...prev.bloques.countdown, ...fields }
      }
    }));
  };

  const updateItineraryConfig = (enabled: boolean) => {
    setTemplate((prev) => ({
      ...prev,
      bloques: { ...prev.bloques, itinerary: { ...prev.bloques.itinerary, enabled } }
    }));
  };

  const handleItineraryChange = (index: number, field: keyof ItineraryItem, value: string) => {
    const updatedItems = [...(template.bloques.itinerary.items || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setTemplate((prev) => ({
      ...prev, bloques: { ...prev.bloques, itinerary: { ...prev.bloques.itinerary, items: updatedItems } }
    }));
  };

  const addItineraryItem = () => {
    const newItem: ItineraryItem = { hora: '00:00', actividad: 'Nueva Actividad' };
    setTemplate((prev) => ({
      ...prev, bloques: { ...prev.bloques, itinerary: { ...prev.bloques.itinerary, items: [...(prev.bloques.itinerary.items || []), newItem] } }
    }));
  };

  const removeItineraryItem = (index: number) => {
    setTemplate((prev) => ({
      ...prev, bloques: { ...prev.bloques, itinerary: { ...prev.bloques.itinerary, items: (prev.bloques.itinerary.items || []).filter((_, i) => i !== index) } }
    }));
  };

  // Helper para dibujar el switch de Tailwind
  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button type="button" onClick={onChange} className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 shrink-0 ${checked ? 'bg-purple-600' : 'bg-zinc-700'}`}>
      <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-zinc-800 bg-zinc-900/80 sticky top-0 z-10">
        <button onClick={() => setActiveTab('bloques')} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'bloques' ? 'border-purple-500 text-purple-400 bg-purple-500/5' : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}>Contenido (Bloques)</button>
        <button onClick={() => setActiveTab('sobres')} className={`flex-1 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'sobres' ? 'border-purple-500 text-purple-400 bg-purple-500/5' : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}>Sobre y Sellos</button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-8 select-none">
        {activeTab === 'bloques' && (
          <>
            {/* SECCIÓN 1: BIENVENIDA Y PORTADA */}
            <div className={`space-y-4 transition-opacity duration-300 ${template.bloques.header.enabled !== false ? 'opacity-100' : 'opacity-40 grayscale-[50%]'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Bloque de Portada</h3>
                <ToggleSwitch checked={template.bloques.header.enabled !== false} onChange={() => updateHeader({ enabled: !(template.bloques.header.enabled !== false) })} />
              </div>
              <ImageUploader currentImageUrl={template.bloques.header.coverPhoto} onUploadSuccess={(url) => updateHeader({ coverPhoto: url })} />
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Nombres en la Invitación</label>
                <input type="text" value={template.bloques.header.coupleNames} onChange={(e) => updateHeader({ coupleNames: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none" />
              </div>
            </div>

            <hr className="border-zinc-800" />

            {/* SECCIÓN 2: DRESS CODE */}
            <div className={`space-y-4 transition-opacity duration-300 ${template.bloques.dressCode.enabled !== false ? 'opacity-100' : 'opacity-40 grayscale-[50%]'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Código de Vestimenta</h3>
                <ToggleSwitch checked={template.bloques.dressCode.enabled !== false} onChange={() => updateDressCode({ enabled: !(template.bloques.dressCode.enabled !== false) })} />
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {(['Formal', 'Semi-Formal', 'Casual', 'Custom'] as const).map((style) => (
                    <button key={style} type="button" onClick={() => updateDressCode({ style })} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${template.bloques.dressCode.style === style ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-zinc-800 bg-zinc-950 text-zinc-400'}`}>{style}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Detalles</label>
                <input type="text" value={template.bloques.dressCode.description} onChange={(e) => updateDressCode({ description: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none" />
              </div>
            </div>

            <hr className="border-zinc-800" />

            {/* SECCIÓN 3: CUENTA REGRESIVA */}
            <div className={`space-y-4 transition-opacity duration-300 ${template.bloques.countdown.enabled ? 'opacity-100' : 'opacity-40 grayscale-[50%]'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Cuenta Regresiva</h3>
                <ToggleSwitch checked={template.bloques.countdown.enabled} onChange={() => updateCountdown({ enabled: !template.bloques.countdown.enabled })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Mensaje del Contador</label>
                <input type="text" value={template.bloques.countdown.message} onChange={(e) => updateCountdown({ message: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none" />
              </div>
            </div>

            <hr className="border-zinc-800" />

            {/* SECCIÓN 4: ITINERARIO DINÁMICO */}
            <div className={`space-y-4 transition-opacity duration-300 ${template.bloques.itinerary?.enabled !== false ? 'opacity-100' : 'opacity-40 grayscale-[50%]'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Itinerario del Día</h3>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={addItineraryItem} className="text-xs text-purple-400 hover:text-purple-300 font-medium">+ Evento</button>
                  <ToggleSwitch checked={template.bloques.itinerary?.enabled !== false} onChange={() => updateItineraryConfig(!(template.bloques.itinerary?.enabled !== false))} />
                </div>
              </div>

              <div className="space-y-3">
                {(template.bloques.itinerary.items || []).map((item: ItineraryItem, index: number) => (
                  <div key={index} className="flex gap-2 items-center bg-zinc-950 p-3 border border-zinc-800 rounded-xl relative">
                    <input type="text" value={item.hora} onChange={(e) => handleItineraryChange(index, 'hora', e.target.value)} className="w-16 text-center bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-100 focus:outline-none" />
                    <input type="text" value={item.actividad} onChange={(e) => handleItineraryChange(index, 'actividad', e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1 text-xs text-zinc-100 focus:outline-none" />
                    <button type="button" onClick={() => removeItineraryItem(index)} className="text-zinc-500 hover:text-red-400 text-xs px-1">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

{activeTab === 'sobres' && (
          <div className="space-y-8 animate-in fade-in duration-200 pb-10">
            
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
    </div>
  );
}