'use client';

import { useState, useEffect } from 'react';

export default function InvitadosTab({ evento }: { evento: any }) {
  const [invitados, setInvitados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'masiva' | 'manual'>('masiva');

  useEffect(() => {
    async function loadInvitados() {
      try {
        const res = await fetch(`/api/event/invitados/list?eventId=${evento.id}`);
        const data = await res.json();
        if (res.ok) setInvitados(data.invitados || []);
      } catch (err) {
        console.error('Error cargando invitados:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInvitados();
  }, [evento.id]);

  // Filtrar invitados por nombre de familia o teléfono en tiempo real
  const invitadosFiltrados = invitados.filter(inv =>
    inv.nombreFamilia.toLowerCase().includes(busqueda.toLowerCase()) ||
    inv.telefono.includes(busqueda)
  );

  return (
    <div className="space-y-4">
      
      {/* ACCIONES SUPERIORES */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/20 p-4 border border-zinc-800/60 rounded-2xl">
        <input
          type="text"
          placeholder="🔍 Buscar familia o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full sm:w-72 bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-zinc-100 focus:outline-none"
        />
        <button 
          className="w-full sm:w-auto px-4 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md"
          onClick={() => setIsModalOpen(true)}
        >
          ➕ Agregar Familia / Grupo
        </button>
      </div>

      {/* TABLA DE INVITADOS */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-xs text-zinc-500 animate-pulse">Cargando base de datos de pases...</div>
        ) : invitadosFiltrados.length === 0 ? (
          <div className="p-10 text-center text-xs text-zinc-500">No se encontraron invitados registrados para este evento.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="p-4">Familia / Grupo</th>
                  <th className="p-4">Código Acceso</th>
                  <th className="p-4 text-center">Pases Asignados</th>
                  <th className="p-4 text-center">Estado RSVP</th>
                  <th className="p-4">Teléfono</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-xs">
                {invitadosFiltrados.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="p-4 font-bold text-zinc-200">{inv.nombreFamilia}</td>
                    <td className="p-4 font-mono text-[11px] text-purple-400 font-semibold">{inv.codigoAcceso}</td>
                    <td className="p-4 text-center font-semibold text-zinc-300">{inv.pasesTotales}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        inv.statusRSVP === 'CONFIRMADO' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        inv.statusRSVP === 'RECHAZADO' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                        'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {inv.statusRSVP}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400 font-mono">{inv.telefono}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL AGREGAR INVITADO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-zinc-100">Agregar Invitados</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                ✕
              </button>
            </div>

            <div className="flex bg-zinc-950 p-1 rounded-xl mb-6">
              <button
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${modalTab === 'masiva' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                onClick={() => setModalTab('masiva')}
              >
                Carga Masiva
              </button>
              <button
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${modalTab === 'manual' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                onClick={() => setModalTab('manual')}
              >
                Registro Manual
              </button>
            </div>

            {modalTab === 'masiva' ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl mb-2">📄</span>
                  <p className="text-sm text-zinc-300 font-medium mb-1">Sube tu archivo de Excel o CSV</p>
                  <p className="text-xs text-zinc-500 mb-4">Asegúrate de seguir el formato de plantilla.</p>
                  <label className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
                    Seleccionar Archivo
                    <input type="file" accept=".csv, .xlsx" className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {evento.configPermiteAcompanantes ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nombre Familia / Grupo</label>
                      <input type="text" className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100" placeholder="Ej: Familia Pérez" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total de Pases Asignados</label>
                      <input type="number" min="1" className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100" placeholder="Ej: 4" />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nombre del Invitado</label>
                    <input type="text" className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100" placeholder="Ej: Juan Pérez" />
                    <p className="text-[10px] text-amber-500/80 mt-1">⚠️ Este evento no permite acompañantes (Pase único).</p>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Teléfono (WhatsApp)</label>
                  <input type="tel" className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100" placeholder="+52..." />
                </div>
                <button className="w-full py-2.5 mt-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition-all">
                  Guardar Invitado
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}