import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireVerifiedApiSession } from '@/lib/auth/session';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireVerifiedApiSession();
    if (!auth.ok) return auth.response;

    const { id } = await params;

    const invitado = await prisma.invitadoPrincipal.update({
      where: { id },
      data: { mensajeEnviado: true },
    });

    return NextResponse.json({ success: true, invitado });
  } catch (error) {
    console.error('ERROR_MARK_SENT:', error);
    return NextResponse.json({ error: 'Error al actualizar el estado' }, { status: 500 });
  }
}