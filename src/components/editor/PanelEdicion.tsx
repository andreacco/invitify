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
  const [activeTab, setActiveTab] = useState<'bloques' | 'sobres' | 'plantillas'>('bloques');

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

  const handleItineraryChange = (index: number, field: keyof ItineraryItem, value: string) => {
    const updatedItinerary = [...template.bloques.itinerary];
    updatedItinerary[index] = { ...updatedItinerary[index], [field]: value };
    
    setTemplate((prev: InvitationTemplateState) => ({
      ...prev,
      bloques: { ...prev.bloques, itinerary: updatedItinerary }
    }));
  };

  const addItineraryItem = () => {
    const newItem: ItineraryItem = { hora: '00:00', actividad: 'Nueva Actividad' };
    setTemplate((prev: InvitationTemplateState) => ({
      ...prev,
      bloques: {
        ...prev.bloques,
        itinerary: [...prev.bloques.itinerary, newItem],
      },
    }));
  };

  const removeItineraryItem = (index: number) => {
    setTemplate((prev: InvitationTemplateState) => ({
      ...prev,
      bloques: {
        ...prev.bloques,
        itinerary: prev.bloques.itinerary.filter(
          (_item: ItineraryItem, i: number) => i !== index
        ),
      },
    }));
  };

  return (
    <div className="h-full flex flex-col w-full">
      {/* Selector de Pestañas */}
      <div className="flex border-b border-zinc-800 bg-zinc-900/80 sticky top-0 z-10 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('bloques')}
          className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'bloques'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          Bloques
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sobres')}
          className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'sobres'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          Sobre y Sellos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('plantillas')}
          className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'plantillas'
              ? 'border-purple-500 text-purple-400 bg-purple-500/5'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          Plantillas
        </button>
      </div>

      {/* Contenido de las Pestañas (AQUÍ ESTÁ EL FIX DEL SCROLL) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 select-none">
        
        {activeTab === 'bloques' && (
          <div className="space-y-8 animate-in fade-in duration-200 pb-10">
            {/* SECCIÓN 1: BIENVENIDA Y PORTADA */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Bloque de Portada</h3>
              <ImageUploader 
                currentImageUrl={template.bloques.header.coverPhoto}
                onUploadSuccess={(url) => updateHeader({ coverPhoto: url })}
              />
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Nombres en la Invitación</label>
                <input
                  type="text"
                  value={template.bloques.header.coupleNames}
                  onChange={(e) => updateHeader({ coupleNames: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Texto de Bienvenida</label>
                <textarea
                  value={template.bloques.header.welcomeText}
                  onChange={(e) => updateHeader({ welcomeText: e.target.value })}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <hr className="border-zinc-800" />

            {/* SECCIÓN 2: DRESS CODE */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Código de Vestimenta (Dress Code)</h3>
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Estilo de Etiqueta</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Formal', 'Semi-Formal', 'Casual', 'Custom'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => updateDressCode({ style })}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        template.bloques.dressCode.style === style
                          ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Instrucciones o Detalles</label>
                <input
                  type="text"
                  value={template.bloques.dressCode.description}
                  onChange={(e) => updateDressCode({ description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <hr className="border-zinc-800" />

            {/* SECCIÓN 3: CUENTA REGRESIVA */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Cuenta Regresiva</h3>
                <input
                  type="checkbox"
                  checked={template.bloques.countdown.enabled}
                  onChange={(e) => updateCountdown({ enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600 bg-zinc-950 border-zinc-800 focus:ring-purple-500 accent-purple-500 cursor-pointer"
                />
              </div>
              {template.bloques.countdown.enabled && (
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400">Mensaje del Contador</label>
                  <input
                    type="text"
                    value={template.bloques.countdown.message}
                    onChange={(e) => updateCountdown({ message: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              )}
            </div>

            <hr className="border-zinc-800" />

            {/* SECCIÓN 4: ITINERARIO DINÁMICO */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Itinerario del Día</h3>
                <button
                  type="button"
                  onClick={addItineraryItem}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                >
                  + Agregar Evento
                </button>
              </div>
              <div className="space-y-3">
                {template.bloques.itinerary.map((item: ItineraryItem, index: number) => (
                  <div key={index} className="flex gap-2 items-center bg-zinc-950 p-3 border border-zinc-800 rounded-xl relative group">
                    <input
                      type="text"
                      value={item.hora}
                      onChange={(e) => handleItineraryChange(index, 'hora', e.target.value)}
                      className="w-16 text-center bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="text"
                      value={item.actividad}
                      onChange={(e) => handleItineraryChange(index, 'actividad', e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1 text-xs text-zinc-100 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeItineraryItem(index)}
                      className="text-zinc-500 hover:text-red-400 text-xs px-1 transition-colors"
                      title="Eliminar actividad"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sobres' && (
          <div className="space-y-8 animate-in fade-in duration-200 pb-10">
            {/* 1. SELECCIÓN DEL COLOR DEL SOBRE */}
            <div className="space-y-4">
              <div className="flex flex-col">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Color del Sobre Digital</h3>
                <p className="text-[11px] text-zinc-500 font-light mt-0.5">Elige el color exterior que verán tus invitados al abrir el link.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'Onyx', name: 'Onyx Black', hex: 'bg-zinc-900 border-zinc-700' },
                  { id: 'Petroleum', name: 'Azul Petróleo', hex: 'bg-slate-800 border-slate-600' },
                  { id: 'Lavender', name: 'Lila Provenzal', hex: 'bg-purple-950/60 border-purple-800/50' },
                  { id: 'Burgundy', name: 'Vino Borgoña', hex: 'bg-rose-950/60 border-rose-900/50' },
                  { id: 'Pearl', name: 'Blanco Perla', hex: 'bg-[#fdfdfc] border-zinc-300' }
                ].map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setTemplate(prev => ({
                      ...prev,
                      estilos: {
                        ...prev.estilos,
                        envelope: { ...prev.estilos.envelope, color: color.id }
                      }
                    }))}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                      template.estilos.envelope.color === color.id
                        ? 'border-purple-500 ring-2 ring-purple-500/20 text-purple-400 bg-zinc-950'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full border shadow-inner ${color.hex}`} />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-zinc-800" />

            {/* 2. SELECCIÓN DEL SELLO DE CERA */}
            <div className="space-y-4">
              <div className="flex flex-col">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Sello de Cera lacrada</h3>
                <p className="text-[11px] text-zinc-500 font-light mt-0.5">El relieve del sello central que cerrará el sobre virtual.</p>
              </div>
              <div className="space-y-2.5">
                {[
                  { id: 'Lotus', name: 'Flor de Loto Tradicional', desc: 'Elegancia clásica y orgánica' },
                  { id: 'Monogram', name: 'Monograma de Iniciales', desc: 'Iniciales entrelazadas minimalistas' },
                  { id: 'Eucalyptus', name: 'Rama de Eucalipto', desc: 'Estilo botánico y moderno' }
                ].map((seal) => (
                  <button
                    key={seal.id}
                    type="button"
                    onClick={() => setTemplate(prev => ({
                      ...prev,
                      estilos: {
                        ...prev.estilos,
                        envelope: { ...prev.estilos.envelope, waxSeal: seal.id }
                      }
                    }))}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                      template.estilos.envelope.waxSeal === seal.id
                        ? 'border-purple-500 bg-purple-500/5 text-purple-400'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-zinc-200">{seal.name}</span>
                      <span className="text-[10px] text-zinc-500 font-light">{seal.desc}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      template.estilos.envelope.waxSeal === seal.id ? 'border-purple-500 bg-purple-600' : 'border-zinc-700 bg-zinc-900'
                    }`}>
                      {template.estilos.envelope.waxSeal === seal.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- VISTA DE SELECCIÓN DE PLANTILLAS --- */}
        {activeTab === 'plantillas' && (
          <div className="space-y-6 animate-in fade-in duration-200 pb-10">
            <div className="flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Catálogo de Plantillas</h3>
              <p className="text-[11px] text-zinc-500 font-light mt-0.5">Elige la estructura artística base para tu tarjeta digital.</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="border border-purple-500 bg-purple-500/5 p-4 rounded-2xl relative group flex flex-col gap-2 cursor-pointer">
                <div className="absolute top-3 right-3 bg-purple-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Activa
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-zinc-100">Pearl Elegance</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Estilo minimalista de alta costura inspirado en papel de acuarela texturizado, tipografías serif clásicas y transiciones limpias.
                  </p>
                </div>
                <div className="text-[10px] text-purple-400 font-mono mt-2">
                  ✓ Seleccionada como predeterminada
                </div>
              </div>

              <div className="border border-zinc-800/80 bg-zinc-950/40 p-4 rounded-2xl opacity-60 flex flex-col gap-2">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-zinc-300">Midnight Minimal</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Un concepto oscuro con contrastes en oro dorado y fuentes sans-serif modernas. Ideal para bodas nocturnas de etiqueta rigurosa.
                  </p>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 mt-2">
                  🔒 Próximamente (Tier Premium)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}