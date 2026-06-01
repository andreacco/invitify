import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 💡 En Next.js 16 la función principal ahora se llama "proxy" en lugar de "middleware"
export async function proxy(request: NextRequest) {
  // Intentamos obtener el token de sesión (JWT) del usuario
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // 🛡️ Proteger la ruta del dashboard
  if (pathname.startsWith('/dashboard') && !token) {
    // Redirigir a la landing page si no está autenticado
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// 🎯 El Matcher sigue funcionando exactamente igual
export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};