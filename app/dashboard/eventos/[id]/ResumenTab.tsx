'use client';

import { useState, useEffect } from 'react';

export default function ResumenTab({ evento }: { evento: any }) {
  const { metricas, fecha, miembros } = evento;
  const [tiempoRestante, setTiempoRestante] = useState('');

  // Cuenta regresiva matemática para el evento
  useEffect(() => {
    const target = new Date(fecha).getTime();

    const interval = setInterval(() => {
      const ahora = new Date().getTime();
      const diferencia = target - ahora;

      if (diferencia <= 0) {
        setTiempoRestante('¡Llegó el gran día! 🎉');
        clearInterval(interval);
        return;
      }

      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

      setTiempoRestante(`${dias}d ${horas}h ${minutos}m`);
    }, 60000);

    return () => clearInterval(interval);
  }, [fecha]);

  return (
    <div className="space-y-6">
      
      {/* CARD DE CUENTA REGRESIVA */}
      <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/30 border border-purple-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">Tiempo restante para la gran fecha</h2>
          <p className="text-xs text-zinc-400">Programado para el: {new Date(fecha).toLocaleDateString('es-ES', { dateStyle: 'long' })}</p>
        </div>
        <div className="text-2xl font-black bg-purple-500/10 text-purple-300 border border-purple-500/30 px-6 py-2.5 rounded-xl tracking-wider font-mono">
          {tiempoRestante || 'Calculando...'}
        </div>
      </div>

      {/* REJILLA DE MÉTRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Invitaciones', value: evento._count?.invitados || 0, icon: '✉️', color: 'text-blue-400' },
          { title: 'Confirmados (Grupos)', value: metricas?.familiasConfirmadas || 0, icon: '✅', color: 'text-emerald-400' },
          { title: 'Pendientes', value: metricas?.familiasPendientes || 0, icon: '⏳', color: 'text-amber-400' },
          { title: 'Pases Totales Asignados', value: metricas?.totalCuposAsignados || 0, icon: '🎟️', color: 'text-purple-400' },
        ].map((item, idx) => (
          <div key={idx} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">{item.title}</span>
              <span className="text-sm">{item.icon}</span>
            </div>
            <p className={`text-2xl font-extrabold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* COLABORADORES ACTIVOS EN ESTE DASHBOARD */}
      <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Equipo de Organización</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {evento.members?.map((member: any) => (
            <div key={member.id} className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600/10 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400 text-xs uppercase">
                  {member.user?.nombre?.[0] || member.correoInvitado[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">
                    {member.user ? `${member.user.nombre} ${member.user.apellido}` : 'Invitado pendiente'}
                  </h4>
                  <p className="text-[10px] text-zinc-500">{member.correoInvitado}</p>
                </div>
              </div>
              <span className="text-[9px] font-bold bg-zinc-900 px-2 py-1 rounded-md text-zinc-400 border border-zinc-800 uppercase">
                {member.role === 'PERSONALIZADO' ? member.rolPersonalizado : member.role}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}