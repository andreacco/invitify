'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { InvitadoPrincipal } from '@/types/invitation';
import * as XLSX from 'xlsx';

export default function InvitadosPage() {
  const [invitados, setInvitados] = useState<InvitadoPrincipal[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('');
  
  // CONFIGURACIÓN INTELIGENTE DEL EVENTO (Simulando lectura de los settings de tu modelo Event)
  // configPermiteAcompanantes = true (Familiar/Parejas), false (Individual)
  const [configPermiteAcompanantes, setConfigPermiteAcompanantes] = useState(true);

  // Estados para el Panel Lateral (Formulario)
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [nombreFamilia, setNombreFamilia] = useState('');
  const [pasesTotales, setPasesTotales] = useState(2);
  const [telefono, setTelefono] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchInvitados = async () => {
    setLoading(true);
    setErrorCarga(null);
    try {
      const res = await fetch('/api/guests');
      if (!res.ok) throw new Error('Error al conectar con la API');
      const data = await res.json();
      if (Array.isArray(data)) setInvitados(data);
    } catch (err: any) {
      setErrorCarga(err.message || 'Error al obtener invitados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitados();
  }, []);

  const handleAgregarInvitado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreFamilia.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombreFamilia, 
          // Si es individual, forzamos de forma inteligente que sea siempre 1 pase
          pasesTotales: configPermiteAcompanantes ? pasesTotales : 1,
          telefono: telefono.trim()
        }),
      });

      if (!res.ok) throw new Error('Error al guardar el invitado');

      setNombreFamilia('');
      setPasesTotales(2);
      setTelefono('');
      setIsPanelOpen(false); // Cerrar panel lateral
      fetchInvitados(); 
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportarExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        
        // Mapeo inteligente adaptativo basado en la configuración del evento
        const rawData = XLSX.utils.sheet_to_json<any>(ws);
        if (rawData.length === 0) throw new Error('El archivo está vacío.');

        let guardados = 0;
        for (const fila of rawData) {
          // Buscamos dinámicamente variaciones en los nombres de las columnas
          const nombre = fila.Familia || fila.Invitado || fila.Nombre;
          if (!nombre) continue;

          const pases = configPermiteAcompanantes ? (fila.Pases || fila.Cupos || 2) : 1;
          const tel = fila.Telefono || fila.Celular || fila.WhatsApp || '';

          const res = await fetch('/api/guests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombreFamilia: String(nombre), pasesTotales: Number(pases), telefono: String(tel) }),
          });
          if (res.ok) guardados++;
        }
        alert(`¡Sincronización Inteligente Éxitosa! Se importaron ${guardados} registros basados en tu configuración.`);
        fetchInvitados();
      } catch (err: any) {
        alert(err.message);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Remover este registro?')) return;
    try {
      const res = await fetch(`/api/guests/${id}`, { method: 'DELETE' });
      if (res.ok) setInvitados(prev => prev.filter(inv => inv.id !== id));
    } catch (err) {
      alert('Error al eliminar.');
    }
  };

  // AUTOMATIZACIÓN DE WHATSAPP: Generador del Link y Mensaje Personalizado
  const abrirWhatsApp = (invitado: InvitadoPrincipal) => {
    if (!invitado.telefono) {
      alert('⚠️ Este invitado no tiene un número de teléfono asignado. Edita el registro o agrégalo antes de enviar.');
      return;
    }

    // Limpiar el teléfono de espacios o caracteres extraños
    const telefonoLimpio = invitado.telefono.replace(/[^0-9]/g, '');
    
    // Construimos la URL absoluta de la invitación digital que abrirá el invitado
    const linkInvitacion = `${window.location.origin}/invitacion/${invitado.codigoAcceso}`;
    
    // Redacción del mensaje adaptativo
    const mensaje = configPermiteAcompanantes
      ? `¡Hola ${invitado.nombreFamilia}! Queremos compartir con ustedes el momento más feliz de nuestras vidas. Aquí tienen su invitación digital junto con sus pases asignados (${invitado.pasesTotales}): ${linkInvitacion}`
      : `¡Hola ${invitado.nombreFamilia}! Queremos compartir contigo este momento tan especial. Aquí tienes tu invitación digital personalizada: ${linkInvitacion}`;

    // Codificamos el texto para que la URL sea válida
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${telefonoLimpio}&text=${encodeURIComponent(mensaje)}`;
    
    // Abrir en una pestaña nueva
    window.open(urlWhatsApp, '_blank');
  };

  const invitadosFiltrados = (invitados || []).filter(inv => 
    inv.nombreFamilia?.toLowerCase().includes(filtro.toLowerCase())
  );

  const totalGrupos = invitados.length;
  const totalPasesAsignados = invitados.reduce((acc, curr) => acc + (curr.pasesTotales || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-hidden">
      
      {/* BARRA SUPERIOR */}
      <header className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <h1 className="font-semibold text-lg tracking-wide text-zinc-200">Invitify Lista Maestra</h1>
          <nav className="flex items-center gap-1 bg-zinc-950 p-1 border border-zinc-800 rounded-lg text-xs">
            <Link href="/admin/editor" className="px-3 py-1.5 rounded-md text-zinc-400 hover:text-zinc-200 transition-colors">🎨 Diseño Editor</Link>
            <span className="px-3 py-1.5 rounded-md bg-purple-600/10 text-purple-400 border border-purple-500/20 font-medium">👥 Invitados & RSVP</span>
          </nav>
        </div>

        {/* INTERRUPTOR DE PRUEBA DE ENTENDIMIENTO COGNITIVO */}
        <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 border border-zinc-800 rounded-xl text-[11px]">
          <span className="text-zinc-500">Modo de Evento:</span>
          <button 
            onClick={() => setConfigPermiteAcompanantes(!configPermiteAcompanantes)}
            className={`font-semibold transition-colors ${configPermiteAcompanantes ? 'text-purple-400' : 'text-amber-400'}`}
          >
            {configPermiteAcompanantes ? '👪 Familiar (Con Pases)' : '👤 Individual (1 pase p/p)'}
          </button>
        </div>
        
        <Link href="/admin/editor" className="px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 transition-all">
          ← Volver al Editor
        </Link>
      </header>

      {/* CUERPO DEL DASHBOARD */}
      <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6 select-none z-10">
        
        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900 p-5 border border-zinc-800 rounded-2xl flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              {configPermiteAcompanantes ? 'Total Familias' : 'Total Invitados'}
            </span>
            <span className="text-3xl font-bold text-zinc-100">{totalGrupos}</span>
          </div>
          <div className="bg-zinc-900 p-5 border border-zinc-800 rounded-2xl flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Pases Concedidos</span>
            <span className="text-3xl font-bold text-purple-400">{totalPasesAsignados}</span>
          </div>
          <div className="bg-zinc-900 p-5 border border-zinc-800 rounded-2xl flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Confirmaciones Totales</span>
            <span className="text-3xl font-bold text-emerald-400">0</span>
          </div>
        </div>

        {/* CONTROLES SUPERIORES */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <input
            type="text"
            placeholder={configPermiteAcompanantes ? "🔍 Buscar familia..." : "🔍 Buscar invitado..."}
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
          />

          <div className="flex gap-2 w-full sm:w-auto">
            <input type="file" ref={fileInputRef} onChange={handleImportarExcel} accept=".xlsx, .xls, .csv" className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-emerald-400 transition-all flex items-center justify-center gap-2"
            >
              {isImporting ? 'Procesando...' : '📥 Importar Excel'}
            </button>

            <button
              onClick={() => setIsPanelOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/10"
            >
              <span>＋</span> Agregar {configPermiteAcompanantes ? 'Familia' : 'Invitado'}
            </button>
          </div>
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-zinc-500">Conectando a base de datos...</div>
          ) : errorCarga ? (
            <div className="p-8 text-center text-sm text-rose-400">⚠️ {errorCarga}</div>
          ) : invitadosFiltrados.length === 0 ? (
            <div className="p-12 text-center text-sm text-zinc-500">
              No hay registros bajo la modalidad {configPermiteAcompanantes ? 'Familiar' : 'Individual'}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-950/40">
                    <th className="p-4">{configPermiteAcompanantes ? 'Familia / Grupo' : 'Invitado'}</th>
                    {configPermiteAcompanantes && <th className="p-4">Pases</th>}
                    <th className="p-4">WhatsApp / Canal</th>
                    <th className="p-4">Estado RSVP</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {invitadosFiltrados.map((invitado) => (
                    <tr key={invitado.id} className="hover:bg-zinc-850/30 transition-colors group">
                      <td className="p-4 font-medium text-zinc-200">{invitado.nombreFamilia}</td>
                      {configPermiteAcompanantes && (
                        <td className="p-4 text-zinc-400 font-mono">{invitado.pasesTotales} pases</td>
                      )}
                      
                      {/* ACCIÓN AUTOMATIZADA DE WHATSAPP INDIVIDUAL */}
                      <td className="p-4">
                        <button
                          onClick={() => abrirWhatsApp(invitado)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                            invitado.telefono 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                              : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed'
                          }`}
                        >
                          <span className="text-xs">💬</span> 
                          {invitado.telefono ? 'Enviar Invitación' : 'Sin Teléfono'}
                        </button>
                      </td>
                      
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          invitado.statusRSVP === 'PENDIENTE' ? 'bg-amber-500/5 text-amber-400 border-amber-500/20' : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {invitado.statusRSVP}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleEliminar(invitado.id)} className="text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all px-2">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* PANEL LATERAL FLOTANTE (SLIDE-OVER ANIDADO) */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end select-none">
          {/* Fondo traslúcido oscuro */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsPanelOpen(false)} />
          
          {/* Panel Contenedor */}
          <div className="relative w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h3 className="text-sm font-semibold text-zinc-200">
                  Agregar {configPermiteAcompanantes ? 'Nueva Familia' : 'Nuevo Invitado'}
                </h3>
                <button onClick={() => setIsPanelOpen(false)} className="text-zinc-500 hover:text-zinc-300 text-sm">✕</button>
              </div>

              <form onSubmit={handleAgregarInvitado} id="lateral-form" className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">
                    {configPermiteAcompanantes ? 'Nombre de la Familia' : 'Nombre Completo del Invitado'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={configPermiteAcompanantes ? "Ej: Familia Paternina Osorio" : "Ej: Maria Esther Osorio"}
                    value={nombreFamilia}
                    onChange={(e) => setNombreFamilia(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400">WhatsApp (Con código de país, ej: 584120000000)</label>
                  <input
                    type="text"
                    placeholder="Ej: 584125556677"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* DETECCIÓN COGNITIVA: Ocultar campo de pases si el evento es individual */}
                {configPermiteAcompanantes && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400">Número de Pases Concedidos</label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={pasesTotales}
                      onChange={(e) => setPasesTotales(parseInt(e.target.value) || 1)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                )}
              </form>
            </div>

            <div className="border-t border-zinc-800 pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setIsPanelOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-zinc-950 border border-zinc-800 hover:bg-zinc-850 text-zinc-400 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="lateral-form"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Confirmar Registro'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}