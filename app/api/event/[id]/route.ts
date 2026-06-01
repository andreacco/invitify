import { NextResponse } from 'next/server';
import { requireVerifiedApiSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

// 💡 FIX: Tipamos params como una Promesa para cumplir con Next.js 15
export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const auth = await requireVerifiedApiSession();
    if (!auth.ok) return auth.response;

    // 💡 FIX: Desempaquetamos de forma asíncrona la promesa de params antes de usar el ID
    const { id } = await params;

    const evento = await prisma.event.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { nombre: true, apellido: true, email: true }
            }
          }
        },
        _count: {
          select: {
            invitados: true,
          }
        }
      }
    });

    if (!evento) {
      return NextResponse.json({ error: 'El evento no existe.' }, { status: 404 });
    }

    // Calcular métricas rápidas de RSVP agregadas para el resumen
    const agregadosRSVP = await prisma.invitadoPrincipal.aggregate({
      where: { eventId: id },
      _sum: { pasesTotales: true },
    });

    const confirmados = await prisma.invitadoPrincipal.count({
      where: { eventId: id, statusRSVP: 'CONFIRMADO' }
    });

    const pendientes = await prisma.invitadoPrincipal.count({
      where: { eventId: id, statusRSVP: 'PENDIENTE' }
    });

    const rechazados = await prisma.invitadoPrincipal.count({
      where: { eventId: id, statusRSVP: 'RECHAZADO' }
    });

    return NextResponse.json({
      evento: {
        ...evento,
        metricas: {
          totalCuposAsignados: agregadosRSVP._sum.pasesTotales || 0,
          familiasConfirmadas: confirmados,
          familiasPendientes: pendientes,
          familiasRechazadas: rechazados,
        }
      }
    });

  } catch (error) {
    console.error('❌ GET_EVENT_BY_ID_ERROR:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}