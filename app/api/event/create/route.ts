import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { sendEventInvitationEmail } from '@/lib/invitationMail'; 

interface ColaboradorInput {
  correo: string;
  rol: string;
  esPersonalizado: boolean;
  etiquetaPersonalizada?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 🛡️ Validación estricta para evitar el 'session.user is possibly undefined'
    if (!session || !session.user || !(session.user as any)?.id) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userEmail = session.user.email; 
    const body = await request.json();
    
    const { 
      titulo, 
      tipo,
      fecha, 
      ubicacionCeremonia, 
      ubicacionRecepcion, 
      miRol, 
      configPermiteAcompanantes,
      colaboradores 
    } = body;

    if (!titulo || !fecha || !ubicacionRecepcion || !miRol || !tipo) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
    }

    // 1. Ejecutar la transacción de la Base de Datos de forma rápida
    const { evento, listaParaCorreos } = await prisma.$transaction(async (tx) => {
      
      // 🔗 Generación dinámica del slug requerido por el schema
      const slugBase = titulo
        .toLowerCase()
        .trim()
        .normalize('NFD') // Remueve acentos y tildes
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '') // Elimina caracteres especiales
        .replace(/\s+/g, '-') // Reemplaza espacios por guiones
        .replace(/-+/g, '-'); // Evita guiones consecutivos

      const idCorto = crypto.randomUUID().split('-')[0]; // Añade sufijo único de 8 caracteres
      const slugFinal = `${slugBase}-${idCorto}`;
      
      // 🚀 CORRECCIÓN AQUÍ: Agregamos ownerId de manera obligatoria al crear el evento
      const nuevoEvento = await tx.event.create({
        data: {
          titulo,
          tipo,
          slug: slugFinal, 
          fecha: new Date(fecha),
          ubicacionCeremonia: ubicacionCeremonia || null,
          ubicacionRecepcion,
          configPermiteAcompanantes: configPermiteAcompanantes ?? true,
          ownerId: userId, // ✨ El creador queda registrado nativamente como el Dueño
        },
      });

      // El creador del evento entra también a la tabla de miembros directos como ACEPTADO
      await tx.eventMember.create({
        data: {
          eventId: nuevoEvento.id,
          userId: userId,
          correoInvitado: userEmail?.toLowerCase().trim() || '',
          role: miRol === 'PERSONALIZADO' ? 'ORGANIZADOR' : (miRol as any),
          status: 'ACEPTADO',
        },
      });

      // Array auxiliar para guardar metadatos necesarios para los correos posteriores
      const infoCorreos: Array<{ email: string; labelRol: string; existe: boolean }> = [];

      if (colaboradores && colaboradores.length > 0) {
        for (const col of colaboradores as ColaboradorInput[]) {
          const emailLimpio = col.correo.toLowerCase().trim();
          if (!emailLimpio || emailLimpio === userEmail?.toLowerCase().trim()) continue;

          // Buscamos si el colaborador ya posee una cuenta registrada
          const usuarioRegistrado = await tx.user.findUnique({
            where: { email: emailLimpio },
          });

          const enumRole = col.rol === 'PERSONALIZADO' ? 'PERSONALIZADO' : (col.rol as any);
          const etiquetaFinal = col.esPersonalizado ? col.etiquetaPersonalizada?.trim() || 'Colaborador' : col.rol;

          // Guardamos en la base de datos (con userId en null si no tiene cuenta aún)
          await tx.eventMember.create({
            data: {
              eventId: nuevoEvento.id,
              userId: usuarioRegistrado ? usuarioRegistrado.id : null,
              correoInvitado: emailLimpio,
              role: enumRole,
              rolPersonalizado: col.esPersonalizado ? etiquetaFinal : null,
              status: usuarioRegistrado ? 'ACEPTADO' : 'INVITADO',
            },
          });

          // Registramos los datos necesarios para disparar el correo electrónico
          infoCorreos.push({
            email: emailLimpio,
            labelRol: etiquetaFinal,
            existe: !!usuarioRegistrado
          });
        }
      }

      return { evento: nuevoEvento, listaParaCorreos: infoCorreos };
    });

    // 2. Disparar los correos electrónicos de forma asíncrona (fuera de la tx)
    if (listaParaCorreos.length > 0) {
      Promise.allSettled(
        listaParaCorreos.map((col) =>
          sendEventInvitationEmail({
            emailDestino: col.email,
            eventoTitulo: titulo,
            rolAsignado: col.labelRol,
            usuarioExiste: col.existe,
          })
        )
      ).then((resultados) => {
        resultados.forEach((res, index) => {
          if (res.status === 'rejected') {
            console.error(`❌ Falló el envío de correo para ${listaParaCorreos[index].email}:`, res.reason);
          } else {
            console.log(`✉️ Correo enviado exitosamente a ${listaParaCorreos[index].email}`);
          }
        });
      });
    }

    // Retornamos status 201 y la info del evento para que el front use el ID o el slug para redirigir
    return NextResponse.json(
      { message: 'Evento creado y correos en cola de envío.', evento },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ ERROR_CREATE_EVENT_API:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}