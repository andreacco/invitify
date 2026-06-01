'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Colaborador {
  correo: string;
  rol: string;
  esPersonalizado: boolean;
  etiquetaPersonalizada?: string;
}

export default function NuevoEventoWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🧠 Ajuste: Inicializamos con BODA por defecto para evitar estados nulos en la UI
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'BODA', 
    fecha: '',
    ubicacionCeremonia: '',
    ubicacionRecepcion: '',
    miRol: 'NOVIA',
    configPermiteAcompanantes: true
  });

  // Estado para la lista dinámica de colaboradores
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([
    { correo: '', rol: 'NOVIO', esPersonalizado: false, etiquetaPersonalizada: '' }
  ]);

  const requiereCeremonia = ['BODA', 'BAUTIZO', 'PRIMERA_COMUNION'].includes(formData.tipo);

  // Helper para obtener los roles disponibles
  const getRolesPorEvento = (esParaColaborador = false) => {
    let roles = [];

    switch (formData.tipo) {
      case 'BODA':
        roles = [
          { id: 'NOVIA', label: 'Novia', icon: '👰‍♀️' },
          { id: 'NOVIO', label: 'Novio', icon: '🤵‍♂️' },
          { id: 'WEDDING_PLANNER', label: 'Wedding Planner', icon: '📋' }
        ];
        break;
      case 'QUINCEANOS':
        roles = [
          { id: 'QUINCEANERA', label: 'Quinceañera', icon: '👑' },
          { id: 'MAMA_DEL_FESTEJADO', label: 'Madre', icon: '👩' },
          { id: 'PAPA_DEL_FESTEJADO', label: 'Padre', icon: '👨' },
          { id: 'ORGANIZADOR', label: 'Organizador del Evento', icon: '📋' }
        ];
        break;
      case 'CUMPLEANOS':
        roles = [
          { id: 'CUMPLEANERO', label: 'Cumpleañero(a)', icon: '🎂' },
          { id: 'PAREJA_DEL_FESTEJADO', label: 'Pareja del Cumpleañero(a)', icon: '❤️' },
          { id: 'MAMA_DEL_FESTEJADO', label: 'Madre', icon: '👩' },
          { id: 'PAPA_DEL_FESTEJADO', label: 'Padre', icon: '👨' }
        ];
        break;
      case 'BAUTIZO':
      case 'BABY_SHOWER':
      case 'PRIMERA_COMUNION':
        roles = [
          { id: 'MAMA_DEL_FESTEJADO', label: 'Madre del Festejado', icon: '🤱' },
          { id: 'PAPA_DEL_FESTEJADO', label: 'Padre del Festejado', icon: '👨‍🍼' },
          { id: 'ORGANIZADOR', label: 'Organizador Principal', icon: '✨' }
        ];
        break;
      default:
        roles = [
          { id: 'ANFITRION', label: 'Anfitrión Principal', icon: '🎉' },
          { id: 'ORGANIZADOR', label: 'Organizador / Planificador', icon: '📋' }
        ];
    }

    if (esParaColaborador) {
      return roles.map(rol => ({
        ...rol,
        label: rol.id === formData.miRol ? `${rol.label} (Ya asignado a ti)` : rol.label
      }));
    }

    return roles;
  };

  const handleColaboradorChange = (index: number, field: keyof Colaborador, value: any) => {
    const nuevos = [...colaboradores];
    nuevos[index] = { ...nuevos[index], [field]: value };
    
    if (field === 'rol') {
      nuevos[index].esPersonalizado = value === 'PERSONALIZADO';
    }
    
    setColaboradores(nuevos);
  };

  const agregarColaboradorCampo = () => {
    const rolesDisponibles = getRolesPorEvento();
    setColaboradores([...colaboradores, { correo: '', rol: rolesDisponibles[1]?.id || 'ORGANIZADOR', esPersonalizado: false, etiquetaPersonalizada: '' }]);
  };

  const eliminarColaboradorCampo = (index: number) => {
    setColaboradores(colaboradores.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    const colaboradoresValidos = colaboradores.filter(c => c.correo.trim() !== '' && c.rol !== '');

    const datosEnviar = {
      ...formData,
      ubicacionCeremonia: requiereCeremonia ? formData.ubicacionCeremonia : 'No aplica',
      colaboradores: colaboradoresValidos
    };

    try {
      const res = await fetch('/api/event/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEnviar)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al inicializar el evento.');

      // 🛡️ FIX MAPEO: Sincronizado de forma exacta con la respuesta '{ evento }' de la API
      if (data.evento && data.evento.id) {
        router.push(`/dashboard/eventos/${data.evento.id}`);
        router.refresh();
      } else {
        throw new Error("El servidor no devolvió el identificador del evento.");
      }

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/5 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl p-8 z-10 space-y-8">
        
        {/* PROGRESO */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">Paso {step + 1} de 4</span>
            <span className="text-xs text-zinc-500 font-medium">Ecosistema Invitify</span>
          </div>
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-300"
              style={{ width: `${((step + 1) / 4) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* CONTENIDO VARIABLE */}
        <div className="min-h-[320px]">
          
          {/* PASO 0: Tipo de Evento */}
          {step === 0 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100">¿Qué tipo de evento vas a crear?</h2>
                <p className="text-xs text-zinc-400">Selecciona una categoría para adaptar la experiencia a tus necesidades.</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {[
                  { id: 'BODA', label: 'Boda / Matrimonio', icon: '💍' },
                  { id: 'QUINCEANOS', label: '15 Años', icon: '👑' },
                  { id: 'CUMPLEANOS', label: 'Cumpleaños', icon: '🎂' },
                  { id: 'BABY_SHOWER', label: 'Baby Shower', icon: '🍼' },
                  { id: 'GRADUACION', label: 'Graduación', icon: '🎓' },
                  { id: 'BAUTIZO', label: 'Bautizo', icon: '🕊️' },
                  { id: 'PRIMERA_COMUNION', label: 'Primera Comunión', icon: '✝️' },
                  { id: 'GENERAL', label: 'Evento en General', icon: '🎉' },
                ].map((tipo) => (
                  <button
                    key={tipo.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, tipo: tipo.id, miRol: '' });
                      // Forzamos un reset temporal de colaboradores para que vuelvan a elegir rol válido
                      setColaboradores([{ correo: '', rol: '', esPersonalizado: false, etiquetaPersonalizada: '' }]);
                    }}
                    className={`cursor-pointer p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${formData.tipo === tipo.id ? 'bg-purple-600/10 border-purple-500 text-purple-300 shadow-md' : 'bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700 text-zinc-400'}`}
                  >
                    <span className="text-base">{tipo.icon}</span>
                    <span className="text-xs font-semibold">{tipo.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASO 1: Tu Rol */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100">Tu rol en el evento</h2>
                <p className="text-xs text-zinc-400">Indícanos quién eres dentro de la planeación.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {getRolesPorEvento().map((rol) => (
                  <button
                    key={rol.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, miRol: rol.id });
                      // Inicializamos el primer colaborador con un rol diferente por defecto para ahorrar clics
                      const rolesFiltrados = getRolesPorEvento().filter(r => r.id !== rol.id);
                      handleColaboradorChange(0, 'rol', rolesFiltrados[0]?.id || 'ORGANIZADOR');
                    }}
                    className={`cursor-pointer p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${formData.miRol === rol.id ? 'bg-purple-600/10 border-purple-500 text-purple-300 shadow-lg' : 'bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700 text-zinc-400'}`}
                  >
                    <span className="text-xl">{rol.icon}</span>
                    <span className="text-xs font-semibold">{rol.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASO 2: Logística */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100">Coordenadas logísticas</h2>
                <p className="text-xs text-zinc-400">Datos fundamentales de ubicación y fechas.</p>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Título del Evento</label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ej: Boda de Andrea & José"
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Fecha del Evento</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="cursor-pointer w-full bg-zinc-950/80 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none transition-colors scheme-dark"
                  />
                </div>

                {requiereCeremonia && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Lugar de la Ceremonia</label>
                    <input
                      type="text"
                      value={formData.ubicacionCeremonia}
                      onChange={(e) => setFormData({ ...formData, ubicacionCeremonia: e.target.value })}
                      placeholder="Iglesia o locación del acto"
                      className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none transition-colors"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {requiereCeremonia ? 'Lugar de la Recepción' : 'Lugar del Evento'}
                  </label>
                  <input
                    type="text"
                    value={formData.ubicacionRecepcion}
                    onChange={(e) => setFormData({ ...formData, ubicacionRecepcion: e.target.value })}
                    placeholder="Salón, dirección o quinta..."
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: Configuración Avanzada y Colaboradores */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight text-zinc-100">Reglas y Accesos de Equipo</h2>
                <p className="text-xs text-zinc-400">Asigna permisos globales e invita a personas cruciales para la organización.</p>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-zinc-950/40 border border-zinc-800 rounded-xl">
                  <div className="space-y-0.5 pr-4">
                    <h4 className="text-xs font-semibold text-zinc-200">Permitir Acompañantes Extra</h4>
                    <p className="text-[11px] text-zinc-400">Habilita pases secundarios editables para tus invitados principales.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, configPermiteAcompanantes: !formData.configPermiteAcompanantes })}
                    className={`cursor-pointer w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${formData.configPermiteAcompanantes ? 'bg-purple-600' : 'bg-zinc-700'}`}
                  >
                    <div className={`bg-zinc-100 w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${formData.configPermiteAcompanantes ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="bg-zinc-950/20 border border-zinc-800/60 p-4 rounded-xl space-y-4">
                  <h4 className="text-xs font-semibold text-purple-400">Vincular Colaboradores del Evento</h4>
                  
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {colaboradores.map((colaborador, index) => (
                      <div key={index} className="space-y-2 p-3 bg-zinc-950/50 border border-zinc-800/60 rounded-xl relative group animate-in fade-in duration-150">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => eliminarColaboradorCampo(index)}
                            className="cursor-pointer absolute top-2 right-2 text-[10px] text-rose-400/70 hover:text-rose-400 transition-colors"
                          >
                            Remover
                          </button>
                        )}

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-[9px] font-medium text-zinc-400">Correo Electrónico</label>
                            <input
                              type="email"
                              value={colaborador.correo}
                              onChange={(e) => handleColaboradorChange(index, 'correo', e.target.value)}
                              placeholder="ejemplo@correo.com"
                              className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-medium text-zinc-400">Rol asignado</label>
                            <select
                              value={colaborador.rol}
                              onChange={(e) => handleColaboradorChange(index, 'rol', e.target.value)}
                              className="cursor-pointer w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none"
                            >
                              <option value="">Selecciona un rol...</option>
                              {getRolesPorEvento(true).map((rol) => (
                                <option key={rol.id} value={rol.id}>{rol.label}</option>
                              ))}
                              <option value="PERSONALIZADO">✨ Otro (Rol Personalizado)</option>
                            </select>
                          </div>
                        </div>

                        {colaborador.esPersonalizado && (
                          <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                            <label className="text-[9px] font-medium text-purple-400">¿Cuál es su rol personalizado? (Etiqueta)</label>
                            <input
                              type="text"
                              value={colaborador.etiquetaPersonalizada}
                              onChange={(e) => handleColaboradorChange(index, 'etiquetaPersonalizada', e.target.value)}
                              placeholder="Ej: Madre de la Novia, Padrino de Honor..."
                              className="w-full bg-zinc-900 border border-purple-900/40 focus:border-purple-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {colaboradores[0].correo.trim().length > 3 && (
                    <button
                      type="button"
                      onClick={agregarColaboradorCampo}
                      className="cursor-pointer w-full text-center py-2 border border-dashed border-zinc-800 hover:border-purple-500/50 bg-zinc-900/30 hover:bg-purple-600/5 text-zinc-400 hover:text-purple-300 rounded-xl text-xs font-semibold transition-all"
                    >
                      ➕ Agregar otro colaborador
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* NAVEGACIÓN */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/60">
          <button
            type="button"
            onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
            disabled={step === 0 || loading}
            className="cursor-pointer px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-0"
          >
            Atrás
          </button>

          {step < 3 ? (
            <button
              type="button"
              disabled={
                (step === 0 && !formData.tipo) ||
                (step === 1 && !formData.miRol) ||
                (step === 2 && (
                  !formData.titulo || 
                  !formData.fecha || 
                  !formData.ubicacionRecepcion || 
                  (requiereCeremonia && !formData.ubicacionCeremonia)
                ))
              }
              onClick={() => setStep((prev) => prev + 1)}
              className="cursor-pointer px-5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-white text-zinc-950 transition-all disabled:opacity-40"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="cursor-pointer px-6 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg"
            >
              {loading ? 'Inicializando Invitify...' : 'Crear mi Evento y Notificar ✨'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}