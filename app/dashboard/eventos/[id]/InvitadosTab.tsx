'use client';

import { useState, useEffect } from 'react';

export default function InvitadosTab({ eventoId }: { eventoId: string }) {
  const [invitados, setInvitados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    async function loadInvitados() {
      try {
        const res = await fetch(`/api/event/${eventoId}/invitados`);
        const data = await res.json();
        if (res.ok) setInvitados(data.invitados || []);
      } catch (err) {
        console.error('Error cargando invitados:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInvitados();
  }, [eventoId]);

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
          onClick={() => alert('¡Próximo paso: Modal para agregar invitado!')}
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

    </div>
  );
}