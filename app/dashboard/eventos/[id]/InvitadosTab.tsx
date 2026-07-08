'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function InvitadosTab({ evento, initialFilterStatus = 'TODOS' }: { evento: any, initialFilterStatus?: 'TODOS'|'CONFIRMADO'|'RECHAZADO'|'PENDIENTE' }) {
  const [invitados, setInvitados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  const [filtroDe, setFiltroDe] = useState<'TODOS' | 'NOVIA' | 'NOVIO' | 'AMBOS'>('TODOS');
  // 🚀 Estado para el filtro de status que viene heredado
  const [filtroStatus, setFiltroStatus] = useState(initialFilterStatus);

  // Reaccionar si el filtro global cambia (cuando hacen click en la tarjeta de Resumen)
  useEffect(() => { setFiltroStatus(initialFilterStatus); }, [initialFilterStatus]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'masiva' | 'manual'>('masiva');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 🚀 Estado para el modal de edición
  const [editingGuest, setEditingGuest] = useState<any | null>(null);

  const [manualData, setManualData] = useState({
    nombreFamilia: '', pasesTotales: 1, telefono: '', invitadoDe: 'AMBOS', observaciones: '' 
  });

  const loadInvitados = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/event/invitados/list?eventId=${evento.id}`);
      const data = await res.json();
      if (res.ok) setInvitados(data.invitados || []);
    } catch (err) {
      console.error('Error cargando invitados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvitados(); }, [evento.id]);

  const handleGuardarManual = async () => {
    if (!manualData.nombreFamilia.trim()) return alert('El nombre es obligatorio.');
    setIsSaving(true);
    try {
      const res = await fetch('/api/event/invitados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: evento.id,
          listaInvitados: [{
            nombreFamilia: manualData.nombreFamilia,
            pasesTotales: evento.configPermiteAcompanantes ? manualData.pasesTotales : 1,
            telefono: manualData.telefono,
            invitadoDe: manualData.invitadoDe,
            observaciones: manualData.observaciones, 
            nombresAsistentes: [manualData.nombreFamilia] 
          }]
        })
      });
      if (!res.ok) throw new Error('Error al guardar');
      setManualData({ nombreFamilia: '', pasesTotales: 1, telefono: '', invitadoDe: 'AMBOS', observaciones: '' });
      setIsModalOpen(false);
      await loadInvitados();
    } catch (error) {
      alert('Hubo un problema al guardar el invitado.');
    } finally { setIsSaving(false); }
  };

  // 🚀 Función para editar un invitado
  const handleActualizarInvitado = async () => {
    if (!editingGuest.nombreFamilia.trim()) return alert('El nombre no puede estar vacío.');
    setIsSaving(true);
    try {
      const res = await fetch(`/api/guests/${editingGuest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreFamilia: editingGuest.nombreFamilia,
          telefono: editingGuest.telefono,
          observaciones: editingGuest.observaciones,
          invitadoDe: editingGuest.invitadoDe
        })
      });
      if(res.ok) {
        setEditingGuest(null);
        await loadInvitados();
      }
    } finally { setIsSaving(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const listaInvitados = jsonData.map((row: any) => ({
        nombreFamilia: row.nombreFamilia || row.NombreFamilia || row.Nombre || row.nombre || '',
        telefono: row.telefono || row.Telefono || row.Teléfono || '',
        invitadoDe: (row.invitadoDe || row.InvitadoDe || 'AMBOS').toUpperCase(),
        observaciones: row.observaciones || row.Observaciones || '',
        pasesTotales: evento.configPermiteAcompanantes ? (row.pasesTotales || 1) : 1,
        nombresAsistentes: [row.nombreFamilia || row.NombreFamilia || row.Nombre || row.nombre || '']
      })).filter((inv: any) => inv.nombreFamilia);

      if (listaInvitados.length === 0) return alert("Archivo vacío o formato incorrecto.");

      const res = await fetch('/api/event/invitados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: evento.id, listaInvitados })
      });
      const result = await res.json();
      if (res.ok) {
        setInvitados([...invitados, ...result.invitados]);
        setIsModalOpen(false);
        alert(`¡Éxito! Se cargaron ${result.invitados.length} invitados.`);
      } else throw new Error(result.error);
    } catch (err) {
      alert("Error leyendo o guardando el archivo.");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleWhatsApp = async (invitado: any) => {
    const enlace = `${window.location.origin}/invitacion/${invitado.codigoAcceso}`;
    const mensaje = `¡Hola ${invitado.nombreFamilia}! Te comparto la invitación para nuestra boda. Confirma tu asistencia aquí: ${enlace}`;
    const numeroLimpio = invitado.telefono?.replace(/\D/g, '');
    await fetch(`/api/guests/${invitado.id}/mark-sent`, { method: 'POST' });
    setInvitados(prev => prev.map(i => i.id === invitado.id ? { ...i, mensajeEnviado: true } : i));
    window.open(`https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const invitadosFiltrados = invitados.filter(inv => {
    const pasaFiltroDe = filtroDe === 'TODOS' || inv.invitadoDe === filtroDe;
    const pasaStatus = filtroStatus === 'TODOS' || inv.statusRSVP === filtroStatus;
    const pasaBusqueda = inv.nombreFamilia.toLowerCase().includes(busqueda.toLowerCase()) || 
                         (inv.telefono && inv.telefono.includes(busqueda));
    return pasaFiltroDe && pasaStatus && pasaBusqueda;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* ACCIONES SUPERIORES Y FILTROS */}
      <div className="flex flex-col gap-4 bg-zinc-900/20 p-4 border border-zinc-800/60 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <input type="text" placeholder="🔍 Buscar familia o teléfono..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full sm:w-72 bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-1.5 text-xs text-zinc-100 focus:outline-none" />
          <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-4 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md">➕ Agregar Familia / Grupo</button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 border-t border-zinc-800/50 pt-3">
          <div className="flex gap-2 flex-wrap">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold self-center mr-2">Status:</span>
            <button onClick={() => setFiltroStatus('TODOS')} className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full border transition-all ${filtroStatus === 'TODOS' ? 'bg-zinc-100 text-black border-white' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}>Todos</button>
            <button onClick={() => setFiltroStatus('CONFIRMADO')} className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full border transition-all ${filtroStatus === 'CONFIRMADO' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}>Confirmados</button>
            <button onClick={() => setFiltroStatus('RECHAZADO')} className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full border transition-all ${filtroStatus === 'RECHAZADO' ? 'bg-rose-500/20 text-rose-400 border-rose-500/50' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}>Rechazados</button>
            <button onClick={() => setFiltroStatus('PENDIENTE')} className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full border transition-all ${filtroStatus === 'PENDIENTE' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}>Pendientes</button>
          </div>
          <div className="flex gap-2 flex-wrap sm:ml-auto">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold self-center mr-2">Lado:</span>
            <button onClick={() => setFiltroDe('TODOS')} className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full border transition-all ${filtroDe === 'TODOS' ? 'bg-zinc-100 text-black border-white' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}>Todos</button>
            <button onClick={() => setFiltroDe('AMBOS')} className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full border transition-all ${filtroDe === 'AMBOS' ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}>Ambos</button>
            <button onClick={() => setFiltroDe('NOVIA')} className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full border transition-all ${filtroDe === 'NOVIA' ? 'bg-pink-500/20 text-pink-400 border-pink-500/50' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}>Novia</button>
            <button onClick={() => setFiltroDe('NOVIO')} className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full border transition-all ${filtroDe === 'NOVIO' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}>Novio</button>
          </div>
        </div>
      </div>

      {/* TABLA DE INVITADOS */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-xs text-zinc-500 animate-pulse">Cargando base de datos de pases...</div>
        ) : invitadosFiltrados.length === 0 ? (
          <div className="p-10 text-center text-xs text-zinc-500">No se encontraron invitados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-950/40 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="p-4">Familia / Grupo</th>
                  <th className="p-4">Lado</th>
                  <th className="p-4 text-center">Pases</th>
                  <th className="p-4 text-center">Estado RSVP</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-xs">
                {invitadosFiltrados.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="p-4 font-bold text-zinc-200">
                      {inv.nombreFamilia}
                      <span className="block font-mono text-[10px] text-purple-400 font-normal mt-0.5">{inv.codigoAcceso}</span>
                      {/* 🚀 Observaciones visibles */}
                      {inv.observaciones && <span className="block text-[10px] text-amber-500 font-normal mt-0.5">📝 {inv.observaciones}</span>}
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] px-2 py-1 rounded-full uppercase tracking-widest font-bold ${inv.invitadoDe === 'NOVIA' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' : inv.invitadoDe === 'NOVIO' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
                        {inv.invitadoDe || 'AMBOS'}
                      </span>
                    </td>
                    <td className="p-4 text-center font-semibold text-zinc-300">{inv.pasesTotales}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                        inv.statusRSVP === 'CONFIRMADO' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        inv.statusRSVP === 'RECHAZADO' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                        'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {inv.statusRSVP}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-2">
                        <button onClick={() => handleWhatsApp(inv)} disabled={!inv.telefono} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${inv.mensajeEnviado ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-30'}`}>
                          {inv.mensajeEnviado ? '✓ Enviado' : '💬 Enviar'}
                        </button>
                        {/* 🚀 Botón Editar (Lápiz) */}
                        <button onClick={() => setEditingGuest(inv)} className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-purple-600 text-zinc-300 hover:text-white rounded-lg transition-colors border border-zinc-700 hover:border-purple-500" title="Editar Información">
                          ✏️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🚀 MODAL DE EDICIÓN DEL LÁPIZ */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={() => setEditingGuest(null)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-zinc-100">✏️ Editar Invitado</h3>
              <button onClick={() => setEditingGuest(null)} className="text-zinc-500 hover:text-zinc-300">✕</button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nombre del Invitado</label>
                <input type="text" value={editingGuest.nombreFamilia} onChange={e => setEditingGuest({...editingGuest, nombreFamilia: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">¿De parte de quién?</label>
                <select value={editingGuest.invitadoDe} onChange={e => setEditingGuest({...editingGuest, invitadoDe: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100">
                  <option value="AMBOS">Ambos / General</option>
                  <option value="NOVIA">De la Novia</option>
                  <option value="NOVIO">Del Novio</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Teléfono (WhatsApp)</label>
                <input type="tel" value={editingGuest.telefono} onChange={e => setEditingGuest({...editingGuest, telefono: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Observaciones / Notas Especiales</label>
                <input type="text" value={editingGuest.observaciones || ''} onChange={e => setEditingGuest({...editingGuest, observaciones: e.target.value})} placeholder="Ej: VIP, Mesa 1..." className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100" />
              </div>
              <button onClick={handleActualizarInvitado} disabled={isSaving} className="w-full py-2.5 mt-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all">
                {isSaving ? 'Guardando cambios...' : 'Actualizar Información'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR INVITADO (CREACIÓN) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-zinc-100">Agregar Invitados</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
            </div>

            <div className="flex bg-zinc-950 p-1 rounded-xl mb-6">
              <button className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${modalTab === 'masiva' ? 'bg-purple-600 text-white' : 'text-zinc-400'}`} onClick={() => setModalTab('masiva')}>Carga Masiva</button>
              <button className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${modalTab === 'manual' ? 'bg-purple-600 text-white' : 'text-zinc-400'}`} onClick={() => setModalTab('manual')}>Registro Manual</button>
            </div>

            {modalTab === 'masiva' ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl mb-2">📄</span>
                  <p className="text-sm text-zinc-300 font-medium mb-1">
                    {isUploading ? 'Procesando archivo...' : 'Sube tu archivo de Excel o CSV'}
                  </p>
                  <label className={`bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors mt-4 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {isUploading ? 'Cargando...' : 'Seleccionar Archivo'}
                    <input type="file" accept=".csv, .xlsx" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">¿De parte de quién?</label>
                  <select value={manualData.invitadoDe} onChange={e => setManualData({...manualData, invitadoDe: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100">
                    <option value="AMBOS">Ambos / General</option>
                    <option value="NOVIA">De la Novia</option>
                    <option value="NOVIO">Del Novio</option>
                  </select>
                </div>

                {evento.configPermiteAcompanantes ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nombre Familia / Grupo</label>
                      <input type="text" value={manualData.nombreFamilia} onChange={e => setManualData({...manualData, nombreFamilia: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100" placeholder="Ej: Familia Pérez" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total de Pases Asignados</label>
                      <input type="number" min="1" value={manualData.pasesTotales} onChange={e => setManualData({...manualData, pasesTotales: parseInt(e.target.value) || 1})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100" placeholder="Ej: 4" />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nombre del Invitado</label>
                    <input type="text" value={manualData.nombreFamilia} onChange={e => setManualData({...manualData, nombreFamilia: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100" placeholder="Ej: Juan Pérez" />
                    <p className="text-[10px] text-amber-500/80 mt-1">⚠️ Este evento no permite acompañantes (Pase único).</p>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Teléfono (WhatsApp)</label>
                  <input type="tel" value={manualData.telefono} onChange={e => setManualData({...manualData, telefono: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100" placeholder="+52..." />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Observaciones (Opcional)</label>
                  <input type="text" value={manualData.observaciones} onChange={e => setManualData({...manualData, observaciones: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100" placeholder="Ej: VIP, Mesa 1, Compañero de trabajo..." />
                </div>
                
                <button onClick={handleGuardarManual} disabled={isSaving} className="w-full py-2.5 mt-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all">
                  {isSaving ? 'Guardando...' : 'Guardar Invitado'}
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}