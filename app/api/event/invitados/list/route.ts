import { NextResponse } from 'next/server';
import { requireVerifiedApiSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const auth = await requireVerifiedApiSession();
    if (!auth.ok) return auth.response;

    const userId = auth.session.user.id;
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'Falta el parámetro eventId.' }, { status: 400 });
    }

    // 2. Verificar permisos del usuario usando findFirst (Adiós al error de índice único)
    const membresia = await prisma.eventMember.findFirst({
      where: { 
        eventId: eventId,
        userId: userId 
      }
    });

    // 🧠 Control de seguridad extra: Si no es miembro invitado, revisamos si es el dueño (owner) del evento
    if (!membresia) {
      const esDueno = await prisma.event.findFirst({
        where: {
          id: eventId,
          ownerId: userId
        }
      });

      if (!esDueno) {
        return NextResponse.json({ error: 'No tienes permisos para ver esta lista.' }, { status: 403 });
      }
    }

    // 3. Traer todos los invitados ordenados alfabéticamente con sus asistentes desglosados
    const listaCompleta = await prisma.invitadoPrincipal.findMany({
      where: { eventId },
      include: {
        asistentes: true,
        paseDigital: true 
      },
      orderBy: {
        nombreFamilia: 'asc'
      }
    });

    return NextResponse.json({ invitados: listaCompleta }, { status: 200 });

  } catch (error) {
    console.error('ERROR_LIST_INVITADOS_API:', error);
    return NextResponse.json({ error: 'Error al obtener la lista de invitados.' }, { status: 500 });
  }
}