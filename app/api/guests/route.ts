import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db'; 

export const dynamic = 'force-dynamic';

// 1. OBTENER GRUPOS DE INVITADOS
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const eventId = "boda-andrea-jose-2026"; 

    const invitados = await prisma.invitadoPrincipal.findMany({
      where: { eventId },
      include: {
        asistentes: true,
        paseDigital: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(invitados);
  } catch (error) {
    console.error('PRISMA_GET_GUESTS_ERROR:', error);
    return NextResponse.json({ error: 'Error al obtener los invitados.' }, { status: 500 });
  }
}

// 2. CREAR UN NUEVO GRUPO O INVITADO
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await request.json();
    const { nombreFamilia, pasesTotales, codigoAcceso, eventId, telefono } = body;

    if (!nombreFamilia || !pasesTotales) {
      return NextResponse.json({ error: 'Faltan campos obligatorios (nombreFamilia o pasesTotales).' }, { status: 400 });
    }

    // Generar un código de acceso limpio para la URL
    const cleanCode = codigoAcceso || nombreFamilia
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-') + `-${Math.floor(1000 + Math.random() * 9000)}`;

    // Objeto data perfectamente limpio y estructurado sin llaves huérfanas
    const nuevoInvitado = await prisma.invitadoPrincipal.create({
      data: {
        eventId: eventId || "boda-andrea-jose-2026",
        nombreFamilia: String(nombreFamilia).trim(),
        pasesTotales: parseInt(pasesTotales, 10),
        codigoAcceso: cleanCode,
        statusRSVP: 'PENDIENTE',
        telefono: telefono ? String(telefono).trim() : ''
      },
      include: {
        asistentes: true
      }
    });

    return NextResponse.json(nuevoInvitado);
  } catch (error: any) {
    // Esto imprimirá el error real con nombres de campos exactos en tu terminal de VSCode/Iterm
    console.error('❌ ERROR_CRÍTICO_EN_POST_GUEST:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'El código de acceso para la URL ya existe.' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Error al registrar el invitado en Prisma.',
      details: error.message 
    }, { status: 500 });
  }
}