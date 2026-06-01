import { NextResponse } from 'next/server';
import { requireVerifiedApiSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireVerifiedApiSession();
    if (!auth.ok) return auth.response;

    const { id } = params;

    await prisma.invitadoPrincipal.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Grupo de invitados eliminado con éxito (Cascada activada).' });
  } catch (error) {
    console.error('PRISMA_DELETE_GUEST_ERROR:', error);
    return NextResponse.json({ error: 'Error al eliminar el invitado.' }, { status: 500 });
  }
}