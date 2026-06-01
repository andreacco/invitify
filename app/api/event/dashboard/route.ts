import { NextResponse } from 'next/server';
import { requireVerifiedApiSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const auth = await requireVerifiedApiSession();
    if (!auth.ok) return auth.response;

    const userId = auth.session.user.id;
    
    // Obtener el eventId de los parámetros de la URL (?eventId=xxx)
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'Falta el parámetro eventId.' }, { status: 400 });
    }

    // 2. Verificar que el usuario pertenece al evento
    const membresia = await prisma.eventMember.findUnique({
      where: { eventId_userId: { eventId, userId } }
    });

    if (!membresia) {
      return NextResponse.json({ error: 'No tienes permisos para ver este evento.' }, { status: 403 });
    }

    // 3. Consultas simultáneas en la base de datos para optimizar rendimiento
    const [invitadosPrincipales, asistentes] = await prisma.$transaction([
      // Conteo de grupos/invitaciones por estatus RSVP
      prisma.invitadoPrincipal.findMany({
        where: { eventId },
        select: { statusRSVP: true, pasesTotales: true }
      }),
      // Conteo de asistentes individuales confirmados reales
      prisma.asistente.findMany({
        where: { invitadoPrincipal: { eventId } },
        select: { asiste: true, menuSeleccionado: true, restricciones: true }
      })
    ]);

    // 4. Procesar métricas de Invitaciones (Grupos)
    let totalInvitaciones = invitadosPrincipales.length;
    let rsvpConfirmados = 0;
    let rsvpRechazados = 0;
    let rsvpPendientes = 0;
    let totalPasesAsignados = 0;

    invitadosPrincipales.forEach(inv => {
      totalPasesAsignados += inv.pasesTotales;
      if (inv.statusRSVP === 'CONFIRMADO') rsvpConfirmados++;
      else if (inv.statusRSVP === 'RECHAZADO') rsvpRechazados++;
      else rsvpPendientes++;
    });

    // 5. Procesar métricas de Asistentes Individuales (Sillas Reales)
    let totalAsistentesConfirmados = 0;
    const menus: Record<string, number> = {};
    const restriccionesAlimentarias: string[] = [];

    asistentes.forEach(asist => {
      if (asist.asiste) {
        totalAsistentesConfirmados++;
        
        // Agrupar menús
        const menu = asist.menuSeleccionado || 'No especificado';
        menus[menu] = (menus[menu] || 0) + 1;

        // Recolectar alergias/restricciones si existen
        if (asist.restricciones && asist.restricciones.trim() !== '') {
          restriccionesAlimentarias.push(asist.restricciones.trim());
        }
      }
    });

    // 6. Responder con el objeto estructurado para las gráficas del Front
    return NextResponse.json({
      resumenInvitaciones: {
        totalInvitaciones,
        confirmadas: rsvpConfirmados,
        rechazadas: rsvpRechazados,
        pendientes: rsvpPendientes
      },
      resumenAsistenciaReal: {
        totalPasesAsignados,
        sillasOcupadasReales: totalAsistentesConfirmados,
        sillasVaciasOcupadas: totalPasesAsignados - totalAsistentesConfirmados
      },
      menus,
      restriccionesAlimentarias
    }, { status: 200 });

  } catch (error) {
    console.error('ERROR_DASHBOARD_GET_API:', error);
    return NextResponse.json({ error: 'Error al obtener métricas del dashboard.' }, { status: 500 });
  }
}