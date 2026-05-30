import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

// ==========================================
// 1. GET: CONSULTAR EL ESTADO DE LA INVITACIÓN
// ==========================================
export async function GET(
  request: Request,
  { params }: { params: { codigoAcceso: string } }
) {
  try {
    const { codigoAcceso } = params;

    // Buscar el grupo familiar por su código único de invitación
    const invitacion = await prisma.invitadoPrincipal.findUnique({
      where: { codigoAcceso },
      include: {
        asistentes: true, // Nos traemos el desglose de los miembros de la familia
        paseDigital: true // Si ya confirmaron antes, nos traemos su pase
      }
    });

    if (!invitacion) {
      return NextResponse.json(
        { error: 'Invitación no encontrada. Verifica el enlace.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ invitacion }, { status: 200 });

  } catch (error) {
    console.error('ERROR_RSVP_GET_API:', error);
    return NextResponse.json(
      { error: 'Error al obtener los datos de la invitación.' },
      { status: 500 }
    );
  }
}

// ==========================================
// 2. POST: CONFIRMAR ASISTENCIA (FORMULARIO RSVP)
// ==========================================
export async function POST(
  request: Request,
  { params }: { params: { codigoAcceso: string } }
) {
  try {
    const { codigoAcceso } = params;
    const body = await request.json();
    
    // respuestasAsistentes será un array de objetos con el id de cada asistente, 
    // si asiste, su menú, restricciones y canción sugerida.
    const { respuestasAsistentes, observaciones } = body;

    if (!respuestasAsistentes || !Array.isArray(respuestasAsistentes)) {
      return NextResponse.json(
        { error: 'El formato de las respuestas es inválido.' },
        { status: 400 }
      );
    }

    // 1. Validar que la invitación exista
    const invitacion = await prisma.invitadoPrincipal.findUnique({
      where: { codigoAcceso },
      include: { asistentes: true }
    });

    if (!invitacion) {
      return NextResponse.json({ error: 'Invitación no encontrada.' }, { status: 404 });
    }

    // 2. Procesar la confirmación dentro de una Transacción
    const resultadoRSVP = await prisma.$transaction(async (tx) => {
      let totalAsistentesConfirmados = 0;

      // A. Actualizar cada asistente individualmente con sus preferencias de menú/alergias
      for (const res of respuestasAsistentes) {
        // Verificar que el asistente realmente pertenezca a esta familia
        const pertenece = invitacion.asistentes.some(a => a.id === res.id);
        if (!pertenece) continue;

        if (res.asiste) {
          totalAsistentesConfirmados++;
        }

        await tx.asistente.update({
          where: { id: res.id },
          data: {
            asiste: res.asiste,
            menuSeleccionado: res.asiste ? res.menuSeleccionado : null,
            restricciones: res.asiste ? res.restricciones : null,
            cancionSugerida: res.cancionSugerida || null
          }
        });
      }

      // B. Determinar el estatus global del grupo familiar
      let statusGlobal = 'RECHAZADO';
      if (totalAsistentesConfirmados > 0) {
        statusGlobal = 'CONFIRMADO';
      }

      // C. Actualizar la cabecera de la invitación
      const invitacionActualizada = await tx.invitadoPrincipal.update({
        where: { id: invitacion.id },
        data: {
          statusRSVP: statusGlobal as any,
          fechaConfirmacion: new Date(),
          observaciones: observaciones || null
        }
      });

      // D. SISTEMA PREMIUM: Generar el Pase Digital con Token Dinámico si alguien asiste
      if (totalAsistentesConfirmados > 0) {
        // Generamos un hash único aleatorio que servirá como la semilla inicial del QR
        const tokenSeguroInicial = crypto.randomBytes(32).toString('hex');

        // Upsert por si el invitado cambia de opinión y re-confirma el formulario antes de la boda
        await tx.paseDigital.upsert({
          where: { invitadoPrincipalId: invitacion.id },
          update: {
            qrSecureToken: tokenSeguroInicial,
            asistentesEsperados: totalAsistentesConfirmados,
            validado: false
          },
          create: {
            invitadoPrincipalId: invitacion.id,
            qrSecureToken: tokenSeguroInicial,
            asistentesEsperados: totalAsistentesConfirmados,
          }
        });
      } else {
        // Si al final confirmaron que van 0 personas, eliminamos el pase digital si existía
        await tx.paseDigital.deleteMany({
          where: { invitadoPrincipalId: invitacion.id }
        });
      }

      return invitacionActualizada;
    });

    return NextResponse.json({
      message: 'Confirmación procesada con éxito.',
      statusRSVP: resultadoRSVP.statusRSVP
    }, { status: 200 });

  } catch (error) {
    console.error('ERROR_RSVP_POST_API:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el RSVP.' },
      { status: 500 }
    );
  }
}