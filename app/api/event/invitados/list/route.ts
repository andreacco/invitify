import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // 1. Validar autenticación
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'Falta el parámetro eventId.' }, { status: 400 });
    }

    // 2. Verificar permisos del usuario
    const membresia = await prisma.eventMember.findUnique({
      where: { eventId_userId: { eventId, userId } }
    });

    if (!membresia) {
      return NextResponse.json({ error: 'No tienes permisos para ver esta lista.' }, { status: 403 });
    }

    // 3. Traer todos los invitados ordenados alfabéticamente con sus asistentes desglosados
    const listaCompleta = await prisma.invitadoPrincipal.findMany({
      where: { eventId },
      include: {
        asistentes: true,
        paseDigital: true // Por si necesitamos saber en la tabla quién ya generó su QR
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