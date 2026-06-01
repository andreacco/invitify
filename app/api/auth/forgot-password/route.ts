import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendPasswordResetEmail } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, token, newPassword } = body;

    // FASE 1: GENERAR TOKEN DE OLVIDÉ MI CONTRASEÑA
    if (action === 'REQUEST_RESET') {
      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      
      // Por seguridad, si el correo no existe, respondemos éxito simulado para evitar rastreos maliciosos
      if (!user) {
        return NextResponse.json({ success: true, message: 'Si el correo existe, se enviará un enlace de restablecimiento.' });
      }

      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expirationDate = new Date(Date.now() + 3600000); // Expiración en 1 hora

      await prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          expires: expirationDate,
          userId: user.id
        }
      });

      // 🚀 CONEXIÓN REAL: Enviamos el correo de restablecimiento real al usuario
      await sendPasswordResetEmail(user.email, resetToken);

      return NextResponse.json({ success: true, message: 'Enlace generado y enviado correctamente.' });
    
    }

    // FASE 2: APLICAR LA NUEVA CONTRASEÑA USANDO EL TOKEN
    if (action === 'RESET_PASSWORD') {
      if (!token || !newPassword) {
        return NextResponse.json({ error: 'Campos requeridos incompletos.' }, { status: 400 });
      }

      const tokenValido = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!tokenValido || tokenValido.expires < new Date()) {
        return NextResponse.json({ error: 'El token de recuperación ha expirado o es inválido.' }, { status: 400 });
      }

      // Cifrar la nueva contraseña con bcryptjs usando las 10 rondas que maneja tu app
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña y purgar tokens anteriores por seguridad
      await prisma.$transaction([
        prisma.user.update({
          where: { id: tokenValido.userId },
          data: { passwordHash: hashedNewPassword }
        }),
        prisma.passwordResetToken.deleteMany({
          where: { userId: tokenValido.userId }
        })
      ]);

      return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente.' });
    }

    return NextResponse.json({ error: 'Acción inválida.' }, { status: 400 });
  } catch (error) {
    console.error('ERROR_FORGOT_PASSWORD_API:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}