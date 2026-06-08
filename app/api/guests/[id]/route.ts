import { NextResponse } from 'next/server';
import { requireVerifiedApiSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 1. params ahora es una promesa
) {
  try {
    const auth = await requireVerifiedApiSession();
    if (!auth.ok) return auth.response;

    // 2. Extraemos el id usando await
    const { id } = await params;

    await prisma.invitadoPrincipal.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Grupo de invitados eliminado con éxito (Cascada activada).' });
  } catch (error) {
    console.error('PRISMA_DELETE_GUEST_ERROR:', error);
    return NextResponse.json({ error: 'Error al eliminar el invitado.' }, { status: 500 });
  }
}