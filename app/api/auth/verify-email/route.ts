import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token requerido.' }, { status: 400 });
    }

    const usuario = await prisma.user.findFirst({
      where: { verificationToken: token }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'El enlace de verificación no es válido o ya expiró.' }, { status: 400 });
    }

    // Activamos al usuario y removemos el token usado
    await prisma.user.update({
      where: { id: usuario.id },
      data: {
        emailVerificado: true,
        verificationToken: null
      }
    });

    return NextResponse.json({ success: true, message: 'Correo verificado exitosamente.' });
  } catch (error) {
    console.error('ERROR_VERIFY_EMAIL:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}