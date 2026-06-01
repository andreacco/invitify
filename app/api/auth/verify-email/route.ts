import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/options';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token requerido.' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    const usuario = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!usuario) {
      // Idempotente: doble clic, React Strict Mode o enlace ya usado
      if (session?.user?.id) {
        const yaVerificado = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { emailVerificado: true },
        });
        if (yaVerificado?.emailVerificado) {
          return NextResponse.json({
            success: true,
            message: 'Correo ya verificado.',
            alreadyVerified: true,
          });
        }
      }
      return NextResponse.json(
        { error: 'El enlace de verificación no es válido o ya expiró.' },
        { status: 400 }
      );
    }

    if (session?.user?.id && session.user.id !== usuario.id) {
      return NextResponse.json(
        { error: 'Este enlace no corresponde a la sesión activa.' },
        { status: 403 }
      );
    }

    if (usuario.emailVerificado) {
      return NextResponse.json({
        success: true,
        message: 'Correo ya verificado.',
        alreadyVerified: true,
      });
    }

    await prisma.user.update({
      where: { id: usuario.id },
      data: {
        emailVerificado: true,
        verificationToken: null,
      },
    });

    return NextResponse.json({ success: true, message: 'Correo verificado exitosamente.' });
  } catch (error) {
    console.error('ERROR_VERIFY_EMAIL:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}