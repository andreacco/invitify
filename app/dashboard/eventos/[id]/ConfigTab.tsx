'use client';

import { useState } from 'react';

interface ConfigTabProps {
  evento: any;
  setEvento: (evt: any) => void;
}

export default function ConfigTab({ evento, setEvento }: ConfigTabProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    titulo: evento.titulo,
    ubicacionCeremonia: evento.ubicacionCeremonia || '',
    ubicacionRecepcion: evento.ubicacionRecepcion,
    configPermiteAcompanantes: evento.configPermiteAcompanantes,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch(`/api/event/${evento.id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Error al actualizar.');
      
      const data = await res.json();
      setEvento(data.evento); // Sincroniza el estado global del componente padre
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Configuración Básica */}
      <div className="md:col-span-2 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
        <h3 className="text-sm font-bold tracking-wider uppercase text-purple-400">Parámetros Generales</h3>
        
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs text-center font-medium">
            ✨ Configuración guardada correctamente.
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nombre del Evento</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none"
            />
          </div>

          {evento.ubicacionCeremonia !== 'No aplica' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Lugar de la Ceremonia</label>
              <input
                type="text"
                value={formData.ubicacionCeremonia}
                onChange={(e) => setFormData({ ...formData, ubicacionCeremonia: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Lugar de la Recepción</label>
            <input
              type="text"
              value={formData.ubicacionRecepcion}
              onChange={(e) => setFormData({ ...formData, ubicacionRecepcion: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-800/60 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Reglas de Negocio / Toggles Especiales */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold tracking-wider uppercase text-purple-400">Reglas de Control</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">Configura los límites que afectarán directamente la tarjeta de invitación digital de tus invitados.</p>
        
        <div className="flex items-center justify-between p-3.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl">
          <div className="space-y-0.5 pr-2">
            <h4 className="text-xs font-semibold text-zinc-200">Acompañantes Extra</h4>
            <p className="text-[10px] text-zinc-500">Permitir más pases asignados.</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, configPermiteAcompanantes: !formData.configPermiteAcompanantes })}
            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${formData.configPermiteAcompanantes ? 'bg-purple-600' : 'bg-zinc-700'}`}
          >
            <div className={`bg-zinc-100 w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${formData.configPermiteAcompanantes ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

    </form>
  );
}