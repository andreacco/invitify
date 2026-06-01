import { NextResponse } from 'next/server';
import { requireVerifiedApiSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const auth = await requireVerifiedApiSession();
    if (!auth.ok) return auth.response;

    const userId = auth.session.user.id;
    const userEmail = auth.session.user.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'El correo de la sesión es requerido.' },
        { status: 400 }
      );
    }

    const emailNormalizado = userEmail.toLowerCase().trim();

    const eventosPropios = await prisma.event.findMany({
      where: { ownerId: userId },
      orderBy: { fecha: 'asc' },
      include: {
        _count: {
          select: { invitados: true },
        },
      },
    });

    const colaboraciones = await prisma.eventMember.findMany({
      where: {
        status: 'ACEPTADO',
        OR: [{ correoInvitado: emailNormalizado }, { userId }],
      },
      include: {
        event: {
          include: {
            _count: {
              select: { invitados: true },
            },
          },
        },
      },
    });

    const eventosPorId = new Map<
      string,
      (typeof eventosPropios)[number] & {
        esColaborador: boolean;
        esOwner: boolean;
        rolEnEvento?: string;
        rolPersonalizado?: string | null;
      }
    >();

    for (const evento of eventosPropios) {
      eventosPorId.set(evento.id, {
        ...evento,
        esOwner: true,
        esColaborador: false,
      });
    }

    for (const colab of colaboraciones) {
      if (!colab.event) continue;
      if (colab.event.ownerId === userId) continue;
      if (eventosPorId.has(colab.event.id)) continue;

      eventosPorId.set(colab.event.id, {
        ...colab.event,
        esOwner: false,
        esColaborador: true,
        rolEnEvento: colab.role,
        rolPersonalizado: colab.rolPersonalizado,
      });
    }

    const todosLosEventos = Array.from(eventosPorId.values()).sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );

    return NextResponse.json({ eventos: todosLosEventos });
  } catch (error) {
    console.error('GET_EVENTS_LIST_ERROR:', error);
    return NextResponse.json({ error: 'Error al listar los eventos.' }, { status: 500 });
  }
}
