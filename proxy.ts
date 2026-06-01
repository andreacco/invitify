/**
 * Capa 1 — Red de borde (Next.js 16 proxy).
 * Complementa: app/dashboard/layout.tsx (DB) y requireVerifiedApiSession() en APIs.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const AUTH_PREFIX = '/auth';
const VERIFY_PATH = '/auth/verify';
const LOGIN_PATH = '/auth/login';

function isProtectedPage(pathname: string) {
  return pathname.startsWith('/dashboard');
}

function isProtectedApi(pathname: string) {
  return (
    pathname.startsWith('/api/event') || pathname.startsWith('/api/guests')
  );
}

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;
  const isVerified = Boolean(token?.emailVerificado);

  // APIs protegidas: exigen sesión y correo verificado
  if (isProtectedApi(pathname)) {
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    if (!isVerified) {
      return NextResponse.json(
        { error: 'Debes verificar tu correo electrónico.' },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // Dashboard y rutas hijas
  if (isProtectedPage(pathname)) {
    if (!token) {
      const loginUrl = new URL(LOGIN_PATH, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isVerified) {
      return NextResponse.redirect(new URL(VERIFY_PATH, request.url));
    }
    return NextResponse.next();
  }

  // Pantalla de verificación: usuarios ya verificados van al dashboard
  if (pathname === VERIFY_PATH && token && isVerified) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Login / signup: sesión activa sin verificar → pantalla de espera
  if (
    token &&
    !isVerified &&
    (pathname === `${AUTH_PREFIX}/login` || pathname === `${AUTH_PREFIX}/signup`)
  ) {
    return NextResponse.redirect(new URL(VERIFY_PATH, request.url));
  }

  // Login / signup: sesión verificada → dashboard
  if (
    token &&
    isVerified &&
    (pathname === `${AUTH_PREFIX}/login` || pathname === `${AUTH_PREFIX}/signup`)
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/login',
    '/auth/signup',
    '/auth/verify',
    '/api/event/:path*',
    '/api/guests/:path*',
  ],
};
