import { NextResponse } from 'next/server';
import { requireVerifiedApiSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client'; // 1. Importamos los tipos de Prisma

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
    const auth = await requireVerifiedApiSession();
    if (!auth.ok) return auth.response;

    const userId = auth.session.user.id;
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
    // Añadimos el tipo a 'tx' para que TypeScript no se queje
    const resultado = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const registrosCreados = [];

      for (const invitado of listaInvitados) {
        const { nombreFamilia, pasesTotales, nombresAsistentes, telefono } = invitado;

        if (!nombreFamilia) continue;

        let pasesFinales = 1;
        let listaAsistentesFinales: string[] = [];

        if (permiteAcompanantes) {
          // MODALIDAD TRADICIONAL
          pasesFinales = parseInt(pasesTotales) || 1;
          listaAsistentesFinales = Array.isArray(nombresAsistentes) && nombresAsistentes.length > 0
            ? nombresAsistentes 
            : [nombreFamilia];
        } else {
          // MODALIDAD INDIVIDUAL
          pasesFinales = 1;
          listaAsistentesFinales = [nombreFamilia]; 
        }

        const codigoAcceso = generarCodigoAcceso(nombreFamilia);

        const nuevoGrupo = await tx.invitadoPrincipal.create({
          data: {
            // 2. Conectamos la relación de forma explícita
            event: { connect: { id: eventId } }, 
            nombreFamilia,
            // 3. Proporcionamos un valor por defecto al teléfono si el Excel no lo trae
            telefono: telefono || "", 
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