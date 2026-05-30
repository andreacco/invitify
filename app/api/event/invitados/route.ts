import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

function generarCodigoAcceso(nombre: string): string {
  const base = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  
  const sufijoAleatorio = Math.random().toString(36).substring(2, 6);
  return `${base}-${sufijoAleatorio}`;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { eventId, listaInvitados } = body;

    if (!eventId || !listaInvitados || !Array.isArray(listaInvitados)) {
      return NextResponse.json({ error: 'Formato incorrecto.' }, { status: 400 });
    }

    // 1. Obtener el evento para verificar permisos Y leer su configuración
    const eventoConfig = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        members: { where: { userId } }
      }
    });

    if (!eventoConfig || eventoConfig.members.length === 0) {
      return NextResponse.json(
        { error: 'No tienes permisos para administrar este evento.' },
        { status: 403 }
      );
    }

    const permiteAcompanantes = eventoConfig.configPermiteAcompanantes;

    // 2. Procesar la carga masiva adaptada a las reglas de la boda
    const resultado = await prisma.$transaction(async (tx) => {
      const registrosCreados = [];

      for (const invitado of listaInvitados) {
        const { nombreFamilia, pasesTotales, nombresAsistentes } = invitado;

        if (!nombreFamilia) continue;

        let pasesFinales = 1;
        let listaAsistentesFinales: string[] = [];

        if (permiteAcompanantes) {
          // MODALIDAD TRADICIONAL: Respeta el Excel con grupos, +1 y familias
          pasesFinales = parseInt(pasesTotales) || 1;
          listaAsistentesFinales = Array.isArray(nombresAsistentes) && nombresAsistentes.length > 0
            ? nombresAsistentes 
            : [nombreFamilia];
        } else {
          // MODALIDAD INDIVIDUAL (Tu Boda): Cada fila es una persona única y no hay pases extra
          pasesFinales = 1;
          listaAsistentesFinales = [nombreFamilia]; // El "nombreFamilia" actúa directamente como el nombre completo del invitado único
        }

        const codigoAcceso = generarCodigoAcceso(nombreFamilia);

        const nuevoGrupo = await tx.invitadoPrincipal.create({
          data: {
            eventId,
            nombreFamilia, // Si es individual, este campo guarda el nombre de la persona
            pasesTotales: pasesFinales,
            codigoAcceso,
            asistentes: {
              create: listaAsistentesFinales.map((nombre: string) => ({
                nombreCompleto: nombre,
                asiste: false,
              })),
            },
          },
          include: {
            asistentes: true,
          },
        });

        registrosCreados.push(nuevoGrupo);
      }

      return registrosCreados;
    });

    return NextResponse.json({ 
      message: `Procesados exitosamente ${resultado.length} invitados en modo ${permiteAcompanantes ? 'Familiar/Grupal' : 'Individual/Personal'}.`, 
      invitados: resultado 
    }, { status: 201 });

  } catch (error) {
    console.error('ERROR_BULK_INVITADOS_CON_CONFIG_API:', error);
    return NextResponse.json({ error: 'Error al cargar invitados.' }, { status: 500 });
  }
}