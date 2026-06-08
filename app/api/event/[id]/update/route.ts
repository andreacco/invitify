import { NextResponse } from 'next/server';
import { requireVerifiedApiSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export async function PUT(
  request: Request, 
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const auth = await requireVerifiedApiSession();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const body = await request.json();

    const { 
      titulo, 
      ubicacionCeremonia, 
      ubicacionRecepcion, 
      configPermiteAcompanantes,
      colorPrincipal,
      mapUrlCeremonia,
      mapUrlRecepcion
    } = body;

    const eventoUpdate = await prisma.event.update({
      where: { id },
      data: {
        titulo,
        ubicacionCeremonia,
        ubicacionRecepcion,
        configPermiteAcompanantes,
        colorPrincipal,
        mapUrlCeremonia,
        mapUrlRecepcion
      }
    });

    return NextResponse.json({
      evento: eventoUpdate
    });

  } catch (error) {
    console.error('❌ PUT_EVENT_UPDATE_ERROR:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
