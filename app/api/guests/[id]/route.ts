import { NextResponse } from 'next/server';
import { requireVerifiedApiSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireVerifiedApiSession();
    if (!auth.ok) return auth.response;

    const { id } = await params;

    await prisma.invitadoPrincipal.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Grupo de invitados eliminado con éxito.' });
  } catch (error) {
    console.error('PRISMA_DELETE_GUEST_ERROR:', error);
    return NextResponse.json({ error: 'Error al eliminar el invitado.' }, { status: 500 });
  }
}

// 🚀 NUEVO: Método PUT para actualizar un invitado desde el Lapicito
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireVerifiedApiSession();
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const body = await request.json();
    const { nombreFamilia, telefono, observaciones, invitadoDe } = body;

    const invitadoActualizado = await prisma.invitadoPrincipal.update({
      where: { id },
      data: {
        nombreFamilia,
        telefono,
        observaciones: observaciones || null,
        invitadoDe
      }
    });

    return NextResponse.json({ success: true, invitado: invitadoActualizado });
  } catch (error) {
    console.error('PRISMA_UPDATE_GUEST_ERROR:', error);
    return NextResponse.json({ error: 'Error al actualizar el invitado.' }, { status: 500 });
  }
}