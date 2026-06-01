import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// Importamos la instancia de prisma desde tu ruta actual
import { prisma } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

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