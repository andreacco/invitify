import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // 1. Proteger el endpoint verificando la sesión activa de NextAuth
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión primero.' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    
    const { 
      titulo, 
      fecha, 
      ubicacionCeremonia, 
      ubicacionRecepcion, 
      miRol, // 'NOVIA' o 'NOVIO'
      correoColaborador, // Opcional: email de la pareja o de la planner
      rolColaborador, // Opcional: 'NOVIO', 'NOVIA' o 'WEDDING_PLANNER'
      configPermiteAcompanantes // <-- Recibimos el parámetro (true o false)
    } = body;

    // 2. Validaciones básicas obligatorias
    if (!titulo || !fecha || !ubicacionCeremonia || !ubicacionRecepcion || !miRol) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios para crear el evento.' },
        { status: 400 }
      );
    }

    // 3. Usar una Transacción de Prisma para asegurar que todo se cree o nada se cree
    const nuevoEvento = await prisma.$transaction(async (tx) => {
      
      // A. Crear el registro principal del evento
      const evento = await tx.event.create({
        data: {
          titulo,
          fecha: new Date(fecha),
          ubicacionCeremonia,
          ubicacionRecepcion,
          configPermiteAcompanantes: configPermiteAcompanantes !== undefined ? configPermiteAcompanantes : true,
        },
      });

      // B. Asignar el rol al usuario creador en la tabla pivote EventMember
      await tx.eventMember.create({
        data: {
          eventId: evento.id,
          userId: userId,
          role: miRol, // Ej: NOVIA
        },
      });

      // C. Si se incluyó un colaborador (pareja o planner), vincularlo de una vez
      if (correoColaborador && rolColaborador) {
        const usuarioColaborador = await tx.user.findUnique({
          where: { email: correoColaborador.toLowerCase() },
        });

        // Si el colaborador ya está registrado en la app, lo enlazamos al evento
        if (usuarioColaborador) {
          await tx.eventMember.create({
            data: {
              eventId: evento.id,
              userId: usuarioColaborador.id,
              role: rolColaborador,
            },
          });
        }
        // NOTA PARA EL FUTURO: Si no existe, aquí podríamos disparar un correo de invitación para registrarse.
      }

      return evento;
    });

    return NextResponse.json(
      { message: 'Evento y roles configurados con éxito.', evento: nuevoEvento },
      { status: 201 }
    );

  } catch (error) {
    console.error('ERROR_CREATE_EVENT_API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al crear el evento.' },
      { status: 500 }
    );
  }
}