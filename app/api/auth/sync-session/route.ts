import { NextResponse } from 'next/server';
import { getAuthoritativeSessionState } from '@/lib/auth/sync-state';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/sync-session
 * Estado de sesión desde la DB. No reemplaza /api/auth/session de NextAuth
 * (ese endpoint sigue gestionando la cookie/JWT del cliente).
 */
export async function GET() {
  try {
    const state = await getAuthoritativeSessionState();

    if (!state.authenticated) {
      return NextResponse.json(
        { authenticated: false, emailVerified: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      emailVerified: state.emailVerified,
      user: state.user,
    });
  } catch (error) {
    console.error('ERROR_SYNC_SESSION:', error);
    return NextResponse.json(
      { error: 'No se pudo obtener el estado de la sesión.' },
      { status: 500 }
    );
  }
}
