import { NextResponse } from 'next/server';
import { requireVerifiedApiSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { Prisma } from '@prisma/client'; // 👈 IMPORTANTE: Asegúrate de que esto esté importado

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

    const body = await request.json();
    const { eventId, listaInvitados } = body;

    if (!eventId || !listaInvitados || !Array.isArray(listaInvitados)) {
      return NextResponse.json({ error: 'Formato incorrecto.' }, { status: 400 });
    }

    // 1. Verificamos permisos
    const eventoConfig = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        members: { where: { userId: auth.session.user.id } }
      }
    });

    if (!eventoConfig || eventoConfig.members.length === 0) {
      return NextResponse.json(
        { error: 'No tienes permisos para administrar este evento.' },
        { status: 403 }
      );
    }

    const permiteAcompanantes = eventoConfig.configPermiteAcompanantes;

    // 🛠️ FIX AQUÍ: Le decimos a TypeScript exactamente qué tipo de datos espera Prisma
    const gruposParaInsertar: Prisma.InvitadoPrincipalCreateManyInput[] = [];
    const asistentesParaInsertar: Prisma.AsistenteCreateManyInput[] = [];

    for (const invitado of listaInvitados) {
      const { nombreFamilia, pasesTotales, nombresAsistentes, telefono, invitadoDe, observaciones } = invitado;

      if (!nombreFamilia) continue;

      let pasesFinales = 1;
      let listaAsistentesFinales: string[] = [];

      if (permiteAcompanantes) {
        pasesFinales = parseInt(pasesTotales) || 1;
        listaAsistentesFinales = Array.isArray(nombresAsistentes) && nombresAsistentes.length > 0
          ? nombresAsistentes 
          : [nombreFamilia];
      } else {
        pasesFinales = 1;
        listaAsistentesFinales = [nombreFamilia]; 
      }

      const codigoAcceso = generarCodigoAcceso(nombreFamilia);
      
      // Generamos el ID único (UUID) en el servidor
      const grupoId = crypto.randomUUID(); 

      gruposParaInsertar.push({
        id: grupoId,
        eventId: eventId,
        nombreFamilia: String(nombreFamilia),
        telefono: telefono ? String(telefono).trim() : "", 
        pasesTotales: pasesFinales,
        codigoAcceso,
        invitadoDe: invitadoDe || 'AMBOS',
        observaciones: observaciones || null,
        statusRSVP: 'PENDIENTE', // Ahora TypeScript sabe que esto pertenece al enum de Prisma
        mensajeEnviado: false
      });

      for (const nombre of listaAsistentesFinales) {
        asistentesParaInsertar.push({
          id: crypto.randomUUID(),
          invitadoPrincipalId: grupoId,
          nombreCompleto: String(nombre),
          asiste: false,
        });
      }
    }

    // 3. Ejecutamos el BULK INSERT masivo
    await prisma.$transaction([
      prisma.invitadoPrincipal.createMany({ data: gruposParaInsertar }),
      prisma.asistente.createMany({ data: asistentesParaInsertar })
    ]);

    // 4. Formateamos la respuesta
    const invitadosResponse = gruposParaInsertar.map(grupo => ({
      ...grupo,
      asistentes: asistentesParaInsertar.filter(a => a.invitadoPrincipalId === grupo.id)
    }));

    return NextResponse.json({ 
      message: `Procesados exitosamente ${gruposParaInsertar.length} invitados.`, 
      invitados: invitadosResponse 
    }, { status: 201 });

  } catch (error) {
    console.error('ERROR_BULK_INVITADOS_API:', error);
    return NextResponse.json({ error: 'Error al cargar invitados en la base de datos.' }, { status: 500 });
  }
}