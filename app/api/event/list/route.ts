import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // 1. Validar que el usuario esté autenticado
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const userEmail = session.user.email;

    // 🛡️ Seguridad y tipado: Si por alguna razón el correo no viene, paramos el flujo antes de golpear la DB
    if (!userEmail) {
      return NextResponse.json({ error: 'El correo de la sesión es requerido.' }, { status: 400 });
    }

    // 2. Buscar los eventos donde el usuario es el Creador/Dueño (Owner)
    const eventosPropios = await prisma.event.findMany({
      where: { ownerId: userId },
      orderBy: { fecha: 'asc' },
      include: {
        _count: {
          select: { invitados: true }
        }
      }
    });

    // 3. Buscar los eventos donde el usuario es un Colaborador Aceptado
    const colaboraciones = await prisma.eventMember.findMany({
      where: {
        correoInvitado: userEmail, // Ahora TypeScript sabe al 100% que es un string válido
        status: 'ACEPTADO'
      },
      include: {
        event: {
          include: {
            _count: {
              select: { invitados: true }
            }
          }
        }
      }
    });

    // 4. Mapear las colaboraciones garantizando que la propiedad 'event' exista en el tipado
    const eventosColaborando = colaboraciones
      .filter((colab) => (colab as any).event !== undefined && (colab as any).event !== null)
      .map((colab) => {
        const item = colab as any;
        return {
          ...item.event,
          rolEnEvento: item.role,
          rolPersonalizado: item.rolPersonalizado,
          esColaborador: true
        };
      });

    // 5. Unificar ambas listas en un solo arreglo plano de eventos
    const todosLosEventos = [
      ...eventosPropios.map(e => ({ ...e, esColaborador: false })),
      ...eventosColaborando
    ];

    // 6. Retornar la lista unificada al Dashboard
    return NextResponse.json({ eventos: todosLosEventos });

  } catch (error) {
    console.error('❌ GET_EVENTS_LIST_ERROR:', error);
    return NextResponse.json({ error: 'Error al listar los eventos.' }, { status: 500 });
  }
}