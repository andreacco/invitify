import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // 1. Verificar autenticación del miembro del Staff (Planner, Novios, etc.)
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { qrSecureToken, eventId } = body;

    if (!qrSecureToken || !eventId) {
      return NextResponse.json(
        { error: 'Faltan parámetros obligatorios (Token del QR o ID del evento).' },
        { status: 400 }
      );
    }

    // 2. Verificar que el usuario que escanea realmente tiene un rol autorizado para este evento
    const membresiaStaff = await prisma.eventMember.findUnique({
      where: {
        eventId_userId: { eventId, userId }
      }
    });

    if (!membresiaStaff) {
      return NextResponse.json(
        { error: 'No tienes permisos de Staff para realizar check-in en este evento.' },
        { status: 403 }
      );
    }

    // 3. Buscar el Pase Digital correspondiente al token escaneado
    const pase = await prisma.paseDigital.findUnique({
      where: { qrSecureToken },
      include: {
        invitadoPrincipal: {
          include: {
            asistentes: {
              where: { asiste: true } // Traer solo a los que confirmaron previamente
            }
          }
        }
      }
    });

    // 4. Validaciones de control de acceso físico
    if (!pase || pase.invitadoPrincipal.eventId !== eventId) {
      return NextResponse.json(
        { valid: false, error: 'Código QR inválido o no pertenece a este evento.' },
        { status: 404 }
      );
    }

    if (pase.validado) {
      return NextResponse.json({
        valid: false,
        error: '¡ALERTA! Este pase ya fue utilizado.',
        fechaIngreso: pase.fechaValidacion,
        familia: pase.invitadoPrincipal.nombreFamilia
      }, { status: 400 });
    }

    // 5. Registrar el ingreso exitoso en la base de datos
    const paseValidado = await prisma.paseDigital.update({
      where: { id: pase.id },
      data: {
        validado: true,
        fechaValidacion: new Date()
      }
    });

    // 6. Responder con toda la información necesaria para la interfaz de la Planner
    return NextResponse.json({
      valid: true,
      message: '¡Acceso Concedido Exitosamente!',
      datosAcceso: {
        familia: pase.invitadoPrincipal.nombreFamilia,
        asistentesEsperados: pase.asistentesEsperados,
        nombresAsistentes: pase.invitadoPrincipal.asistentes.map(a => a.nombreCompleto),
        horaIngreso: paseValidado.fechaValidacion
      }
    }, { status: 200 });

  } catch (error) {
    console.error('ERROR_CHECKIN_QR_API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar el check-in.' },
      { status: 500 }
    );
  }
}