import { NextResponse } from 'next/server';
import { requireVerifiedApiSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { userCanManageEvent } from '@/lib/event/permissions';

export async function GET(request: Request) {
  try {
    const auth = await requireVerifiedApiSession();
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'Falta el parámetro eventId.' }, { status: 400 });
    }

    const puedeEditar = await userCanManageEvent(
      auth.session.user.id,
      auth.session.user.email,
      eventId
    );

    if (!puedeEditar) {
      return NextResponse.json({ error: 'No tienes permisos de edición.' }, { status: 403 });
    }

    const template = await prisma.invitationTemplate.findUnique({
      where: { eventId },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error('ERROR_GET_TEMPLATE_API:', error);
    return NextResponse.json({ error: 'Error al cargar la plantilla.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireVerifiedApiSession();
    if (!auth.ok) return auth.response;

    const userId = auth.session.user.id;
    const body = await request.json();
    const { eventId, estilos, bloques } = body;

    if (!eventId || !estilos || !bloques) {
      return NextResponse.json({ error: 'Faltan parámetros de diseño.' }, { status: 400 });
    }

    const puedeEditar = await userCanManageEvent(
      userId,
      auth.session.user.email,
      eventId
    );

    if (!puedeEditar) {
      return NextResponse.json({ error: 'No tienes permisos de edición.' }, { status: 403 });
    }

    const plantillaConfigurada = await prisma.invitationTemplate.upsert({
      where: { eventId },
      update: { estilos, bloques },
      create: { eventId, estilos, bloques },
    });

    return NextResponse.json({
      message: 'Diseño de la invitación guardado con éxito.',
      template: plantillaConfigurada,
    });
  } catch (error) {
    console.error('ERROR_SAVE_TEMPLATE_API:', error);
    return NextResponse.json({ error: 'Error al guardar la plantilla.' }, { status: 500 });
  }
}
