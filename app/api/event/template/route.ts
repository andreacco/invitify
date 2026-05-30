import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

// 1. POST: Guardar o actualizar la plantilla visual de la boda
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { eventId, estilos, bloques } = body;

    if (!eventId || !estilos || !bloques) {
      return NextResponse.json({ error: 'Faltan parámetros de diseño.' }, { status: 400 });
    }

    // Verificar que quien edita el diseño sea administrador de este evento
    const membresia = await prisma.eventMember.findUnique({
      where: { eventId_userId: { eventId, userId } }
    });

    if (!membresia) {
      return NextResponse.json({ error: 'No tienes permisos de edición.' }, { status: 403 });
    }

    // Insertar o actualizar la plantilla en un solo paso
    const plantillaConfigurada = await prisma.invitationTemplate.upsert({
      where: { eventId },
      update: { estilos, bloques },
      create: { eventId, estilos, bloques },
    });

    return NextResponse.json({
      message: 'Diseño de la invitación guardado con éxito.',
      template: plantillaConfigurada
    }, { status: 200 });

  } catch (error) {
    console.error('ERROR_SAVE_TEMPLATE_API:', error);
    return NextResponse.json({ error: 'Error al guardar la plantilla.' }, { status: 500 });
  }
}