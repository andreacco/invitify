import { NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';

export async function GET() {
  // Solo permitir esto si estamos ejecutando el proyecto localmente (Desarrollo)
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'No permitido en producción.' }, { status: 403 });
  }

  try {
    // Definimos un usuario ficticio o tu propio ID de la base de datos
    const user = {
      id: 'dev-user-id-andrea',
      name: 'Andrea Osorio',
      email: 'andrea@example.com',
      role: 'ADMIN'
    };

    // Crear el token usando la misma clave secreta de Next-Auth
    const token = await encode({
      token: user,
      secret: process.env.NEXTAUTH_SECRET || 'un_secret_muy_largo_y_seguro_de_prueba_123456789'
    });

    const cookieName = 'next-auth.session-token';

    const response = NextResponse.json({
      message: '¡Sesión de desarrollo iniciada correctamente! Ya puedes usar el editor.',
      user
    });

    // Inyectar la cookie directamente al navegador
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('DEV_LOGIN_ERROR:', error);
    return NextResponse.json({ error: 'Error al simular el login.' }, { status: 500 });
  }
}